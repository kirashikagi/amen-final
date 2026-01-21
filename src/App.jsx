import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  onAuthStateChanged, 
  signInAnonymously, 
  signOut 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  query, 
  where,
  orderBy, 
  limit, 
  getDocs,
  onSnapshot, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove,
  increment,
  enableIndexedDbPersistence
} from "firebase/firestore";
import { List, X, Check, Disc, Plus, CheckCircle2, FileText, Heart, CalendarDays, Compass, Edit3, MessageCircle, Trash2, Mail, Copy, Hand, SkipBack, SkipForward, PenLine } from 'lucide-react'; 

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAnW6B3CEoFEQy08WFGKIfNVzs3TevBPtc",
  authDomain: "amen-app-b0da2.firebaseapp.com",
  projectId: "amen-app-b0da2",
  storageBucket: "amen-app-b0da2.firebasestorage.app",
  messagingSenderId: "964550407508",
  appId: "1:964550407508:web:2d6a8c18fcf461af97c4c1"
};

const dbCollectionId = "amen-production"; 
const ADMIN_NAMES = ['Admin', 'Founder', 'admin', 'founder', 'Киря'];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

try {
  enableIndexedDbPersistence(db).catch(() => {});
} catch (e) {}

// --- ANIMATIONS ---
const pageVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 1 }
};

const simpleContainer = {
  hidden: { opacity: 1 },
  show: { opacity: 1 }
};

const itemAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } }
};

const modalAnim = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } }
};

// --- HAPTICS ---
const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(10);
};

// --- AUDIO TRACKS ---
const AUDIO_TRACKS = [
  { id: 1, title: "Beautiful Worship", url: "/music/beautiful-worship.mp3" },
  { id: 2, title: "Evening Prayer", url: "/music/evening-prayer.mp3" },
  { id: 3, title: "Gospel Spirit", url: "/music/gospel-worship.mp3" },
  { id: 4, title: "Gymnopédie", url: "/music/gymnopedie.mp3" },
  { id: 5, title: "Holy Grace", url: "/music/holygrace.mp3" },
  { id: 6, title: "Peace & Quiet", url: "/music/peace.mp3" },
  { id: 7, title: "Deep Prayer", url: "/music/prayer.mp3" },
  { id: 8, title: "Sunrise", url: "/music/sunrise.mp3" },
  { id: 9, title: "Worship Flow", url: "/music/worship.mp3" },
];

// --- THEMES ---
const THEMES = {
  dawn: { 
    id: 'dawn', label: 'Безмятежность', bgImage: '/dawn.jpg', 
    fallbackColor: '#fff7ed', 
    cardBg: 'bg-white/40 backdrop-blur-3xl shadow-sm', 
    text: 'text-stone-900', subText: 'text-stone-600', 
    containerBg: 'bg-white/50',
    button: 'border border-stone-800/10 hover:bg-white/40', 
    activeButton: 'bg-stone-800 text-white shadow-lg shadow-stone-800/20',
    menuBg: 'bg-[#fffbf7]/95 backdrop-blur-3xl text-stone-900 border-l border-white/20',
    iconColor: 'text-stone-800',
    placeholderColor: 'placeholder:text-stone-500/50'
  },
  morning: { 
    id: 'morning', label: 'Величие', bgImage: '/morning.jpg', 
    fallbackColor: '#f0f9ff', 
    cardBg: 'bg-white/40 backdrop-blur-3xl shadow-sm', 
    text: 'text-slate-900', subText: 'text-slate-600', 
    containerBg: 'bg-white/50',
    button: 'border border-slate-800/10 hover:bg-white/40', 
    activeButton: 'bg-sky-900 text-white shadow-lg shadow-sky-900/20',
    menuBg: 'bg-white/95 backdrop-blur-3xl text-slate-900 border-l border-white/20',
    iconColor: 'text-sky-900',
    placeholderColor: 'placeholder:text-slate-500/50'
  },
  day: { 
    id: 'day', label: 'Гармония', bgImage: '/day.jpg', 
    fallbackColor: '#fdfce7', 
    cardBg: 'bg-[#fffff0]/40 backdrop-blur-3xl shadow-sm', 
    text: 'text-stone-950', subText: 'text-stone-700', 
    containerBg: 'bg-white/50',
    button: 'border border-stone-900/10 hover:bg-white/40', 
    activeButton: 'bg-amber-900 text-white shadow-lg shadow-amber-900/20',
    menuBg: 'bg-[#fffff0]/95 backdrop-blur-3xl text-stone-950 border-l border-white/20',
    iconColor: 'text-amber-900',
    placeholderColor: 'placeholder:text-stone-500/50'
  },
  sunset: { 
    id: 'sunset', label: 'Откровение', bgImage: '/sunset.jpg', 
    fallbackColor: '#fff1f2', 
    cardBg: 'bg-stone-900/20 backdrop-blur-3xl shadow-sm', 
    text: 'text-orange-50', subText: 'text-orange-200/70', 
    containerBg: 'bg-black/20', 
    button: 'border border-orange-100/30 hover:bg-white/10', 
    activeButton: 'bg-orange-100 text-stone-900 shadow-lg shadow-orange-500/20', 
    menuBg: 'bg-[#2c1810]/95 backdrop-blur-3xl text-orange-50 border-l border-white/10',
    iconColor: 'text-orange-100',
    placeholderColor: 'placeholder:text-orange-200/50'
  },
  evening: { 
    id: 'evening', label: 'Тайна', bgImage: '/evening.jpg', 
    fallbackColor: '#f5f3ff', 
    cardBg: 'bg-[#2e1065]/20 backdrop-blur-3xl shadow-sm', 
    text: 'text-white', subText: 'text-purple-200', 
    containerBg: 'bg-white/10',
    button: 'border border-white/20 hover:bg-white/10', 
    activeButton: 'bg-white text-purple-950 shadow-lg shadow-purple-500/20',
    menuBg: 'bg-[#2e1065]/95 backdrop-blur-3xl text-white border-l border-white/10',
    iconColor: 'text-white',
    placeholderColor: 'placeholder:text-white/30'
  },
  midnight: { 
    id: 'midnight', label: 'Волшебство', bgImage: '/midnight.jpg', 
    fallbackColor: '#020617', 
    cardBg: 'bg-black/30 backdrop-blur-3xl shadow-sm', 
    text: 'text-slate-100', subText: 'text-slate-400', 
    containerBg: 'bg-white/10',
    button: 'border border-white/10 hover:bg-white/5', 
    activeButton: 'bg-white text-black shadow-lg shadow-white/10',
    menuBg: 'bg-black/95 backdrop-blur-3xl text-slate-100 border-l border-white/10',
    iconColor: 'text-white',
    placeholderColor: 'placeholder:text-white/30'
  }
};

const CALENDAR_READINGS = {
  "19-01": { title: "Где ты?", source: "Бытие 3:9", text: "И воззвал Господь Бог к Адаму и сказал ему: где ты?", thought: "Бог обращается не к месту, а к сердцу. Найди сегодня время остановиться и честно посмотреть, где ты сейчас духовно.", action: "Оценить, где я духовно" },
  "20-01": { title: "Работа до падения", source: "Бытие 2:15", text: "И взял Господь Бог человека... чтобы возделывать его и хранить его.", thought: "Труд был задуман как часть жизни с Богом. Попробуй сегодня отнестись к своей работе как к служению, а не просто обязанности.", action: "Работа как служение" },
  "21-01": { title: "Проповедник правды", source: "2 Петра 2:5", text: "…Ноя, проповедника правды, сохранил…", thought: "Богу дорога верность. Останься сегодня верен добру, даже если не видишь отклика.", action: "Быть верным добру" },
  "22-01": { title: "Не зная куда", source: "Евреям 11:8", text: "Верою Авраам… пошёл, не зная, куда идёт.", thought: "Вера часто начинается без полной ясности. Подумай, какой шаг ты мог бы сделать, доверяя Богу.", action: "Сделать шаг доверия" },
  "23-01": { title: "Путь через зло", source: "Бытие 50:20", text: "Вы умышляли против меня зло; но Бог обратил это в добро.", thought: "Путь призвания не всегда прямой. Посмотри на свою ситуацию с надеждой, что Бог продолжает действовать.", action: "Верить в Божий план" },
  "24-01": { title: "Время подготовки", source: "Деяния 7:30", text: "По исполнении сорока лет явился ему… Ангел Господень.", thought: "Время подготовки имеет ценность. Позволь Богу формировать тебя в том сезоне, где ты сейчас.", action: "Принять текущий сезон" },
  "25-01": { title: "Ежедневная манна", source: "Исход 16:20", text: "…и завелись в ней черви, и она осмердела.", thought: "Богу важно живое, ежедневное общение. Найди сегодня момент, чтобы обратиться к Нему снова.", action: "Обратиться к Нему" },
  "26-01": { title: "Сила в малом", source: "Судей 7:7", text: "Тремястами мужей… Я спасу вас.", thought: "Божья сила не зависит от количества ресурсов. Вспомни, где ты можешь довериться Ему больше, чем своим возможностям.", action: "Довериться Богу" },
  "27-01": { title: "Бдительность", source: "Судей 16:20", text: "…а он не знал, что Господь отступил от него.", thought: "Даже сильные нуждаются в бдительности. Обрати внимание на те области жизни, где стоит быть внимательнее.", action: "Быть внимательным" },
  "28-01": { title: "Скрытое помазание", source: "1 Царств 16:13", text: "…и почивал Дух Господень на Давиде.", thought: "Бог видит призвание раньше, чем оно становится видимым. Живи сегодня верно в том, что тебе доверено сейчас.", action: "Быть верным в малом" },
  "29-01": { title: "Честные молитвы", source: "Псалом 61:9", text: "Изливайте пред Ним сердце ваше.", thought: "Богу важна искренность. Попробуй сегодня говорить с Ним открыто, без лишних слов и форм.", action: "Говорить открыто" },
  "30-01": { title: "Право на усталость", source: "3 Царств 19:4", text: "…душе моей довольно уже, Господи.", thought: "Усталость не делает тебя слабым. Позволь себе сегодня отдых и заботу.", action: "Позволить себе отдых" },
  "31-01": { title: "Сердце Отца", source: "Иона 4:2", text: "…знал я, что Ты Бог благий и милосердный.", thought: "Бог зовёт не только к истине, но и к милости. Присмотрись к своему отношению к людям рядом.", action: "Проявить милость" },
  "01-02": { title: "Бог говорит", source: "Числа 22:28", text: "И отверз Господь уста ослицы…", thought: "Бог может говорить неожиданно. Будь внимателен к тем сигналам, которые приходят в обычных ситуациях.", action: "Слушать внимательно" },
  "02-02": { title: "Долгая тишина", source: "Луки 3:23", text: "Иисус… был лет тридцати.", thought: "Тихие и незаметные сезоны имеют глубокий смысл. Прими ценность времени, в котором ты находишься сейчас.", action: "Ценить ожидание" },
  "03-02": { title: "Уединение", source: "Марка 1:35", text: "…удалился в пустынное место и там молился.", thought: "Тишина помогает услышать главное. Найди сегодня немного времени для уединения.", action: "Найти время тишины" },
  "04-02": { title: "Кто больше?", source: "Марка 9:34", text: "…рассуждали между собою, кто больше.", thought: "Гордость знакома каждому. Подумай, где сегодня можно выбрать смирение.", action: "Выбрать смирение" },
  "05-02": { title: "Восстановление", source: "Иоанна 21:17", text: "…паси овец Моих.", thought: "Бог даёт новое начало. Прими Его призыв идти дальше, несмотря на прошлое.", action: "Идти дальше" },
  "06-02": { title: "Взгляд веры", source: "Матфея 28:6", text: "Его нет здесь — Он воскрес.", thought: "Бог доверяет тем, кого часто не замечают. Позволь себе принять эту ценность.", action: "Принять доверие" },
  "07-02": { title: "Дух для всех", source: "Деяния 2:17", text: "…излию от Духа Моего на всякую плоть.", thought: "Божье действие не ограничено избранными. Подумай, как ты можешь быть частью Его работы.", action: "Быть частью работы" },
  "08-02": { title: "Сила единства", source: "Деяния 1:14", text: "Все они единодушно пребывали в молитве.", thought: "Молитва создаёт пространство для Божьего присутствия. Начни сегодня с неё.", action: "Начать с молитвы" },
  "09-02": { title: "Шаг доверия", source: "Деяния 9:17", text: "Анания пошёл и вошёл в дом.", thought: "Страх не всегда исчезает сразу. Обрати внимание, где Бог зовёт тебя к доверию.", action: "Шагнуть сквозь страх" },
  "10-02": { title: "Служение в узах", source: "Филиппийцам 1:12", text: "…обстоятельства мои послужили к большему успеху благовествования.", thought: "Даже ограничения могут стать пространством для плода. Подумай, что возможно в твоих обстоятельствах.", action: "Найти возможность" },
  "11-02": { title: "Звук без любви", source: "1 Коринфянам 13:1", text: "…я медь звенящая или кимвал звучащий.", thought: "Любовь придаёт глубину любому действию. Прислушайся сегодня к мотивам своего сердца.", action: "Проверить мотивы" },
  "12-02": { title: "Вера и будущее", source: "Евреям 11:1", text: "Вера же есть осуществление ожидаемого.", thought: "Будущее начинается с доверия. Позволь надежде направлять твои шаги.", action: "Довериться надежде" },
  "13-02": { title: "Новое имя", source: "Бытие 17:5", text: "…и не будешь ты больше называться Аврамом.", thought: "Богу важнее то, кем ты являешься, чем твоя роль. Вспомни свою идентичность во Христе.", action: "Вспомнить кто я" },
  "14-02": { title: "Трудная истина", source: "Иоанна 6:60", text: "Какие странные слова! кто может это слушать?", thought: "Истина может быть непростой. Останься с ней, даже если она вызывает напряжение.", action: "Принять истину" },
  "15-02": { title: "Надежда", source: "Откровение 21:4", text: "И отрёт Бог всякую слезу.", thought: "История ещё продолжается. Живи с ожиданием того, что Бог ведёт к восстановлению.", action: "Ждать восстановления" },
  "16-02": { title: "Он видит боль", source: "Псалом 55:9", text: "Положи слёзы мои в сосуд у Тебя.", thought: "Боль не остаётся незамеченной. Принеси её Богу в тишине молитвы.", action: "Принести боль Богу" },
  "17-02": { title: "Творю новое", source: "Исаия 43:19", text: "Вот, Я делаю новое.", thought: "Перед Богом открыто будущее. Будь готов принять то новое, что Он приготовил.", action: "Принять новое" }
};
const DAILY_WORD_DEFAULT = { title: "Тишина", source: "Псалом 46:11", text: "Остановитесь и познайте, что Я — Бог.", thought: "В суете трудно услышать шепот.", action: "Побыть в тишине" };

const TERMS_TEXT = `1. Amen — пространство тишины.\n2. Мы не используем ваши данные.\n3. Дневник — личное, Единство — общее.\n4. Будьте светом.`;
const DISCLAIMER_TEXT = `Amen не заменяет профессиональную помощь.\nКонтент носит духовный характер.`;

const fonts = { ui: "font-sans", content: "font-serif" };

// --- COMPONENTS ---

const FilmGrain = () => (
    <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.07] mix-blend-overlay"
         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
    />
);

const Card = ({ children, theme, className = "", onClick }) => (
  <div 
    onClick={onClick} 
    className={`rounded-[2.5rem] p-8 mb-6 transition-all duration-500 ${theme.cardBg} ${theme.text} ${className}`}
  >
    {children}
  </div>
);

const ActivityCalendar = ({ prayers, theme }) => {
    const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        return d;
    });
    return (
        <div className="flex flex-col items-center gap-3 mb-8">
            <div className="flex items-center gap-2 opacity-50">
                <CalendarDays size={12} />
                <span className="text-[9px] uppercase tracking-widest font-bold">Путь (14 дней)</span>
            </div>
            <div className="flex gap-2">
                {days.map((day, idx) => {
                    const dateStr = day.toLocaleDateString();
                    const hasPrayer = prayers.some(p => p.createdAt?.toDate().toLocaleDateString() === dateStr);
                    return <div key={idx} className={`w-2 h-2 rounded-full transition-all ${hasPrayer ? theme.activeButton : 'bg-current opacity-10'}`} title={dateStr} />;
                })}
            </div>
        </div>
    );
};

const AudioPlayer = ({ currentTrack, isPlaying, togglePlay, changeTrack, theme, isUiVisible }) => {
  const audioRef = useRef(null);
  const [showPlaylist, setShowPlaylist] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
        audio.volume = 0;
        audio.play().catch(e => console.log(e));
        let vol = 0;
        const interval = setInterval(() => {
            if (vol < 1) { vol += 0.1; audio.volume = Math.min(vol, 1); } 
            else clearInterval(interval);
        }, 100);
        return () => clearInterval(interval);
    } else {
        audio.pause();
    }
  }, [isPlaying, currentTrack]);

  const handleNextTrack = () => {
      const currentIndex = AUDIO_TRACKS.findIndex(t => t.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % AUDIO_TRACKS.length;
      changeTrack(AUDIO_TRACKS[nextIndex]);
  };

  const handlePrevTrack = () => {
      const currentIndex = AUDIO_TRACKS.findIndex(t => t.id === currentTrack.id);
      const prevIndex = (currentIndex - 1 + AUDIO_TRACKS.length) % AUDIO_TRACKS.length;
      changeTrack(AUDIO_TRACKS[prevIndex]);
  };

  return (
    <>
      <AnimatePresence>
        {showPlaylist && (
            <>
                <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm" onClick={() => setShowPlaylist(false)} />
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                    className={`fixed bottom-24 left-4 right-4 z-50 rounded-2xl p-4 shadow-2xl ${theme.menuBg} max-h-72 overflow-y-auto ${fonts.ui}`}
                >
                    <h4 className="text-sm font-medium opacity-50 mb-4 px-2">Фонотека</h4>
                    {AUDIO_TRACKS.map(track => (
                        <button key={track.id} onClick={() => { changeTrack(track); setShowPlaylist(false); }} className={`w-full text-left py-3 px-2 rounded-lg text-sm font-normal ${currentTrack.id === track.id ? 'bg-black/5 dark:bg-white/10 font-medium' : ''}`}>
                            {track.title}
                        </button>
                    ))}
                </motion.div>
            </>
        )}
      </AnimatePresence>

      <motion.div 
        animate={{ y: isUiVisible ? 0 : 100, opacity: isUiVisible ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className={`fixed bottom-6 left-6 right-6 z-40 h-16 px-6 rounded-full backdrop-blur-2xl shadow-lg flex items-center justify-between ${theme.menuBg} ${fonts.ui}`}
      >
        <audio ref={audioRef} src={currentTrack.url} onEnded={handleNextTrack} />
        
        <div className="flex items-center gap-4 overflow-hidden cursor-pointer flex-1" onClick={() => setShowPlaylist(true)}>
           <div className={`p-2 rounded-full bg-black/5 dark:bg-white/10`}>
             <Disc size={18} className={isPlaying ? "animate-spin-slow" : ""} />
           </div>
           <span className="text-xs font-medium truncate tracking-wide opacity-80">
              {currentTrack.title}
           </span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={handlePrevTrack} className="opacity-50 hover:opacity-100 transition"><SkipBack size={18}/></button>
          <button onClick={() => { triggerHaptic(); togglePlay(); }} className="text-xs font-medium hover:opacity-60 transition uppercase tracking-wider">
             {isPlaying ? "Pause" : "Play"}
          </button>
          <button onClick={handleNextTrack} className="opacity-50 hover:opacity-100 transition"><SkipForward size={18}/></button>
        </div>
      </motion.div>
    </>
  );
};

const TopMenu = ({ view, setView, theme, openThemeModal, openLegal, logout, isAdmin, isUiVisible }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuItems = [ { id: 'diary', label: 'Дневник' }, { id: 'flow', label: 'Поток' }, { id: 'profile', label: 'Профиль' } ];

  return (
    <>
      <motion.div 
        animate={{ y: isUiVisible ? 0 : -100, opacity: isUiVisible ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className={`fixed top-12 right-6 z-[60] ${fonts.ui}`}
      >
        <button onClick={() => { triggerHaptic(); setIsOpen(!isOpen); }} className={`text-sm font-medium px-5 py-2.5 rounded-full backdrop-blur-xl ${theme.text} bg-white/10 hover:bg-white/20 transition shadow-sm`}>
          {isOpen ? "Закрыть" : "Меню"}
        </button>
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className={`fixed inset-0 z-40 bg-black/10 backdrop-blur-sm`} onClick={() => setIsOpen(false)}/>
            <motion.div 
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.5, ease: "easeInOut" }} 
                className={`fixed top-0 right-0 bottom-0 z-50 w-72 p-10 shadow-2xl flex flex-col justify-between ${theme.menuBg} ${fonts.ui}`}
            >
              <div className="mt-8 flex flex-col items-start gap-8">
                <div className={`${fonts.ui} text-4xl font-light tracking-wide mb-10 opacity-30 uppercase`}>Amen</div>
                {menuItems.map(item => (
                  <button key={item.id} onClick={() => { triggerHaptic(); setView(item.id); setIsOpen(false); }} className={`text-left text-xl font-light transition-opacity ${view === item.id ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}>
                    {item.label}
                  </button>
                ))}
                <button onClick={() => { openThemeModal(); setIsOpen(false); }} className="text-left text-xl font-light opacity-100 hover:opacity-80">
                    Атмосфера
                </button>
                {isAdmin && (
                    <button onClick={() => { setView('admin_feedback'); setIsOpen(false); }} className="text-left text-lg font-normal opacity-70 hover:opacity-100 flex items-center gap-3 mt-4">
                        <Mail size={18}/> Входящие
                    </button>
                )}
              </div>
              <div className="mb-8 flex flex-col items-start gap-2 opacity-40">
                  <button onClick={() => { openLegal(); setIsOpen(false); }} className="flex items-center gap-2 text-xs hover:opacity-100">
                     <FileText size={12}/> Соглашение
                  </button>
                  <div className="text-[10px] leading-tight mt-4 max-w-[180px]">
                      Музыка и тексты — Public Domain / CC0. Библия — Синодальный перевод.
                  </div>
                  <button onClick={logout} className="text-xs mt-4 hover:opacity-100">Выйти</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// --- MAIN APP ---
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState('flow'); 
  const [currentThemeId, setCurrentThemeId] = useState(() => localStorage.getItem('amen-theme-id') || 'dawn');
  const theme = THEMES[currentThemeId] || THEMES.dawn;
  
  const [currentTrack, setCurrentTrack] = useState(AUDIO_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [myPrayers, setMyPrayers] = useState([]);
  const [publicPosts, setPublicPosts] = useState([]);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);

  // UI States
  const [showInlineCreate, setShowInlineCreate] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [isAmenAnimating, setIsAmenAnimating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Услышано");
  const [isUiVisible, setIsUiVisible] = useState(true); 

  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [focusPrayerPublic, setFocusPrayerPublic] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [diaryTab, setDiaryTab] = useState('active'); 
  const [newName, setNewName] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', text: '' });
  const [noteText, setNoteText] = useState(''); 
  const [answeringId, setAnsweringId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [feedbackText, setFeedbackText] = useState('');

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // --- TYPEWRITER EFFECT STATE ---
  const [placeholderText, setPlaceholderText] = useState("");
  const intervalRef = useRef(null);

  // --- VIEWPORT & SCROLL LOCK LOGIC (STABILITY) ---
  useEffect(() => {
      const handleStatusChange = () => setIsOnline(navigator.onLine);
      window.addEventListener('online', handleStatusChange);
      window.addEventListener('offline', handleStatusChange);
      return () => {
          window.removeEventListener('online', handleStatusChange);
          window.removeEventListener('offline', handleStatusChange);
      };
  }, []);

  const [lockedHeight, setLockedHeight] = useState('100dvh');

  // Lock body scroll and fix height when writing modal opens
  useEffect(() => {
    if (showInlineCreate) {
        document.body.style.overflow = 'hidden'; // Stop background scrolling
        // Fix height to current pixels to prevent keyboard resize jump
        setLockedHeight(`${window.innerHeight}px`);
    } else {
        document.body.style.overflow = '';
        setLockedHeight('100dvh');
    }
    return () => {
        document.body.style.overflow = '';
    }
  }, [showInlineCreate]);

  const isAdmin = user && ADMIN_NAMES.includes(user.displayName);
  const mainScrollRef = useRef(null);

  useLayoutEffect(() => {
      if (mainScrollRef.current) mainScrollRef.current.scrollTo(0, 0);
  }, [view]);

  const handleScroll = (e) => {
      const top = e.target.scrollTop;
      if (top > 50 && isUiVisible) setIsUiVisible(false);
      if (top < 30 && !isUiVisible) setIsUiVisible(true);
  };

  useEffect(() => {
    localStorage.setItem('amen-theme-id', currentThemeId);
  }, [currentThemeId]);

  useEffect(() => {
    const fetchDailyWord = async () => {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const key = `${day}-${month}`;
      let reading = CALENDAR_READINGS[key];
      if(!reading) {
          const keys = Object.keys(CALENDAR_READINGS);
          const index = today.getDate() % keys.length;
          reading = CALENDAR_READINGS[keys[index]];
      }
      setDailyVerse(reading || DAILY_WORD_DEFAULT);
    };
    fetchDailyWord();
  }, []);

  useEffect(() => {
      const img1 = new Image(); img1.src = '/dawn.jpg';
      const img2 = new Image(); img2.src = '/morning.jpg';
      const img3 = new Image(); img3.src = '/day.jpg';
      const img4 = new Image(); img4.src = '/sunset.jpg';
      const img5 = new Image(); img5.src = '/evening.jpg';
      const img6 = new Image(); img6.src = '/midnight.jpg';
  }, []);

  useEffect(() => onAuthStateChanged(auth, (u) => { 
      setUser(u); 
      setLoading(false);
      if(u) setNewName(u.displayName || "");
  }), []);

  // --- SAFE TYPEWRITER EFFECT ---
  useEffect(() => {
    if (!showInlineCreate) {
      clearInterval(intervalRef.current);
      setPlaceholderText("");
      return;
    }

    const text = "Мысли, молитвы, благодарность...";
    let currentIndex = 0;
    
    intervalRef.current = setInterval(() => {
      if (currentIndex <= text.length) {
          setPlaceholderText(text.slice(0, currentIndex));
          currentIndex++;
      } else {
          clearInterval(intervalRef.current);
      }
    }, 45); 

    return () => clearInterval(intervalRef.current);
  }, [showInlineCreate]);

  useEffect(() => { if (!user) return; return onSnapshot(query(collection(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers'), orderBy('createdAt', 'desc')), snap => setMyPrayers(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, [user]);
  useEffect(() => { return onSnapshot(query(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts'), orderBy('createdAt', 'desc'), limit(50)), snap => setPublicPosts(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, []);
  useEffect(() => { if (view !== 'admin_feedback' || !isAdmin) return; return onSnapshot(query(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'feedback'), orderBy('createdAt', 'desc')), snap => setFeedbacks(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, [view, isAdmin]);

  const handleLogin = async (e) => { e.preventDefault(); setAuthError(''); setIsAuthLoading(true); const { username, password } = e.target.elements; const fakeEmail = `${username.value.trim().replace(/\s/g, '').toLowerCase()}@amen.app`; try { await signInWithEmailAndPassword(auth, fakeEmail, password.value); } catch (err) { if(err.code.includes('not-found') || err.code.includes('invalid-credential')) { try { const u = await createUserWithEmailAndPassword(auth, fakeEmail, password.value); await updateProfile(u.user, { displayName: username.value }); } catch(ce) { setAuthError("Ошибка: " + ce.code); } } else { setAuthError("Ошибка: " + err.code); } } setIsAuthLoading(false); };
  const handleUpdateName = async () => { if(!newName.trim() || newName === user.displayName) return; await updateProfile(user, { displayName: newName }); };
  const handleAmen = async (e, source = "manual") => { e.preventDefault(); setIsAmenAnimating(true); triggerHaptic(); const title = e.target.elements.title?.value || "Молитва"; const text = e.target.elements.text.value; const isPublic = focusPrayerPublic; const data = { title, text, createdAt: serverTimestamp(), status: 'active', updates: [], prayerCount: 1 }; await addDoc(collection(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers'), data); if(isPublic) { await addDoc(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts'), { text: title + (text ? `\n\n${text}` : ""), authorId: user.uid, authorName: user.displayName || "Пилигрим", createdAt: serverTimestamp(), likes: [] }); } setTimeout(() => { setIsAmenAnimating(false); setShowInlineCreate(false); setSuccessMessage("Услышано"); setShowSuccessModal(true); e.target.reset(); setFocusPrayerPublic(false); setTimeout(() => setShowSuccessModal(false), 2000); }, 800); };
  const incrementPrayerCount = async (id, currentCount) => { triggerHaptic(); await updateDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', id), { prayerCount: (currentCount || 1) + 1 }); };
  const toggleLike = async (id, likes) => { triggerHaptic(); const ref = doc(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts', id); await updateDoc(ref, { likes: likes?.includes(user.uid) ? arrayRemove(user.uid) : arrayUnion(user.uid) }); };
  const startEditing = (p) => { setEditingId(p.id); setEditForm({ title: p.title, text: p.text }); };
  const saveEdit = async () => { if(!editForm.title.trim()) return; await updateDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', editingId), { title: editForm.title, text: editForm.text }); setEditingId(null); };
  const addNote = async (prayerId) => { if(!noteText.trim()) return; await updateDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', prayerId), { updates: arrayUnion({ text: noteText, createdAt: new Date().toISOString() }) }); setNoteText(''); };
  const openAnswerModal = (prayerId) => { setAnsweringId(prayerId); setAnswerText(''); setShowAnswerModal(true); };
  const confirmAnswer = async () => { if(!answeringId) return; await updateDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', answeringId), { status: 'answered', answerNote: answerText, answeredAt: serverTimestamp() }); const prayer = myPrayers.find(p => p.id === answeringId); if(prayer) { const q = query(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts'), where('authorId', '==', user.uid)); const querySnapshot = await getDocs(q); querySnapshot.forEach(async (docSnap) => { const postData = docSnap.data(); if (postData.text.startsWith(prayer.title)) { await updateDoc(docSnap.ref, { status: 'answered' }); } }); } setShowAnswerModal(false); setAnsweringId(null); setSuccessMessage("Твой путь важен"); setShowSuccessModal(true); setTimeout(() => setShowSuccessModal(false), 2000); };
  const copyToClipboard = () => { triggerHaptic(); navigator.clipboard.writeText("42301810200082919550"); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const deletePost = async (id) => { if(confirm("Админ: Удалить пост с концами?")) { await deleteDoc(doc(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts', id)); } };
  const deleteFeedback = async (id) => { if(confirm("Админ: Удалить отзыв?")) { await deleteDoc(doc(db, 'artifacts', dbCollectionId, 'public', 'data', 'feedback', id)); } };
  const sendFeedback = async () => { if(!feedbackText.trim()) return; await addDoc(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'feedback'), { text: feedbackText, userId: user.uid, userName: user.displayName, createdAt: serverTimestamp() }); setFeedbackText(''); setShowFeedbackModal(false); alert("Отправлено!"); };
  
  const openEditor = () => {
      setView('diary');
      setDiaryTab('active');
      setShowInlineCreate(true);
  };

  const handleInlineAmen = async (e) => {
      e.preventDefault();
      await handleAmen(e);
  };

  if (loading || !dailyVerse) return <div className={`h-screen bg-[#f4f5f0] flex flex-col items-center justify-center gap-4 text-stone-400 font-light ${fonts.ui}`}><span className="italic animate-pulse">Загрузка тишины...</span><div className="w-5 h-5 border-2 border-stone-200 border-t-stone-400 rounded-full animate-spin"></div></div>;
  if (!user) return <div className={`fixed inset-0 flex flex-col items-center justify-center p-8 bg-[#fffbf7] ${fonts.ui}`}><div className="w-full max-w-xs space-y-8 text-center"><h1 className="text-6xl font-semibold text-stone-900 tracking-tight">Amen</h1><p className="text-stone-400 text-sm">Пространство тишины</p><form onSubmit={handleLogin} className="space-y-4 pt-8"><input name="username" type="text" placeholder="Имя" className="w-full bg-transparent border-b border-stone-200 py-3 text-center text-lg outline-none focus:border-stone-800 transition" required /><input name="password" type="password" placeholder="Пароль" className="w-full bg-transparent border-b border-stone-200 py-3 text-center text-lg outline-none focus:border-stone-800 transition" required />{authError && <p className="text-red-500 text-xs">{authError}</p>}<button disabled={isAuthLoading} className="w-full py-4 bg-stone-900 text-white text-sm font-medium rounded-xl">{isAuthLoading ? "..." : "Войти"}</button></form><button onClick={() => signInAnonymously(auth)} className="text-stone-400 text-sm">Войти тихо</button></div></div>;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=Spectral:wght@400;500&display=swap" rel="stylesheet" />
      <FilmGrain />
      
      <div className={`fixed inset-0 z-[-1] bg-cover bg-center transition-all duration-1000`} style={{ backgroundImage: theme.bgImage ? `url(${theme.bgImage})` : 'none', backgroundColor: theme.fallbackColor }} />
      <div className={`fixed inset-0 z-[-1] transition-all duration-1000 ${theme.overlay}`} />

      <div className={`relative z-10 h-[100dvh] w-full flex flex-col max-w-md mx-auto overflow-hidden`}>
        <TopMenu view={view} setView={setView} theme={theme} currentTheme={currentThemeId} setCurrentTheme={setCurrentThemeId} openThemeModal={() => setShowThemeModal(true)} openLegal={() => setShowLegalModal(true)} logout={() => signOut(auth)} isAdmin={isAdmin} isUiVisible={isUiVisible} />

        <main ref={mainScrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-6 pb-44 no-scrollbar scroll-smooth pt-28 min-h-screen"> 
          
          {!isOnline && (
              <div className="mb-4 text-center">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 text-xs font-medium ${theme.text} ${fonts.ui}`}>
                      <Disc size={12} className="animate-pulse mr-2"/> Оффлайн режим
                  </span>
              </div>
          )}

          {/* MAIN CONTENT SWITCH - REMOVED AnimatePresence mode="wait" for stability */}
          <div className="space-y-8">
            {view === 'flow' && (
              <motion.div variants={simpleContainer} initial="hidden" animate="show" className="space-y-8">
                <Card theme={theme} className="text-center py-10 relative overflow-hidden group">
                   <div className={`text-xs font-medium uppercase opacity-50 mb-6 ${fonts.ui}`}>Фокус дня</div>
                   <h2 className={`text-2xl font-normal leading-tight mb-6 px-2 ${fonts.content}`}>{dailyVerse.title}</h2>
                   <div className="mb-8 px-2 relative">
                       <span className={`text-4xl absolute -top-4 -left-2 opacity-10 ${fonts.content}`}>“</span>
                       <p className={`text-lg leading-[1.75] opacity-90 relative z-10 ${fonts.content}`}>{dailyVerse.text}</p>
                       <span className={`text-4xl absolute -bottom-8 -right-2 opacity-10 ${fonts.content}`}>”</span>
                   </div>
                   <div className={`text-sm opacity-50 mb-8 ${fonts.ui}`}>{dailyVerse.source}</div>
                   <div className={`${theme.containerBg} rounded-2xl p-6 mb-8 mx-2 text-left shadow-sm backdrop-blur-md`}>
                       <div className="flex gap-3">
                           <div className="w-0.5 bg-current opacity-20 rounded-full"></div>
                           <p className={`text-[17px] leading-relaxed opacity-90 ${fonts.content}`}>{dailyVerse.thought}</p>
                       </div>
                   </div>
                   <button onClick={() => { triggerHaptic(); openEditor(); }} className={`w-full py-4 text-sm font-medium rounded-xl transition ${theme.button} ${fonts.ui}`}>
                       {dailyVerse.action}
                   </button>
                </Card>

                <div className="flex items-center justify-center my-8 opacity-40">
                    <div className="h-px bg-current w-16"></div>
                    <span className={`mx-4 text-xs font-medium uppercase tracking-widest ${fonts.ui}`}>Единство</span>
                    <div className="h-px bg-current w-16"></div>
                </div>

                <div className="space-y-4">
                    {publicPosts.map(post => (
                         <Card key={post.id} theme={theme} className="!p-6 relative group">
                             <div className={`flex justify-between mb-4 opacity-50 text-xs font-normal ${fonts.ui}`}>
                                 <span>{post.authorName}</span>
                                 <div className="flex gap-2 mr-0">
                                    {post.status === 'answered' && <span className={`${theme.iconColor} font-medium flex items-center gap-1`}><CheckCircle2 size={12}/> Чудо</span>}
                                    <span>{post.createdAt?.toDate().toLocaleDateString()}</span>
                                 </div>
                             </div>
                             <p className={`mb-6 text-[17px] leading-[1.75] whitespace-pre-wrap opacity-90 ${fonts.content}`}>{post.text}</p>
                             <button onClick={() => toggleLike(post.id, post.likes)} className={`w-full py-3 text-sm font-medium transition rounded-xl flex items-center justify-center gap-2 ${post.likes?.includes(user.uid) ? theme.activeButton : theme.button} ${fonts.ui}`}>
                                 {post.likes?.includes(user.uid) ? "Amen" : "Amen"}
                                 {post.likes?.length > 0 && <span className="opacity-60 ml-1">{post.likes.length}</span>}
                             </button>
                             {isAdmin && <button onClick={() => deletePost(post.id)} className="absolute bottom-4 right-4 text-red-400 opacity-20 hover:opacity-100"><Trash2 size={16} /></button>}
                         </Card>
                     ))}
                </div>
              </motion.div>
            )}

            {view === 'diary' && (
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                    {/* LIST MODE */}
                    {!showInlineCreate ? (
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <div className={`flex items-center justify-between px-2 pb-4 ${fonts.ui}`}>
                                <h2 className="text-3xl font-semibold tracking-tight opacity-90 drop-shadow-sm">Amen</h2>
                                <button onClick={() => { triggerHaptic(); setShowInlineCreate(true); }} className={`p-3 rounded-full ${theme.button} backdrop-blur-xl transition hover:scale-105 active:scale-95`}>
                                    <PenLine size={20} />
                                </button>
                            </div>

                            <div className={`flex p-1 rounded-full mb-6 relative ${theme.containerBg} ${fonts.ui}`}>
                                <div className={`absolute top-1 bottom-1 w-1/2 bg-white shadow-sm rounded-full transition-all duration-300 ${diaryTab === 'active' ? 'left-1' : 'left-[49%]'}`} />
                                <button onClick={() => { triggerHaptic(); setDiaryTab('active'); }} className={`flex-1 py-2 text-xs font-medium relative z-10 transition-colors ${diaryTab === 'active' ? 'opacity-100' : 'opacity-50'}`}>Молитвы</button>
                                <button onClick={() => { triggerHaptic(); setDiaryTab('answered'); }} className={`flex-1 py-2 text-xs font-medium relative z-10 transition-colors ${diaryTab === 'answered' ? 'opacity-100' : 'opacity-50'}`}>Ответы</button>
                            </div>

                            <div className="space-y-4">
                                {myPrayers.filter(p => diaryTab === 'answered' ? p.status === 'answered' : p.status !== 'answered').length === 0 && (
                                    <div className={`text-center opacity-40 py-10 text-lg ${fonts.content}`}>
                                        {diaryTab === 'active' ? "Дневник чист..." : "Пока нет записанных ответов..."}
                                    </div>
                                )}
                                {myPrayers.filter(p => diaryTab === 'answered' ? p.status === 'answered' : p.status !== 'answered').map(p => (
                                    <Card key={p.id} theme={theme}>
                                        <div className={`flex justify-between items-start mb-3 ${fonts.ui}`}>
                                            <span className="text-xs font-normal opacity-50">{p.createdAt?.toDate().toLocaleDateString()}</span>
                                            {p.status === 'answered' ? (
                                                <span className={`${theme.iconColor} text-xs font-medium flex items-center gap-1`}><CheckCircle2 size={12}/> Ответ</span>
                                            ) : (
                                                <button onClick={() => startEditing(p)} className="opacity-40 hover:opacity-100"><Edit3 size={14} /></button>
                                            )}
                                        </div>

                                        {editingId === p.id ? (
                                            <div className={`mb-4 space-y-2 ${fonts.ui}`}>
                                                <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className={`w-full bg-transparent border-b border-current border-opacity-20 py-2 outline-none text-lg font-medium`} />
                                                <textarea value={editForm.text} onChange={e => setEditForm({...editForm, text: e.target.value})} className={`w-full bg-transparent border-b border-current border-opacity-20 py-2 outline-none text-sm h-20 resize-none ${fonts.content}`} />
                                                <div className="flex justify-end gap-3 pt-2">
                                                    <button onClick={() => setEditingId(null)} className="text-xs opacity-50">Отмена</button>
                                                    <button onClick={saveEdit} className="text-xs font-medium">Сохранить</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className={`text-xl font-medium mb-3 leading-snug ${fonts.ui}`}>{p.title}</h3>
                                                <p className={`text-[17px] leading-[1.75] opacity-90 whitespace-pre-wrap mb-6 ${fonts.content}`}>{p.text}</p>
                                            </>
                                        )}

                                        {p.status === 'answered' && p.answerNote && (
                                            <div className={`${theme.containerBg} p-5 rounded-2xl mb-4 border border-current border-opacity-10`}>
                                                <p className={`text-xs font-medium opacity-60 uppercase mb-2 ${fonts.ui}`}>Свидетельство</p>
                                                <p className={`text-[17px] leading-relaxed ${fonts.content}`}>{p.answerNote}</p>
                                            </div>
                                        )}
                                        
                                        <div className={`pt-4 border-t border-current border-opacity-10 flex justify-between items-center ${fonts.ui}`}>
                                            <button onClick={() => deleteDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', p.id))} className="text-xs opacity-40 hover:opacity-100 transition">Удалить</button>
                                            
                                            {p.status !== 'answered' ? (
                                                <div className="flex items-center gap-4">
                                                    <button onClick={() => incrementPrayerCount(p.id, p.prayerCount)} className={`text-xs font-medium opacity-60 hover:opacity-100 flex items-center gap-2 transition ${theme.text}`}>
                                                        <Hand size={14}/> {p.prayerCount || 1}
                                                    </button>
                                                    <button onClick={() => openAnswerModal(p.id)} className="flex items-center gap-2 text-xs font-medium opacity-60 hover:opacity-100 transition">
                                                        <CheckCircle2 size={14}/> Есть ответ
                                                    </button>
                                                </div>
                                            ) : null}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        // WRITER MODE
                        <motion.div 
                            key="writer"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 z-50 flex flex-col pt-28 px-6"
                            style={{ 
                                height: lockedHeight, // Force exact pixel height
                                touchAction: "none"
                            }} 
                        >
                             <div className="fixed top-12 left-6 z-[60]">
                                <button
                                    onClick={() => setShowInlineCreate(false)}
                                    className={`text-sm font-medium px-5 py-2.5 rounded-full backdrop-blur-xl ${theme.text} bg-white/10 hover:bg-white/20 transition shadow-sm`}
                                >
                                    Закрыть
                                </button>
                            </div>

                            <form onSubmit={handleAmen} className="w-full max-w-sm mx-auto flex flex-col gap-4 overflow-y-auto pb-40"> 
                                {/* Title Input */}
                                <div className={`rounded-2xl p-4 ${theme.containerBg} backdrop-blur-md transition-all focus-within:scale-[1.01]`}>
                                    <input 
                                        name="title" 
                                        placeholder="Тема..." 
                                        className={`w-full bg-transparent text-lg font-medium outline-none ${theme.text} ${theme.placeholderColor} text-center`}
                                        autoFocus 
                                    />
                                </div>

                                {/* Text Input */}
                                <div className={`rounded-2xl p-4 flex-1 h-48 ${theme.containerBg} backdrop-blur-md transition-all focus-within:scale-[1.01]`}>
                                    <textarea 
                                        name="text" 
                                        placeholder={placeholderText} 
                                        className={`w-full h-full bg-transparent text-base leading-relaxed resize-none outline-none ${theme.text} ${theme.placeholderColor} ${fonts.content}`} 
                                    />
                                </div>
                                
                                {/* Bottom Controls */}
                                <div className="flex gap-4 mt-2">
                                    {/* Privacy Toggle */}
                                    <div 
                                        onClick={() => setFocusPrayerPublic(!focusPrayerPublic)} 
                                        className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 ${theme.containerBg} backdrop-blur-md`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${focusPrayerPublic ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-current opacity-30'}`} />
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.text} opacity-60`}>
                                            {focusPrayerPublic ? "Все" : "Личное"}
                                        </span>
                                    </div>

                                    {/* Amen Button */}
                                    <button className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest rounded-2xl transition transform active:scale-95 ${theme.activeButton} shadow-lg ${fonts.ui}`}>
                                        Amen
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
            )}

            {view === 'admin_feedback' && isAdmin && (
                <motion.div variants={simpleContainer} initial="hidden" animate="show" className="space-y-4 pt-28">
                     <h2 className={`text-xl text-center mb-8 ${fonts.ui}`}>Входящие отзывы</h2>
                     {feedbacks.map(msg => (
                         <Card key={msg.id} theme={theme} className="relative">
                             <div className={`flex justify-between mb-3 opacity-50 text-xs font-normal ${fonts.ui}`}>
                                 <span>{msg.userName}</span>
                                 <span>{msg.createdAt?.toDate().toLocaleDateString()}</span>
                             </div>
                             <p className={`mb-4 text-sm leading-relaxed opacity-90 ${fonts.content}`}>{msg.text}</p>
                             <div className="flex justify-end">
                                 <button onClick={() => deleteFeedback(msg.id)} className="p-2 text-red-400 bg-red-500/10 rounded-full hover:bg-red-500/20"><Trash2 size={16} /></button>
                             </div>
                         </Card>
                     ))}
                </motion.div>
            )}

            {view === 'profile' && (
                <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="text-center pt-28">
                    <div className="pb-10">
                        <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center text-4xl font-light mb-8 shadow-2xl ${theme.activeButton} ${fonts.content}`}>
                            {user.displayName?.[0] || "A"}
                        </div>
                        <div className="relative mb-8 px-8 group">
                            <input value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={handleUpdateName} className={`w-full bg-transparent text-center text-3xl font-medium outline-none border-b border-transparent focus:border-current transition placeholder:opacity-30 ${fonts.ui}`} placeholder="Ваше имя" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 transition pointer-events-none text-xs">edit</span>
                        </div>
                        
                        <div className={`${theme.containerBg} rounded-2xl p-6 mb-8 text-left mx-4 shadow-sm backdrop-blur-md`}>
                            <div className="flex gap-4 items-start">
                                <div className="mt-1"><Compass size={16}/></div>
                                <div className="space-y-3">
                                    <h4 className={`text-xs font-bold uppercase tracking-widest mb-1 ${fonts.ui}`}>Путеводитель</h4>
                                    <p className={`text-sm leading-relaxed ${fonts.content}`}>
                                        <span className="font-medium">Утро:</span> Открой "Поток", чтобы принять Слово и настроить сердце.
                                    </p>
                                    <p className={`text-sm leading-relaxed ${fonts.content}`}>
                                        <span className="font-medium">День:</span> Используй "Дневник" для честного разговора с Богом.
                                    </p>
                                    <p className={`text-sm leading-relaxed ${fonts.content}`}>
                                        <span className="font-medium">Вечер:</span> Включи музыку в "Атмосфере", чтобы успокоить мысли.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <button onClick={() => setShowFeedbackModal(true)} className={`flex items-center gap-2 mx-auto text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl transition ${theme.button} ${fonts.ui}`}>
                                <MessageCircle size={14} /> Написать разработчику
                            </button>
                        </div>
                        <div className="mb-12">
                            <button onClick={() => setShowSupportModal(true)} className={`text-xs opacity-50 hover:opacity-100 transition flex items-center gap-2 mx-auto ${fonts.ui}`}>
                                <Heart size={12} /> Поддержать проект
                            </button>
                        </div>
                        <div className={`text-center opacity-40 mt-auto px-10 ${fonts.ui}`}>
                             <p className="text-[10px] leading-relaxed whitespace-pre-wrap">{DISCLAIMER_TEXT}</p>
                        </div>
                    </div>
                </motion.div>
            )}
          </div>

        </main>

        <AudioPlayer currentTrack={currentTrack} isPlaying={isPlaying} togglePlay={() => setIsPlaying(!isPlaying)} changeTrack={setCurrentTrack} theme={theme} isUiVisible={isUiVisible} />

        {/* --- OTHER MODALS --- */}
        <AnimatePresence>
            {showSupportModal && (
                <>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setShowSupportModal(false)}/>
                <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" className={`fixed top-1/4 left-6 right-6 z-50 rounded-[2rem] p-8 shadow-2xl ${theme.cardBg}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className={`text-xl font-medium ${fonts.ui}`}>Поддержка</h3>
                        <button onClick={() => setShowSupportModal(false)} className="opacity-40 hover:opacity-100"><X size={24}/></button>
                    </div>
                    <p className={`text-[17px] leading-relaxed opacity-90 mb-8 ${fonts.content}`}>
                        Amen создается в тишине и для тишины. Это не коммерческий проект, а служение. Ваша поддержка помогает оплачивать серверы и сохранять это пространство чистым от рекламы и шума. Спасибо, что вы рядом.
                    </p>
                    <button onClick={copyToClipboard} className={`w-full p-4 rounded-xl mb-4 flex items-center justify-between ${theme.containerBg} active:scale-95 transition`}>
                        <span className={`text-base tracking-wider font-medium ${fonts.ui}`}>42301810200082919550</span>
                        {copied ? <Check size={18} className={theme.iconColor}/> : <Copy size={18} className="opacity-60"/>}
                    </button>
                    {copied && <p className={`text-xs text-center opacity-60 ${fonts.ui}`}>Реквизиты скопированы</p>}
                </motion.div>
                </>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showAnswerModal && (
                <>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setShowAnswerModal(false)}/>
                <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" className={`fixed top-1/4 left-6 right-6 z-50 rounded-[2rem] p-8 shadow-2xl ${theme.cardBg} border border-current border-opacity-10`}>
                    <div className="text-center mb-6">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${theme.containerBg} ${theme.iconColor}`}><CheckCircle2 size={24} /></div>
                        <h3 className={`text-xl font-medium ${fonts.ui}`}>Чудо произошло?</h3>
                    </div>
                    <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Напиши краткое свидетельство..." className={`w-full p-4 rounded-xl outline-none h-32 text-sm resize-none mb-6 ${theme.containerBg} ${fonts.content}`} />
                    <button onClick={confirmAnswer} className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest ${theme.activeButton} shadow-lg active:scale-95 transition ${fonts.ui}`}>Подтвердить</button>
                </motion.div>
                </>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showFeedbackModal && (
                <>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setShowFeedbackModal(false)}/>
                <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" className={`fixed top-1/4 left-6 right-6 z-50 rounded-[2rem] p-8 shadow-2xl ${theme.cardBg}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className={`text-xl font-medium ${fonts.ui}`}>Разработчику</h3>
                        <button onClick={() => setShowFeedbackModal(false)} className="opacity-40 hover:opacity-100"><X size={24}/></button>
                    </div>
                    <p className={`text-sm opacity-60 mb-4 leading-relaxed ${fonts.ui}`}>Нашли ошибку? Есть идея? Или просто хотите сказать спасибо? Я читаю всё.</p>
                    <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Ваше сообщение..." className={`w-full p-4 rounded-xl outline-none h-32 text-[17px] leading-relaxed resize-none mb-6 ${theme.containerBg} ${fonts.content}`} />
                    <button onClick={sendFeedback} className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest ${theme.activeButton} shadow-lg active:scale-95 transition ${fonts.ui}`}>Отправить</button>
                </motion.div>
                </>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showThemeModal && (
                <>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-md" onClick={() => setShowThemeModal(false)}/>
                <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" className={`fixed top-1/2 left-6 right-6 -translate-y-1/2 z-[70] rounded-3xl p-8 shadow-2xl ${theme.cardBg} max-h-[70vh] overflow-y-auto`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className={`text-xl font-medium ${fonts.ui}`}>Атмосфера</h3>
                        <button onClick={() => setShowThemeModal(false)} className="opacity-40 hover:opacity-100"><X size={24}/></button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.values(THEMES).map(t => (
                            <button key={t.id} onClick={() => { setCurrentThemeId(t.id); }} className={`h-24 rounded-2xl relative overflow-hidden transition-all duration-300 ${currentThemeId === t.id ? 'ring-2 ring-offset-2 ring-current scale-105' : 'opacity-80 hover:opacity-100'}`}>
                            <img src={t.bgImage} className="absolute inset-0 w-full h-full object-cover" alt={t.label} />
                            <span className={`absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xs font-bold uppercase tracking-widest shadow-sm ${fonts.ui}`}>{t.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
                </>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showLegalModal && (
                <>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-md" onClick={() => setShowLegalModal(false)}/>
                <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" className={`fixed top-1/2 left-6 right-6 -translate-y-1/2 z-[70] rounded-3xl p-8 shadow-2xl ${theme.cardBg} max-h-[70vh] overflow-y-auto`}>
                    <button onClick={() => setShowLegalModal(false)} className="absolute top-6 right-6 opacity-40 hover:opacity-100"><X size={24}/></button>
                    <div>
                        <h3 className={`text-lg font-bold uppercase tracking-widest mb-6 opacity-50 ${fonts.ui}`}>Соглашение</h3>
                        <p className={`text-sm leading-relaxed opacity-80 ${fonts.content}`}>{TERMS_TEXT}</p>
                    </div>
                </motion.div>
                </>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showSuccessModal && (
                <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} className="fixed inset-0 z-[60] flex items-center justify-center p-8 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 flex flex-col items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${theme.activeButton}`}><Check size={32} /></div>
                        <h3 className={`text-xl font-medium text-stone-900 ${fonts.ui}`}>{successMessage}</h3>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </>
  );
};

export default App;
