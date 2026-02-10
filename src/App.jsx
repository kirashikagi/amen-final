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
  setDoc,
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
// Добавил иконки для семени: Sprout, TreeDeciduous, Apple, CloudRain (для засыхания), Circle (для семени)
import { List, X, Check, Disc, Plus, CheckCircle2, FileText, Heart, CalendarDays, Compass, Edit3, MessageCircle, Trash2, Mail, Copy, Hand, SkipBack, SkipForward, PenLine, Sprout, TreeDeciduous, Apple, CloudRain, Circle, CircleDot } from 'lucide-react'; 

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

const heavenCurtainAnim = {
    hidden: { y: "-105%" }, 
    visible: { y: "0%", transition: { duration: 0.25, ease: "easeOut" } }, 
    exit: { y: "-105%", transition: { duration: 0.3, ease: "easeIn" } }
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
    fallbackColor: '#fff7ed', headerColor: '#fff7ed',
    cardBg: 'bg-white/40 backdrop-blur-3xl shadow-sm', 
    text: 'text-stone-900', subText: 'text-stone-600', 
    containerBg: 'bg-white/50',
    button: 'border border-stone-800/10 hover:bg-white/40', 
    activeButton: 'bg-stone-800 text-white shadow-lg shadow-stone-800/20',
    menuBg: 'bg-[#fffbf7]/95 backdrop-blur-3xl text-stone-900 border-l border-white/20',
    iconColor: 'text-stone-800',
    placeholderColor: 'placeholder:text-stone-500/50',
    progressBar: 'bg-stone-800'
  },
  morning: { 
    id: 'morning', label: 'Величие', bgImage: '/morning.jpg', 
    fallbackColor: '#f0f9ff', headerColor: '#f0f9ff',
    cardBg: 'bg-white/40 backdrop-blur-3xl shadow-sm', 
    text: 'text-slate-900', subText: 'text-slate-600', 
    containerBg: 'bg-white/50',
    button: 'border border-slate-800/10 hover:bg-white/40', 
    activeButton: 'bg-sky-900 text-white shadow-lg shadow-sky-900/20',
    menuBg: 'bg-white/95 backdrop-blur-3xl text-slate-900 border-l border-white/20',
    iconColor: 'text-sky-900',
    placeholderColor: 'placeholder:text-slate-500/50',
    progressBar: 'bg-sky-900'
  },
  day: { 
    id: 'day', label: 'Гармония', bgImage: '/day.jpg', 
    fallbackColor: '#fdfce7', headerColor: '#fdfce7',
    cardBg: 'bg-[#fffff0]/40 backdrop-blur-3xl shadow-sm', 
    text: 'text-stone-950', subText: 'text-stone-700', 
    containerBg: 'bg-white/50',
    button: 'border border-stone-900/10 hover:bg-white/40', 
    activeButton: 'bg-amber-900 text-white shadow-lg shadow-amber-900/20',
    menuBg: 'bg-[#fffff0]/95 backdrop-blur-3xl text-stone-950 border-l border-white/20',
    iconColor: 'text-amber-900',
    placeholderColor: 'placeholder:text-stone-500/50',
    progressBar: 'bg-amber-900'
  },
  sunset: { 
    id: 'sunset', label: 'Откровение', bgImage: '/sunset.jpg', 
    fallbackColor: '#fff1f2', headerColor: '#fff1f2',
    cardBg: 'bg-stone-900/20 backdrop-blur-3xl shadow-sm', 
    text: 'text-orange-50', subText: 'text-orange-200/70', 
    containerBg: 'bg-black/20', 
    button: 'border border-orange-100/30 hover:bg-white/10', 
    activeButton: 'bg-orange-100 text-stone-900 shadow-lg shadow-orange-500/20', 
    menuBg: 'bg-[#2c1810]/95 backdrop-blur-3xl text-orange-50 border-l border-white/10',
    iconColor: 'text-orange-100',
    placeholderColor: 'placeholder:text-orange-200/50',
    progressBar: 'bg-orange-100'
  },
  evening: { 
    id: 'evening', label: 'Тайна', bgImage: '/evening.jpg', 
    fallbackColor: '#f5f3ff', headerColor: '#2e1065',
    cardBg: 'bg-[#2e1065]/20 backdrop-blur-3xl shadow-sm', 
    text: 'text-white', subText: 'text-purple-200', 
    containerBg: 'bg-white/10',
    button: 'border border-white/20 hover:bg-white/10', 
    activeButton: 'bg-white text-purple-950 shadow-lg shadow-purple-500/20',
    menuBg: 'bg-[#2e1065]/95 backdrop-blur-3xl text-white border-l border-white/10',
    iconColor: 'text-white',
    placeholderColor: 'placeholder:text-white/30',
    progressBar: 'bg-white'
  },
  midnight: { 
    id: 'midnight', label: 'Волшебство', bgImage: '/midnight.jpg', 
    fallbackColor: '#020617', headerColor: '#020617',
    cardBg: 'bg-black/30 backdrop-blur-3xl shadow-sm', 
    text: 'text-slate-100', subText: 'text-slate-400', 
    containerBg: 'bg-white/10',
    button: 'border border-white/10 hover:bg-white/5', 
    activeButton: 'bg-white text-black shadow-lg shadow-white/10',
    menuBg: 'bg-black/95 backdrop-blur-3xl text-slate-100 border-l border-white/10',
    iconColor: 'text-white',
    placeholderColor: 'placeholder:text-white/30',
    progressBar: 'bg-white'
  }
};

const CALENDAR_READINGS = {
  "19-01": { title: "Где ты?", source: "Бытие 3:9", text: "И воззвал Господь Бог к Адаму и сказал ему: где ты?", thought: "Бог обращается не к месту, а к сердцу. Найди сегодня время остановиться и честно посмотреть, где ты сейчас духовно.", action: "Оценить, где я духовно" },
  // ... (для экономии места в ответе используем те же чтения, что и раньше)
  "20-01": { title: "Работа до падения", source: "Бытие 2:15", text: "И взял Господь Бог человека... чтобы возделывать его и хранить его.", thought: "Труд был задуман как часть жизни с Богом. Попробуй сегодня отнестись к своей работе как к служению, а не просто обязанности.", action: "Работа как служение" },
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

// --- AUDIO PLAYER WITH SEEKER ---
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

  const handleTimeUpdate = () => {
      if(audioRef.current) {
          setProgress(audioRef.current.currentTime);
      }
  };

  const handleLoadedMetadata = () => {
      if(audioRef.current) {
          setDuration(audioRef.current.duration);
      }
  };

  const handleSeek = (e) => {
      const time = Number(e.target.value);
      if(audioRef.current) {
          audioRef.current.currentTime = time;
          setProgress(time);
      }
  };

  return (
    <>
      <AnimatePresence>
        {showPlaylist && (
            <>
                <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm" onClick={() => setShowPlaylist(false)} />
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                    className={`fixed bottom-28 left-4 right-4 z-50 rounded-2xl p-4 shadow-2xl ${theme.menuBg} max-h-72 overflow-y-auto ${fonts.ui}`}
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
        className={`fixed bottom-6 left-6 right-6 z-40 h-20 px-6 rounded-3xl backdrop-blur-2xl shadow-lg flex flex-col justify-center ${theme.menuBg} ${fonts.ui}`}
      >
        <audio 
            ref={audioRef} 
            src={currentTrack.url} 
            onEnded={handleNextTrack} 
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
        />
        
        {/* Minimalist Progress Bar */}
        <div className="w-full flex items-center mb-2">
            <input 
                type="range" 
                min="0" 
                max={duration || 0} 
                value={progress} 
                onChange={handleSeek}
                className="w-full h-1 bg-current opacity-10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-current"
            />
        </div>

        <div className="flex items-center justify-between w-full">
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

// --- SEED VISUALIZER ---
const DivineSeed = ({ stage, fruits, theme }) => {
    // 0: Seed, 1-2: Sprout, 3-4: Tree Small, 5-6: Tree Big, 7: Fruit
    let icon = <CircleDot size={48} strokeWidth={1} />;
    let text = "Посажено";

    if (stage >= 1 && stage <= 2) { icon = <Sprout size={48} strokeWidth={1} />; text = "Прорастает"; }
    else if (stage >= 3 && stage <= 4) { icon = <TreeDeciduous size={48} strokeWidth={1} className="scale-75" />; text = "Укореняется"; }
    else if (stage >= 5 && stage <= 6) { icon = <TreeDeciduous size={56} strokeWidth={1} />; text = "Крепнет"; }
    else if (stage === 7) { icon = <Apple size={48} strokeWidth={1} />; text = "Плодоносит"; }

    return (
        <div className={`flex flex-col items-center justify-center p-8 rounded-[2.5rem] mb-6 ${theme.cardBg} transition-all`}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${theme.containerBg} shadow-inner`}>
                <div className={`${theme.iconColor} transition-all duration-1000`}>
                    {icon}
                </div>
            </div>
            <h3 className={`text-xl font-normal ${fonts.content} mb-1`}>{text}</h3>
            <p className="text-xs opacity-50 uppercase tracking-widest font-bold">День {stage} из 7</p>
            
            {/* Weekly Progress Dots */}
            <div className="flex gap-2 mt-6">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i < stage ? theme.activeButton : 'bg-current opacity-10'}`} />
                ))}
            </div>

            {fruits > 0 && (
                <div className="mt-6 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md flex items-center gap-2">
                    <Apple size={14} className={theme.iconColor}/>
                    <span className="text-xs font-medium">{fruits} плодов</span>
                </div>
            )}
        </div>
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

  // Seed State
  const [seedStage, setSeedStage] = useState(0);
  const [seedFruits, setSeedFruits] = useState(0);

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

  const [placeholderText, setPlaceholderText] = useState("");
  const intervalRef = useRef(null);

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

  useEffect(() => {
    if (showInlineCreate) {
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${window.scrollY}px`; 

        const updateHeight = () => {
            if (window.visualViewport) {
                setLockedHeight(`${window.visualViewport.height}px`);
                window.scrollTo(0, 0); 
            }
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', updateHeight);
            updateHeight(); 
        }

        return () => {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);

            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', updateHeight);
            }
        }
    } else {
        setLockedHeight('100dvh');
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
      if(u) {
          setNewName(u.displayName || "");
          checkDivineSeed(u.uid); // Check seed logic on login
      }
  }), []);

  // --- DIVINE SEED LOGIC ---
  const checkDivineSeed = async (uid) => {
      const userRef = doc(db, 'artifacts', dbCollectionId, 'users', uid);
      const userSnap = await getDoc(userRef);
      const today = new Date().setHours(0,0,0,0);

      if (userSnap.exists()) {
          const data = userSnap.data();
          const lastVisit = data.lastVisit?.toDate().setHours(0,0,0,0) || 0;
          let newStage = data.seedStage || 0;
          let newFruits = data.seedFruits || 0;
          
          const diffTime = Math.abs(today - lastVisit);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

          if (diffDays === 1) {
              // User visited yesterday -> Grow
              newStage += 1;
              if (newStage > 7) {
                  newFruits += 1;
                  newStage = 0; // Harvest and reset
                  setSuccessMessage("Плод созрел!");
                  setShowSuccessModal(true);
                  setTimeout(() => setShowSuccessModal(false), 3000);
              }
          } else if (diffDays > 1) {
              // Missed more than 1 day -> Wither/Reset
              if (newStage > 0) {
                  setSuccessMessage("Сад пересох...");
                  setShowSuccessModal(true);
                  setTimeout(() => setShowSuccessModal(false), 2000);
              }
              newStage = 0;
          }
          // If diffDays == 0 (same day), do nothing visual

          // Update DB
          await setDoc(userRef, { 
              lastVisit: serverTimestamp(),
              seedStage: newStage,
              seedFruits: newFruits
          }, { merge: true });

          setSeedStage(newStage);
          setSeedFruits(newFruits);

      } else {
          // First time user
          await setDoc(userRef, { 
              lastVisit: serverTimestamp(),
              seedStage: 0,
              seedFruits: 0
          }, { merge: true });
      }
  };

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

          {/* MAIN CONTENT SWITCH */}
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
                                height: lockedHeight, 
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

                            <form onSubmit={handleAmen} className="w-full max-w-sm mx-auto flex flex-col gap-4 overflow-y-auto pb-40 no-scrollbar"> 
                                <div className={`rounded-2xl p-4 ${theme.containerBg} backdrop-blur-md transition-all focus-within:scale-[1.01]`}>
                                    <input 
                                        name="title" 
                                        placeholder="Тема..." 
                                        className={`w-full bg-transparent text-lg font-medium outline-none ${theme.text} ${theme.placeholderColor} text-center`}
                                        autoFocus 
                                    />
                                </div>

                                <div className={`rounded-2xl p-4 flex-1 h-48 ${theme.containerBg} backdrop-blur-md transition-all focus-within:scale-[1.01]`}>
                                    <textarea 
                                        name="text" 
                                        placeholder={placeholderText} 
                                        className={`w-full h-full bg-transparent text-base leading-relaxed resize-none outline-none ${theme.text} ${theme.placeholderColor} ${fonts.content}`} 
                                    />
                                </div>
                                
                                <div className="flex gap-4 mt-2">
                                    <div 
                                        onClick={() => setFocusPrayerPublic(!focusPrayerPublic)} 
                                        className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 ${theme.containerBg} backdrop-blur-md`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${focusPrayerPublic ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-current opacity-30'}`} />
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.text} opacity-60`}>
                                            {focusPrayerPublic ? "Все" : "Личное"}
                                        </span>
                                    </div>

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
                        
                        {/* Divine Seed Card */}
                        <DivineSeed stage={seedStage} fruits={seedFruits} theme={theme} />

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

                         {/* Updated Support & Dev Cards */}
                        <div className="grid grid-cols-2 gap-4 px-4 mb-12">
                            <button onClick={() => setShowFeedbackModal(true)} className={`flex flex-col items-center justify-center gap-2 p-6 rounded-[2rem] ${theme.cardBg} transition hover:scale-105 active:scale-95`}>
                                <MessageCircle size={24} className={theme.iconColor} />
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${fonts.ui} ${theme.text}`}>Написать</span>
                            </button>
                            
                            <button onClick={() => setShowSupportModal(true)} className={`flex flex-col items-center justify-center gap-2 p-6 rounded-[2rem] ${theme.cardBg} transition hover:scale-105 active:scale-95`}>
                                <Heart size={24} className={theme.iconColor} />
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${fonts.ui} ${theme.text}`}>Поддержать</span>
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
