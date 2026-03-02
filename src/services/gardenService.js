import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const dbCollectionId = "amen-production"; 

export const waterGarden = async (userId) => {
  if (!userId) return { success: false, error: "Нет ID" };

  // Теперь путь точно совпадает с вашей базой
  const userRef = doc(db, 'artifacts', dbCollectionId, 'users', userId);

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      let garden = { totalWaterings: 0, currentStage: 1, fruitsHarvested: 0, lastWateredAt: null };
      
      if (userDoc.exists() && userDoc.data().garden) {
          garden = userDoc.data().garden;
      }

      const now = new Date();
      let lastWatered = null;

      // Безопасное извлечение даты, чтобы React не падал
      if (garden.lastWateredAt) {
          if (typeof garden.lastWateredAt.toDate === 'function') {
              lastWatered = garden.lastWateredAt.toDate();
          } else if (garden.lastWateredAt.seconds) {
              lastWatered = new Date(garden.lastWateredAt.seconds * 1000);
          }
      }

      if (lastWatered && lastWatered.toDateString() === now.toDateString()) {
        return; 
      }

      let newStage = garden.currentStage + 1;
      let newFruits = garden.fruitsHarvested;

      if (newStage > 7) {
        newStage = 1; 
        newFruits += 1;
      }

      // Используем set с merge, чтобы не затереть другие данные профиля
      transaction.set(userRef, {
        garden: {
            totalWaterings: garden.totalWaterings + 1,
            currentStage: newStage,
            fruitsHarvested: newFruits,
            lastWateredAt: serverTimestamp()
        }
      }, { merge: true });
    });
    
    return { success: true };
  } catch (error) {
    console.error("Ошибка обновления Сада:", error);
    return { success: false, error };
  }
};
