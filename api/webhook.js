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

const db = admin.firestore();
const dbCollectionId = "amen-production";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const event = req.body;

        if (event.event === 'payment.succeeded') {
            const metadata = event.object.metadata;
            
            if (metadata && metadata.userId) {
                const userRef = db.collection('artifacts').doc(dbCollectionId).collection('users').doc(metadata.userId);
                
                const purchaseType = metadata.purchaseType;
                const itemId = metadata.itemId; // Сюда прилетит ID выбранного фона

                if (purchaseType === 'angel') {
                    // Даем статус Ангела и закрепляем выбранный фон на месяц
                    await userRef.set({
                        isAngel: true,
                        angelSince: admin.firestore.FieldValue.serverTimestamp(),
                        angelTheme: itemId 
                    }, { merge: true });
                }
            }
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}