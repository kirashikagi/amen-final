import admin from 'firebase-admin';

// Безопасная инициализация БД
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    // Принимаем данные от фронтенда: кто, сколько, и что именно покупает
    const { userId, amount, purchaseType, itemId } = req.body; 
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    
    // Минимальная сумма 99 руб (т.к. треки стоят 99)
    const finalAmount = amount && !isNaN(amount) && Number(amount) >= 99 ? Number(amount) : 100;

    // Формируем правильное описание для чека ЮKassa
    let description = 'Оплата цифровой услуги в Amen';
    if (purchaseType === 'angel') description = 'Добровольное пожертвование (Статус Ангела)';
    if (purchaseType === 'theme') description = 'Покупка анимированного фона';
    if (purchaseType === 'track') description = 'Покупка музыкального трека';

    try {
        const idempotencyKey = Math.random().toString(36).substring(2, 15);
        const authHeader = Buffer.from(`${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`).toString('base64');

        const response = await fetch('https://api.yookassa.ru/v3/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Idempotence-Key': idempotencyKey,
                'Authorization': `Basic ${authHeader}`
            },
            body: JSON.stringify({
                amount: { value: `${finalAmount}.00`, currency: 'RUB' },
                capture: true,
                confirmation: {
                    type: 'redirect',
                    return_url: 'https://amen-final.vercel.app/'
                },
                description: description,
                metadata: { 
                    userId: userId,
                    purchaseType: purchaseType || 'angel',
                    itemId: String(itemId || 'none') 
                }
            })
        });

        const data = await response.json();
        
        if (data.confirmation && data.confirmation.confirmation_url) {
            res.status(200).json({ url: data.confirmation.confirmation_url });
        } else {
            console.error('YooKassa error:', data);
            res.status(500).json({ error: 'Payment creation failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}