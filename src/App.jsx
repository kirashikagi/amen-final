import React, { useState, useEffect, useRef } from 'react';
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
  getDoc, // Добавлено для чтения одного документа
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove 
} from "firebase/firestore";
import { 
  Heart, User, Plus, Play, Pause, SkipForward, Trash2, CheckCircle2, 
  Sparkles, Music, LogOut, ArrowLeft, Edit2, Save, Info, Shield, 
  ArrowRight, Send, Menu, X, Palette, AlertTriangle, 
  MessageSquarePlus, Inbox, BookOpen, MessageCircle
} from 'lucide-react';

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyC13LrL4yNE4F8ekrZQnhdvgzhkfnVaR_w",
  authDomain: "amen-7e4fa.firebaseapp.com",
  projectId: "amen-7e4fa",
  storageBucket: "amen-7e4fa.firebasestorage.app",
  messagingSenderId: "1082048216180",
  appId: "1:1082048216180:web:cc5e252e70153f1c332521"
};

const appId = "amen-production";
const ADMIN_NAMES = ['Admin', 'Founder', 'admin', 'founder'];

// Инициализация Firebase (проверка на дублирование)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- THEMES ---
const THEMES = {
  dawn: { 
    id: 'dawn', 
    bgImage: '/dawn.jpg', 
    fallbackColor: '#fff7ed', 
    cardBg: 'bg-[#fffbf7]/95', 
    text: 'text-stone-800', 
    subText: 'text-stone-500',
    accent: 'text-orange-700', 
    overlay: 'bg-[#78350f]/10',
    button: 'bg-[#fff7ed] text-stone-800 border border-orange-200/50 shadow-sm', 
    activeButton: 'bg-orange-100 text-orange-900',
    menuBg: 'bg-[#fffbf7]/95 text-stone-800',
    inputBg: 'bg-stone-900/5'
  },
  ocean: { 
    id: 'ocean', 
    bgImage: '/ocean.jpg', 
    fallbackColor: '#f0f9ff',
    cardBg: 'bg-[#f0f9ff]/95',
    text: 'text-slate-800', 
    subText: 'text-slate-500',
    accent: 'text-sky-700', 
    overlay: 'bg-[#0c4a6e]/10',
    button: 'bg-[#f0f9ff] text-slate-800 border border-sky-200/50 shadow-sm',
    activeButton: 'bg-sky-100 text-sky-900',
    menuBg: 'bg-[#f0f9ff]/95 text-slate-800',
    inputBg: 'bg-slate-900/5'
  },
  forest: { 
    id: 'forest', 
    bgImage: '/forest.jpg', 
    fallbackColor: '#f0fdf4', 
    cardBg: 'bg-[#f2fcf5]/95',
    text: 'text-emerald-900', 
    subText: 'text-emerald-600',
    accent: 'text-emerald-700', 
    overlay: 'bg-[#064e3b]/10',
    button: 'bg-[#f0fdf4] text-emerald-900 border border-emerald-200/50 shadow-sm',
    activeButton: 'bg-emerald-100 text-emerald-900',
    menuBg: 'bg-[#f2fcf5]/95 text-emerald-900',
    inputBg: 'bg-emerald-900/5'
  },
  dusk: { 
    id: 'dusk', 
    bgImage: '/dusk.jpg', 
    fallbackColor: '#faf5ff', 
    cardBg: 'bg-[#faf5ff]/95',
    text: 'text-indigo-950', 
    subText: 'text-indigo-500/70',
    accent: 'text-purple-700', 
    overlay: 'bg-[#3b0764]/10',
    button: 'bg-[#faf5ff] text-indigo-900 border border-purple-200/50 shadow-sm',
    activeButton: 'bg-purple-100 text-purple-900',
    menuBg: 'bg-[#faf5ff]/95 text-indigo-950',
    inputBg: 'bg-indigo-900/5'
  },
  night: { 
    id: 'night', 
    bgImage: '/night.jpg', 
    fallbackColor: '#0f172a',
    cardBg: 'bg-[#1e293b]/90', 
    text: 'text-slate-100', 
    subText: 'text-slate-400',
    accent: 'text-blue-200', 
    overlay: 'bg-[#020617]/40',
    button: 'bg-[#1e293b] text-slate-200 border border-slate-700 shadow-sm',
    activeButton: 'bg-slate-700 text-white',
    menuBg: 'bg-[#1e293b]/95 text-slate-100',
    inputBg: 'bg-black/20' 
  },
  noir: { 
    id: 'noir', 
    bgImage: '/noir.jpg', 
    fallbackColor: '#1c1917',
    cardBg: 'bg-[#1c1917]/90', 
    text: 'text-stone-200', 
    subText: 'text-stone-500',
    accent: 'text-stone-100', 
    overlay: 'bg-black/40',
    button: 'bg-[#292524] text-stone-300 border border-stone-700 shadow-sm',
    activeButton: 'bg-stone-700 text-white',
    menuBg: 'bg-[#1c1917]/95 text-stone-200',
    inputBg: 'bg-black/30' 
  },
};

// --- PRAYER CATEGORIES ---
const PRAYER_CATEGORIES = [
  { id: 'focus', label: 'Фокус дня', icon: '🔥' },
  { id: 'heart', label: 'Сердце', icon: '❤️' },
  { id: 'family', label: 'Семья', icon: '🌿' },
  { id: 'work', label: 'Дело', icon: '💼' },
  { id: 'world', label: 'Мир', icon: '🌍' },
  { id: 'thank', label: 'Спасибо', icon: '✨' }
];

// --- FALLBACK DATA (SAFETY NET) ---
// Используется, если в Firestore нет данных на сегодня
const FALLBACK_READINGS = {
  // ДЕКАБРЬ
  "21-12": { title: "Передача управления", source: "Притчи 16:3", text: "Предай Господу дела твои, и предприятия твои совершатся.", thought: "Доверие Богу — не отказ от действий, а смена источника контроля.", action: "Осознанно отдай Богу один конкретный план." },
  "22-12": { title: "Мудрость доступна", source: "Иакова 1:5", text: "Если же у кого из вас недостаёт мудрости, да просит у Бога…", thought: "Бог не упрекает за вопросы — Он приглашает к диалогу.", action: "Попроси у Бога мудрости для текущей ситуации." },
  "23-12": { title: "Новое утро", source: "Плач Иеремии 3:22–23", text: "…милость Господа… обновляются каждое утро.", thought: "Каждый день начинается не с нуля, а с Божьей верности.", action: "Начни день с благодарности." },
  "24-12": { title: "Радость без шума", source: "Луки 2:10–11", text: "…возвещаю вам великую радость… родился вам Спаситель.", thought: "Бог действует тихо, но результат — вечный.", action: "Заметь Божье присутствие в простом." },
  "25-12": { title: "Бог рядом", source: "Иоанна 1:14", text: "И Слово стало плотью и обитало с нами.", thought: "Бог не на расстоянии — Он близко.", action: "Проведи время с Богом осознанно." },
  "26-12": { title: "Свобода от обвинений", source: "Римлянам 8:1", text: "Нет ныне никакого осуждения…", thought: "Во Христе прошлое не управляет настоящим.", action: "Прими Божье прощение." },
  "27-12": { title: "С Кем ты строишь", source: "Псалом 126:1", text: "Если Господь не созиждет дома…", thought: "Успех без Бога — пустой.", action: "Проверь свои основания." },
  "28-12": { title: "Бог завершает", source: "Филиппийцам 1:6", text: "Начавший в вас доброе дело будет совершать его.", thought: "Ты — процесс, а не ошибка.", action: "Доверь Богу свой рост." },
  "29-12": { title: "Свой сезон", source: "Екклесиаста 3:1", text: "Всему своё время…", thought: "Текущий сезон — часть Божьего плана.", action: "Прими время, в котором ты сейчас." },
  "30-12": { title: "Цена дня", source: "Псалом 90:12", text: "Научи нас так счислять дни наши…", thought: "Мудрость начинается с ценности времени.", action: "Подведи итоги года с Богом." },
  "31-12": { title: "Новое начинается", source: "Исаия 43:18–19", text: "Вот, Я делаю новое…", thought: "Бог зовёт вперёд, а не назад.", action: "Оставь старое и войди с верой." },
  
  // ЯНВАРЬ
  "01-01": { title: "Первый приоритет", source: "Матфея 6:33", text: "Ищите прежде Царства Божия…", thought: "Приоритет определяет направление года.", action: "Поставь Бога первым." },
  "02-01": { title: "Хранимое сердце", source: "Притчи 4:23", text: "Больше всего хранимого храни сердце твоё.", thought: "Внутреннее формирует внешнее.", action: "Следи за мыслями." },
  "03-01": { title: "Обновление мышления", source: "Римлянам 12:2", text: "Преобразуйтесь обновлением ума…", thought: "Перемены начинаются внутри.", action: "Замени ложь истиной." },
  "04-01": { title: "Смелость с Богом", source: "Иисуса Навина 1:9", text: "Будь твёрд и мужествен…", thought: "Божье присутствие — источник силы.", action: "Сделай смелый шаг." },
  "05-01": { title: "Отдать путь", source: "Псалом 36:5", text: "Предай Господу путь твой…", thought: "Доверие освобождает.", action: "Отпусти контроль." },
  "06-01": { title: "Место покоя", source: "Матфея 11:28", text: "Придите ко Мне…", thought: "Иисус — источник настоящего покоя.", action: "Приди к Нему таким, как есть." },
  "07-01": { title: "Источник плода", source: "Иоанна 15:5", text: "Без Меня не можете делать ничего.", thought: "Плод рождается из близости.", action: "Углуби отношения с Богом." },
  "08-01": { title: "Доверие без понимания", source: "Притчи 3:5–6", text: "Надейся на Господа всем сердцем…", thought: "Не всё нужно понимать, чтобы доверять.", action: "Доверь Богу свои решения." },
  "09-01": { title: "Не раньше времени", source: "Галатам 6:9", text: "…да не унываем.", thought: "Плод приходит вовремя.", action: "Продолжай делать добро." },
  "10-01": { title: "Простая верность", source: "Михея 6:8", text: "…действовать справедливо…", thought: "Бог ценит верность больше формы.", action: "Прояви милость сегодня." },
  "11-01": { title: "Видимый свет", source: "Матфея 5:16", text: "Да светит свет ваш…", thought: "Вера становится видимой через дела.", action: "Пусть поступки говорят." },
  "12-01": { title: "Работа как служение", source: "Колоссянам 3:23", text: "…делайте как для Господа.", thought: "Любая работа может быть поклонением.", action: "Делай своё дело от сердца." },
  "13-01": { title: "Навигатор жизни", source: "Псалом 118:105", text: "Слово Твоё — светильник ноге моей.", thought: "Писание даёт направление.", action: "Прочитай Слово внимательно." },
  "14-01": { title: "Критерий любви", source: "1 Коринфянам 16:14", text: "Всё у вас да будет с любовью.", thought: "Любовь — мерило всего.", action: "Сделай что-то из любви." },
  "15-01": { title: "Живая вера", source: "Иакова 1:22", text: "Будьте исполнителями слова…", thought: "Истина работает только в действии.", action: "Примени услышанное." },
  "16-01": { title: "Близкий Бог", source: "Псалом 33:19", text: "Близок Господь к сокрушённым.", thought: "Бог рядом в слабости.", action: "Приди к Нему честно." },
  "17-01": { title: "Ищи дальше", source: "Матфея 7:7", text: "Ищите — и найдёте.", thought: "Бог отвечает настойчивым.", action: "Продолжай искать." },
  "18-01": { title: "Источник надежды", source: "Римлянам 15:13", text: "Бог надежды да исполнит вас…", thought: "Надежда приходит от Бога.", action: "Наполнись миром." },
  "19-01": { title: "Снять груз", source: "1 Петра 5:7", text: "Все заботы ваши возложите на Него.", thought: "Ты не создан нести всё сам.", action: "Отдай Богу тревоги." },
  "20-01": { title: "Проверка верности", source: "Притчи 17:17", text: "Друг любит во всякое время.", thought: "Верность видна в процессе.", action: "Будь надёжным." },
  "21-01": { title: "Он с тобой", source: "Матфея 28:20", text: "Я с вами во все дни…", thought: "Божье присутствие постоянно.", action: "Живи с этим осознанием." },
  "22-01": { title: "Под Его руководством", source: "Псалом 22:1", text: "Господь — Пастырь мой…", thought: "Бог ведёт, а не просто наблюдает.", action: "Доверь Ему направление." },
  "23-01": { title: "Следуй за Светом", source: "Иоанна 8:12", text: "Я свет миру.", thought: "Свет всегда сильнее тьмы.", action: "Иди за Христом." },
  "24-01": { title: "Создан для добра", source: "Ефесянам 2:10", text: "Мы — Его творение…", thought: "Твоя жизнь имеет смысл и цель.", action: "Сделай добро осознанно." },
  "25-01": { title: "Отпуская — находишь", source: "Матфея 10:39", text: "Кто потеряет душу свою ради Меня…", thought: "Отдавая Богу, мы приобретаем.", action: "Отпусти то, за что держишься." },
  "26-01": { title: "Сила слов", source: "Псалом 19:15", text: "Да будут слова уст моих благоугодны Тебе.", thought: "Слова формируют реальность.", action: "Следи за своей речью." },
  "27-01": { title: "Мир иной природы", source: "Иоанна 14:27", text: "Мир Мой даю вам.", thought: "Божий мир не зависит от обстоятельств.", action: "Прими этот мир." },
  "28-01": { title: "Надежда, которая держит", source: "Римлянам 5:5", text: "Надежда не постыжает.", thought: "Божьи обещания надёжны.", action: "Держись обетований." },
  "29-01": { title: "Формирующее окружение", source: "Притчи 27:17", text: "Железо железо острит.", thought: "Люди вокруг формируют нас.", action: "Выбирай окружение мудро." },
  "30-01": { title: "Верность сегодня", source: "Матфея 25:21", text: "В малом ты был верен…", thought: "Большое начинается с малого.", action: "Будь верен сегодня." },
  "31-01": { title: "Всё новое", source: "Откровение 21:5", text: "Вот, творю всё новое.", thought: "Будущее в Божьих руках.", action: "Смотри вперёд с верой." }
};

const DAILY_WORD_DEFAULT = { title: "Тишина", source: "Псалом 46:11", text: "Остановитесь и познайте, что Я — Бог.", thought: "В суете трудно услышать шепот.", action: "Проведи 5 минут в полной тишине." };

const AUDIO_TRACKS = [
  { id: 1, title: "Deep Prayer", url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3", duration: "3:15" },
  { id: 2, title: "Quiet Spirit", url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3", duration: "4:20" },
  { id: 3, title: "Sanctuary", url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3", duration: "2:45" },
  { id: 4, title: "Rain & Peace", url: "https://cdn.pixabay.com/download/audio/2022/07/06/audio_9979948074.mp3", duration: "5:30" },
  { id: 5, title: "Ethereal", url: "https://cdn.pixabay.com/download/audio/2021/09/06/audio_3707c2eeec.mp3", duration: "3:45" },
  { id: 6, title: "Holy Ground", url: "https://cdn.pixabay.com/download/audio/2021/11/24/audio_c764c67035.mp3", duration: "4:12" },
  { id: 7, title: "Reflection", url: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_65903b415a.mp3", duration: "2:55" },
  { id: 8, title: "Night Vigil", url: "https://cdn.pixabay.com/download/audio/2022/02/07/audio_03d98c227a.mp3", duration: "4:00" },
  { id: 9, title: "Morning Light", url: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_34b6814674.mp3", duration: "3:20" },
  { id: 10, title: "Silence", url: "https://cdn.pixabay.com/download/audio/2022/04/27/audio_6861d85942.mp3", duration: "5:00" }
];

// --- COMPONENTS ---

const Card = ({ children, theme, className = "", onClick }) => (
  <motion.div 
    layout
    onClick={onClick} 
    className={`rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm transition-colors duration-500 ${theme.cardBg} ${theme.text} ${className}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    {children}
  </motion.div>
);

const AudioPlayer = ({ currentTrack, isPlaying, togglePlay, nextTrack, theme }) => {
  const audioRef = useRef(null);
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(e => console.log("Audio err", e));
      else audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
      className={`fixed bottom-8 left-0 right-0 z-40 flex justify-center px-6 pointer-events-none pb-[env(safe-area-inset-bottom)]`}
    >
      <div className={`pointer-events-auto flex items-center justify-between py-3 pl-5 pr-3 rounded-full shadow-2xl backdrop-blur-xl border border-white/10 w-full max-w-sm transition-all duration-500 ${theme.menuBg}`}>
        <audio ref={audioRef} src={currentTrack.url} onEnded={nextTrack} />
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`p-2 rounded-full ${theme.button}`}>
            <Music size={14} />
          </div>
          <div className="flex flex-col truncate pr-4">
            <span className={`text-[10px] font-bold uppercase tracking-widest truncate opacity-80 ${theme.text}`}>{currentTrack.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={togglePlay} className={`p-2 rounded-full hover:scale-105 transition active:scale-95 ${theme.button}`}>
             {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" ml="2px" />}
          </button>
          <button onClick={nextTrack} className="p-2 opacity-50 hover:opacity-100 active:scale-95"><SkipForward size={18} /></button>
        </div>
      </div>
    </motion.div>
  );
};

const TopMenu = ({ view, setView, theme, currentTheme, setCurrentTheme, openFeedback, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuItems = [
    { id: 'home', label: 'Сегодня', icon: <Sparkles size={18} /> },
    { id: 'word', label: 'Слово', icon: <BookOpen size={18} /> },
    { id: 'prayer', label: 'Молитва', icon: <MessageCircle size={18} /> },
    { id: 'unity', label: 'Единство', icon: <Heart size={18} /> },
    { id: 'profile', label: 'Профиль', icon: <User size={18} /> },
  ];

  return (
    <>
      <div className="fixed top-12 right-6 z-[60]">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsOpen(!isOpen)} className={`p-3 rounded-full shadow-lg transition-colors duration-300 ${isOpen ? 'rotate-90' : ''} ${theme.button}`}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-40 backdrop-blur-[2px] ${theme.overlay}`} onClick={() => setIsOpen(false)}/>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: -20, x: 20 }} animate={{ opacity: 1, scale: 1, y: 0, x: 0 }} exit={{ opacity: 0, scale: 0.9, y: -20, x: 20 }} transition={{ type: "spring", duration: 0.4 }} className={`fixed top-28 right-6 z-50 w-64 rounded-[2rem] shadow-2xl p-4 border border-white/5 backdrop-blur-xl ${theme.menuBg}`}>
              <div className="flex flex-col gap-1 mb-6">
                {menuItems.map(item => (
                  <motion.button key={item.id} whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }} onClick={() => { setView(item.id); setIsOpen(false); }} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${view === item.id ? `${theme.activeButton} shadow-sm` : 'opacity-60 hover:opacity-100'}`}>
                    {item.icon}<span className="text-sm uppercase tracking-wider">{item.label}</span>
                  </motion.button>
                ))}
                
                <motion.button whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }} onClick={() => { openFeedback(); setIsOpen(false); }} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors opacity-60 hover:opacity-100`}>
                    <MessageSquarePlus size={18} /><span className="text-sm uppercase tracking-wider">Написать разработчику</span>
                </motion.button>

                {isAdmin && (
                  <motion.button whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }} onClick={() => { setView('admin_feedback'); setIsOpen(false); }} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors opacity-60 hover:opacity-100 text-orange-500`}>
                      <Inbox size={18} /><span className="text-sm uppercase tracking-wider">Входящие</span>
                  </motion.button>
                )}
              </div>
              
              <div className="pt-4 border-t border-current border-opacity-10">
                <div className="flex items-center gap-2 mb-3 opacity-50 px-2"><Palette size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">Атмосфера</span></div>
                <div className="grid grid-cols-3 gap-2">
                   {Object.values(THEMES).map(t => (
                     <motion.button key={t.id} whileTap={{ scale: 0.9 }} onClick={() => setCurrentTheme(t.id)} className={`h-10 rounded-lg border-2 overflow-hidden relative transition-all ${currentTheme === t.id ? 'border-current scale-105 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`} style={{backgroundColor: t.fallbackColor}}><img src={t.bgImage} className="absolute inset-0 w-full h-full object-cover" alt={t.id} /></motion.button>
                   ))}
                </div>
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
  const [view, setView] = useState('home');
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('amen-theme') || 'dawn'); 
  const [theme, setTheme] = useState(THEMES[currentTheme] || THEMES.dawn);
  const [currentTrack, setCurrentTrack] = useState(AUDIO_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [myPrayers, setMyPrayers] = useState([]);
  const [publicPosts, setPublicPosts] = useState([]);
  const [dailyVerse, setDailyVerse] = useState(null); // Изменено на null для загрузки
  const [feedbacks, setFeedbacks] = useState([]);

  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [showFocusPrayerModal, setShowFocusPrayerModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false); 
  const [expandedPrayerId, setExpandedPrayerId] = useState(null); 
  const [prayerUpdateText, setPrayerUpdateText] = useState('');
  const [focusPrayerPublic, setFocusPrayerPublic] = useState(false);
  
  const isAdmin = user && ADMIN_NAMES.includes(user.displayName);

  // Логика получения слова дня (Сначала БД, потом Фолбэк)
  useEffect(() => {
    const fetchDailyWord = async () => {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const key = `${day}-${month}`;
      
      try {
        // 1. Пробуем достать из базы
        const readingRef = doc(db, 'artifacts', appId, 'public', 'daily_readings', key);
        const snap = await getDoc(readingRef);
        
        if (snap.exists()) {
          setDailyVerse(snap.data());
        } else {
          // 2. Если в базе нет — берем из хардкода
          console.log("Reading not found in DB, using fallback");
          setDailyVerse(FALLBACK_READINGS[key] || DAILY_WORD_DEFAULT);
        }
      } catch (e) {
        console.error("Error fetching reading:", e);
        setDailyVerse(FALLBACK_READINGS[key] || DAILY_WORD_DEFAULT);
      }
    };

    fetchDailyWord();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => { 
      setUser(u); setLoading(false);
      if(u) setNewName(u.displayName || (u.isAnonymous ? "Пилигрим" : ""));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { 
    localStorage.setItem('amen-theme', currentTheme); 
    setTheme(THEMES[currentTheme] || THEMES.dawn);
    document.body.style.backgroundColor = (THEMES[currentTheme] || THEMES.dawn).fallbackColor;
  }, [currentTheme]);

  useEffect(() => { if (!user) return; return onSnapshot(query(collection(db, 'artifacts', appId, 'users', user.uid, 'prayers'), orderBy('createdAt', 'desc')), snap => setMyPrayers(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, [user]);
  useEffect(() => { if (view !== 'unity') return; return onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'posts'), orderBy('createdAt', 'desc'), limit(50)), snap => setPublicPosts(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, [view]);
  
  useEffect(() => {
    if (view !== 'admin_feedback' || !isAdmin) return;
    return onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'feedback'), orderBy('createdAt', 'desc')), snap => setFeedbacks(snap.docs.map(d => ({id: d.id, ...d.data()}))));
  }, [view, isAdmin]);

  const handleLogin = async (e) => {
    e.preventDefault(); setAuthError(''); setIsAuthLoading(true);
    const { username, password } = e.target.elements;
    if (!username.value || !password.value) { setAuthError("Заполните все поля"); setIsAuthLoading(false); return; }
    const fakeEmail = `${username.value.replace(/\s/g, '').toLowerCase()}@amen.app`;
    try { await signInWithEmailAndPassword(auth, fakeEmail, password.value); } catch (err) {
      if (['auth/user-not-found', 'auth/invalid-credential', 'auth/invalid-email'].includes(err.code)) {
        try { const u = await createUserWithEmailAndPassword(auth, fakeEmail, password.value); await updateProfile(u.user, { displayName: username.value }); } catch (cre) { setAuthError(cre.code === 'auth/weak-password' ? "Пароль слишком простой" : "Ошибка создания"); }
      } else { setAuthError("Неверный пароль"); }
    }
    setIsAuthLoading(false);
  };

  const updateUserName = async () => {
    if(!newName.trim()) return;
    try {
        await updateProfile(user, { displayName: newName });
        setIsEditingName(false);
        // Force refresh user state locally if needed, though onAuthStateChanged usually handles it
    } catch(e) {
        alert("Ошибка обновления имени");
    }
  };

  const addPrayer = async (e, forcedCategory = null, forcedTitle = null) => {
    e.preventDefault();
    const title = forcedTitle || e.target.elements.title.value;
    const text = e.target.elements.text.value;
    const category = forcedCategory || e.target.elements.category.value;
    const isPublic = forcedCategory ? focusPrayerPublic : e.target.elements.pub.checked;

    if(!title.trim()) return;

    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'prayers'), {
      title, text, category, createdAt: serverTimestamp(), status: 'active', updates: []
    });
    if(isPublic) {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'posts'), {
        text: title + (text ? `\n\n${text}` : ""), category, authorId: user.uid, authorName: user.displayName || "Пилигрим", createdAt: serverTimestamp(), likes: []
      });
    }
    e.target.reset(); 
    setShowPrayerForm(false);
    setShowFocusPrayerModal(false);
    setFocusPrayerPublic(false);
  };

  const sendFeedback = async (e) => {
    e.preventDefault();
    const text = e.target.elements.text.value;
    if(!text.trim()) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'feedback'), {
        text, userId: user.uid, userName: user.displayName || "Аноним", createdAt: serverTimestamp()
    });
    setShowFeedbackModal(false);
    alert("Ваше послание отправлено.");
  };

  const deleteFeedback = async (id) => {
    if(!isAdmin) return;
    if(confirm("Удалить отзыв?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'feedback', id));
  }

  const addPrayerUpdate = async (pid) => {
    if (!prayerUpdateText.trim()) return;
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'prayers', pid), { updates: arrayUnion({ text: prayerUpdateText, createdAt: new Date().toISOString() }) });
    setPrayerUpdateText('');
  };

  const handleDelete = async (p) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'prayers', p.id));
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'posts'), where('authorId', '==', user.uid), where('text', '>=', p.title));
      const s = await getDocs(q); 
      s.forEach(async (d) => { 
          if(d.data().text.includes(p.title)) await deleteDoc(d.ref); 
      });
    } catch(e) {
      console.error("Delete error", e);
    }
  };

  const adminDeletePost = async (postId) => {
    if (!isAdmin) return;
    if (confirm("Удалить?")) {
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId));
        } catch (e) {
            alert("Ошибка удаления. Проверьте права (Rules).");
        }
    }
  };

  const adminCleanGhosts = async () => {
    if (!isAdmin) return;
    if (!confirm("Очистить битые посты?")) return;
    alert("Для очистки используйте консоль. Опасно.");
  }

  const toggleLike = async (id, likes) => {
    const ref = doc(db, 'artifacts', appId, 'public', 'data', 'posts', id);
    await updateDoc(ref, { likes: likes?.includes(user.uid) ? arrayRemove(user.uid) : arrayUnion(user.uid) });
  };

  // Ждем загрузку пользователя И слова дня
  if (loading || !dailyVerse) return <div className="h-screen bg-[#f4f5f0] flex items-center justify-center text-stone-400 font-serif italic">Amen...</div>;

  if (!user) {
    return (
      <div className="fixed inset-0 w-full h-[100dvh] flex flex-col items-center justify-center p-8 bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url(${THEMES.dawn.bgImage})` }}>
        <div className="absolute inset-0 bg-white/40 backdrop-blur-md" />
        <div className="relative z-10 w-full max-w-xs">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
               <h1 className="text-5xl font-serif text-stone-900 mb-2">Amen</h1>
               <p className="text-stone-600 italic font-light">Тайная комната</p>
            </motion.div>
            <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} onSubmit={handleLogin} className="space-y-4">
               {/* Soft login inputs */}
               <input name="username" type="text" placeholder="Ваше имя" className="w-full bg-[#fdfaf6]/90 border-0 rounded-2xl py-4 px-6 text-stone-800 placeholder:text-stone-400 shadow-xl focus:ring-2 focus:ring-stone-200 outline-none transition" required />
               <input name="password" type="password" placeholder="Пароль" className="w-full bg-[#fdfaf6]/90 border-0 rounded-2xl py-4 px-6 text-stone-800 placeholder:text-stone-400 shadow-xl focus:ring-2 focus:ring-stone-200 outline-none transition" required />
               {authError && <p className="text-red-500 text-xs text-center">{authError}</p>}
               <button disabled={isAuthLoading} className="w-full py-4 bg-stone-800 text-white rounded-2xl font-medium shadow-xl hover:scale-[1.02] transition">{isAuthLoading ? "..." : "Войти"}</button>
            </motion.form>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} onClick={() => signInAnonymously(auth)} className="w-full mt-6 text-stone-600 text-sm hover:text-stone-900 transition">Войти тихо (Анонимно)</motion.button>
        </div>
      </div>
    );
  }

  const pageVariants = { initial: { opacity: 0, y: 10 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -10 } };
  const pageTransition = { type: "tween", ease: "anticipate", duration: 0.3 };

  return (
    <>
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat transition-all duration-1000 h-[100dvh] w-screen"
        style={{ backgroundImage: `url(${theme.bgImage})`, backgroundColor: theme.fallbackColor }}
      />
      
      <div className={`fixed inset-0 z-[-1] transition-all duration-1000 ${theme.overlay}`} />

      <div className={`relative z-10 h-[100dvh] w-full flex flex-col max-w-md mx-auto font-sans ${theme.text} overflow-hidden`}>
        <TopMenu view={view} setView={setView} theme={theme} currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} openFeedback={() => setShowFeedbackModal(true)} isAdmin={isAdmin} />

        {view !== 'word' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-16 pb-6 px-8">
               <h1 className={`text-4xl font-serif font-medium tracking-wide drop-shadow-sm ${theme.text}`}>Amen</h1>
           </motion.div>
        )}

        <main className="flex-1 overflow-y-auto px-6 pb-44 no-scrollbar overscroll-none">
          <AnimatePresence mode="wait">
            {view === 'home' && (
              <motion.div key="home" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="space-y-6 pb-10">
                <Card theme={theme} className="relative overflow-hidden group min-h-[180px] flex flex-col justify-between">
                  <div>
                     <div className="flex justify-between items-center mb-4">
                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 ${theme.text}`}>Фокус дня</span>
                        {/* CURRENT DATE BADGE */}
                        <div className={`text-[10px] px-2 py-1 rounded-full ${theme.button} opacity-70`}>
                           {new Date().toLocaleDateString('ru-RU', {day: 'numeric', month: 'long'})}
                        </div>
                     </div>
                     <h2 className="text-2xl font-serif leading-tight mb-4">{dailyVerse.title}</h2>
                  </div>
                  <button onClick={() => setView('word')} className={`w-full py-3 rounded-xl text-sm font-medium transition active:scale-95 ${theme.button}`}>Открыть слово</button>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                  <Card theme={theme} className="flex flex-col items-center justify-center py-8">
                      <span className="text-4xl font-serif mb-1">{myPrayers.filter(p => p.status === 'active').length}</span>
                      <span className={`text-[10px] uppercase tracking-widest font-bold opacity-50 ${theme.text}`}>Нужды</span>
                  </Card>
                  <Card theme={theme} className="flex flex-col items-center justify-center py-8">
                      <span className="text-4xl font-serif mb-1">{myPrayers.filter(p => p.status === 'answered').length}</span>
                      <span className={`text-[10px] uppercase tracking-widest font-bold opacity-50 ${theme.text}`}>Чудеса</span>
                  </Card>
                </div>
              </motion.div>
            )}

            {view === 'word' && (
                <motion.div key="word" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="h-full flex flex-col justify-center p-2">
                    <Card theme={theme} className="text-center py-12 relative flex flex-col items-center">
                        <button onClick={() => setView('home')} className="absolute top-6 left-6 opacity-40 hover:opacity-100"><ArrowLeft size={24}/></button>
                        
                        <h2 className="text-3xl font-serif font-medium mb-4 leading-tight px-2">{dailyVerse.title}</h2>
                        <div className="w-10 h-1 bg-current opacity-10 mb-6 rounded-full" />
                        <p className="text-xl font-serif italic opacity-80 mb-6 leading-relaxed px-4">"{dailyVerse.text}"</p>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-40 mb-8">{dailyVerse.source}</span>
                        
                        <div className={`p-6 rounded-2xl w-full text-left mb-6 ${theme.inputBg}`}>
                           <p className="text-sm font-medium opacity-90 leading-relaxed">{dailyVerse.thought}</p>
                        </div>

                        <button 
                            onClick={() => setShowFocusPrayerModal(true)}
                            className={`w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 ${theme.button}`}
                        >
                           {dailyVerse.action} <ArrowRight size={16} />
                        </button>
                    </Card>
                </motion.div>
            )}

            {view === 'prayer' && (
                <motion.div key="prayer" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="space-y-6 pb-10">
                    <div className="flex justify-between items-center px-1">
                        <h2 className={`text-xl font-serif ${theme.text}`}>Мой список</h2>
                        <motion.button whileTap={{scale: 0.9}} onClick={() => setShowPrayerForm(!showPrayerForm)} className={`p-3 rounded-full shadow-lg hover:scale-110 transition ${theme.button}`}><Plus size={20}/></motion.button>
                    </div>
                    
                    <AnimatePresence>
                    {showPrayerForm && (
                        <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="overflow-hidden">
                          <Card theme={theme} className="mb-8">
                            <form onSubmit={addPrayer}>
                              <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
                                {PRAYER_CATEGORIES.filter(c => c.id !== 'focus').map(cat => (
                                  <label key={cat.id} className="cursor-pointer shrink-0">
                                    <input type="radio" name="category" value={cat.label} className="hidden peer" defaultChecked={cat.id === 'heart'} />
                                    <div className={`px-4 py-2 rounded-full text-xs font-medium border transition ${theme.button.includes('slate') ? 'border-white/20 peer-checked:bg-white/20' : 'border-black/5 peer-checked:bg-black/5'}`}>
                                       {cat.icon} {cat.label}
                                    </div>
                                  </label>
                                ))}
                              </div>
                              <input name="title" placeholder="О чем молимся?" className={`w-full p-2 outline-none text-xl font-serif placeholder:opacity-30 mb-4 border-b border-current border-opacity-10 bg-transparent`} autoFocus required />
                              <textarea name="text" placeholder="Детали..." className={`w-full p-2 outline-none h-20 placeholder:opacity-30 text-sm mb-6 resize-none border-b border-current border-opacity-10 bg-transparent`}/>
                              <div className="flex justify-between items-center">
                                  <label className="flex items-center gap-2 text-xs font-medium opacity-60 cursor-pointer"><input name="pub" type="checkbox" className="w-4 h-4 rounded-full"/> Опубликовать</label>
                                  <button className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${theme.button}`}>Сохранить</button>
                              </div>
                            </form>
                          </Card>
                        </motion.div>
                    )}
                    </AnimatePresence>

                    <div className="space-y-4">
                        {myPrayers.length === 0 && !showPrayerForm && <div className="text-center opacity-40 py-20 font-serif italic text-lg">Пока тишина...</div>}
                        <AnimatePresence>
                        {myPrayers.filter(p => p.status === 'active').map(p => {
                            const isExpanded = expandedPrayerId === p.id;
                            return (
                              <Card key={p.id} theme={theme} onClick={() => setExpandedPrayerId(isExpanded ? null : p.id)} className={`relative cursor-pointer group ${isExpanded ? 'ring-2 ring-current ring-opacity-10' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                                       <div className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${theme.button} opacity-70`}>{p.category || 'Другое'}</div>
                                       <span className="text-[10px] opacity-40 font-mono">{p.createdAt?.toDate().toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-xl font-serif leading-snug mb-2">{p.title}</h3>
                                    {!isExpanded && p.text && <p className="text-sm opacity-60 line-clamp-1">{p.text}</p>}
                                    
                                    <AnimatePresence>
                                    {isExpanded && (
                                    <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} onClick={e => e.stopPropagation()} className="overflow-hidden border-t border-current border-opacity-10 cursor-default">
                                       <div className="pt-4">
                                       {p.text && <p className="text-sm opacity-80 mb-6 font-light leading-relaxed">{p.text}</p>}
                                       <div className="space-y-3 mb-4 pl-3 border-l-2 border-current border-opacity-10">
                                          {p.updates?.map((upd, idx) => (
                                            <div key={idx} className="text-sm">
                                               <p className="opacity-90">{upd.text}</p>
                                               <span className="text-[10px] opacity-30">{new Date(upd.createdAt).toLocaleDateString()}</span>
                                            </div>
                                          ))}
                                       </div>
                                       <div className="flex gap-2 items-center mt-4">
                                          <input value={prayerUpdateText} onChange={(e) => setPrayerUpdateText(e.target.value)} placeholder="Добавить заметку..." className={`flex-1 rounded-xl px-4 py-3 text-sm outline-none ${theme.inputBg}`} />
                                          <button onClick={() => addPrayerUpdate(p.id)} className={`p-3 rounded-xl bg-current bg-opacity-10`}><Send size={16}/></button>
                                       </div>
                                       <div className="flex justify-between items-center mt-6 pt-2">
                                          <button onClick={() => handleDelete(p)} className="text-xs text-red-400 opacity-60 hover:opacity-100 flex items-center gap-1"><Trash2 size={14}/> Удалить</button>
                                          <button onClick={() => updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'prayers', p.id), {status: 'answered', answeredAt: serverTimestamp()})} className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider bg-emerald-500/10 px-4 py-2 rounded-full hover:bg-emerald-500/20 transition"><CheckCircle2 size={16}/> Отвечено</button>
                                       </div>
                                       </div>
                                    </motion.div>
                                  )}
                                  </AnimatePresence>
                              </Card>
                            );
                        })}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}

            {view === 'unity' && (
                <motion.div key="unity" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="space-y-4 pb-10">
                     <div className={`sticky top-0 py-4 z-20 backdrop-blur-xl -mx-6 px-6 mb-2 border-b border-white/5`}>
                        <h2 className="text-xl font-serif">Единство</h2>
                     </div>
                     {publicPosts.map(post => {
                         if (!post || !post.text) return null;
                         const liked = post.likes?.includes(user.uid);
                         return (
                             <Card key={post.id} theme={theme} className="relative">
                                 <div className="flex justify-between mb-4 opacity-50 text-[10px] uppercase tracking-widest font-bold">
                                     <div className="flex gap-2 items-center">
                                        <span>{post.authorName}</span>
                                        {post.category && <span className="bg-current bg-opacity-10 px-1.5 py-0.5 rounded">{post.category}</span>}
                                     </div>
                                     <span>{post.createdAt?.toDate().toLocaleDateString()}</span>
                                 </div>
                                 <p className="mb-6 text-base leading-relaxed whitespace-pre-wrap font-light">{post.text}</p>
                                 <div className="flex justify-between items-center">
                                     <button onClick={() => toggleLike(post.id, post.likes)} className={`flex items-center justify-center gap-2 text-xs px-6 py-3 rounded-full transition font-bold uppercase tracking-wider whitespace-nowrap min-w-[140px] ${liked ? theme.button : 'bg-current bg-opacity-5 hover:bg-opacity-10'}`}>
                                         <Heart size={14} fill={liked ? "currentColor" : "none"} /> {liked ? "Поддержано" : "Поддержать"} {post.likes?.length > 0 && `(${post.likes.length})`}
                                     </button>
                                     {isAdmin && <button onClick={() => adminDeletePost(post.id)} className="p-2 text-red-400 bg-red-500/10 rounded-full"><Trash2 size={16} /></button>}
                                 </div>
                             </Card>
                         );
                     })}
                </motion.div>
            )}

            {view === 'admin_feedback' && isAdmin && (
                <motion.div key="admin_feedback" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="space-y-4 pb-10">
                     <div className={`sticky top-0 py-4 z-20 backdrop-blur-xl -mx-6 px-6 mb-2 border-b border-white/5`}>
                        <h2 className="text-xl font-serif">Входящие отзывы</h2>
                     </div>
                     {feedbacks.length === 0 && <div className="text-center opacity-40 py-20">Пока пусто.</div>}
                     {feedbacks.map(msg => (
                         <Card key={msg.id} theme={theme} className="relative">
                             <div className="flex justify-between mb-3 opacity-60 text-[10px] uppercase tracking-widest font-bold">
                                 <span>{msg.userName}</span>
                                 <span>{msg.createdAt?.toDate().toLocaleDateString()}</span>
                             </div>
                             <p className="mb-4 text-sm leading-relaxed whitespace-pre-wrap opacity-90">{msg.text}</p>
                             <div className="flex justify-end">
                                 <button onClick={() => deleteFeedback(msg.id)} className="p-2 text-red-400 bg-red-500/10 rounded-full hover:bg-red-500/20"><Trash2 size={16} /></button>
                             </div>
                         </Card>
                     ))}
                </motion.div>
            )}

            {view === 'profile' && (
                <motion.div key="profile" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="space-y-8 pb-10">
                    <div className="flex items-center gap-5">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-serif shadow-2xl ${theme.button} relative`}>
                           {user.isAnonymous ? "A" : (user.displayName?.[0] || "U")}
                           {isAdmin && <div className="absolute -bottom-1 -right-1 bg-white text-black p-1.5 rounded-full shadow-md"><Shield size={14}/></div>}
                        </div>
                        <div className="flex-1">
                           {isEditingName ? (
                             <div className="flex items-center gap-2">
                               <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-current bg-opacity-5 border border-current border-opacity-20 rounded-xl px-3 py-2 text-xl font-serif outline-none" autoFocus />
                               <button onClick={updateUserName} className="p-2 bg-current bg-opacity-10 rounded-lg"><Save size={20}/></button>
                             </div>
                           ) : (
                             <div className="flex items-center gap-3 group">
                                <h2 className="text-3xl font-serif">{user.isAnonymous ? "Пилигрим" : user.displayName}</h2>
                                <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover:opacity-50 hover:opacity-100 transition"><Edit2 size={18}/></button>
                             </div>
                           )}
                           <p className="text-xs opacity-50 mt-1 font-medium tracking-wide uppercase">{user.email || "Тихий режим"}</p>
                        </div>
                    </div>
                    
                    <Card theme={theme} className="!p-8">
                       <div className="flex items-center gap-3 mb-6 opacity-60">
                          <Info size={18} />
                          <span className="text-xs uppercase tracking-[0.2em] font-bold">Манифест</span>
                       </div>
                       <p className="text-base leading-relaxed opacity-80 font-serif italic mb-6">Amen — это цифровая тайная комната. Место, где шум мира затихает.</p>
                       <ul className="text-sm space-y-3 opacity-70">
                          <li className="flex items-center gap-3"><Sparkles size={14}/> Фокус — настройка сердца.</li>
                          <li className="flex items-center gap-3"><MessageCircle size={14}/> Молитва — честный диалог.</li>
                          <li className="flex items-center gap-3"><Heart size={14}/> Единство — тихая поддержка.</li>
                       </ul>
                    </Card>
                    
                    <div className="flex justify-between items-center mt-8">
                       <button onClick={() => signOut(auth)} className="py-4 px-8 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-2 hover:bg-red-500/5 transition font-medium"><LogOut size={18} /> Выйти</button>
                       {isAdmin && <button onClick={adminCleanGhosts} className="p-4 text-orange-400 opacity-50 hover:opacity-100"><AlertTriangle size={18} /></button>}
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </main>

        <AudioPlayer currentTrack={currentTrack} isPlaying={isPlaying} togglePlay={() => setIsPlaying(!isPlaying)} nextTrack={() => setCurrentTrack(AUDIO_TRACKS[(AUDIO_TRACKS.indexOf(currentTrack)+1)%AUDIO_TRACKS.length])} theme={theme} />

        {/* --- FOCUS PRAYER MODAL --- */}
        <AnimatePresence>
        {showFocusPrayerModal && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className={`fixed inset-0 z-[60] backdrop-blur-md ${theme.overlay}`} onClick={() => setShowFocusPrayerModal(false)}/>
            <motion.div initial={{y: "100%"}} animate={{y: 0}} exit={{y: "100%"}} transition={{type: "spring", damping: 25}} className={`fixed bottom-0 left-0 right-0 z-[70] rounded-t-[2.5rem] p-8 pb-12 shadow-2xl ${theme.cardBg} ${theme.text}`}>
               
               <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2 opacity-50">
                     <Sparkles size={18} />
                     <span className="text-xs uppercase tracking-widest font-bold">Твой отклик</span>
                  </div>
                  <button onClick={() => setShowFocusPrayerModal(false)} className="p-2 opacity-30 hover:opacity-100"><X size={24}/></button>
               </div>

               <form onSubmit={(e) => addPrayer(e, "Фокус дня", `Ответ на: ${dailyVerse.title}`)}>
                  <input type="hidden" name="title" value={`Ответ на: ${dailyVerse.title}`} />
                  <input type="hidden" name="category" value="Фокус дня" />
                  
                  <div className="mb-6 opacity-60 text-sm italic font-serif border-l-2 border-current pl-4">
                     "{dailyVerse.text}"
                  </div>

                  <textarea 
                    name="text" 
                    autoFocus 
                    placeholder="Напиши свою молитву здесь..." 
                    className={`w-full p-4 rounded-xl outline-none h-40 placeholder:opacity-30 text-lg leading-relaxed resize-none mb-8 ${theme.inputBg}`}
                  />
                  
                  <div className="flex items-center justify-between">
                      {/* Organic toggle */}
                      <div 
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setFocusPrayerPublic(!focusPrayerPublic)}
                      >
                         <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${focusPrayerPublic ? theme.activeButton : 'bg-stone-200 dark:bg-stone-700'}`}>
                            <motion.div 
                              className="w-5 h-5 bg-white rounded-full shadow-sm"
                              animate={{ x: focusPrayerPublic ? 20 : 0 }}
                            />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-wider">{focusPrayerPublic ? "Видят все" : "Личное"}</span>
                            <span className="text-[10px] opacity-50">{focusPrayerPublic ? "Появится в Единстве" : "Только для тебя"}</span>
                         </div>
                      </div>

                      <button className={`px-8 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider shadow-lg transform active:scale-95 transition ${theme.button}`}>
                        Сохранить
                      </button>
                  </div>
               </form>
            </motion.div>
          </>
        )}
        </AnimatePresence>

        {/* --- FEEDBACK MODAL --- */}
        <AnimatePresence>
        {showFeedbackModal && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className={`fixed inset-0 z-[60] backdrop-blur-md ${theme.overlay}`} onClick={() => setShowFeedbackModal(false)}/>
            <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.9, opacity: 0}} className={`fixed top-1/4 left-6 right-6 z-[70] rounded-[2rem] p-8 shadow-2xl ${theme.cardBg} ${theme.text}`}>
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-serif">Написать разработчику</h3>
                  <button onClick={() => setShowFeedbackModal(false)} className="p-2 opacity-50"><X size={24}/></button>
               </div>
               <form onSubmit={sendFeedback}>
                  <p className="text-sm opacity-60 mb-4">Есть идея, нашли ошибку или просто хотите сказать спасибо? Я читаю всё.</p>
                  <textarea name="text" autoFocus placeholder="Ваше сообщение..." className={`w-full p-4 rounded-xl outline-none h-32 placeholder:opacity-30 text-base leading-relaxed resize-none mb-6 ${theme.inputBg}`}/>
                  <button className={`w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-wider shadow-lg transition active:scale-95 ${theme.button}`}>Отправить</button>
               </form>
            </motion.div>
          </>
        )}
        </AnimatePresence>

      </div>
    </>
  );
};

export default App;
