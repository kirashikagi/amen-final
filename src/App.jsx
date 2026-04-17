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

// --- ANIMATIONS ---
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

const TERMS_TEXT = `1. Amen — пространство тишины.\n2. Мы не используем ваши данные.\n3. Дневник — личное, Единство — общее.\n4. Будьте светом.\n\nРеквизиты разработчика:\nПлательщик НПД\nИНН: 775101376595`;

// --- МУЗЫКА (ОБНОВЛЕННЫЙ СПИСОК БЕЗ 10, 11, 12 ТРЕКОВ) ---
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

// --- БАЗА КОНТЕНТА НА 30 ДНЕЙ ---
const CALENDAR_READINGS = {
  "16-04": { title: "Твердость", source: "Иисус Навин 1:9", text: "Будь тверд и мужествен, не страшись и не ужасайся; ибо с тобою Господь Бог твой везде, куда ни пойдешь.", thought: "Твое видение будет подвергаться сомнению. Где сегодня тебе нужно проявить твердость, опираясь не на свои силы, а на Его обещание?" },
  "17-04": { title: "Дефицит мудрости", source: "Иакова 1:5", text: "Если же у кого из вас недостает мудрости, да просит у Бога, дающего всем просто и без упреков, — и дастся ему.", thought: "В бизнесе и жизни бывают тупики. Признать: 'Мне не хватает мудрости' — это не слабость, это доступ к безграничному ресурсу." },
  "18-04": { title: "Честность в малом", source: "Луки 16:10", text: "Верный в малом и во многом верен, а неверный в малом неверен и во многом.", thought: "Большой успех — это сумма сотен честных мелочей. Есть ли в твоих делах сейчас 'серая зона', которую ты оправдываешь масштабом целей?" },
  "19-04": { title: "Слова-семена", source: "Притчи 18:22", text: "Смерть и жизнь — во власти языка, и любящие его вкусят от плодов его.", thought: "Твои слова сегодня либо строят команду и отношения, либо разрушают их. Что ты посеешь сегодня в разговоре с коллегами?" },
  "20-04": { title: "Фокус", source: "Матфея 6:22", text: "Светильник для тела есть око. Итак, если око твое будет чисто, то все тело твое будет светло.", thought: "Суета размывает фокус. Если ты смотришь сразу во все стороны, ты никуда не идешь. Выбери сегодня одну главную цель." },
  "21-04": { title: "Труд и плод", source: "Колоссянам 3:23", text: "И всё, что делаете, делайте от души, как для Господа, а не для человеков.", thought: "Когда ты работаешь для Бога, качество становится вопросом поклонения. Изменится ли твой подход к задачам с этой позиции?" },
  "22-04": { title: "Гнев как барьер", source: "Иакова 1:20", text: "Ибо гнев человека не творит правды Божией.", thought: "Эмоции — плохой советник для лидера. Гнев может дать иллюзию контроля, но он разрушает правду. Ответь сегодня из мира." },
  "23-04": { title: "Гордость vs Рост", source: "Притчи 16:18", text: "Погибели предшествует гордость, и падению — надменность.", thought: "Самый опасный момент — когда ты считаешь, что всё понял сам. Готов ли ты сегодня услышать совет, не включая защиту эго?" },
  "24-04": { title: "Цена тревоги", source: "Матфея 6:27", text: "Да и кто из вас, заботясь, может прибавить себе росту хотя на один локоть?", thought: "Тревога — это попытка контролировать будущее, которое тебе не принадлежит. Сколько энергии ты тратишь на переживания?" },
  "25-04": { title: "Сила тишины", source: "Исаия 30:15", text: "В тишине и уповании крепость ваша.", thought: "Шум мешает слышать стратегические ответы. Найди сегодня 10 минут абсолютной тишины. Не говори — просто слушай." },
  "26-04": { title: "Справедливость", source: "Михей 6:8", text: "Действовать справедливо, любить дела милосердия и смиренномудренно ходить пред Богом твоим.", thought: "Три столпа жизни. Где сегодня тебе нужно поступить по справедливости, даже если это сейчас 'невыгодно'?" },
  "27-04": { title: "Источник сил", source: "Филиппийцам 4:13", text: "Все могу в укрепляющем меня Иисусе Христе.", thought: "Это про делегирование своих немощей Богу. Когда твои батарейки на нуле, вспомни, к какой сети ты подключен." },
  "28-04": { title: "Управление временем", source: "Псалом 89:12", text: "Научи нас так счислять дни наши, чтобы нам приобрести сердце мудрое.", thought: "Твоё время — твой главный капитал. На что ты его инвестируешь сегодня: на вечное или на временное?" },
  "29-04": { title: "Смелость быть иным", source: "Римлянам 12:2", text: "И не сообразуйтесь с веком сим, но преобразуйтесь обновлением ума вашего.", thought: "Мир диктует: 'бери, манипулируй'. Твой путь может быть другим. Хватит ли тебе смелости пойти против течения?" },
  "30-04": { title: "Завершение", source: "2 Тимофею 4:7", text: "Подвигом добрым я подвизался, течение совершил, веру сохранил.", thought: "Конец месяца. Оглянись назад. Что было главным достижением в состоянии твоего духа?" },
  "01-05": { title: "Новое начало", source: "Плач Иеремии 3:22-23", text: "Милосердие Его не истощилось. Оно обновляется каждое утро.", thought: "Вчерашние ошибки остались во вчера. Сегодня — чистый лист. Какую одну вещь ты начнешь делать по-новому прямо сейчас?" },
  "02-05": { title: "Терпение", source: "Иакова 1:4", text: "Терпение же должно иметь совершенное действие, чтобы вы были совершенны во всей полноте.", thought: "Мы хотим результат немедленно. Но рост требует времени. Можешь ли ты сегодня доверять Богу сроки урожая?" },
  "03-05": { title: "Любовь в действии", source: "1 Иоанна 3:18", text: "Будем любить не словом или языком, но делом и истиною.", thought: "Красивые речи ничего не стоят без дел. Кому конкретно ты можешь помочь делом сегодня, без лишних слов?" },
  "04-05": { title: "Мир среди шторма", source: "Иоанна 14:27", text: "Мир оставляю вам, мир Мой даю вам; не так, как мир дает.", thought: "Внутренний штиль не зависит от внешних обстоятельств. Если в твоем сердце хаос — вернись к Источнику мира." },
  "05-05": { title: "Скромность", source: "1 Петра 5:5", text: "Бог гордым противится, а смиренным дает благодать.", thought: "Смирение — это адекватная оценка реальности. Ты — инструмент в Его руках. Позволь Ему действовать через тебя." },
  "06-05": { title: "Прощение", source: "Ефесянам 4:32", text: "Будьте друг к другу добры, сострадательны, прощайте друг друга.", thought: "Обида — это яд, который пьешь ты. Кого тебе нужно отпустить сегодня, чтобы стать свободным?" },
  "07-05": { title: "Свет миру", source: "Матфея 5:14", text: "Вы — свет мира. Не может укрыться город, стоящий на верху горы.", thought: "Твои ценности видны всем. Светит ли твой 'город' сегодня или ты пытаешься спрятать свою веру?" },
  "08-05": { title: "Сила слабости", source: "2 Коринфянам 12:9", text: "Довольно для тебя благодати Моей, ибо сила Моя совершается в немощи.", thought: "Там, где ты заканчиваешься, начинается Бог. Не бойся своих ограничений — через них проявляется Его величие." },
  "09-05": { title: "Победа над злом", source: "Римлянам 12:21", text: "Не будь побежден злом, но побеждай зло добром.", thought: "Отвечать злом на зло — значит проиграть. Какое доброе дело ты противопоставишь негативу сегодня?" },
  "10-05": { title: "Доверие", source: "Притчи 3:5", text: "Надейся на Господа всем сердцем твоим и не полагайся на разум твой.", thought: "Твой интеллект — мощный инструмент, но он ограничен. Готов ли ты следовать Его призыву, даже если он кажется нелогичным?" },
  "11-05": { title: "Дисциплина", source: "Евреям 12:11", text: "Всякое наказание кажется не радостью, а печалью; но после доставляет мирный плод.", thought: "Самодисциплина часто болезненна, но это единственный путь к плодам. Какую привычку нужно 'подтянуть'?" },
  "12-05": { title: "Единство", source: "Екклесиаст 4:12", text: "И нитка, втрое скрученная, не скоро порвется.", thought: "Одиночество — ловушка для лидера. Кто твоя 'нитка втрое'? Укрепляй связи сегодня." },
  "13-05": { title: "Радость", source: "Неемия 8:10", text: "Радость пред Господом — подкрепление для вас.", thought: "Радость — это не следствие успеха, это топливо для него. Найди сегодня повод для искренней благодарности." },
  "14-05": { title: "Наследие", source: "Матфея 6:20", text: "Собирайте себе сокровища на небе, где ни моль, ни ржа не истребляют.", thought: "Что из сделанного тобой сегодня останется через 100 лет? Инвестируй в людей и смыслы." },
  "15-05": { title: "Присутствие", source: "Матфея 28:20", text: "И се, Я с вами во все дни до скончания века. Аминь.", thought: "Ты никогда не один. Даже в самый трудный момент Он рядом. Осознай это присутствие прямо сейчас." },
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
                        <p className={`text-[17px] leading-[1.8] opacity-90 ${fonts.content}`}>Это не магический ритуал. Молитва — это дыхание души, честный диалог с Тем, кто знает вас лучше, чем вы сами.</p>
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
  const [angelTheme, setAngelTheme] = useState(null); 
  const [selectedAngelTheme, setSelectedAngelTheme] = useState(null); 

  const [seedStage, setSeedStage] = useState(0);
  const [seedFruits, setSeedFruits] = useState(0);

  const [showInlineCreate, setShowInlineCreate] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [showPaymentWidget, setShowPaymentWidget] = useState(false);

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
              const diffDays = Math.floor((new Date() - angelDate) / (1000 * 60 * 60 * 24));
              if (diffDays >= 30) {
                  currentIsAngel = false;
                  await setDoc(userRef, { isAngel: false, angelTheme: null }, { merge: true }); 
              }
          }
          setIsAngel(currentIsAngel);
          setAngelTheme(data.angelTheme || null);
          let lastVisitTime = data.lastVisit?.toDate?.()?.setHours(0,0,0,0) || 0;
          let newStage = data.seedStage || 0;
          let newFruits = data.seedFruits || 0;
          if (lastVisitTime > 0) {
              const diffDays = Math.ceil(Math.abs(today - lastVisitTime) / (1000 * 60 * 60 * 24)); 
              if (diffDays === 1) {
                  newStage += 1;
                  if (newStage > 7) { newFruits += 1; newStage = 0; setSuccessMessage("Плод созрел!"); setShowSuccessModal(true); setTimeout(() => setShowSuccessModal(false), 3000); }
              } else if (diffDays > 1) {
                  if (newStage > 0) { setSuccessMessage("Сад пересох..."); setShowSuccessModal(true); setTimeout(() => setShowSuccessModal(false), 2000); }
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
      setTimeout(() => { setIsAmenAnimating(false); setShowInlineCreate(false); setSuccessMessage("Услышано"); setShowSuccessModal(true); setNewPrayerTitle(''); setNewPrayerText(''); setFocusPrayerPublic(false); setTimeout(() => setShowSuccessModal(false), 2000); }, 800); 
  };

  const handleInlineFocusSubmit = async () => {
      if (!inlineFocusText.trim()) return;
      setIsFocusSubmitting(true); triggerHaptic();
      const title = dailyVerse.title; const text = inlineFocusText;
      await addDoc(collection(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers'), { title, text, createdAt: serverTimestamp(), status: 'active', updates: [], prayerCount: 1 }); 
      if(isFocusPublic) await addDoc(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts'), { text: `[${title}]\n\n${text}`, authorId: user.uid, authorName: user.displayName || "Пилигрим", authorIsAngel: isAngel, createdAt: serverTimestamp(), likes: [] }); 
      setTimeout(() => { setIsFocusSubmitting(false); setInlineFocusText(''); setIsFocusExpanded(false); setSuccessMessage("Услышано"); setShowSuccessModal(true); setTimeout(() => setShowSuccessModal(false), 2000); }, 800); 
  };

  const toggleLike = async (e, id, likes) => { 
      e.preventDefault(); e.stopPropagation(); triggerHaptic(); 
      try {
          const ref = doc(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts', id); 
          const hasLiked = likes && likes.includes(user.uid);
          await updateDoc(ref, { likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid) }); 
      } catch (err) { console.error("Like error:", err); }
  };

  const incrementPrayerCount = async (id, currentCount) => { triggerHaptic(); await updateDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', id), { prayerCount: (currentCount || 1) + 1 }); };
  const startEditing = (p) => { setEditingId(p.id); setEditForm({ title: p.title, text: p.text }); };
  const saveEdit = async () => { if(!editForm.title.trim()) return; await updateDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', editingId), { title: editForm.title, text: editForm.text }); setEditingId(null); };
  
  const openAnswerModal = (id) => { triggerHaptic(); setAnsweringId(id); setAnswerText(''); setShowAnswerModal(true); };
  const confirmAnswer = async () => { if(!answeringId) return; await updateDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', answeringId), { status: 'answered', answerNote: answerText, answeredAt: serverTimestamp() }); setShowAnswerModal(false); setAnsweringId(null); setSuccessMessage("Твой путь важен"); setShowSuccessModal(true); setTimeout(() => setShowSuccessModal(false), 2000); };
  const deletePost = async (id) => { if(confirm("Удалить пост?")) await deleteDoc(doc(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts', id)); };
  const deleteFeedback = async (id) => { if(confirm("Удалить отзыв?")) await deleteDoc(doc(db, 'artifacts', dbCollectionId, 'public', 'data', 'feedback', id)); };
  const sendFeedback = async () => { if(!feedbackText.trim()) return; await addDoc(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'feedback'), { text: feedbackText, userId: user.uid, userName: user.displayName, createdAt: serverTimestamp() }); setFeedbackText(''); setShowFeedbackModal(false); alert("Отправлено!"); };
  
  const resetAllAngels = async () => {
      if (!confirm("ВНИМАНИЕ! Лишить статуса ВСЕХ?")) return;
      const snap = await getDocs(collection(db, 'artifacts', dbCollectionId, 'users'));
      snap.forEach(async (userDoc) => { if (userDoc.data().isAngel) await updateDoc(doc(db, 'artifacts', dbCollectionId, 'users', userDoc.id), { isAngel: false }); });
      alert("Сброс завершен.");
  };

  const closeSupportModal = () => { setShowSupportModal(false); setPreviewThemeId(null); setShowPaymentWidget(false); };

  const becomeAngel = async () => {
      triggerHaptic(); setIsAuthLoading(true); 
      try {
          const amountToSend = donateAmount ? Number(donateAmount) : 100;
          const res = await fetch('https://amen-final.vercel.app/api/payment', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.uid, amount: amountToSend, purchaseType: 'angel', itemId: selectedAngelTheme })
          });
          const data = await res.json();
          if (data.confirmation_token) {
              setShowPaymentWidget(true); 
              setTimeout(() => {
                  const checkout = new window.YooMoneyCheckoutWidget({
                      confirmation_token: data.confirmation_token,
                      return_url: window.location.href, 
                      customization: { colors: { control_primary: '#fbbf24' } },
                      error_callback: () => { setShowPaymentWidget(false); }
                  });
                  checkout.render('payment-form'); 
              }, 100);
          } else throw new Error("Нет токена");
      } catch (error) { setSuccessMessage("Ошибка связи"); setShowSuccessModal(true); setTimeout(() => setShowSuccessModal(false), 2000); }
      finally { setIsAuthLoading(false); }
  };

  if (loading || !dailyVerse) return <div className={`h-screen bg-[#f4f5f0] flex flex-col items-center justify-center gap-4 text-stone-400 font-light ${fonts.ui}`}><span className="italic animate-pulse">Загрузка тишины...</span><div className="w-5 h-5 border-2 border-stone-200 border-t-stone-400 rounded-full animate-spin"></div></div>;
  if (!user) return <div className={`fixed inset-0 flex flex-col items-center justify-center p-8 bg-[#fffbf7] ${fonts.ui}`}><div className="w-full max-w-xs space-y-8 text-center"><h1 className="text-6xl font-semibold text-stone-900 tracking-tight">Amen</h1><p className="text-stone-400 text-sm">Пространство тишины</p><form onSubmit={handleLogin} className="space-y-4 pt-8"><input name="username" type="text" placeholder="Имя" className="w-full bg-transparent border-b border-stone-200 py-3 text-center text-lg outline-none focus:border-stone-800 transition text-stone-900" required /><input name="password" type="password" placeholder="Пароль" className="w-full bg-transparent border-b border-stone-200 py-3 text-center text-lg outline-none focus:border-stone-800 transition text-stone-900" required />{authError && <p className="text-red-500 text-xs">{authError}</p>}<button disabled={isAuthLoading} className="w-full py-4 bg-stone-900 text-white text-sm font-medium rounded-xl">{isAuthLoading ? "..." : "Войти"}</button></form><button onClick={() => signInAnonymously(auth)} className="text-stone-400 text-sm">Войти тихо</button></div></div>;

  const freeThemes = Object.values(THEMES).filter(t => !t.isPremium);
  const premiumThemes = Object.values(THEMES).filter(t => t.isPremium);
  const availableThemes = isAdmin ? [...freeThemes, ...premiumThemes] : [...freeThemes, ...premiumThemes.filter(t => isAngel && angelTheme === t.id)];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=Spectral:wght@400;500&display=swap" rel="stylesheet" />
      <FilmGrain />
      <div className={`fixed inset-0 z-[-3] transition-colors duration-1000`} style={{ backgroundColor: theme.fallbackColor }} />
      <AnimatePresence>
          {theme.type === 'video' ? (
              <motion.video key={theme.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} autoPlay loop muted playsInline WebkitPlaysInline disablePictureInPicture className="fixed inset-0 z-[-2] w-full h-full object-cover pointer-events-none" src={theme.bgVideo} />
          ) : (
              <motion.div key={theme.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="fixed inset-0 z-[-2] bg-cover bg-center" style={{ backgroundImage: `url(${theme.bgImage})` }} />
          )}
      </AnimatePresence>
      <div className={`fixed inset-0 z-[-1] transition-all duration-1000 ${theme.overlay || ''}`} />

      <AnimatePresence>{showWelcomeScreen && <WelcomeScreen theme={theme} onComplete={completeWelcome} openLegal={() => setShowLegalModal(true)} />}</AnimatePresence>

      <div className={`relative z-10 h-[100dvh] w-full flex flex-col max-w-md mx-auto overflow-hidden ${showWelcomeScreen ? 'pointer-events-none blur-sm' : ''}`}>
        <TopMenu view={view} setView={setView} theme={theme} openLegal={() => setShowLegalModal(true)} openSupport={() => setShowSupportModal(true)} logout={() => signOut(auth)} isAdmin={isAdmin} isUiVisible={isUiVisible} />

        <main ref={mainScrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-6 pb-44 no-scrollbar pt-28 min-h-screen"> 
          <AnimatePresence mode="wait">
          {!showInlineCreate && (
              <motion.div key={view} variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
                {view === 'flow' && (
                  <motion.div variants={simpleContainer} initial="hidden" animate="show" className="space-y-8">
                    <Card theme={theme} className="text-center py-10 relative overflow-hidden">
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
                                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => { triggerHaptic(); setIsFocusExpanded(true); }} className={`mt-8 w-full py-4 text-xs font-bold uppercase tracking-widest rounded-2xl ${theme.button} ${fonts.ui}`}>Погрузиться</motion.button>
                            ) : (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
                                    <div className={`${theme.containerBg} rounded-[2rem] p-6 mb-6 mx-2 text-left shadow-inner backdrop-blur-md`}>
                                        <p className={`text-[17px] leading-relaxed opacity-90 ${fonts.content}`}>{dailyVerse.thought}</p>
                                    </div>
                                    <div className="mx-2 flex flex-col gap-3">
                                        <textarea value={inlineFocusText} onChange={(e) => setInlineFocusText(e.target.value)} placeholder={placeholderText} className={`w-full p-5 rounded-2xl ${theme.containerBg} backdrop-blur-md text-[15px] outline-none ${theme.text} ${theme.placeholderColor} ${fonts.content}`} rows="3" />
                                        <div className="flex gap-3 mt-1">
                                            <div onClick={() => setIsFocusPublic(!isFocusPublic)} className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer ${theme.containerBg}`}>
                                                <div className={`w-2 h-2 rounded-full ${isFocusPublic ? 'bg-emerald-400' : 'bg-current opacity-40'}`} />
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.text} opacity-80`}>{isFocusPublic ? "Все" : "Личное"}</span>
                                            </div>
                                            <button onClick={handleInlineFocusSubmit} disabled={isFocusSubmitting} className={`flex-[2] py-3 text-xs font-bold uppercase tracking-widest rounded-2xl ${theme.activeButton} shadow-lg`}>{isFocusSubmitting ? "..." : "Amen"}</button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                    <div className="space-y-4">
                        {publicPosts.map(post => (
                             <Card key={post.id} theme={theme} className="!p-6 relative">
                                 <div className={`flex justify-between items-center mb-4 opacity-70 text-xs ${fonts.ui}`}>
                                     <span className="flex items-center gap-1.5">{post.authorName} {post.authorIsAngel && <Feather size={12} className={theme.iconColor} />}</span>
                                     <div className="flex gap-2">
                                        {post.status === 'answered' && <span className={`${theme.iconColor} font-medium flex items-center gap-1`}><CheckCircle2 size={12}/> Чудо</span>}
                                        <span>{post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Только что'}</span>
                                     </div>
                                 </div>
                                 <p className={`mb-6 text-[17px] leading-[1.75] whitespace-pre-wrap ${fonts.content}`}>{post.text}</p>
                                 <button onClick={(e) => toggleLike(e, post.id, post.likes)} className={`w-full py-3 text-sm font-medium transition rounded-xl flex items-center justify-center gap-2 ${post.likes?.includes(user.uid) ? theme.activeButton : theme.button}`}>
                                     {post.likes?.includes(user.uid) ? "Amen 🙏" : "Amen"} {post.likes?.length > 0 && <span className="opacity-80 ml-1">{post.likes.length}</span>}
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
                            <h2 className={`text-3xl font-semibold opacity-90 ${theme.text}`}>Amen</h2>
                            <button onClick={() => { triggerHaptic(); setShowInlineCreate(true); }} className={`p-3 rounded-full ${theme.button} backdrop-blur-xl`}><PenLine size={20} /></button>
                        </div>
                        <div className={`flex p-1 rounded-full mb-6 relative z-0 ${theme.containerBg} ${fonts.ui}`}>
                            <div className={`absolute top-1 bottom-1 w-1/2 bg-white/80 rounded-full transition-all duration-300 ${diaryTab === 'active' ? 'left-1' : 'left-[49%]'}`} />
                            <button onClick={() => setDiaryTab('active')} className={`flex-1 py-2 text-xs font-medium relative z-10 ${theme.text} ${diaryTab === 'active' ? 'opacity-100' : 'opacity-60'}`}>Молитвы</button>
                            <button onClick={() => setDiaryTab('answered')} className={`flex-1 py-2 text-xs font-medium relative z-10 ${theme.text} ${diaryTab === 'answered' ? 'opacity-100' : 'opacity-60'}`}>Ответы</button>
                        </div>
                        <div className="space-y-4">
                            {myPrayers.filter(p => diaryTab === 'answered' ? p.status === 'answered' : p.status !== 'answered').map(p => (
                                <Card key={p.id} theme={theme}>
                                    <div className="flex justify-between mb-3 text-xs opacity-70">
                                        <span>{p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : 'Только что'}</span>
                                        {p.status === 'answered' ? <span className={`${theme.iconColor} font-medium flex items-center gap-1`}><CheckCircle2 size={12}/> Ответ</span> : <button onClick={() => startEditing(p)}><Edit3 size={14} /></button>}
                                    </div>
                                    <h3 className={`text-xl font-medium mb-3 leading-snug ${fonts.ui}`}>{p.title}</h3>
                                    <p className={`text-[17px] leading-[1.75] opacity-100 whitespace-pre-wrap mb-6 ${fonts.content}`}>{p.text}</p>
                                    <div className={`pt-4 border-t border-current border-opacity-10 flex justify-between items-center ${fonts.ui}`}>
                                        <button onClick={() => deleteDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', p.id))} className="text-xs opacity-50">Удалить</button>
                                        {p.status !== 'answered' && <div className="flex items-center gap-4">
                                            <button onClick={() => incrementPrayerCount(p.id, p.prayerCount)} className="text-xs flex items-center gap-2"><Hand size={14}/> {p.prayerCount || 1}</button>
                                            <button onClick={() => openAnswerModal(p.id)} className="flex items-center gap-2 text-xs"><CheckCircle2 size={14}/> Ответ</button>
                                        </div>}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}

                {view === 'admin_feedback' && isAdmin && (
                    <div className="space-y-4 pt-28">
                         <h2 className="text-center mb-4">Отзывы</h2>
                         <button onClick={resetAllAngels} className="w-full py-2 bg-red-500/10 text-red-500 rounded-xl mb-8">Сбросить Ангелов</button>
                         {feedbacks.map(msg => (
                             <Card key={msg.id} theme={theme}>
                                 <div className="flex justify-between mb-3 opacity-60 text-xs"><span>{msg.userName}</span></div>
                                 <p className="mb-4 text-sm">{msg.text}</p>
                                 <button onClick={() => deleteFeedback(msg.id)} className="text-red-400"><Trash2 size={16} /></button>
                             </Card>
                         ))}
                    </div>
                )}

                {view === 'profile' && (
                    <motion.div variants={pageVariants} className="text-center pt-28 flex flex-col h-full">
                        <div className="pb-10 flex-1">
                            <div className="flex justify-center items-end gap-2 mb-8">
                                <div className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl shadow-2xl ${theme.activeButton}`}>
                                    {user.displayName?.[0] || "A"}
                                </div>
                                {isAngel && <Feather size={24} className={`${theme.iconColor} pb-2`} />}
                            </div>
                            <input value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={handleUpdateName} className={`w-full bg-transparent text-center text-3xl font-medium outline-none mb-8 ${theme.text}`} placeholder="Имя" />
                            <DivineSeed stage={seedStage} fruits={seedFruits} theme={theme} />
                            
                            <div className="mb-10 w-full">
                                <div className="flex items-center mb-4 px-2">
                                     <h4 className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${fonts.ui}`}>Атмосфера</h4>
                                     <span className="text-[10px] ml-2">{availableThemes.find(t => t.id === (previewThemeId || currentThemeId))?.label || ''}</span>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pt-4 px-2 pb-4 no-scrollbar snap-x">
                                    {availableThemes.map(t => (
                                        <button key={t.id} onClick={() => { triggerHaptic(); setCurrentThemeId(t.id); }} className={`relative w-16 h-16 rounded-full shrink-0 snap-center overflow-hidden transition-all ${(previewThemeId || currentThemeId) === t.id ? 'ring-2 ring-offset-2 ring-current scale-110' : 'opacity-60'}`}>
                                            {t.type === 'video' ? <video src={t.bgVideo} className="absolute inset-0 w-full h-full object-cover" muted /> : <img src={t.bgImage} className="absolute inset-0 w-full h-full object-cover" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setShowFeedbackModal(true)} className={`w-full py-5 rounded-[2rem] ${theme.cardBg} mb-12`}><span className="text-[10px] font-bold uppercase">Написать нам</span></button>
                            <div className="mt-auto opacity-40 text-[8px] uppercase tracking-widest">Amen App<br/>НПД ИНН 775101376595</div>
                        </div>
                    </motion.div>
                )}
              </motion.div>
          )}
          </AnimatePresence>

          <AnimatePresence>
          {showInlineCreate && (
                <motion.div key="writer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col pt-28 px-6 backdrop-blur-3xl bg-black/10" style={{ height: lockedHeight }}>
                     <button onClick={() => setShowInlineCreate(false)} className="fixed top-12 left-6 px-5 py-2.5 rounded-full bg-white/10 text-sm">Закрыть</button>
                    <div className="w-full max-w-sm mx-auto flex flex-col gap-4"> 
                        <div className={`rounded-2xl p-4 ${theme.containerBg} backdrop-blur-md`}>
                            <input value={newPrayerTitle} onChange={(e) => setNewPrayerTitle(e.target.value)} placeholder="Тема..." className="w-full bg-transparent text-lg font-medium outline-none text-center" autoFocus />
                        </div>
                        <div className={`rounded-2xl p-4 flex-1 h-48 ${theme.containerBg} backdrop-blur-md`}>
                            <textarea value={newPrayerText} onChange={(e) => setNewPrayerText(e.target.value)} placeholder={placeholderText} className={`w-full h-full bg-transparent outline-none resize-none ${fonts.content}`} />
                        </div>
                        <div className="flex gap-4 mt-2">
                            <div onClick={() => setFocusPrayerPublic(!focusPrayerPublic)} className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 ${theme.containerBg}`}>
                                <div className={`w-2 h-2 rounded-full ${focusPrayerPublic ? 'bg-emerald-400' : 'bg-current opacity-40'}`} />
                                <span className="text-[10px] font-bold uppercase">Все</span>
                            </div>
                            <button onClick={handleAmen} disabled={isAmenAnimating} className={`flex-1 py-4 text-xs font-bold uppercase rounded-2xl ${theme.activeButton}`}>{isAmenAnimating ? "..." : "Amen"}</button>
                        </div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </main>
        <AudioPlayer currentTrack={currentTrack} isPlaying={isPlaying} togglePlay={() => setIsPlaying(!isPlaying)} changeTrack={setCurrentTrack} theme={theme} isUiVisible={isUiVisible} />
      </div>

      {/* MODALS */}
      <AnimatePresence>
          {showSupportModal && (
              <>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" onClick={closeSupportModal}/>
              <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" className={`fixed top-[5%] bottom-[5%] left-6 right-6 z-[100] rounded-[2.5rem] p-8 shadow-2xl bg-black/40 backdrop-blur-md border border-white/20 text-white overflow-y-auto no-scrollbar flex flex-col`}>
                  <div className="flex justify-between mb-6">
                      <div className="flex items-center gap-3"><Feather className="text-amber-400" size={24} /><h3 className="text-2xl font-medium">Ангел проекта</h3></div>
                      <button onClick={closeSupportModal} className="opacity-50"><X size={24}/></button>
                  </div>
                  {showPaymentWidget ? (
                      <div className="flex-1 flex flex-col items-center justify-center">
                          <p className="mb-4 text-sm opacity-60">Безопасная оплата</p>
                          <div id="payment-form" className="w-full bg-white rounded-2xl min-h-[400px]"></div>
                      </div>
                  ) : (
                      <>
                          <div className={`p-6 rounded-3xl mb-8 bg-white/10 shadow-inner space-y-4`}>
                              <p className={`text-[17px] leading-relaxed opacity-90 ${fonts.content}`}>Amen — это бесплатное пространство тишины. Мы принципиально не добавляем рекламу, чтобы сохранить чистоту проекта.</p>
                              <p className={`text-[17px] leading-relaxed opacity-90 ${fonts.content}`}>Вы можете помочь развитию и поддержанию проекта. В знак благодарности ваш аккаунт получит статус Ангела и <strong>открывает 1 эксклюзивный живой видео-фон на выбор.</strong></p>
                              <p className="text-xs opacity-50 italic">* Переводы являются добровольными пожертвованиями.</p>
                          </div>
                          {!isAngel ? <>
                              <div className="mb-6">
                                  <div className="flex items-center mb-4 px-2"><h4 className="text-[10px] font-bold uppercase text-amber-400">Выберите фон</h4></div>
                                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
                                      {premiumThemes.map(t => (
                                          <div key={t.id} onClick={() => { triggerHaptic(); setSelectedAngelTheme(t.id); setPreviewThemeId(t.id); }} className={`relative w-24 h-36 rounded-2xl overflow-hidden shrink-0 border transition-all ${selectedAngelTheme === t.id ? 'border-amber-400 ring-2 ring-amber-400' : 'border-white/20 opacity-60'}`}>
                                              <video src={t.bgVideo} className="absolute inset-0 w-full h-full object-cover" muted />
                                              <div className="absolute bottom-3 left-0 right-0 text-center z-10"><span className="text-[10px] font-bold uppercase text-white">{t.label}</span></div>
                                              {selectedAngelTheme === t.id && <div className="absolute top-2 right-2 bg-amber-400 rounded-full p-1"><Check size={12} className="text-black" /></div>}
                                          </div>
                                      ))}
                                  </div>
                              </div>
                              <div className="mt-auto">
                                  <input type="number" value={donateAmount} onChange={(e) => setDonateAmount(e.target.value)} placeholder="Сумма" className="w-full bg-transparent border-b border-white/30 py-3 text-center text-3xl mb-6 outline-none" />
                                  <button onClick={becomeAngel} disabled={isAuthLoading || !selectedAngelTheme} className="w-full py-5 rounded-2xl text-xs font-bold uppercase bg-white text-stone-900">{isAuthLoading ? "Загрузка..." : "Поддержать и получить фон"}</button>
                              </div>
                          </> : <div className="text-center opacity-60 py-4">Услуга активна</div>}
                      </>
                  )}
              </motion.div>
              </>
          )}
      </AnimatePresence>

      <AnimatePresence>{showAnswerModal && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" onClick={() => setShowAnswerModal(false)}><motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" onClick={e => e.stopPropagation()} className={`fixed top-1/4 left-6 right-6 z-[100] rounded-[2rem] p-8 shadow-2xl ${theme.cardBg} ${theme.text}`}><h3 className="text-center mb-6">Чудо произошло?</h3><textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Свидетельство..." className={`w-full p-4 rounded-xl h-32 mb-6 ${theme.containerBg}`} /><button onClick={confirmAnswer} className={`w-full py-4 rounded-xl font-bold uppercase ${theme.activeButton}`}>Подтвердить</button></motion.div></motion.div>}</AnimatePresence>
      <AnimatePresence>{showFeedbackModal && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" onClick={() => setShowFeedbackModal(false)}><motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" onClick={e => e.stopPropagation()} className={`fixed top-1/4 left-6 right-6 z-[100] rounded-[2rem] p-8 ${theme.cardBg} ${theme.text}`}><h3 className="mb-6">Разработчику</h3><textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Сообщение..." className={`w-full p-4 rounded-xl h-32 mb-6 ${theme.containerBg}`} /><button onClick={sendFeedback} className={`w-full py-4 rounded-xl font-bold uppercase ${theme.activeButton}`}>Отправить</button></motion.div></motion.div>}</AnimatePresence>
      <AnimatePresence>{showLegalModal && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[110] bg-black/50" onClick={() => setShowLegalModal(false)}><motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" onClick={e => e.stopPropagation()} className={`fixed top-1/2 left-6 right-6 -translate-y-1/2 rounded-3xl p-8 ${theme.cardBg} ${theme.text} max-h-[70vh] overflow-y-auto`}><h3 className="mb-6 opacity-60">Соглашение</h3><p className="whitespace-pre-wrap text-sm">{TERMS_TEXT}</p></motion.div></motion.div>}</AnimatePresence>
      <AnimatePresence>{showSuccessModal && <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"><div className="bg-white/90 shadow-2xl rounded-3xl p-8 flex flex-col items-center gap-4"><div className={`w-16 h-16 rounded-full flex items-center justify-center ${theme.activeButton}`}><Check size={32} /></div><h3 className="text-xl font-medium text-stone-900">{successMessage}</h3></div></motion.div>}</AnimatePresence>
    </>
  );
};

export default App;
