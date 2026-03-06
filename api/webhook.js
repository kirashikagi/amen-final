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

const db = admin.firestore();
const dbCollectionId = "amen-production";

export default async function handler(req, res) {
    // ЮKassa всегда присылает POST-запрос
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const event = req.body;

        // Если платеж успешно прошел
        if (event.event === 'payment.succeeded') {
            const metadata = event.object.metadata;
            
            // Если есть метаданные о пользователе
            if (metadata && metadata.userId) {
                const userRef = db.collection('artifacts').doc(dbCollectionId).collection('users').doc(metadata.userId);
                
                const purchaseType = metadata.purchaseType;
                const itemId = metadata.itemId;

                if (purchaseType === 'theme') {
                    // Выдаем доступ к конкретному фону
                    await userRef.set({
                        unlockedThemes: admin.firestore.FieldValue.arrayUnion(itemId)
                    }, { merge: true });
                } 
                else if (purchaseType === 'track') {
                    // Выдаем доступ к конкретному треку (преобразуем ID в число, т.к. на фронте ID треков это числа)
                    await userRef.set({
                        unlockedTracks: admin.firestore.FieldValue.arrayUnion(Number(itemId))
                    }, { merge: true });
                } 
                else {
                    // Выдаем статус Ангела и записываем дату (чтобы снять через 30 дней)
                    await userRef.set({
                        isAngel: true,
                        angelSince: admin.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                }
            }
        }

        // Обязательно отвечаем ЮKassa, что мы получили запрос, иначе она будет долбить нас повторами
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}