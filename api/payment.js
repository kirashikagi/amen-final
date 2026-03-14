export default async function handler(req, res) {
  // 1. ЖЕСТКИЙ CORS (Пропускаем запросы от Firebase)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') return res.status(405).json({error: "Method not allowed"});

  try {
    const { userId, amount, purchaseType, itemId } = req.body;
    
    // Ключи из настроек Vercel (Environment Variables)
    const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
    const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
    
    if (!SHOP_ID || !SECRET_KEY) {
        throw new Error("Не настроены ключи ЮKassa в Vercel");
    }

    const authString = Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64');
    const idempotenceKey = Math.random().toString(36).substring(7);

    // 2. Создаем платеж типа "EMBEDDED" (Встроенный виджет)
    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
        'Idempotence-Key': idempotenceKey
      },
      body: JSON.stringify({
        amount: { value: amount.toString(), currency: 'RUB' },
        capture: true,
        confirmation: { type: 'embedded' }, // Команда отдать токен для виджета
        description: `Amen: Статус Ангела (${itemId})`,
        metadata: { userId, purchaseType, itemId }
      })
    });

    const data = await response.json();
    
    if (data.confirmation && data.confirmation.confirmation_token) {
      // Отдаем токен фронтенду
      res.status(200).json({ confirmation_token: data.confirmation.confirmation_token });
    } else {
      res.status(400).json({ error: "Ошибка создания платежа", details: data });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}