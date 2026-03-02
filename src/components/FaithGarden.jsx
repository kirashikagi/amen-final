import { useState } from 'react';
import { motion } from 'framer-motion';
import { CircleDot, Sprout, Leaf, Apple } from 'lucide-react';
import { waterGarden } from '../services/gardenService';

export default function FaithGarden({ userId, gardenData, theme }) {
  const [isWatering, setIsWatering] = useState(false);

  const handleWatering = async () => {
    if (isWatering || !userId) return;
    setIsWatering(true);
    await waterGarden(userId);
    setIsWatering(false);
  };

  // Пуленепробиваемая проверка даты для предотвращения краша React
  let lastDate = null;
  if (gardenData?.lastWateredAt) {
      if (typeof gardenData.lastWateredAt.toDate === 'function') {
          lastDate = gardenData.lastWateredAt.toDate();
      } else if (gardenData.lastWateredAt.seconds) {
          lastDate = new Date(gardenData.lastWateredAt.seconds * 1000);
      }
  }

  const daysSinceLastWatering = lastDate 
    ? Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24)) 
    : 0;

  const isWateredToday = lastDate ? lastDate.toDateString() === new Date().toDateString() : false;
  const stage = gardenData?.currentStage || 1;
  const fruits = gardenData?.fruitsHarvested || 0;

  let Icon = CircleDot;
  let text = "Посажено";
  if (stage >= 1 && stage <= 2) { Icon = Sprout; text = "Прорастает"; }
  else if (stage >= 3 && stage <= 4) { Icon = Leaf; text = "Укореняется"; }
  else if (stage >= 5 && stage <= 6) { Icon = Leaf; text = "Крепнет"; }
  else if (stage === 7) { Icon = Apple; text = "Плодоносит"; }

  const safeTheme = theme || { text: 'text-stone-800', iconColor: 'text-stone-700' };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center py-6 mb-8 transition-opacity ${safeTheme.text}`}
    >
      {daysSinceLastWatering > 2 && (
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}
          className="text-[10px] font-medium uppercase tracking-widest opacity-40 mb-6 text-center"
        >
          Сад ждал вас
        </motion.p>
      )}

      <motion.div 
        key={stage} 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="w-32 h-32 rounded-full flex items-center justify-center mb-6 relative"
      >
        <div className="absolute inset-0 rounded-full bg-current opacity-5 blur-xl" />
        <div className="absolute inset-0 rounded-full border border-current opacity-10" />
        
        <div className={`${safeTheme.iconColor} opacity-70 transition-opacity duration-1000 relative z-10`}>
          <Icon size={stage >= 5 && stage <= 6 ? 48 : 40} strokeWidth={1} className={stage >= 3 && stage <= 4 ? "scale-90" : ""} />
        </div>
      </motion.div>

      <h3 className="text-2xl font-light font-serif mb-2 opacity-90">{text}</h3>
      <p className="text-[10px] opacity-40 uppercase tracking-widest font-medium">Стадия {stage} из 7</p>

      <div className="flex gap-3 mt-8 mb-8">
          {[...Array(7)].map((_, i) => ( 
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${i < stage ? 'bg-current opacity-60 scale-125' : 'bg-current opacity-10'}`} /> 
          ))}
      </div>

      <div className="flex space-x-10 text-[10px] font-medium uppercase tracking-widest opacity-50 mb-10">
        <div className="flex flex-col items-center gap-1.5">
            <span>Плодов</span> 
            <span className="text-xl font-light opacity-80">{fruits}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
            <span>Дней</span> 
            <span className="text-xl font-light opacity-80">{gardenData?.totalWaterings || 0}</span>
        </div>
      </div>

      <button 
        onClick={handleWatering}
        disabled={isWatering || isWateredToday}
        className={`w-full max-w-[220px] py-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 border ${
          isWateredToday 
            ? 'border-current/10 bg-transparent opacity-30 text-current' 
            : 'border-current/20 hover:bg-current/5 active:scale-95 opacity-80 hover:opacity-100'
        }`}
      >
        {isWatering ? 'Взращиваем...' : isWateredToday ? 'В тишине' : 'Побыть в тишине'}
      </button>
    </motion.div>
  );
}
