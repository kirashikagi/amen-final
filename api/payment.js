// Файл: api/payment.js (или внутри папки api/index.js в зависимости от структуры)

export default async function handler(req, res) {
  // 1. Разрешаем запросы (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // В идеале тут должен быть 'https://amen-app.ru'
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Обработка OPTIONS запроса
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Защита от неправильных методов
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, amount, purchaseType, itemId } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // ЖЕСТКИЙ ФИКС ДЛЯ ЮКАССЫ: Сумма должна быть строкой с двумя знаками после запятой
  const formattedAmount = Number(amount).toFixed(2);
  
  // Уникальный ключ для каждой транзакции (защита от двойных списаний)
  const idempotenceKey = crypto.randomUUID(); 

  try {
    const authString = Buffer.from(`${process.env.SHOP_ID}:${process.env.SECRET_KEY}`).toString('base64');

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify({
        amount: {
          value: formattedAmount,
          currency: 'RUB'
        },
        capture: true, // Автоматическое списание
        confirmation: {
          type: 'embedded' // Важно для работы виджета в приложении
        },
        description: `Статус Ангела (${itemId}) для ${userId}`,
        metadata: {
          userId: userId,
          purchaseType: purchaseType,
          itemId: itemId
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('YooKassa Rejection:', data);
      // Возвращаем точную причину отказа от кассы
      return res.status(400).json({ error: 'YooKassa validation failed', details: data });
    }

    // Возвращаем токен подтверждения нашему фронтенду
    return res.status(200).json({ confirmation_token: data.confirmation.confirmation_token });

  } catch (error) {
    console.error('Server Internal Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
