import admin from 'firebase-admin';

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
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    try {
        const event = req.body;

        // Если ЮKassa говорит "Оплата прошла успешно"
        if (event.event === 'payment.succeeded') {
            const paymentObj = event.object;
            const userId = paymentObj.metadata?.userId;

            if (userId) {
                const db = admin.firestore();
                // Записываем статус в базу
                await db.doc(`artifacts/amen-production/users/${userId}`).set({
                    isAngel: true,
                    angelSince: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                console.log(`Пользователь ${userId} стал Ангелом!`);
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Error processing webhook');
    }
}