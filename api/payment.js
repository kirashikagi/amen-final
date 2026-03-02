import admin from 'firebase-admin';

// Безопасная инициализация (чтобы Vercel не ругался)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Vercel иногда экранирует \n, поэтому делаем принудительный перенос
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    try {
        const idempotencyKey = Math.random().toString(36).substring(2, 15);
        const authHeader = Buffer.from(`${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`).toString('base64');

        // Обращаемся к ЮKassa
        const response = await fetch('https://api.yookassa.ru/v3/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Idempotence-Key': idempotencyKey,
                'Authorization': `Basic ${authHeader}`
            },
            body: JSON.stringify({
                amount: { value: '299.00', currency: 'RUB' }, // Цена Ангела
                capture: true,
                confirmation: {
                    type: 'redirect',
                    return_url: 'https://amen-final.vercel.app/' // Куда возвращать
                },
                description: 'Статус Ангела в Amen',
                metadata: { userId } // Запоминаем, кто платит
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