import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeApp } from "firebase/app";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, 
  onAuthStateChanged, signInAnonymously, signOut 
} from "firebase/auth";
import { 
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc,
  query, where, orderBy, limit, getDocs, onSnapshot, serverTimestamp, arrayUnion, arrayRemove, enableIndexedDbPersistence
} from "firebase/firestore";
import { List, X, Check, Disc, Plus, CheckCircle2, FileText, Heart, CalendarDays, Edit3, MessageCircle, Trash2, Mail, Copy, Hand, SkipBack, SkipForward, PenLine, Sprout, Leaf, Apple, CloudRain, Circle, CircleDot, Feather, Sparkles, BookOpen, ChevronRight, ChevronDown, Lock } from 'lucide-react'; 

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
const ADMIN_NAMES = ['Admin', 'Founder', 'admin', 'founder', 'Киря', 'Димон'];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

try {
  enableIndexedDbPersistence(db).catch(() => {});
} catch (e) {}

// --- ANTI-BLINK ANIMATIONS ---
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.25, ease: "easeIn" } }
};

const simpleContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemAnim = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const modalAnim = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15, ease: "easeIn" } }
};

const triggerHaptic = () => {
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
};

// --- ЮРИДИЧЕСКИЕ ТЕКСТЫ (Впиши ИНН) ---
const TERMS_TEXT = `1. Amen — пространство тишины.\n2. Мы не используем ваши данные.\n3. Дневник — личное, Единство — общее.\n4. Будьте светом.\n\nРеквизиты разработчика:\nПлательщик НПД\nИНН: ВСТАВЬ_СВОЙ_ИНН_СЮДА`;

// --- МУЗЫКА ---
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
  { id: 10, title: "Ангельские голоса", url: "/music/premium1.mp3" },
  { id: 11, title: "Глубокий океан", url: "/music/premium2.mp3" },
  { id: 12, title: "Небесная арфа", url: "/music/premium3.mp3" },
];

// --- ТЕМЫ (ОСТАВЛЕНО 6 ПРЕМИУМ-ФОНОВ) ---
const THEMES = {
  dawn: { id: 'dawn', type: 'image', label: 'Безмятежность', bgImage: '/dawn.webp', isPremium: false, fallbackColor: '#fff7ed', headerColor: '#fff7ed', cardBg: 'bg-white/60 backdrop-blur-3xl shadow-sm', text: 'text-stone-950', subText: 'text-stone-700', containerBg: 'bg-white/70', button: 'border border-stone-800/10 hover:bg-white/60 text-stone-900', activeButton: 'bg-stone-900 text-white shadow-lg shadow-stone-800/20', menuBg: 'bg-[#fffbf7]/95 backdrop-blur-3xl text-stone-950 border-l border-white/20', iconColor: 'text-stone-900', placeholderColor: 'placeholder:text-stone-600/70', progressBar: 'bg-stone-900' },
  morning: { id: 'morning', type: 'image', label: 'Величие', bgImage: '/morning.webp', isPremium: false, fallbackColor: '#f0f9ff', headerColor: '#f0f9ff', cardBg: 'bg-white/60 backdrop-blur-3xl shadow-sm', text: 'text-slate-950', subText: 'text-slate-700', containerBg: 'bg-white/70', button: 'border border-slate-800/10 hover:bg-white/60 text-slate-900', activeButton: 'bg-sky-950 text-white shadow-lg shadow-sky-900/20', menuBg: 'bg-white/95 backdrop-blur-3xl text-slate-950 border-l border-white/20', iconColor: 'text-sky-950', placeholderColor: 'placeholder:text-slate-600/70', progressBar: 'bg-sky-950' },
  day: { id: 'day', type: 'image', label: 'Гармония', bgImage: '/day.webp', isPremium: false, fallbackColor: '#fdfce7', headerColor: '#fdfce7', cardBg: 'bg-[#fffff0]/70 backdrop-blur-3xl shadow-sm', text: 'text-stone-950', subText: 'text-stone-800', containerBg: 'bg-white/80', button: 'border border-stone-900/10 hover:bg-white/60 text-stone-950', activeButton: 'bg-amber-950 text-white shadow-lg shadow-amber-900/20', menuBg: 'bg-[#fffff0]/95 backdrop-blur-3xl text-stone-950 border-l border-white/20', iconColor: 'text-amber-950', placeholderColor: 'placeholder:text-stone-600/70', progressBar: 'bg-amber-950' },
  sunset: { id: 'sunset', type: 'image', label: 'Откровение', bgImage: '/sunset.webp', isPremium: false, fallbackColor: '#fff1f2', headerColor: '#fff1f2', cardBg: 'bg-stone-950/40 backdrop-blur-3xl shadow-md', text: 'text-orange-50', subText: 'text-orange-100', containerBg: 'bg-black/40', button: 'border border-orange-100/30 hover:bg-white/10 text-orange-50', activeButton: 'bg-orange-100 text-stone-950 shadow-lg shadow-orange-500/20', menuBg: 'bg-[#1a0f0a]/95 backdrop-blur-3xl text-orange-50 border-l border-white/10', iconColor: 'text-orange-200', placeholderColor: 'placeholder:text-orange-100/70', progressBar: 'bg-orange-100' },
  evening: { id: 'evening', type: 'image', label: 'Тайна', bgImage: '/evening.webp', isPremium: false, fallbackColor: '#f5f3ff', headerColor: '#2e1065', cardBg: 'bg-[#1e0a45]/40 backdrop-blur-3xl shadow-md', text: 'text-white', subText: 'text-purple-100', containerBg: 'bg-black/30', button: 'border border-white/20 hover:bg-white/10 text-white', activeButton: 'bg-white text-purple-950 shadow-lg shadow-purple-500/20', menuBg: 'bg-[#150530]/95 backdrop-blur-3xl text-white border-l border-white/10', iconColor: 'text-white', placeholderColor: 'placeholder:text-white/70', progressBar: 'bg-white' },
  midnight: { id: 'midnight', type: 'image', label: 'Волшебство', bgImage: '/midnight.webp', isPremium: false, fallbackColor: '#020617', headerColor: '#020617', cardBg: 'bg-black/50 backdrop-blur-3xl shadow-md', text: 'text-slate-50', subText: 'text-slate-200', containerBg: 'bg-white/10', button: 'border border-white/20 hover:bg-white/10 text-white', activeButton: 'bg-white text-black shadow-lg shadow-white/10', menuBg: 'bg-black/95 backdrop-blur-3xl text-slate-50 border-l border-white/10', iconColor: 'text-white', placeholderColor: 'placeholder:text-white/70', progressBar: 'bg-white' },
  
  premium1: { id: 'premium1', type: 'video', label: 'Эфир', bgVideo: '/vid1.mp4', isPremium: true, fallbackColor: '#000000', cardBg: 'bg-black/50 backdrop-blur-3xl shadow-md', text: 'text-slate-50', containerBg: 'bg-white/10', button: 'border border-white/20 hover:bg-white/10 text-white', activeButton: 'bg-white text-black shadow-lg shadow-white/10', menuBg: 'bg-black/95 backdrop-blur-3xl text-slate-50 border-l border-white/10', iconColor: 'text-white', placeholderColor: 'placeholder:text-white/70' },
  premium4: { id: 'premium4', type: 'video', label: 'Космос', bgVideo: '/vid4.mp4', isPremium: true, fallbackColor: '#000000', cardBg: 'bg-[#0f0f1a]/60 backdrop-blur-3xl shadow-md', text: 'text-indigo-50', containerBg: 'bg-white/10', button: 'border border-indigo-100/30 hover:bg-white/10 text-indigo-50', activeButton: 'bg-indigo-400 text-slate-950 shadow-lg', menuBg: 'bg-[#0a0a14]/95 backdrop-blur-3xl text-indigo-50 border-l border-white/10', iconColor: 'text-indigo-300', placeholderColor: 'placeholder:text-indigo-100/70' },
  premium5: { id: 'premium5', type: 'video', label: 'Глубина', bgVideo: '/vid5.mp4', isPremium: true, fallbackColor: '#000000', cardBg: 'bg-[#001a1a]/60 backdrop-blur-3xl shadow-md', text: 'text-teal-50', containerBg: 'bg-white/10', button: 'border border-teal-100/30 hover:bg-white/10 text-teal-50', activeButton: 'bg-teal-400 text-stone-950 shadow-lg', menuBg: 'bg-[#001010]/95 backdrop-blur-3xl text-teal-50 border-l border-white/10', iconColor: 'text-teal-300', placeholderColor: 'placeholder:text-teal-100/70' },
  premium6: { id: 'premium6', type: 'video', label: 'Заря', bgVideo: '/vid6.mp4', isPremium: true, fallbackColor: '#000000', cardBg: 'bg-[#2a1015]/60 backdrop-blur-3xl shadow-md', text: 'text-rose-50', containerBg: 'bg-white/10', button: 'border border-rose-100/30 hover:bg-white/10 text-rose-50', activeButton: 'bg-rose-400 text-stone-950 shadow-lg', menuBg: 'bg-[#150508]/95 backdrop-blur-3xl text-rose-50 border-l border-white/10', iconColor: 'text-rose-300', placeholderColor: 'placeholder:text-rose-100/70' },
  premium7: { id: 'premium7', type: 'video', label: 'Туман', bgVideo: '/vid7.mp4', isPremium: true, fallbackColor: '#000000', cardBg: 'bg-[#1a202c]/60 backdrop-blur-3xl shadow-md', text: 'text-gray-50', containerBg: 'bg-white/10', button: 'border border-gray-100/30 hover:bg-white/10 text-gray-50', activeButton: 'bg-gray-300 text-slate-900 shadow-lg', menuBg: 'bg-[#10141a]/95 backdrop-blur-3xl text-gray-50 border-l border-white/10', iconColor: 'text-gray-300', placeholderColor: 'placeholder:text-gray-100/70' },
  premium9: { id: 'premium9', type: 'video', label: 'Небо', bgVideo: '/vid9.mp4', isPremium: true, fallbackColor: '#000000', cardBg: 'bg-[#101b2a]/60 backdrop-blur-3xl shadow-md', text: 'text-blue-50', containerBg: 'bg-white/10', button: 'border border-blue-100/30 hover:bg-white/10 text-blue-50', activeButton: 'bg-blue-400 text-slate-950 shadow-lg', menuBg: 'bg-[#0a101a]/95 backdrop-blur-3xl text-blue-50 border-l border-white/10', iconColor: 'text-blue-300', placeholderColor: 'placeholder:text-blue-100/70' }
};

const CALENDAR_READINGS = {
  "06-03": { title: "Сила тишины", source: "Псалом 61:2", text: "Только в Боге успокаивается душа моя: от Него спасение мое.", thought: "В мире, где всё требует нашего внимания, тишина становится самым ценным ресурсом. Найди сегодня 5 минут, чтобы просто побыть в Его присутствии." },
  "07-03": { title: "Скрытая работа", source: "Матфея 6:6", text: "Ты же, когда молишься, войди в комнату твою и, затворив дверь твою, помолись Отцу твоему, Который втайне...", thought: "Самая важная работа происходит там, где никто не видит. Не ищи одобрения людей, ищи искренности перед Отцом." },
  "08-03": { title: "Где ты?", source: "Бытие 3:9", text: "И воззвал Господь Бог к Адаму и сказал ему: где ты?", thought: "Бог обращается не к месту, а к сердцу. Найди сегодня время остановиться и честно посмотреть, где ты сейчас духовно." },
};
const DAILY_WORD_DEFAULT = { title: "Тишина", source: "Псалом 46:11", text: "Остановитесь и познайте, что Я — Бог.", thought: "В суете трудно услышать шепот." };

const fonts = { ui: "font-sans", content: "font-serif" };

const FilmGrain = () => (
    <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.07] mix-blend-overlay"
         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
    />
);

const Card = ({ children, theme, className = "", onClick }) => (
  <motion.div variants={itemAnim} onClick={onClick} className={`rounded-[2.5rem] p-8 mb-6 transition-transform hover:scale-[1.01] ${theme.cardBg} ${theme.text} ${className}`}>
    {children}
  </motion.div>
);

const WelcomeScreen = ({ theme, onComplete, openLegal }) => {
    const [accepted, setAccepted] = useState(false);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[80] bg-cover bg-center overflow-y-auto no-scrollbar`} style={{ backgroundImage: `url(${theme.bgImage})`, backgroundColor: theme.fallbackColor }}>
            <div className={`min-h-screen p-6 md:p-12 pb-32 flex flex-col max-w-2xl mx-auto ${theme.text} bg-black/20 backdrop-blur-sm`}>
                <div className="pt-20 pb-16 text-center">
                    <h1 className={`text-4xl md:text-5xl font-semibold tracking-tight mb-6 ${fonts.ui}`}>Добро пожаловать</h1>
                    <p className={`text-lg md:text-xl opacity-90 ${fonts.content}`}>В пространство тишины и разговора с Отцом.</p>
                </div>
                <div className="space-y-8">
                    <div className={`p-8 md:p-10 rounded-[2.5rem] ${theme.cardBg} shadow-xl`}>
                        <h2 className={`text-2xl font-semibold mb-6 ${fonts.ui}`}>Что такое молитва?</h2>
                        <p className={`text-[17px] leading-[1.8] opacity-90 ${fonts.content}`}>Это не магический ритуал и не попытка впечатлить Творца красивыми словами. Молитва — это дыхание души, честный диалог с Тем, кто знает вас лучше, чем вы сами.</p>
                    </div>
                    <div className={`p-8 md:p-10 rounded-[2.5rem] ${theme.cardBg} shadow-xl`}>
                        <h2 className={`text-2xl font-semibold mb-8 ${fonts.ui}`}>Анатомия разговора</h2>
                        <ul className={`space-y-6 text-[16px] leading-relaxed opacity-90 ${fonts.content}`}>
                            <li className="flex gap-5"><div className="mt-1 opacity-60"><CheckCircle2 size={20}/></div><div><strong className="font-semibold block mb-1">Благодарение</strong>Смещение фокуса с того, чего у нас нет, на Того, кто дает всё.</div></li>
                            <li className="flex gap-5"><div className="mt-1 opacity-60"><CheckCircle2 size={20}/></div><div><strong className="font-semibold block mb-1">Покаяние</strong>Сброс балласта. Искреннее признание ошибок исцеляет.</div></li>
                            <li className="flex gap-5"><div className="mt-1 opacity-60"><CheckCircle2 size={20}/></div><div><strong className="font-semibold block mb-1">Прошение</strong>Доверие своих нужд и страхов в руки Отца.</div></li>
                            <li className="flex gap-5"><div className="mt-1 opacity-60"><CheckCircle2 size={20}/></div><div><strong className="font-semibold block mb-1">Созерцание</strong>Момент, когда мы перестаем говорить и начинаем слушать тишину.</div></li>
                        </ul>
                    </div>
                    <div className={`p-8 md:p-10 rounded-[2.5rem] ${theme.cardBg} shadow-xl`}>
                        <h2 className={`text-2xl font-semibold mb-6 ${fonts.ui}`}>Зачем это нужно?</h2>
                        <p className={`text-[17px] leading-[1.8] opacity-90 ${fonts.content}`}>Суета разрывает нас на части, заставляя жить в тревоге о будущем. Молитва возвращает нас в реальность. Она не всегда меняет обстоятельства мгновенно, но она неизбежно меняет того, кто молится. Это ваш якорь в шторме.</p>
                    </div>
                    <div className={`p-8 md:p-10 rounded-[2.5rem] ${theme.cardBg} shadow-xl`}>
                        <h2 className={`text-2xl font-semibold mb-8 ${fonts.ui}`}>Как устроен Amen</h2>
                        <div className="space-y-8">
                            <div><h5 className={`text-base font-semibold mb-2 flex items-center gap-3 ${fonts.ui}`}><MessageCircle size={18} className="opacity-60"/> Единство</h5><p className={`text-[16px] leading-relaxed opacity-90 ${fonts.content}`}>Анонимная общая лента. Поддерживайте чужие молитвы нажатием Amen. Вы не одни.</p></div>
                            <div className="w-16 h-px bg-current opacity-20"></div>
                            <div><h5 className={`text-base font-semibold mb-2 flex items-center gap-3 ${fonts.ui}`}><BookOpen size={18} className="opacity-60"/> Дневник и Ответы</h5><p className={`text-[16px] leading-relaxed opacity-90 ${fonts.content}`}>Ваша тайная комната. Записывайте личные просьбы и обязательно отмечайте «Ответы», когда Бог действует — чтобы собирать свидетельства Его верности.</p></div>
                            <div className="w-16 h-px bg-current opacity-20"></div>
                            <div><h5 className={`text-base font-semibold mb-2 flex items-center gap-3 ${fonts.ui}`}><Sprout size={18} className="opacity-60"/> Сад веры</h5><p className={`text-[16px] leading-relaxed opacity-90 ${fonts.content}`}>Дисциплина растит семя. Заходите в приложение каждый день, чтобы древо крепло и приносило плоды. Без внимания оно увядает.</p></div>
                            <div className="w-16 h-px bg-current opacity-20"></div>
                            <div><h5 className={`text-base font-semibold mb-2 flex items-center gap-3 ${fonts.ui}`}><Disc size={18} className="opacity-60"/> Погружение</h5><p className={`text-[16px] leading-relaxed opacity-90 ${fonts.content}`}>Включайте фоновую музыку в плеере и меняйте темы оформления (в профиле), чтобы отсечь лишний шум.</p></div>
                        </div>
                    </div>
                    <div className={`p-8 md:p-12 rounded-[2.5rem] ${theme.cardBg} shadow-xl text-center mt-12`}>
                        <span className={`text-7xl opacity-20 block mb-4 leading-none ${fonts.content}`}>“</span>
                        <p className={`text-xl leading-[1.8] font-medium opacity-90 mb-6 ${fonts.content}`}>Не заботьтесь ни о чем, но всегда в молитве и прошении с благодарением открывайте свои желания пред Богом, и мир Божий соблюдет сердца ваши...</p>
                        <p className={`text-sm opacity-60 uppercase tracking-widest font-bold ${fonts.ui}`}>Филиппийцам 4:6-7</p>
                    </div>
                </div>
                <div className="mt-16 flex flex-col gap-6">
                    <div className="flex items-start gap-4 px-2">
                        <button type="button" onClick={() => { triggerHaptic(); setAccepted(!accepted); }} className={`mt-1 flex-shrink-0 w-6 h-6 rounded-md border-2 border-current transition-colors flex items-center justify-center ${accepted ? theme.activeButton : 'opacity-40 hover:opacity-80'}`}>
                            {accepted && <Check size={14} className="text-white dark:text-black" />}
                        </button>
                        <span className={`text-sm opacity-80 leading-relaxed ${fonts.ui}`}>
                            <span onClick={() => { triggerHaptic(); setAccepted(!accepted); }} className="cursor-pointer">Я понимаю назначение приложения и принимаю условия </span>
                            <button type="button" onClick={(e) => { e.stopPropagation(); openLegal(); }} className="underline underline-offset-4 opacity-100 font-semibold hover:opacity-70 transition-opacity">Пользовательского соглашения</button>.
                        </span>
                    </div>
                    <button onClick={onComplete} disabled={!accepted} className={`w-full py-6 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-2xl transition-all duration-300 flex justify-center items-center gap-2 ${accepted ? theme.activeButton : `${theme.containerBg} opacity-50 cursor-not-allowed`} ${fonts.ui}`}>
                        Начать путь <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const AudioPlayer = ({ currentTrack, isPlaying, togglePlay, changeTrack, theme, isUiVisible }) => {
  const audioRef = useRef(null);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
        audio.volume = 0;
        audio.play().catch(e => console.log(e));
        let vol = 0;
        const interval = setInterval(() => {
            if (vol < 1) { vol += 0.1; audio.volume = Math.min(vol, 1); } else clearInterval(interval);
        }, 100);
        return () => clearInterval(interval);
    } else {
        audio.pause();
    }
  }, [isPlaying, currentTrack]);

  const handleNextTrack = () => changeTrack(AUDIO_TRACKS[(AUDIO_TRACKS.findIndex(t => t.id === currentTrack.id) + 1) % AUDIO_TRACKS.length]);
  const handlePrevTrack = () => changeTrack(AUDIO_TRACKS[(AUDIO_TRACKS.findIndex(t => t.id === currentTrack.id) - 1 + AUDIO_TRACKS.length) % AUDIO_TRACKS.length]);
  const handleTimeUpdate = () => { if(audioRef.current) setProgress(audioRef.current.currentTime || 0); };
  const handleLoadedMetadata = () => { if(audioRef.current) setDuration(audioRef.current.duration || 0); };
  const handleSeek = (e) => { const time = Number(e.target.value); if(audioRef.current) { audioRef.current.currentTime = time; setProgress(time); } };

  return (
    <>
      <AnimatePresence>
        {showPlaylist && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm" onClick={() => setShowPlaylist(false)} />
                <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" className={`fixed bottom-28 left-4 right-4 z-50 rounded-2xl p-4 shadow-2xl ${theme.menuBg} max-h-72 overflow-y-auto ${fonts.ui}`}>
                    <h4 className="text-sm font-medium opacity-50 mb-4 px-2">Фонотека</h4>
                    {AUDIO_TRACKS.map(track => {
                        return (
                            <button 
                                key={track.id} 
                                onClick={() => { 
                                    changeTrack(track); 
                                    setShowPlaylist(false); 
                                }} 
                                className={`w-full text-left py-3 px-2 rounded-lg text-sm font-normal transition-colors flex justify-between items-center hover:bg-black/5 ${currentTrack.id === track.id ? 'bg-black/5 dark:bg-white/10 font-medium' : ''}`}
                            >
                                <span className="truncate pr-2 opacity-90">{track.title}</span>
                            </button>
                        );
                    })}
                </motion.div>
            </>
        )}
      </AnimatePresence>

      <motion.div animate={{ y: isUiVisible ? 0 : 100, opacity: isUiVisible ? 1 : 0 }} transition={{ type: "spring", damping: 26, stiffness: 200 }} className={`fixed bottom-6 left-6 right-6 z-40 h-20 px-6 rounded-3xl backdrop-blur-2xl shadow-lg flex flex-col justify-center ${theme.menuBg} ${fonts.ui}`}>
        <audio ref={audioRef} src={currentTrack.url} onEnded={handleNextTrack} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} />
        <div className="w-full flex items-center mb-2">
            <input type="range" min="0" max={duration || 0} value={progress || 0} onChange={handleSeek} className="w-full h-1 bg-current opacity-20 rounded-lg appearance-none cursor-pointer transition-opacity hover:opacity-40 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-current" />
        </div>
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4 overflow-hidden cursor-pointer flex-1 transition-opacity hover:opacity-70" onClick={() => setShowPlaylist(true)}>
                <div className={`p-2 rounded-full bg-black/5 dark:bg-white/10`}><Disc size={18} className={isPlaying ? "animate-spin-slow" : ""} /></div>
                <span className="text-xs font-medium truncate tracking-wide opacity-80">{currentTrack.title}</span>
            </div>
            <div className="flex items-center gap-6">
                <button onClick={handlePrevTrack} className="opacity-50 hover:opacity-100 transition active:scale-90"><SkipBack size={18}/></button>
                <button onClick={() => { triggerHaptic(); togglePlay(); }} className="text-xs font-medium hover:opacity-60 transition active:scale-90 uppercase tracking-wider">{isPlaying ? "Pause" : "Play"}</button>
                <button onClick={handleNextTrack} className="opacity-50 hover:opacity-100 transition active:scale-90"><SkipForward size={18}/></button>
            </div>
        </div>
      </motion.div>
    </>
  );
};

const TopMenu = ({ view, setView, theme, openLegal, openSupport, logout, isAdmin, isUiVisible }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuItems = [ { id: 'diary', label: 'Дневник' }, { id: 'flow', label: 'Поток' }, { id: 'profile', label: 'Профиль' } ];

  return (
    <>
      <motion.div animate={{ y: isUiVisible ? 0 : -100, opacity: isUiVisible ? 1 : 0 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className={`fixed top-12 right-6 z-[60] ${fonts.ui}`}>
        <button onClick={() => { triggerHaptic(); setIsOpen(!isOpen); }} className={`text-sm font-medium px-5 py-2.5 rounded-full backdrop-blur-xl ${theme.text} bg-white/10 hover:bg-white/20 transition active:scale-95 shadow-sm`}>{isOpen ? "Закрыть" : "Меню"}</button>
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className={`fixed inset-0 z-40 bg-black/10 backdrop-blur-sm`} onClick={() => setIsOpen(false)}/>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 250 }} className={`fixed top-0 right-0 bottom-0 z-50 w-72 p-10 shadow-2xl flex flex-col justify-between ${theme.menuBg} ${fonts.ui}`}>
              <div className="mt-8 flex flex-col items-start gap-8">
                <div className={`${fonts.ui} text-4xl font-light tracking-wide mb-10 opacity-30 uppercase`}>Amen</div>
                {menuItems.map(item => (
                  <button key={item.id} onClick={() => { triggerHaptic(); setView(item.id); setIsOpen(false); }} className={`text-left text-xl font-light transition-opacity ${view === item.id ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}>{item.label}</button>
                ))}
                {isAdmin && <button onClick={() => { setView('admin_feedback'); setIsOpen(false); }} className="text-left text-lg font-normal opacity-70 hover:opacity-100 flex items-center gap-3 mt-4"><Mail size={18}/> Входящие</button>}
              </div>
              
              <div className="mb-8 flex flex-col items-start gap-4">
                  <button onClick={() => { triggerHaptic(); openSupport(); setIsOpen(false); }} className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:opacity-80 transition-opacity">
                      <Feather size={14} /> Ангел проекта
                  </button>
                  <div className="w-8 h-px bg-current opacity-10"></div>
                  <div className="flex flex-col items-start gap-3 opacity-50">
                      <button onClick={() => { openLegal(); setIsOpen(false); }} className="flex items-center gap-2 text-xs hover:opacity-100"><FileText size={12}/> Соглашение</button>
                      <button onClick={logout} className="text-xs hover:opacity-100">Выйти</button>
                  </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const DivineSeed = ({ stage, fruits, theme }) => {
    let icon = <CircleDot size={48} strokeWidth={1} />;
    let text = "Посажено";
    if (stage >= 1 && stage <= 2) { icon = <Sprout size={48} strokeWidth={1} />; text = "Прорастает"; }
    else if (stage >= 3 && stage <= 4) { icon = <Leaf size={48} strokeWidth={1} className="scale-75" />; text = "Укореняется"; }
    else if (stage >= 5 && stage <= 6) { icon = <Leaf size={56} strokeWidth={1} />; text = "Крепнет"; }
    else if (stage === 7) { icon = <Apple size={48} strokeWidth={1} />; text = "Плодоносит"; }

    return (
        <motion.div variants={itemAnim} className={`flex flex-col items-center justify-center p-8 rounded-[2.5rem] mb-6 ${theme.cardBg} transition-all`}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 20 }} className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${theme.containerBg} shadow-inner`}>
                <div className={`${theme.iconColor} transition-all duration-1000`}>{icon}</div>
            </motion.div>
            <h3 className={`text-xl font-normal ${fonts.content} mb-1`}>{text}</h3>
            <p className="text-xs opacity-50 uppercase tracking-widest font-bold">День {stage} из 7</p>
            <div className="flex gap-2 mt-6">
                {[...Array(7)].map((_, i) => ( <div key={i} className={`w-2 h-2 rounded-full transition-colors duration-500 ${i < stage ? theme.activeButton : 'bg-current opacity-10'}`} /> ))}
            </div>
            <AnimatePresence>
                {fruits > 0 && (
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md flex items-center gap-2">
                        <Apple size={14} className={theme.iconColor}/>
                        <span className="text-xs font-medium">{fruits} плодов</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// --- MAIN APP ---
const App = () => {
  const [user, setUser] = useState(null);
  const isAdmin = user && ADMIN_NAMES.includes(user.displayName);
  const [loading, setLoading] = useState(true);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false); 

  const [view, setView] = useState('flow'); 
  const [currentThemeId, setCurrentThemeId] = useState(() => localStorage.getItem('amen-theme-id') || 'dawn');
  
  const [previewThemeId, setPreviewThemeId] = useState(null);
  const theme = THEMES[previewThemeId] || THEMES[currentThemeId] || THEMES.dawn;

  const [currentTrack, setCurrentTrack] = useState(AUDIO_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [myPrayers, setMyPrayers] = useState([]);
  const [publicPosts, setPublicPosts] = useState([]);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);

  const [isAngel, setIsAngel] = useState(false);
  const [angelTheme, setAngelTheme] = useState(null); // ТЕКУЩИЙ КУПЛЕННЫЙ ФОН
  const [selectedAngelTheme, setSelectedAngelTheme] = useState(null); // ФОН, ВЫБРАННЫЙ ПЕРЕД ДОНАТОМ

  const [seedStage, setSeedStage] = useState(0);
  const [seedFruits, setSeedFruits] = useState(0);

  const [showInlineCreate, setShowInlineCreate] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [newPrayerTitle, setNewPrayerTitle] = useState('');
  const [newPrayerText, setNewPrayerText] = useState('');
  const [isFocusExpanded, setIsFocusExpanded] = useState(false);
  const [inlineFocusText, setInlineFocusText] = useState('');
  const [isFocusPublic, setIsFocusPublic] = useState(false);
  const [isFocusSubmitting, setIsFocusSubmitting] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');

  const [isGuideExpanded, setIsGuideExpanded] = useState(false);

  const [isAmenAnimating, setIsAmenAnimating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Услышано");
  const [isUiVisible, setIsUiVisible] = useState(true); 

  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [focusPrayerPublic, setFocusPrayerPublic] = useState(false);
  const [diaryTab, setDiaryTab] = useState('active'); 
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', text: '' });
  const [answeringId, setAnsweringId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [feedbackText, setFeedbackText] = useState('');

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [placeholderText, setPlaceholderText] = useState("");
  const intervalRef = useRef(null);
  const [lockedHeight, setLockedHeight] = useState('100dvh');
  const mainScrollRef = useRef(null);

  useEffect(() => {
    if (showInlineCreate) {
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${window.scrollY}px`; 
        const updateHeight = () => { if (window.visualViewport) { setLockedHeight(`${window.visualViewport.height}px`); window.scrollTo(0, 0); } };
        if (window.visualViewport) { window.visualViewport.addEventListener('resize', updateHeight); updateHeight(); }
        return () => {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
            if (window.visualViewport) window.visualViewport.removeEventListener('resize', updateHeight);
        }
    } else { setLockedHeight('100dvh'); }
  }, [showInlineCreate]);

  useLayoutEffect(() => { if (mainScrollRef.current) mainScrollRef.current.scrollTo(0, 0); }, [view]);

  const handleScroll = (e) => {
      const top = e.target.scrollTop;
      if (top > 50 && isUiVisible) setIsUiVisible(false);
      if (top < 30 && !isUiVisible) setIsUiVisible(true);
  };

  useEffect(() => { localStorage.setItem('amen-theme-id', currentThemeId); }, [currentThemeId]);

  useEffect(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    let reading = CALENDAR_READINGS[`${day}-${month}`];
    if(!reading) {
        const keys = Object.keys(CALENDAR_READINGS);
        reading = CALENDAR_READINGS[keys[today.getDate() % keys.length]];
    }
    setDailyVerse(reading || DAILY_WORD_DEFAULT);
  }, []);

  useEffect(() => {
      const images = ['/dawn.webp', '/morning.webp', '/day.webp', '/sunset.webp', '/evening.webp', '/midnight.webp'];
      images.forEach(src => { const img = new Image(); img.src = src; });
  }, []);

  useEffect(() => onAuthStateChanged(auth, (u) => { 
      setUser(u); 
      setLoading(false);
      if(u) { 
          setNewName(u.displayName || ""); 
          checkUserStatus(u.uid); 
          if (!localStorage.getItem(`amen_welcome_done_${u.uid}`)) {
              setShowWelcomeScreen(true);
          }
      }
  }), []);

  const completeWelcome = () => {
      triggerHaptic();
      localStorage.setItem(`amen_welcome_done_${user.uid}`, 'true');
      setShowWelcomeScreen(false);
  };

  const checkUserStatus = async (uid) => {
      const userRef = doc(db, 'artifacts', dbCollectionId, 'users', uid);
      const userSnap = await getDoc(userRef);
      const today = new Date().setHours(0,0,0,0);

      if (userSnap.exists()) {
          const data = userSnap.data();
          
          let currentIsAngel = data.isAngel || false;
          if (currentIsAngel && data.angelSince) {
              const angelDate = data.angelSince.toDate();
              const diffTime = new Date() - angelDate;
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays >= 30) {
                  currentIsAngel = false;
                  await setDoc(userRef, { isAngel: false, angelTheme: null }, { merge: true }); 
              }
          }
          setIsAngel(currentIsAngel);
          setAngelTheme(data.angelTheme || null);

          let lastVisitTime = 0;
          if (data.lastVisit && typeof data.lastVisit.toDate === 'function') {
              lastVisitTime = data.lastVisit.toDate().setHours(0,0,0,0);
          }

          let newStage = data.seedStage || 0;
          let newFruits = data.seedFruits || 0;
          
          if (lastVisitTime > 0) {
              const diffTime = Math.abs(today - lastVisitTime);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

              if (diffDays === 1) {
                  newStage += 1;
                  if (newStage > 7) {
                      newFruits += 1;
                      newStage = 0; 
                      setSuccessMessage("Плод созрел!");
                      setShowSuccessModal(true);
                      setTimeout(() => setShowSuccessModal(false), 3000);
                  }
              } else if (diffDays > 1) {
                  if (newStage > 0) {
                      setSuccessMessage("Сад пересох...");
                      setShowSuccessModal(true);
                      setTimeout(() => setShowSuccessModal(false), 2000);
                  }
                  newStage = 0;
              }
          }

          await setDoc(userRef, { lastVisit: serverTimestamp(), seedStage: newStage, seedFruits: newFruits }, { merge: true });
          setSeedStage(newStage);
          setSeedFruits(newFruits);
      } else {
          await setDoc(userRef, { lastVisit: serverTimestamp(), seedStage: 0, seedFruits: 0, isAngel: false, angelTheme: null }, { merge: true });
      }
  };

  useEffect(() => {
    if (!showInlineCreate && !isFocusExpanded) { clearInterval(intervalRef.current); setPlaceholderText(""); return; }
    const text = "Мысли, молитвы, благодарность...";
    let currentIndex = 0;
    intervalRef.current = setInterval(() => {
      if (currentIndex <= text.length) { setPlaceholderText(text.slice(0, currentIndex)); currentIndex++; } 
      else clearInterval(intervalRef.current);
    }, 45); 
    return () => clearInterval(intervalRef.current);
  }, [showInlineCreate, isFocusExpanded]);

  useEffect(() => { if (!user) return; return onSnapshot(query(collection(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers'), orderBy('createdAt', 'desc')), snap => setMyPrayers(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, [user]);
  useEffect(() => { return onSnapshot(query(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts'), orderBy('createdAt', 'desc'), limit(50)), snap => setPublicPosts(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, []);
  useEffect(() => { if (view !== 'admin_feedback' || !isAdmin) return; return onSnapshot(query(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'feedback'), orderBy('createdAt', 'desc')), snap => setFeedbacks(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, [view, isAdmin]);

  const handleLogin = async (e) => { e.preventDefault(); setAuthError(''); setIsAuthLoading(true); const { username, password } = e.target.elements; const fakeEmail = `${username.value.trim().replace(/\s/g, '').toLowerCase()}@amen.app`; try { await signInWithEmailAndPassword(auth, fakeEmail, password.value); } catch (err) { if(err.code.includes('not-found') || err.code.includes('invalid-credential')) { try { const u = await createUserWithEmailAndPassword(auth, fakeEmail, password.value); await updateProfile(u.user, { displayName: username.value }); } catch(ce) { setAuthError("Ошибка: " + ce.code); } } else { setAuthError("Ошибка: " + err.code); } } setIsAuthLoading(false); };
  const handleUpdateName = async () => { if(!newName.trim() || newName === user.displayName) return; await updateProfile(user, { displayName: newName }); };
  
  const handleAmen = async () => { 
      if (isAmenAnimating) return;
      setIsAmenAnimating(true); triggerHaptic(); 
      const title = newPrayerTitle.trim() || "Молитва"; 
      const text = newPrayerText.trim(); 
      const isPublic = focusPrayerPublic; 
      
      await addDoc(collection(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers'), { title, text, createdAt: serverTimestamp(), status: 'active', updates: [], prayerCount: 1 }); 
      if(isPublic) await addDoc(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts'), { text: title + (text ? `\n\n${text}` : ""), authorId: user.uid, authorName: user.displayName || "Пилигрим", authorIsAngel: isAngel, createdAt: serverTimestamp(), likes: [] }); 
      
      setTimeout(() => { 
          setIsAmenAnimating(false); 
          setShowInlineCreate(false); 
          setSuccessMessage("Услышано"); 
          setShowSuccessModal(true); 
          setNewPrayerTitle('');
          setNewPrayerText('');
          setFocusPrayerPublic(false); 
          setTimeout(() => setShowSuccessModal(false), 2000); 
      }, 800); 
  };

  const handleInlineFocusSubmit = async () => {
      if (!inlineFocusText.trim()) return;
      setIsFocusSubmitting(true); triggerHaptic();
      const title = dailyVerse.title; const text = inlineFocusText;
      await addDoc(collection(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers'), { title, text, createdAt: serverTimestamp(), status: 'active', updates: [], prayerCount: 1 }); 
      if(isFocusPublic) await addDoc(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts'), { text: `[${title}]\n\n${text}`, authorId: user.uid, authorName: user.displayName || "Пилигрим", authorIsAngel: isAngel, createdAt: serverTimestamp(), likes: [] }); 
      setTimeout(() => { setIsFocusSubmitting(false); setInlineFocusText(''); setIsFocusExpanded(false); setSuccessMessage("Услышано"); setShowSuccessModal(true); setTimeout(() => setShowSuccessModal(false), 2000); }, 800); 
  };

  // ИСПРАВЛЕННАЯ ЛОГИКА AMEN (С защитой от ложных кликов)
  const toggleLike = async (e, id, likes) => { 
      e.preventDefault();
      e.stopPropagation();
      triggerHaptic(); 
      try {
          const ref = doc(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts', id); 
          const hasLiked = likes && likes.includes(user.uid);
          await updateDoc(ref, { 
              likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid) 
          }); 
      } catch (err) {
          console.error("Like error:", err);
          alert("Ошибка лайка. Проверьте интернет.");
      }
  };

  const incrementPrayerCount = async (id, currentCount) => { triggerHaptic(); await updateDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', id), { prayerCount: (currentCount || 1) + 1 }); };
  const startEditing = (p) => { setEditingId(p.id); setEditForm({ title: p.title, text: p.text }); };
  const saveEdit = async () => { if(!editForm.title.trim()) return; await updateDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', editingId), { title: editForm.title, text: editForm.text }); setEditingId(null); };
  
  const openAnswerModal = (id) => { triggerHaptic(); setAnsweringId(id); setAnswerText(''); setShowAnswerModal(true); };
  const confirmAnswer = async () => { if(!answeringId) return; await updateDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', answeringId), { status: 'answered', answerNote: answerText, answeredAt: serverTimestamp() }); const prayer = myPrayers.find(p => p.id === answeringId); if(prayer) { const q = query(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts'), where('authorId', '==', user.uid)); const querySnapshot = await getDocs(q); querySnapshot.forEach(async (docSnap) => { if (docSnap.data().text.startsWith(prayer.title)) await updateDoc(docSnap.ref, { status: 'answered' }); }); } setShowAnswerModal(false); setAnsweringId(null); setSuccessMessage("Твой путь важен"); setShowSuccessModal(true); setTimeout(() => setShowSuccessModal(false), 2000); };
  const deletePost = async (id) => { if(confirm("Админ: Удалить пост?")) await deleteDoc(doc(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts', id)); };
  const deleteFeedback = async (id) => { if(confirm("Админ: Удалить отзыв?")) await deleteDoc(doc(db, 'artifacts', dbCollectionId, 'public', 'data', 'feedback', id)); };
  const sendFeedback = async () => { if(!feedbackText.trim()) return; await addDoc(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'feedback'), { text: feedbackText, userId: user.uid, userName: user.displayName, createdAt: serverTimestamp() }); setFeedbackText(''); setShowFeedbackModal(false); alert("Отправлено!"); };
  
  const resetAllAngels = async () => {
      if (!confirm("ВНИМАНИЕ! Лишить статуса ВСЕХ Ангелов в базе?")) return;
      try {
          const usersRef = collection(db, 'artifacts', dbCollectionId, 'users');
          const snap = await getDocs(usersRef);
          let count = 0;
          snap.forEach(async (userDoc) => {
              if (userDoc.data().isAngel === true) {
                  await updateDoc(doc(db, 'artifacts', dbCollectionId, 'users', userDoc.id), { isAngel: false });
                  count++;
              }
          });
          alert(`Сброс завершен. Ангелов удалено: ${count}`);
      } catch (error) { console.error("Ошибка сброса:", error); alert("Ошибка при сбросе."); }
  };

  const becomeAngel = async () => {
      triggerHaptic();
      setIsAuthLoading(true); 
      try {
          const amountToSend = donateAmount ? Number(donateAmount) : 100;
          // ПЕРЕДАЕМ ВЫБРАННЫЙ ФОН В КАЧЕСТВЕ itemId
          const res = await fetch('/api/payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.uid, amount: amountToSend, purchaseType: 'angel', itemId: selectedAngelTheme })
          });
          const data = await res.json();
          if (data.url) window.location.href = data.url; 
          else throw new Error("Нет ссылки от сервера");
      } catch (error) {
          console.error("Ошибка инициализации платежа:", error);
          setSuccessMessage("Ошибка связи с кассой");
          setShowSuccessModal(true); setTimeout(() => setShowSuccessModal(false), 2000);
      } finally { setIsAuthLoading(false); }
  };

  if (loading || !dailyVerse) return <div className={`h-screen bg-[#f4f5f0] flex flex-col items-center justify-center gap-4 text-stone-400 font-light ${fonts.ui}`}><span className="italic animate-pulse">Загрузка тишины...</span><div className="w-5 h-5 border-2 border-stone-200 border-t-stone-400 rounded-full animate-spin"></div></div>;
  if (!user) return <div className={`fixed inset-0 flex flex-col items-center justify-center p-8 bg-[#fffbf7] ${fonts.ui}`}><div className="w-full max-w-xs space-y-8 text-center"><h1 className="text-6xl font-semibold text-stone-900 tracking-tight">Amen</h1><p className="text-stone-400 text-sm">Пространство тишины</p><form onSubmit={handleLogin} className="space-y-4 pt-8"><input name="username" type="text" placeholder="Имя" className="w-full bg-transparent border-b border-stone-200 py-3 text-center text-lg outline-none focus:border-stone-800 transition text-stone-900" required /><input name="password" type="password" placeholder="Пароль" className="w-full bg-transparent border-b border-stone-200 py-3 text-center text-lg outline-none focus:border-stone-800 transition text-stone-900" required />{authError && <p className="text-red-500 text-xs">{authError}</p>}<button disabled={isAuthLoading} className="w-full py-4 bg-stone-900 text-white text-sm font-medium rounded-xl">{isAuthLoading ? "..." : "Войти"}</button></form><button onClick={() => signInAnonymously(auth)} className="text-stone-400 text-sm">Войти тихо</button></div></div>;

  const freeThemes = Object.values(THEMES).filter(t => !t.isPremium);
  const premiumThemes = Object.values(THEMES).filter(t => t.isPremium);

  // В профиле показываем бесплатные + тот ОДИН премиум, который купил юзер
  const availableThemes = isAdmin 
      ? [...freeThemes, ...premiumThemes] 
      : [...freeThemes, ...premiumThemes.filter(t => isAngel && angelTheme === t.id)];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=Spectral:wght@400;500&display=swap" rel="stylesheet" />
      <FilmGrain />
      
      <div className={`fixed inset-0 z-[-3] transition-colors duration-1000`} style={{ backgroundColor: theme.fallbackColor }} />
      <AnimatePresence>
          {theme.type === 'video' ? (
              <motion.video
                  key={theme.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  autoPlay loop muted playsInline WebkitPlaysInline disablePictureInPicture controls={false}
                  className="fixed inset-0 z-[-2] w-full h-full object-cover pointer-events-none"
                  src={theme.bgVideo}
              />
          ) : (
              <motion.div
                  key={theme.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="fixed inset-0 z-[-2] bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${theme.bgImage})` }}
              />
          )}
      </AnimatePresence>
      <div className={`fixed inset-0 z-[-1] transition-all duration-1000 ${theme.overlay || ''}`} />

      <AnimatePresence>
          {showWelcomeScreen && (
              <WelcomeScreen 
                  theme={theme} 
                  onComplete={completeWelcome} 
                  openLegal={() => setShowLegalModal(true)} 
              />
          )}
      </AnimatePresence>

      <div className={`relative z-10 h-[100dvh] w-full flex flex-col max-w-md mx-auto overflow-hidden ${showWelcomeScreen ? 'pointer-events-none blur-sm' : ''}`}>
        <TopMenu view={view} setView={setView} theme={theme} openLegal={() => setShowLegalModal(true)} openSupport={() => setShowSupportModal(true)} logout={() => signOut(auth)} isAdmin={isAdmin} isUiVisible={isUiVisible} />

        <main ref={mainScrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-6 pb-44 no-scrollbar scroll-smooth pt-28 min-h-screen"> 
          
          {!isOnline && (
              <div className="mb-4 text-center">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 text-xs font-medium ${theme.text} ${fonts.ui}`}>
                      <Disc size={12} className="animate-pulse mr-2"/> Оффлайн режим
                  </span>
              </div>
          )}

          <AnimatePresence mode="wait">
          {!showInlineCreate && (
              <motion.div key={view} variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
                
                {view === 'flow' && (
                  <motion.div variants={simpleContainer} initial="hidden" animate="show" className="space-y-8">
                    
                    <Card theme={theme} className="text-center py-10 relative overflow-hidden group">
                        <div className={`text-xs font-medium uppercase opacity-60 mb-6 tracking-widest ${fonts.ui}`}>Фокус дня</div>
                        <h2 className={`text-2xl font-normal leading-tight mb-6 px-2 ${fonts.content}`}>{dailyVerse.title}</h2>
                        
                        <div className="mb-6 px-2 relative">
                            <span className={`text-4xl absolute -top-4 -left-2 opacity-10 ${fonts.content}`}>“</span>
                            <p className={`text-lg leading-[1.75] opacity-90 relative z-10 ${fonts.content}`}>{dailyVerse.text}</p>
                            <span className={`text-4xl absolute -bottom-8 -right-2 opacity-10 ${fonts.content}`}>”</span>
                        </div>
                        
                        <div className={`text-sm opacity-60 ${isFocusExpanded ? 'mb-8' : 'mb-0'} ${fonts.ui}`}>{dailyVerse.source}</div>

                        <AnimatePresence>
                            {!isFocusExpanded ? (
                                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { triggerHaptic(); setIsFocusExpanded(true); }} className={`mt-8 w-full py-4 text-xs font-bold uppercase tracking-widest rounded-2xl transition active:scale-95 ${theme.button} ${fonts.ui}`}>
                                    Погрузиться
                                </motion.button>
                            ) : (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="overflow-hidden">
                                    <div className={`${theme.containerBg} rounded-[2rem] p-6 mb-6 mx-2 text-left shadow-inner backdrop-blur-md`}>
                                        <p className={`text-[17px] leading-relaxed opacity-90 ${fonts.content}`}>{dailyVerse.thought}</p>
                                    </div>
                                    <div className="mx-2 flex flex-col gap-3">
                                        <textarea value={inlineFocusText} onChange={(e) => setInlineFocusText(e.target.value)} placeholder={placeholderText} className={`w-full p-5 rounded-2xl ${theme.containerBg} backdrop-blur-md text-[15px] leading-relaxed resize-none outline-none ${theme.text} ${theme.placeholderColor} transition focus:scale-[1.01] ${fonts.content}`} rows="3" />
                                        <AnimatePresence>
                                            {inlineFocusText.length > 0 && (
                                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex gap-3 mt-1">
                                                    <div onClick={() => setIsFocusPublic(!isFocusPublic)} className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 ${theme.containerBg} backdrop-blur-md`}>
                                                        <div className={`w-2 h-2 rounded-full ${isFocusPublic ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-current opacity-40'}`} />
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.text} opacity-80`}>{isFocusPublic ? "Все" : "Личное"}</span>
                                                    </div>
                                                    <button onClick={handleInlineFocusSubmit} disabled={isFocusSubmitting} className={`flex-[2] py-3 text-xs font-bold uppercase tracking-widest rounded-2xl transition transform active:scale-95 ${theme.activeButton} shadow-lg ${fonts.ui}`}>
                                                        {isFocusSubmitting ? "..." : "Amen"}
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>

                    <div className="flex items-center justify-center my-8 opacity-50">
                        <div className="h-px bg-current w-16"></div>
                        <span className={`mx-4 text-xs font-medium uppercase tracking-widest ${fonts.ui}`}>Единство</span>
                        <div className="h-px bg-current w-16"></div>
                    </div>

                    <div className="space-y-4">
                        {publicPosts.map(post => (
                             <Card key={post.id} theme={theme} className="!p-6 relative group">
                                 <div className={`flex justify-between items-center mb-4 opacity-70 text-xs font-normal ${fonts.ui}`}>
                                     <span className="flex items-center gap-1.5">
                                         {post.authorName} 
                                         {post.authorIsAngel && <Feather size={12} className={theme.iconColor} />}
                                     </span>
                                     <div className="flex gap-2 mr-0">
                                        {post.status === 'answered' && <span className={`${theme.iconColor} font-medium flex items-center gap-1`}><CheckCircle2 size={12}/> Чудо</span>}
                                        <span>{post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Только что'}</span>
                                     </div>
                                 </div>
                                 <p className={`mb-6 text-[17px] leading-[1.75] whitespace-pre-wrap opacity-100 ${fonts.content}`}>{post.text}</p>
                                 <button 
                                    onClick={(e) => toggleLike(e, post.id, post.likes)} 
                                    className={`w-full py-3 text-sm font-medium transition rounded-xl flex items-center justify-center gap-2 ${post.likes?.includes(user.uid) ? theme.activeButton : theme.button} ${fonts.ui}`}
                                 >
                                     {post.likes?.includes(user.uid) ? "Amen 🙏" : "Amen"}
                                     {post.likes?.length > 0 && <span className="opacity-80 ml-1">{post.likes.length}</span>}
                                 </button>
                                 {isAdmin && <button onClick={() => deletePost(post.id)} className="absolute bottom-4 right-4 text-red-400 opacity-30 hover:opacity-100"><Trash2 size={16} /></button>}
                             </Card>
                         ))}
                    </div>
                  </motion.div>
                )}

                {view === 'diary' && (
                    <motion.div variants={simpleContainer} initial="hidden" animate="show" className="space-y-6">
                        <div className={`flex items-center justify-between px-2 pb-4 ${fonts.ui}`}>
                            <h2 className={`text-3xl font-semibold tracking-tight opacity-90 drop-shadow-sm ${theme.text}`}>Amen</h2>
                            <button onClick={() => { triggerHaptic(); setShowInlineCreate(true); }} className={`p-3 rounded-full ${theme.button} backdrop-blur-xl transition hover:scale-105 active:scale-95`}>
                                <PenLine size={20} />
                            </button>
                        </div>

                        <div className={`flex p-1 rounded-full mb-6 relative z-0 ${theme.containerBg} ${fonts.ui}`}>
                            <div className={`absolute top-1 bottom-1 w-1/2 bg-white/80 shadow-sm rounded-full transition-all duration-300 pointer-events-none ${diaryTab === 'active' ? 'left-1' : 'left-[49%]'}`} />
                            <button onClick={() => { triggerHaptic(); setDiaryTab('active'); }} className={`flex-1 py-2 text-xs font-medium relative z-10 transition-colors ${theme.text} ${diaryTab === 'active' ? 'opacity-100' : 'opacity-60'}`}>Молитвы</button>
                            <button onClick={() => { triggerHaptic(); setDiaryTab('answered'); }} className={`flex-1 py-2 text-xs font-medium relative z-10 transition-colors ${theme.text} ${diaryTab === 'answered' ? 'opacity-100' : 'opacity-60'}`}>Ответы</button>
                        </div>

                        <div className="space-y-4">
                            {myPrayers.filter(p => diaryTab === 'answered' ? p.status === 'answered' : p.status !== 'answered').length === 0 && (
                                <div className={`text-center opacity-60 py-10 text-lg ${fonts.content}`}>
                                    {diaryTab === 'active' ? "Дневник чист..." : "Пока нет записанных ответов..."}
                                </div>
                            )}
                            {myPrayers.filter(p => diaryTab === 'answered' ? p.status === 'answered' : p.status !== 'answered').map(p => (
                                <Card key={p.id} theme={theme}>
                                    <div className={`flex justify-between items-start mb-3 ${fonts.ui}`}>
                                        <span className="text-xs font-normal opacity-70">{p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : 'Только что'}</span>
                                        {p.status === 'answered' ? (
                                            <span className={`${theme.iconColor} text-xs font-medium flex items-center gap-1`}><CheckCircle2 size={12}/> Ответ</span>
                                        ) : (
                                            <button onClick={() => startEditing(p)} className="opacity-50 hover:opacity-100"><Edit3 size={14} /></button>
                                        )}
                                    </div>

                                    {editingId === p.id ? (
                                        <div className={`mb-4 space-y-2 ${fonts.ui}`}>
                                            <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className={`w-full bg-transparent border-b border-current border-opacity-30 py-2 outline-none text-lg font-medium`} />
                                            <textarea value={editForm.text} onChange={e => setEditForm({...editForm, text: e.target.value})} className={`w-full bg-transparent border-b border-current border-opacity-30 py-2 outline-none text-sm h-20 resize-none ${fonts.content}`} />
                                            <div className="flex justify-end gap-3 pt-2">
                                                <button onClick={() => setEditingId(null)} className="text-xs opacity-60">Отмена</button>
                                                <button onClick={saveEdit} className="text-xs font-medium">Сохранить</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className={`text-xl font-medium mb-3 leading-snug ${fonts.ui}`}>{p.title}</h3>
                                            <p className={`text-[17px] leading-[1.75] opacity-100 whitespace-pre-wrap mb-6 ${fonts.content}`}>{p.text}</p>
                                        </>
                                    )}

                                    {p.status === 'answered' && p.answerNote && (
                                        <div className={`${theme.containerBg} p-5 rounded-2xl mb-4 border border-current border-opacity-10`}>
                                            <p className={`text-xs font-medium opacity-70 uppercase mb-2 ${fonts.ui}`}>Свидетельство</p>
                                            <p className={`text-[17px] leading-relaxed ${fonts.content}`}>{p.answerNote}</p>
                                        </div>
                                    )}
                                    
                                    <div className={`pt-4 border-t border-current border-opacity-10 flex justify-between items-center ${fonts.ui}`}>
                                        <button onClick={() => deleteDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', p.id))} className="text-xs opacity-50 hover:opacity-100 transition">Удалить</button>
                                        {p.status !== 'answered' ? (
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => incrementPrayerCount(p.id, p.prayerCount)} className={`text-xs font-medium opacity-80 hover:opacity-100 flex items-center gap-2 transition ${theme.text}`}>
                                                    <Hand size={14}/> {p.prayerCount || 1}
                                                </button>
                                                <button onClick={() => openAnswerModal(p.id)} className="flex items-center gap-2 text-xs font-medium opacity-80 hover:opacity-100 transition">
                                                    <CheckCircle2 size={14}/> Есть ответ
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}

                {view === 'admin_feedback' && isAdmin && (
                    <motion.div variants={simpleContainer} initial="hidden" animate="show" className="space-y-4 pt-28">
                         <h2 className={`text-xl text-center mb-4 ${theme.text} ${fonts.ui}`}>Входящие отзывы</h2>
                         
                         <div className="flex justify-center mb-8">
                             <button onClick={resetAllAngels} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition">
                                 Сбросить всех Ангелов
                             </button>
                         </div>

                         {feedbacks.map(msg => (
                             <Card key={msg.id} theme={theme} className="relative">
                                 <div className={`flex justify-between mb-3 opacity-60 text-xs font-normal ${fonts.ui}`}>
                                     <span>{msg.userName}</span>
                                     <span>{msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleDateString() : 'Только что'}</span>
                                 </div>
                                 <p className={`mb-4 text-sm leading-relaxed opacity-100 ${fonts.content}`}>{msg.text}</p>
                                 <div className="flex justify-end">
                                     <button onClick={() => deleteFeedback(msg.id)} className="p-2 text-red-400 bg-red-500/10 rounded-full hover:bg-red-500/20"><Trash2 size={16} /></button>
                                 </div>
                             </Card>
                         ))}
                    </motion.div>
                )}

                {view === 'profile' && (
                    <motion.div variants={pageVariants} className="text-center pt-28 flex flex-col h-full">
                        <div className="pb-10 flex-1">
                            <div className="flex justify-center items-end gap-2 mb-8">
                                <div className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-light shadow-2xl ${theme.activeButton} ${fonts.content}`}>
                                    {user.displayName?.[0] || "A"}
                                </div>
                                {isAngel && <Feather size={24} className={`${theme.iconColor} opacity-90 pb-2`} />}
                            </div>

                            <div className="relative mb-8 px-8 group">
                                <input value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={handleUpdateName} className={`w-full bg-transparent text-center text-3xl font-medium outline-none border-b border-transparent focus:border-current transition placeholder:opacity-50 ${theme.text} ${fonts.ui}`} placeholder="Ваше имя" />
                            </div>
                            
                            <DivineSeed stage={seedStage} fruits={seedFruits} theme={theme} />

                            {/* 1. ПУТЕВОДИТЕЛЬ ПЕРВЫМ */}
                            <div className={`${theme.containerBg} rounded-[2.5rem] p-8 mb-8 text-left shadow-sm backdrop-blur-md transition-all`}>
                                <button 
                                    onClick={() => { triggerHaptic(); setIsGuideExpanded(!isGuideExpanded); }} 
                                    className="w-full flex justify-between items-center group cursor-pointer"
                                >
                                    <h4 className={`text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity ${fonts.ui}`}>Путеводитель</h4>
                                    <motion.div animate={{ rotate: isGuideExpanded ? 180 : 0 }} transition={{ duration: 0.3 }} className="opacity-60 group-hover:opacity-100">
                                        <ChevronDown size={16} />
                                    </motion.div>
                                </button>

                                <AnimatePresence>
                                    {isGuideExpanded && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }} 
                                            animate={{ height: "auto", opacity: 1 }} 
                                            exit={{ height: 0, opacity: 0 }} 
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="space-y-6 mt-6 pt-6 border-t border-current border-opacity-10">
                                                <div>
                                                    <h5 className={`text-sm font-semibold mb-1 flex items-center gap-2 ${fonts.ui} ${theme.text}`}><Disc size={16} className="opacity-60"/> Поток и Погружение</h5>
                                                    <p className={`text-[15px] leading-relaxed opacity-90 ${fonts.content}`}>Ежедневный фокус из Писания для настройки сердца. Включайте музыку, чтобы отсечь лишний шум.</p>
                                                </div>
                                                <div className="w-12 h-px bg-current opacity-20"></div>
                                                <div>
                                                    <h5 className={`text-sm font-semibold mb-1 flex items-center gap-2 ${fonts.ui} ${theme.text}`}><MessageCircle size={16} className="opacity-60"/> Единство</h5>
                                                    <p className={`text-[15px] leading-relaxed opacity-90 ${fonts.content}`}>Анонимная общая лента. Поддерживайте молитвы других словом Amen. Вы не одни.</p>
                                                </div>
                                                <div className="w-12 h-px bg-current opacity-20"></div>
                                                <div>
                                                    <h5 className={`text-sm font-semibold mb-1 flex items-center gap-2 ${fonts.ui} ${theme.text}`}><BookOpen size={16} className="opacity-60"/> Дневник и Ответы</h5>
                                                    <p className={`text-[15px] leading-relaxed opacity-90 ${fonts.content}`}>Ваша тайная комната. Записывайте личные просьбы и обязательно отмечайте «Ответы», когда Бог действует.</p>
                                                </div>
                                                <div className="w-12 h-px bg-current opacity-20"></div>
                                                <div>
                                                    <h5 className={`text-sm font-semibold mb-1 flex items-center gap-2 ${fonts.ui} ${theme.text}`}><Sprout size={16} className="opacity-60"/> Сад веры</h5>
                                                    <p className={`text-[15px] leading-relaxed opacity-90 ${fonts.content}`}>Дисциплина растит семя. Заходите в приложение каждый день, чтобы древо крепло и приносило плоды. Без внимания оно увядает.</p>
                                                </div>
                                                <div className="w-12 h-px bg-current opacity-20"></div>
                                                <div>
                                                    <h5 className={`text-sm font-semibold mb-1 flex items-center gap-2 ${fonts.ui} ${theme.text}`}><Feather size={16} className="opacity-60"/> Ангел проекта</h5>
                                                    <p className={`text-[15px] leading-relaxed opacity-90 ${fonts.content}`}>Статус Ангела (в меню) выдается за поддержку проекта. Он дает специальный значок и открывает 1 живой видеофон на выбор на весь месяц.</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* 2. АТМОСФЕРА ВНИЗУ (Бесплатные + Купленный) */}
                            <div className="mb-10 w-full">
                                <div className="flex items-center mb-4 px-2">
                                     <h4 className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${fonts.ui}`}>Атмосфера</h4>
                                     <span className={`text-[10px] uppercase tracking-widest ml-2 opacity-100 ${fonts.ui}`}>
                                         {availableThemes.find(t => t.id === (previewThemeId || currentThemeId))?.label || 'Классика'}
                                     </span>
                                </div>
                                <div className="flex gap-4 overflow-x-auto px-2 pb-4 no-scrollbar snap-x">
                                    {availableThemes.map(t => (
                                        <button 
                                            key={t.id}
                                            onClick={() => { triggerHaptic(); setCurrentThemeId(t.id); setPreviewThemeId(null); }} 
                                            className={`relative w-16 h-16 rounded-full shrink-0 snap-center overflow-hidden transition-all duration-300 ${(previewThemeId || currentThemeId) === t.id ? 'ring-2 ring-offset-2 ring-current scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'}`}
                                        >
                                            {t.type === 'video' ? (
                                                <video src={t.bgVideo} className="absolute inset-0 w-full h-full object-cover pointer-events-none" autoPlay loop muted playsInline WebkitPlaysInline />
                                            ) : (
                                                <img src={t.bgImage} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt={t.label} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={() => setShowFeedbackModal(true)} className={`w-full py-5 rounded-[2rem] ${theme.cardBg} transition hover:scale-[1.02] active:scale-95 mb-12`}>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${fonts.ui} ${theme.text}`}>Написать разработчику</span>
                            </button>

                            <div className={`mt-auto pt-8 pb-4 flex flex-col items-center justify-center opacity-40 hover:opacity-80 transition-opacity ${fonts.ui}`}>
                                <Feather size={14} className="mb-2 opacity-50" />
                                <div className="text-[10px] uppercase tracking-widest font-bold mb-1">Amen App</div>
                                <div className="text-[9px] leading-relaxed text-center max-w-[200px] mb-3 opacity-80">
                                    Контент носит духовный характер и не заменяет профессиональную помощь.
                                </div>
                                <div className="text-[8px] uppercase tracking-widest opacity-50 text-center">
                                    Создано с душой<br/>
                                    НПД ИНН ВСТАВЬ_СВОЙ_ИНН_СЮДА
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
              </motion.div>
          )}
          </AnimatePresence>

          {/* WRITER MODE (OVERLAY) */}
          <AnimatePresence>
          {showInlineCreate && (
                <motion.div 
                    key="writer"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-50 flex flex-col pt-28 px-6 backdrop-blur-3xl bg-black/10"
                    style={{ height: lockedHeight }} 
                >
                     <div className="fixed top-12 left-6 z-[60]">
                        <button onClick={() => setShowInlineCreate(false)} className={`text-sm font-medium px-5 py-2.5 rounded-full backdrop-blur-xl ${theme.text} bg-white/10 hover:bg-white/20 transition shadow-sm`}>
                            Закрыть
                        </button>
                    </div>

                    <div className="w-full max-w-sm mx-auto flex flex-col gap-4 overflow-y-auto pb-40 no-scrollbar"> 
                        <motion.div variants={itemAnim} initial="hidden" animate="show" transition={{delay: 0.1}} className={`rounded-2xl p-4 ${theme.containerBg} backdrop-blur-md transition-all focus-within:scale-[1.01]`}>
                            <input 
                                value={newPrayerTitle} 
                                onChange={(e) => setNewPrayerTitle(e.target.value)} 
                                placeholder="Тема..." 
                                className={`w-full bg-transparent text-lg font-medium outline-none ${theme.text} ${theme.placeholderColor} text-center`} 
                                autoFocus 
                            />
                        </motion.div>
                        <motion.div variants={itemAnim} initial="hidden" animate="show" transition={{delay: 0.2}} className={`rounded-2xl p-4 flex-1 h-48 ${theme.containerBg} backdrop-blur-md transition-all focus-within:scale-[1.01]`}>
                            <textarea 
                                value={newPrayerText} 
                                onChange={(e) => setNewPrayerText(e.target.value)} 
                                placeholder={placeholderText} 
                                className={`w-full h-full bg-transparent text-base leading-relaxed resize-none outline-none ${theme.text} ${theme.placeholderColor} ${fonts.content}`} 
                            />
                        </motion.div>
                        <motion.div variants={itemAnim} initial="hidden" animate="show" transition={{delay: 0.3}} className="flex gap-4 mt-2">
                            <div onClick={() => setFocusPrayerPublic(!focusPrayerPublic)} className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 ${theme.containerBg} backdrop-blur-md`}>
                                <div className={`w-2 h-2 rounded-full ${focusPrayerPublic ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-current opacity-40'}`} />
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.text} opacity-80`}>{focusPrayerPublic ? "Все" : "Личное"}</span>
                            </div>
                            <button 
                                onClick={handleAmen} 
                                disabled={isAmenAnimating} 
                                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest rounded-2xl transition transform active:scale-95 ${theme.activeButton} shadow-lg ${fonts.ui} disabled:opacity-50`}
                            >
                                {isAmenAnimating ? "..." : "Amen"}
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

        </main>

        <AudioPlayer 
            currentTrack={currentTrack} 
            isPlaying={isPlaying} 
            togglePlay={() => setIsPlaying(!isPlaying)} 
            changeTrack={setCurrentTrack} 
            theme={theme} 
            isUiVisible={isUiVisible}
        />
      </div>

      {/* --- МОДАЛКИ --- */}
      
      {/* ОКНО АНГЕЛА (ТЕПЕРЬ С ВЫБОРОМ 1 ФОНА) */}
      <AnimatePresence>
            {showSupportModal && (
                <>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" onClick={() => { setShowSupportModal(false); setPreviewThemeId(null); }}/>
                <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" className={`fixed top-[5%] bottom-[5%] left-6 right-6 z-[100] rounded-[2.5rem] p-8 shadow-2xl ${theme.cardBg} ${theme.text} overflow-y-auto no-scrollbar flex flex-col`}>
                    <div className="flex justify-between items-center mb-6 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <Feather className={theme.iconColor} size={24} />
                            <h3 className={`text-2xl font-medium ${fonts.ui}`}>Ангел проекта</h3>
                        </div>
                        <button onClick={() => { setShowSupportModal(false); setPreviewThemeId(null); }} className="opacity-50 hover:opacity-100"><X size={24}/></button>
                    </div>
                    
                    <div className={`p-6 rounded-3xl mb-8 flex-shrink-0 ${theme.containerBg} shadow-inner`}>
                        <p className={`text-[15px] leading-relaxed opacity-100 ${fonts.content}`}>
                            В знак благодарности за поддержку ваш аккаунт на 1 месяц получает статус Ангела (перо) и <strong>открывает 1 эксклюзивный видео-фон на ваш выбор.</strong>
                        </p>
                    </div>

                    {isAngel ? (
                        <div className="flex flex-col items-center mt-auto flex-shrink-0">
                            <div className={`w-full py-4 rounded-2xl text-center text-xs font-bold uppercase tracking-widest ${theme.containerBg} opacity-60 mb-4`}>
                                Услуга активна
                            </div>
                            {angelTheme && (
                                <div className={`text-sm opacity-80 text-center ${fonts.ui}`}>
                                    Выбранный фон: <strong className="font-semibold">{premiumThemes.find(t => t.id === angelTheme)?.label || 'Установлен'}</strong>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* ВИТРИНА ФОНОВ ПРЯМО В ОКНЕ */}
                            <div className="mb-6 w-full flex-shrink-0">
                                <div className="flex items-center mb-4 px-2">
                                    <h4 className={`text-[10px] font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2 ${fonts.ui}`}>
                                        <Sparkles size={14}/> Выберите фон
                                    </h4>
                                </div>
                                <div className="flex gap-4 overflow-x-auto px-2 pb-4 no-scrollbar snap-x">
                                    {premiumThemes.map(t => (
                                        <div 
                                            key={t.id}
                                            onClick={() => { 
                                                triggerHaptic(); 
                                                setSelectedAngelTheme(t.id); 
                                                setPreviewThemeId(t.id); 
                                            }} 
                                            className={`relative w-24 h-36 rounded-2xl overflow-hidden shrink-0 snap-center shadow-lg border transition-all duration-300 cursor-pointer ${selectedAngelTheme === t.id ? 'border-amber-400 ring-2 ring-amber-400 scale-105' : 'border-white/10 opacity-60 hover:opacity-100'} bg-black/50 active:scale-95`}
                                        >
                                            <video src={t.bgVideo} className="absolute inset-0 w-full h-full object-cover pointer-events-none" autoPlay loop muted playsInline WebkitPlaysInline />
                                            
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />

                                            <div className="absolute bottom-3 left-0 right-0 text-center z-10">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest text-white shadow-sm ${fonts.ui}`}>{t.label}</span>
                                            </div>
                                            
                                            {selectedAngelTheme === t.id && (
                                                <div className="absolute top-2 right-2 bg-amber-400 text-stone-900 rounded-full p-1 shadow-md">
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto flex-shrink-0">
                                <div className="mb-6">
                                    <label className={`text-[10px] font-bold opacity-70 uppercase tracking-widest mb-3 block text-center ${fonts.ui}`}>Пожертвование (от 100 ₽)</label>
                                    <input 
                                        type="number" 
                                        min="100"
                                        value={donateAmount}
                                        onChange={(e) => setDonateAmount(e.target.value)}
                                        placeholder="Сумма"
                                        className={`w-full bg-transparent border-b border-current border-opacity-30 py-3 text-center text-3xl font-medium outline-none transition focus:border-opacity-100 placeholder:opacity-40 ${fonts.ui}`}
                                    />
                                </div>

                                <button 
                                    onClick={becomeAngel} 
                                    disabled={isAuthLoading || Number(donateAmount) < 100 || !selectedAngelTheme} 
                                    className={`w-full py-5 rounded-2xl text-xs font-bold uppercase tracking-widest ${theme.activeButton} shadow-lg active:scale-95 transition flex justify-center items-center gap-2 ${fonts.ui} disabled:opacity-50 disabled:active:scale-100`}
                                >
                                    {isAuthLoading ? "Загрузка..." : (!selectedAngelTheme ? "Сначала выберите фон" : `Оплатить и получить фон`)}
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
                </>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showAnswerModal && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" onClick={() => setShowAnswerModal(false)}>
                    <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" onClick={e => e.stopPropagation()} className={`fixed top-1/4 left-6 right-6 z-[100] rounded-[2rem] p-8 shadow-2xl ${theme.cardBg} ${theme.text} border border-current border-opacity-10`}>
                        <div className="text-center mb-6">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${theme.containerBg} ${theme.iconColor}`}><CheckCircle2 size={24} /></div>
                            <h3 className={`text-xl font-medium ${fonts.ui}`}>Чудо произошло?</h3>
                        </div>
                        <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Напиши краткое свидетельство..." className={`w-full p-4 rounded-xl outline-none h-32 text-sm resize-none mb-6 ${theme.containerBg} ${fonts.content}`} />
                        <button onClick={confirmAnswer} className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest ${theme.activeButton} shadow-lg active:scale-95 transition ${fonts.ui}`}>Подтвердить</button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showFeedbackModal && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" onClick={() => setShowFeedbackModal(false)}>
                    <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" onClick={e => e.stopPropagation()} className={`fixed top-1/4 left-6 right-6 z-[100] rounded-[2rem] p-8 shadow-2xl ${theme.cardBg} ${theme.text}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-xl font-medium ${fonts.ui}`}>Разработчику</h3>
                            <button onClick={() => setShowFeedbackModal(false)} className="opacity-50 hover:opacity-100"><X size={24}/></button>
                        </div>
                        <p className={`text-sm opacity-80 mb-4 leading-relaxed ${fonts.ui}`}>Нашли ошибку? Есть идея? Или просто хотите сказать спасибо? Я читаю всё.</p>
                        <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Ваше сообщение..." className={`w-full p-4 rounded-xl outline-none h-32 text-[17px] leading-relaxed resize-none mb-6 ${theme.containerBg} ${fonts.content}`} />
                        <button onClick={sendFeedback} className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest ${theme.activeButton} shadow-lg active:scale-95 transition ${fonts.ui}`}>Отправить</button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showLegalModal && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-md" onClick={() => setShowLegalModal(false)}>
                    <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" onClick={e => e.stopPropagation()} className={`fixed top-1/2 left-6 right-6 -translate-y-1/2 z-[110] rounded-3xl p-8 shadow-2xl ${theme.cardBg} ${theme.text} max-h-[70vh] overflow-y-auto`}>
                        <button onClick={() => setShowLegalModal(false)} className="absolute top-6 right-6 opacity-50 hover:opacity-100"><X size={24}/></button>
                        <div>
                            <h3 className={`text-lg font-bold uppercase tracking-widest mb-6 opacity-60 ${fonts.ui}`}>Соглашение</h3>
                            <p className={`text-sm leading-relaxed opacity-90 ${fonts.content} whitespace-pre-wrap`}>{TERMS_TEXT}</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showSuccessModal && (
                <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} className="fixed inset-0 z-[100] flex items-center justify-center p-8 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 flex flex-col items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${theme.activeButton}`}><Check size={32} /></div>
                        <h3 className={`text-xl font-medium text-stone-900 ${fonts.ui}`}>{successMessage}</h3>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

    </>
  );
};

export default App;