import FaithGarden from './components/FaithGarden';
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  onAuthStateChanged, 
  signInAnonymously, 
  signOut 
} from "firebase/auth";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  query, 
  where,
  orderBy, 
  limit, 
  getDocs,
  onSnapshot, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove
} from "firebase/firestore";
import { List, X, Check, Disc, Plus, CheckCircle2, FileText, Heart, CalendarDays, Edit3, MessageCircle, Trash2, Mail, Copy, Hand, SkipBack, SkipForward, PenLine, Sprout, Leaf, Apple, CloudRain, Circle, CircleDot, Feather, Sparkles, BookOpen } from 'lucide-react'; 

const dbCollectionId = "amen-production"; 
const ADMIN_NAMES = ['Admin', 'Founder', 'admin', 'founder', 'Киря'];

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
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

const modalAnim = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.15, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.1, ease: "easeIn" } }
};

const triggerHaptic = () => {
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
};

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

// --- ARCHITECTURE FIX: SOFT TYPOGRAPHY ---
// Мы убрали text-stone-900 (почти черный) и text-white (чистый белый).
// Теперь используются более мягкие оттенки (800/700 для света, 100/50 для тьмы).
const THEMES = {
  dawn: { id: 'dawn', label: 'Безмятежность', bgImage: '/dawn.jpg', fallbackColor: '#fff7ed', headerColor: '#fff7ed', cardBg: 'bg-white/40 backdrop-blur-3xl shadow-sm', text: 'text-stone-800', subText: 'text-stone-500', containerBg: 'bg-white/50', button: 'border border-stone-800/10 hover:bg-white/40', activeButton: 'bg-stone-800/90 text-stone-50 shadow-lg shadow-stone-800/10', menuBg: 'bg-[#fffbf7]/95 backdrop-blur-3xl text-stone-800 border-l border-white/20', iconColor: 'text-stone-700', placeholderColor: 'placeholder:text-stone-500/40', progressBar: 'bg-stone-700' },
  morning: { id: 'morning', label: 'Величие', bgImage: '/morning.jpg', fallbackColor: '#f0f9ff', headerColor: '#f0f9ff', cardBg: 'bg-white/40 backdrop-blur-3xl shadow-sm', text: 'text-slate-800', subText: 'text-slate-500', containerBg: 'bg-white/50', button: 'border border-slate-800/10 hover:bg-white/40', activeButton: 'bg-sky-900/90 text-sky-50 shadow-lg shadow-sky-900/10', menuBg: 'bg-white/95 backdrop-blur-3xl text-slate-800 border-l border-white/20', iconColor: 'text-sky-800', placeholderColor: 'placeholder:text-slate-500/40', progressBar: 'bg-sky-800' },
  day: { id: 'day', label: 'Гармония', bgImage: '/day.jpg', fallbackColor: '#fdfce7', headerColor: '#fdfce7', cardBg: 'bg-[#fffff0]/40 backdrop-blur-3xl shadow-sm', text: 'text-stone-800', subText: 'text-stone-600', containerBg: 'bg-white/50', button: 'border border-stone-800/10 hover:bg-white/40', activeButton: 'bg-amber-900/90 text-amber-50 shadow-lg shadow-amber-900/10', menuBg: 'bg-[#fffff0]/95 backdrop-blur-3xl text-stone-800 border-l border-white/20', iconColor: 'text-amber-800', placeholderColor: 'placeholder:text-stone-500/40', progressBar: 'bg-amber-800' },
  sunset: { id: 'sunset', label: 'Откровение', bgImage: '/sunset.jpg', fallbackColor: '#fff1f2', headerColor: '#fff1f2', cardBg: 'bg-stone-900/20 backdrop-blur-3xl shadow-sm', text: 'text-orange-50', subText: 'text-orange-200/60', containerBg: 'bg-black/20', button: 'border border-orange-100/20 hover:bg-white/10', activeButton: 'bg-orange-100/90 text-stone-800 shadow-lg shadow-orange-500/10', menuBg: 'bg-[#2c1810]/95 backdrop-blur-3xl text-orange-50 border-l border-white/10', iconColor: 'text-orange-200/90', placeholderColor: 'placeholder:text-orange-200/40', progressBar: 'bg-orange-200' },
  evening: { id: 'evening', label: 'Тайна', bgImage: '/evening.jpg', fallbackColor: '#f5f3ff', headerColor: '#2e1065', cardBg: 'bg-[#2e1065]/20 backdrop-blur-3xl shadow-sm', text: 'text-purple-50', subText: 'text-purple-300/60', containerBg: 'bg-white/10', button: 'border border-white/10 hover:bg-white/10', activeButton: 'bg-purple-50/90 text-purple-950 shadow-lg shadow-purple-500/10', menuBg: 'bg-[#2e1065]/95 backdrop-blur-3xl text-purple-50 border-l border-white/10', iconColor: 'text-purple-100/90', placeholderColor: 'placeholder:text-purple-200/30', progressBar: 'bg-purple-100' },
  midnight: { id: 'midnight', label: 'Волшебство', bgImage: '/midnight.jpg', fallbackColor: '#020617', headerColor: '#020617', cardBg: 'bg-black/30 backdrop-blur-3xl shadow-sm', text: 'text-slate-200', subText: 'text-slate-400', containerBg: 'bg-white/10', button: 'border border-white/10 hover:bg-white/5', activeButton: 'bg-slate-200/90 text-slate-900 shadow-lg shadow-white/5', menuBg: 'bg-black/95 backdrop-blur-3xl text-slate-200 border-l border-white/10', iconColor: 'text-slate-300/90', placeholderColor: 'placeholder:text-slate-400/30', progressBar: 'bg-slate-300' }
};

const CALENDAR_READINGS = {
  "19-01": { title: "Где ты?", source: "Бытие 3:9", text: "И воззвал Господь Бог к Адаму и сказал ему: где ты?", thought: "Бог обращается не к месту, а к сердцу. Найди сегодня время остановиться и честно посмотреть, где ты сейчас духовно." },
  "20-01": { title: "Работа до падения", source: "Бытие 2:15", text: "И взял Господь Бог человека... чтобы возделывать его и хранить его.", thought: "Труд был задуман как часть жизни с Богом. Попробуй сегодня отнестись к своей работе как к служению, а не просто обязанности." },
};
const DAILY_WORD_DEFAULT = { title: "Тишина", source: "Псалом 46:11", text: "Остановитесь и познайте, что Я — Бог.", thought: "В суете трудно услышать шепот." };
const TERMS_TEXT = `1. Amen — пространство тишины.\n2. Мы не используем ваши данные.\n3. Дневник — личное, Единство — общее.\n4. Будьте светом.`;
const DISCLAIMER_TEXT = `Amen не заменяет профессиональную помощь.\nКонтент носит духовный характер.`;

const fonts = { ui: "font-sans", content: "font-serif" };

const FilmGrain = () => (
    <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.05] mix-blend-overlay"
         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
    />
);

const Card = ({ children, theme, className = "", onClick }) => (
  <motion.div variants={itemAnim} onClick={onClick} className={`rounded-[2.5rem] p-8 mb-6 transition-transform hover:scale-[1.01] ${theme.cardBg} ${theme.text} ${className}`}>
    {children}
  </motion.div>
);

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
                    {AUDIO_TRACKS.map(track => (
                        <button key={track.id} onClick={() => { changeTrack(track); setShowPlaylist(false); }} className={`w-full text-left py-3 px-2 rounded-lg text-sm font-normal transition-colors hover:bg-black/5 ${currentTrack.id === track.id ? 'bg-black/5 opacity-100 font-medium' : 'opacity-70'}`}>
                            {track.title}
                        </button>
                    ))}
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
                <div className={`p-2 rounded-full bg-black/5 opacity-80`}><Disc size={18} className={isPlaying ? "animate-spin-slow" : ""} /></div>
                <span className="text-xs font-medium truncate tracking-wide opacity-80">{currentTrack.title}</span>
            </div>
            <div className="flex items-center gap-6 opacity-80">
                <button onClick={handlePrevTrack} className="opacity-50 hover:opacity-100 transition active:scale-90"><SkipBack size={18}/></button>
                <button onClick={() => { triggerHaptic(); togglePlay(); }} className="text-xs font-medium hover:opacity-80 transition active:scale-90 uppercase tracking-wider">{isPlaying ? "Pause" : "Play"}</button>
                <button onClick={handleNextTrack} className="opacity-50 hover:opacity-100 transition active:scale-90"><SkipForward size={18}/></button>
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
      <motion.div animate={{ y: isUiVisible ? 0 : -100, opacity: isUiVisible ? 1 : 0 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className={`fixed top-12 right-6 z-[60] ${fonts.ui}`}>
        <button onClick={() => { triggerHaptic(); setIsOpen(!isOpen); }} className={`text-sm font-medium px-5 py-2.5 rounded-full backdrop-blur-xl ${theme.text} bg-white/10 hover:bg-white/20 transition active:scale-95 shadow-sm opacity-90`}>{isOpen ? "Закрыть" : "Меню"}</button>
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className={`fixed inset-0 z-40 bg-black/10 backdrop-blur-sm`} onClick={() => setIsOpen(false)}/>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 250 }} className={`fixed top-0 right-0 bottom-0 z-50 w-72 p-10 shadow-2xl flex flex-col justify-between ${theme.menuBg} ${fonts.ui}`}>
              <div className="mt-8 flex flex-col items-start gap-8">
                <div className={`${fonts.ui} text-4xl font-light tracking-wide mb-10 opacity-30 uppercase`}>Amen</div>
                {menuItems.map(item => (
                  <button key={item.id} onClick={() => { triggerHaptic(); setView(item.id); setIsOpen(false); }} className={`text-left text-xl font-light transition-opacity ${view === item.id ? 'opacity-90' : 'opacity-40 hover:opacity-80'}`}>{item.label}</button>
                ))}
                <button onClick={() => { openThemeModal(); setIsOpen(false); }} className="text-left text-xl font-light opacity-90 hover:opacity-80">Атмосфера</button>
                {isAdmin && <button onClick={() => { setView('admin_feedback'); setIsOpen(false); }} className="text-left text-lg font-normal opacity-60 hover:opacity-90 flex items-center gap-3 mt-4"><Mail size={18}/> Входящие</button>}
              </div>
              <div className="mb-8 flex flex-col items-start gap-2 opacity-40 hover:opacity-70 transition-opacity">
                  <button onClick={() => { openLegal(); setIsOpen(false); }} className="flex items-center gap-2 text-xs"><FileText size={12}/> Соглашение</button>
                  <button onClick={logout} className="text-xs mt-4">Выйти</button>
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
  const [userDocData, setUserDocData] = useState(null);
  const isAdmin = user && ADMIN_NAMES.includes(user.displayName);
  
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

  // Учет статуса
  const [isAngel, setIsAngel] = useState(false);

  // UI States
  const [showInlineCreate, setShowInlineCreate] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPrayerInfoModal, setShowPrayerInfoModal] = useState(false);

  // Интерактивный Фокус Дня
  const [isFocusExpanded, setIsFocusExpanded] = useState(false);
  const [inlineFocusText, setInlineFocusText] = useState('');
  const [isFocusPublic, setIsFocusPublic] = useState(false);
  const [isFocusSubmitting, setIsFocusSubmitting] = useState(false);

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

  // --- SAFE KEYBOARD & SCROLL FIX ---
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
            if (window.visualViewport) window.visualViewport.removeEventListener('resize', updateHeight);
        }
    } else {
        setLockedHeight('100dvh');
    }
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
      const images = ['/dawn.jpg', '/morning.jpg', '/day.jpg', '/sunset.jpg', '/evening.jpg', '/midnight.jpg'];
      images.forEach(src => { const img = new Image(); img.src = src; });
  }, []);

  useEffect(() => onAuthStateChanged(auth, (u) => { 
      setUser(u); 
      setLoading(false);
      if(u) { setNewName(u.displayName || ""); }
  }), []);

  useEffect(() => {
      if (!user) return;
      const unsubscribe = onSnapshot(doc(db, 'artifacts', dbCollectionId, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
              const data = docSnap.data();
              setUserDocData(data);
              setIsAngel(data.isAngel || false);
          }
      });
      return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!showInlineCreate && !isFocusExpanded) {
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
      } else clearInterval(intervalRef.current);
    }, 45); 
    return () => clearInterval(intervalRef.current);
  }, [showInlineCreate, isFocusExpanded]);

  useEffect(() => { if (!user) return; return onSnapshot(query(collection(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers'), orderBy('createdAt', 'desc')), snap => setMyPrayers(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, [user]);
  useEffect(() => { return onSnapshot(query(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts'), orderBy('createdAt', 'desc'), limit(50)), snap => setPublicPosts(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, []);
  useEffect(() => { if (view !== 'admin_feedback' || !isAdmin) return; return onSnapshot(query(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'feedback'), orderBy('createdAt', 'desc')), snap => setFeedbacks(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, [view, isAdmin]);

  const handleLogin = async (e) => { e.preventDefault(); setAuthError(''); setIsAuthLoading(true); const { username, password } = e.target.elements; const fakeEmail = `${username.value.trim().replace(/\s/g, '').toLowerCase()}@amen.app`; try { await signInWithEmailAndPassword(auth, fakeEmail, password.value); } catch (err) { if(err.code.includes('not-found') || err.code.includes('invalid-credential')) { try { const u = await createUserWithEmailAndPassword(auth, fakeEmail, password.value); await updateProfile(u.user, { displayName: username.value }); } catch(ce) { setAuthError("Ошибка: " + ce.code); } } else { setAuthError("Ошибка: " + err.code); } } setIsAuthLoading(false); };
  const handleUpdateName = async () => { if(!newName.trim() || newName === user.displayName) return; await updateProfile(user, { displayName: newName }); };
  
  const handleAmen = async (e) => { 
      e.preventDefault(); setIsAmenAnimating(true); triggerHaptic(); 
      const title = e.target.elements.title?.value || "Молитва"; const text = e.target.elements.text.value; const isPublic = focusPrayerPublic; 
      await addDoc(collection(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers'), { title, text, createdAt: serverTimestamp(), status: 'active', updates: [], prayerCount: 1 }); 
      if(isPublic) await addDoc(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts'), { text: title + (text ? `\n\n${text}` : ""), authorId: user.uid, authorName: user.displayName || "Пилигрим", authorIsAngel: isAngel, createdAt: serverTimestamp(), likes: [] }); 
      setTimeout(() => { setIsAmenAnimating(false); setShowInlineCreate(false); setSuccessMessage("Услышано"); setShowSuccessModal(true); e.target.reset(); setFocusPrayerPublic(false); setTimeout(() => setShowSuccessModal(false), 2000); }, 800); 
  };

  const handleInlineFocusSubmit = async () => {
      if (!inlineFocusText.trim()) return;
      setIsFocusSubmitting(true); triggerHaptic();
      const title = dailyVerse.title; const text = inlineFocusText;
      await addDoc(collection(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers'), { title, text, createdAt: serverTimestamp(), status: 'active', updates: [], prayerCount: 1 }); 
      if(isFocusPublic) await addDoc(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts'), { text: `[${title}]\n\n${text}`, authorId: user.uid, authorName: user.displayName || "Пилигрим", authorIsAngel: isAngel, createdAt: serverTimestamp(), likes: [] }); 
      setTimeout(() => { setIsFocusSubmitting(false); setInlineFocusText(''); setIsFocusExpanded(false); setSuccessMessage("Услышано"); setShowSuccessModal(true); setTimeout(() => setShowSuccessModal(false), 2000); }, 800); 
  };

  const incrementPrayerCount = async (id, currentCount) => { triggerHaptic(); await updateDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', id), { prayerCount: (currentCount || 1) + 1 }); };
  const toggleLike = async (id, likes) => { triggerHaptic(); const ref = doc(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts', id); await updateDoc(ref, { likes: likes?.includes(user.uid) ? arrayRemove(user.uid) : arrayUnion(user.uid) }); };
  const startEditing = (p) => { setEditingId(p.id); setEditForm({ title: p.title, text: p.text }); };
  const saveEdit = async () => { if(!editForm.title.trim()) return; await updateDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', editingId), { title: editForm.title, text: editForm.text }); setEditingId(null); };
  const openAnswerModal = (id) => { setAnsweringId(id); setShowAnswerModal(true); };
  const confirmAnswer = async () => { if(!answeringId) return; await updateDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', answeringId), { status: 'answered', answerNote: answerText, answeredAt: serverTimestamp() }); const prayer = myPrayers.find(p => p.id === answeringId); if(prayer) { const q = query(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts'), where('authorId', '==', user.uid)); const querySnapshot = await getDocs(q); querySnapshot.forEach(async (docSnap) => { if (docSnap.data().text.startsWith(prayer.title)) await updateDoc(docSnap.ref, { status: 'answered' }); }); } setShowAnswerModal(false); setAnsweringId(null); setSuccessMessage("Твой путь важен"); setShowSuccessModal(true); setTimeout(() => setShowSuccessModal(false), 2000); };
  const deletePost = async (id) => { if(window.confirm("Админ: Удалить пост?")) await deleteDoc(doc(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts', id)); };
  const deleteFeedback = async (id) => { if(window.confirm("Админ: Удалить отзыв?")) await deleteDoc(doc(db, 'artifacts', dbCollectionId, 'public', 'data', 'feedback', id)); };
  const sendFeedback = async () => { if(!feedbackText.trim()) return; await addDoc(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'feedback'), { text: feedbackText, userId: user.uid, userName: user.displayName, createdAt: serverTimestamp() }); setFeedbackText(''); setShowFeedbackModal(false); alert("Отправлено!"); };
  const becomeAngel = async () => {
      triggerHaptic();
      setIsAuthLoading(true); // Включаем лоадер на кнопке
      
      try {
          const res = await fetch('/api/payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.uid })
          });
          
          const data = await res.json();
          
          if (data.url) {
              window.location.href = data.url; // Перекидываем на оплату
          } else {
              throw new Error("Нет ссылки от сервера");
          }
      } catch (error) {
          console.error("Ошибка инициализации платежа:", error);
          setSuccessMessage("Ошибка связи с кассой");
          setShowSuccessModal(true);
          setTimeout(() => setShowSuccessModal(false), 2000);
      } finally {
          setIsAuthLoading(false);
      }
  };
  if (loading || !dailyVerse) return <div className={`h-screen bg-[#f4f5f0] flex flex-col items-center justify-center gap-4 text-stone-500/80 font-light ${fonts.ui}`}><span className="italic animate-pulse">Загрузка тишины...</span><div className="w-5 h-5 border-2 border-stone-200 border-t-stone-400 rounded-full animate-spin"></div></div>;
  if (!user) return <div className={`fixed inset-0 flex flex-col items-center justify-center p-8 bg-[#fffbf7] ${fonts.ui}`}><div className="w-full max-w-xs space-y-8 text-center"><h1 className="text-6xl font-semibold text-stone-800 tracking-tight opacity-90">Amen</h1><p className="text-stone-500 text-sm opacity-80">Пространство тишины</p><form onSubmit={handleLogin} className="space-y-4 pt-8"><input name="username" type="text" placeholder="Имя" className="w-full bg-transparent border-b border-stone-200 py-3 text-center text-lg outline-none focus:border-stone-400 transition text-stone-700 placeholder:text-stone-400" required /><input name="password" type="password" placeholder="Пароль" className="w-full bg-transparent border-b border-stone-200 py-3 text-center text-lg outline-none focus:border-stone-400 transition text-stone-700 placeholder:text-stone-400" required />{authError && <p className="text-red-400/80 text-xs">{authError}</p>}<button disabled={isAuthLoading} className="w-full py-4 bg-stone-800/90 text-stone-50 text-sm font-medium rounded-xl">{isAuthLoading ? "..." : "Войти"}</button></form><button onClick={() => signInAnonymously(auth)} className="text-stone-400 text-sm hover:text-stone-600 transition-colors">Войти тихо</button></div></div>;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=Spectral:wght@400;500&display=swap" rel="stylesheet" />
      <FilmGrain />
      
      <div className={`fixed inset-0 z-[-1] bg-cover bg-center transition-all duration-1000`} style={{ backgroundImage: theme.bgImage ? `url(${theme.bgImage})` : 'none', backgroundColor: theme.fallbackColor }} />
      <div className={`fixed inset-0 z-[-1] transition-all duration-1000 ${theme.overlay}`} />

      <div className={`relative z-10 h-[100dvh] w-full flex flex-col max-w-md mx-auto overflow-hidden`}>
        <TopMenu view={view} setView={setView} theme={theme} openThemeModal={() => setShowThemeModal(true)} openLegal={() => setShowLegalModal(true)} logout={() => signOut(auth)} isAdmin={isAdmin} isUiVisible={isUiVisible} />

        <main ref={mainScrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-6 pb-44 no-scrollbar scroll-smooth pt-28 min-h-screen"> 
          
          {!isOnline && (
              <div className="mb-4 text-center">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 text-xs font-medium ${theme.text} ${fonts.ui} opacity-70`}>
                      <Disc size={12} className="animate-pulse mr-2"/> Оффлайн режим
                  </span>
              </div>
          )}

          {/* MAIN CONTENT SWITCH */}
          <AnimatePresence mode="wait">
          {!showInlineCreate && (
              <motion.div key={view} variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
                
                {view === 'flow' && (
                  <motion.div variants={simpleContainer} initial="hidden" animate="show" className="space-y-8">
                    
                    <Card theme={theme} className="text-center py-10 relative overflow-hidden group">
                        <div className={`text-xs font-medium uppercase opacity-50 mb-6 tracking-widest ${fonts.ui}`}>Фокус дня</div>
                        <h2 className={`text-2xl font-normal leading-tight mb-6 px-2 ${fonts.content} opacity-90`}>{dailyVerse.title}</h2>
                        
                        <div className="mb-6 px-2 relative">
                            <span className={`text-4xl absolute -top-4 -left-2 opacity-10 ${fonts.content}`}>“</span>
                            <p className={`text-lg leading-[1.75] opacity-80 relative z-10 ${fonts.content}`}>{dailyVerse.text}</p>
                            <span className={`text-4xl absolute -bottom-8 -right-2 opacity-10 ${fonts.content}`}>”</span>
                        </div>
                        
                        <div className={`text-sm opacity-50 ${isFocusExpanded ? 'mb-8' : 'mb-0'} ${fonts.ui}`}>{dailyVerse.source}</div>

                        <AnimatePresence>
                            {!isFocusExpanded ? (
                                <motion.button 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                                    onClick={() => { triggerHaptic(); setIsFocusExpanded(true); }} 
                                    className={`mt-8 w-full py-4 text-xs font-bold uppercase tracking-widest rounded-2xl transition active:scale-95 ${theme.button} opacity-80 hover:opacity-100 ${fonts.ui}`}
                                >
                                    Погрузиться
                                </motion.button>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} 
                                    transition={{ duration: 0.4, ease: "easeOut" }} className="overflow-hidden"
                                >
                                    <div className={`${theme.containerBg} rounded-[2rem] p-6 mb-6 mx-2 text-left shadow-inner backdrop-blur-md`}>
                                        <p className={`text-[17px] leading-relaxed opacity-80 ${fonts.content}`}>{dailyVerse.thought}</p>
                                    </div>
                                    <div className="mx-2 flex flex-col gap-3">
                                        <textarea 
                                            value={inlineFocusText} 
                                            onChange={(e) => setInlineFocusText(e.target.value)} 
                                            placeholder={placeholderText} 
                                            className={`w-full p-5 rounded-2xl ${theme.containerBg} backdrop-blur-md text-[15px] leading-relaxed resize-none outline-none ${theme.text} ${theme.placeholderColor} transition focus:scale-[1.01] opacity-90 ${fonts.content}`} 
                                            rows="3" 
                                        />
                                        <AnimatePresence>
                                            {inlineFocusText.length > 0 && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3 mt-1">
                                                    <div onClick={() => setIsFocusPublic(!isFocusPublic)} className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 ${theme.containerBg} backdrop-blur-md`}>
                                                        <div className={`w-2 h-2 rounded-full ${isFocusPublic ? 'bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'bg-current opacity-30'}`} />
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.text} opacity-60`}>{isFocusPublic ? "Все" : "Личное"}</span>
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

                    <div className="flex items-center justify-center my-8 opacity-30">
                        <div className="h-px bg-current w-16"></div>
                        <span className={`mx-4 text-xs font-medium uppercase tracking-widest ${fonts.ui}`}>Единство</span>
                        <div className="h-px bg-current w-16"></div>
                    </div>

                    <div className="space-y-4">
                        {publicPosts.map(post => (
                             <Card key={post.id} theme={theme} className="!p-6 relative group">
                                 <div className={`flex justify-between items-center mb-4 opacity-50 text-xs font-normal ${fonts.ui}`}>
                                     <span className="flex items-center gap-1.5">
                                         {post.authorName} 
                                     </span>
                                     <div className="flex gap-2 mr-0">
                                        {post.status === 'answered' && <span className={`${theme.iconColor} font-medium flex items-center gap-1 opacity-80`}><CheckCircle2 size={12}/> Чудо</span>}
                                        <span>{post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Только что'}</span>
                                     </div>
                                 </div>
                                 <p className={`mb-6 text-[17px] leading-[1.75] whitespace-pre-wrap opacity-80 ${fonts.content}`}>{post.text}</p>
                                 <button onClick={() => toggleLike(post.id, post.likes)} className={`w-full py-3 text-sm font-medium transition rounded-xl flex items-center justify-center gap-2 ${post.likes?.includes(user.uid) ? theme.activeButton : theme.button + " opacity-70 hover:opacity-100"} ${fonts.ui}`}>
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
                    <motion.div variants={simpleContainer} initial="hidden" animate="show" className="space-y-6">
                        <div className={`flex items-center justify-between px-2 pb-4 ${fonts.ui}`}>
                            <h2 className={`text-3xl font-semibold tracking-tight opacity-80 drop-shadow-sm ${theme.text}`}>Amen</h2>
                            <button onClick={() => { triggerHaptic(); setShowInlineCreate(true); }} className={`p-3 rounded-full ${theme.button} opacity-80 backdrop-blur-xl transition hover:scale-105 active:scale-95 ${theme.text}`}>
                                <PenLine size={20} />
                            </button>
                        </div>

                        <div className={`flex p-1 rounded-full mb-6 relative ${theme.containerBg} ${fonts.ui}`}>
                            <div className={`absolute top-1 bottom-1 w-1/2 bg-white/80 shadow-sm rounded-full transition-all duration-300 ${diaryTab === 'active' ? 'left-1' : 'left-[49%]'}`} />
                            <button onClick={() => { triggerHaptic(); setDiaryTab('active'); }} className={`flex-1 py-2 text-xs font-medium relative z-10 transition-colors ${theme.text} ${diaryTab === 'active' ? 'opacity-90' : 'opacity-40'}`}>Молитвы</button>
                            <button onClick={() => { triggerHaptic(); setDiaryTab('answered'); }} className={`flex-1 py-2 text-xs font-medium relative z-10 transition-colors ${theme.text} ${diaryTab === 'answered' ? 'opacity-90' : 'opacity-40'}`}>Ответы</button>
                        </div>

                        <div className="space-y-4">
                            {myPrayers.filter(p => diaryTab === 'answered' ? p.status === 'answered' : p.status !== 'answered').length === 0 && (
                                <div className={`text-center opacity-40 py-10 text-lg ${fonts.content} ${theme.text}`}>
                                    {diaryTab === 'active' ? "Дневник чист..." : "Пока нет записанных ответов..."}
                                </div>
                            )}
                            {myPrayers.filter(p => diaryTab === 'answered' ? p.status === 'answered' : p.status !== 'answered').map(p => (
                                <Card key={p.id} theme={theme}>
                                    <div className={`flex justify-between items-start mb-3 ${fonts.ui}`}>
                                        <span className="text-xs font-normal opacity-50">{p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : 'Только что'}</span>
                                        {p.status === 'answered' ? (
                                            <span className={`${theme.iconColor} text-xs font-medium flex items-center gap-1 opacity-80`}><CheckCircle2 size={12}/> Ответ</span>
                                        ) : (
                                            <button onClick={() => startEditing(p)} className="opacity-40 hover:opacity-100"><Edit3 size={14} /></button>
                                        )}
                                    </div>

                                    {editingId === p.id ? (
                                        <div className={`mb-4 space-y-2 ${fonts.ui}`}>
                                            <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className={`w-full bg-transparent border-b border-current border-opacity-20 py-2 outline-none text-lg font-medium opacity-90`} />
                                            <textarea value={editForm.text} onChange={e => setEditForm({...editForm, text: e.target.value})} className={`w-full bg-transparent border-b border-current border-opacity-20 py-2 outline-none text-sm h-20 resize-none opacity-80 ${fonts.content}`} />
                                            <div className="flex justify-end gap-3 pt-2">
                                                <button onClick={() => setEditingId(null)} className="text-xs opacity-50">Отмена</button>
                                                <button onClick={saveEdit} className="text-xs font-medium opacity-80">Сохранить</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className={`text-xl font-medium mb-3 leading-snug opacity-90 ${fonts.ui}`}>{p.title}</h3>
                                            <p className={`text-[17px] leading-[1.75] opacity-80 whitespace-pre-wrap mb-6 ${fonts.content}`}>{p.text}</p>
                                        </>
                                    )}

                                    {p.status === 'answered' && p.answerNote && (
                                        <div className={`${theme.containerBg} p-5 rounded-2xl mb-4 border border-current border-opacity-5`}>
                                            <p className={`text-xs font-medium opacity-50 uppercase mb-2 ${fonts.ui}`}>Свидетельство</p>
                                            <p className={`text-[17px] leading-relaxed opacity-90 ${fonts.content}`}>{p.answerNote}</p>
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
                )}

                {view === 'admin_feedback' && isAdmin && (
                    <motion.div variants={simpleContainer} initial="hidden" animate="show" className="space-y-4 pt-28">
                         <h2 className={`text-xl text-center mb-8 opacity-80 ${fonts.ui} ${theme.text}`}>Входящие отзывы</h2>
                         {feedbacks.map(msg => (
                             <Card key={msg.id} theme={theme} className="relative">
                                 <div className={`flex justify-between mb-3 opacity-50 text-xs font-normal ${fonts.ui}`}>
                                     <span>{msg.userName}</span>
                                     <span>{msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleDateString() : 'Только что'}</span>
                                 </div>
                                 <p className={`mb-4 text-sm leading-relaxed opacity-80 ${fonts.content}`}>{msg.text}</p>
                                 <div className="flex justify-end">
                                     <button onClick={() => deleteFeedback(msg.id)} className="p-2 text-red-400 bg-red-500/10 rounded-full hover:bg-red-500/20"><Trash2 size={16} /></button>
                                 </div>
                             </Card>
                         ))}
                    </motion.div>
                )}

                {view === 'profile' && (
                    <motion.div variants={pageVariants} className="text-center pt-28">
                        <div className="pb-10">
                            <div className="flex justify-center items-end gap-2 mb-8">
                                <div className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-light shadow-2xl opacity-90 ${theme.activeButton} ${fonts.content}`}>
                                    {user.displayName?.[0] || "A"}
                                </div>
                                {isAngel && <Feather size={24} className={`${theme.iconColor} opacity-70 pb-2`} />}
                            </div>

                            <div className="relative mb-8 px-8 group">
                                <input value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={handleUpdateName} className={`w-full bg-transparent text-center text-3xl font-medium outline-none border-b border-transparent focus:border-current transition placeholder:opacity-30 opacity-90 ${theme.text} ${fonts.ui}`} placeholder="Ваше имя" />
                            </div>
                            
                            <FaithGarden userId={user?.uid} gardenData={userDocData?.garden} theme={theme} />

                            <button onClick={() => setShowPrayerInfoModal(true)} className={`w-full mb-6 py-5 rounded-[2rem] flex items-center justify-center gap-3 transition hover:scale-[1.02] active:scale-95 ${theme.containerBg} backdrop-blur-md shadow-sm border border-current border-opacity-5 opacity-90`}>
                                <BookOpen size={20} className={theme.iconColor} />
                                <span className={`text-[12px] font-bold uppercase tracking-widest ${fonts.ui} ${theme.text}`}>Погружение в тишину</span>
                            </button>

                            <div className={`${theme.containerBg} rounded-[2.5rem] p-8 mb-8 text-left shadow-sm backdrop-blur-md ${theme.text}`}>
                                <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-6 opacity-40 ${fonts.ui}`}>Путеводитель</h4>
                                <div className="space-y-6">
                                    <div>
                                        <h5 className={`text-sm font-semibold mb-1 opacity-90 ${fonts.ui}`}>Поток</h5>
                                        <p className={`text-[15px] leading-relaxed opacity-70 ${fonts.content}`}>Ежедневный фокус из Писания для настройки сердца и лента «Единство», где мы поддерживаем молитвы других словом Amen.</p>
                                    </div>
                                    <div className="w-12 h-px bg-current opacity-10"></div>
                                    <div>
                                        <h5 className={`text-sm font-semibold mb-1 opacity-90 ${fonts.ui}`}>Дневник</h5>
                                        <p className={`text-[15px] leading-relaxed opacity-70 ${fonts.content}`}>Твоя тайная комната. Записывай личные молитвы, отмечай ответы на них и возвращайся к свидетельствам Божьей верности.</p>
                                    </div>
                                    <div className="w-12 h-px bg-current opacity-10"></div>
                                    <div>
                                        <h5 className={`text-sm font-semibold mb-1 opacity-90 ${fonts.ui}`}>Атмосфера и Звук</h5>
                                        <p className={`text-[15px] leading-relaxed opacity-70 ${fonts.content}`}>Свободно меняй визуальную тему в меню и включай фоновую музыку в плеере, чтобы успокоить мысли.</p>
                                    </div>
                                    <div className="w-12 h-px bg-current opacity-10"></div>
                                    <div>
                                        <h5 className={`text-sm font-semibold mb-1 opacity-90 ${fonts.ui}`}>Сад веры</h5>
                                        <p className={`text-[15px] leading-relaxed opacity-70 ${fonts.content}`}>Твоя дисциплина растит семя. Заходи каждый день, чтобы древо крепло и приносило плоды. Без внимания оно увядает.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-12">
                                <button onClick={() => setShowFeedbackModal(true)} className={`flex flex-col items-center justify-center p-6 rounded-[2rem] ${theme.cardBg} opacity-90 transition hover:scale-[1.02] active:scale-95`}>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${fonts.ui} ${theme.text}`}>Написать</span>
                                </button>
                                <button onClick={() => setShowSupportModal(true)} className={`flex flex-col items-center justify-center p-6 rounded-[2rem] ${theme.cardBg} opacity-90 transition hover:scale-[1.02] active:scale-95 border border-current border-opacity-10`}>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.text} ${fonts.ui}`}>Поддержать</span>
                                </button>
                            </div>

                            <div className={`text-center opacity-30 mt-auto px-10 ${fonts.ui} ${theme.text}`}>
                                 <p className="text-[10px] leading-relaxed whitespace-pre-wrap">{DISCLAIMER_TEXT}</p>
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
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                    className={`fixed inset-0 z-50 flex flex-col pt-28 px-6 backdrop-blur-3xl bg-black/5 ${theme.text}`}
                    style={{ height: lockedHeight, touchAction: "none" }} 
                >
                     <div className="fixed top-12 left-6 z-[60]">
                        <button onClick={() => setShowInlineCreate(false)} className={`text-sm font-medium px-5 py-2.5 rounded-full backdrop-blur-xl ${theme.text} bg-white/10 hover:bg-white/20 transition shadow-sm opacity-90`}>
                            Закрыть
                        </button>
                    </div>

                    <form onSubmit={handleAmen} className="w-full max-w-sm mx-auto flex flex-col gap-4 overflow-y-auto pb-40 no-scrollbar"> 
                        <motion.div variants={itemAnim} initial="hidden" animate="show" transition={{delay: 0.1}} className={`rounded-2xl p-4 ${theme.containerBg} backdrop-blur-md transition-all focus-within:scale-[1.01]`}>
                            <input name="title" placeholder="Тема..." className={`w-full bg-transparent text-lg font-medium outline-none ${theme.text} ${theme.placeholderColor} text-center opacity-90`} autoFocus />
                        </motion.div>
                        <motion.div variants={itemAnim} initial="hidden" animate="show" transition={{delay: 0.2}} className={`rounded-2xl p-4 flex-1 h-48 ${theme.containerBg} backdrop-blur-md transition-all focus-within:scale-[1.01]`}>
                            <textarea name="text" placeholder={placeholderText} className={`w-full h-full bg-transparent text-base leading-relaxed resize-none outline-none ${theme.text} ${theme.placeholderColor} opacity-90 ${fonts.content}`} />
                        </motion.div>
                        <motion.div variants={itemAnim} initial="hidden" animate="show" transition={{delay: 0.3}} className="flex gap-4 mt-2">
                            <div onClick={() => setFocusPrayerPublic(!focusPrayerPublic)} className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 ${theme.containerBg} backdrop-blur-md`}>
                                <div className={`w-2 h-2 rounded-full ${focusPrayerPublic ? 'bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'bg-current opacity-30'}`} />
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.text} opacity-60`}>{focusPrayerPublic ? "Все" : "Личное"}</span>
                            </div>
                            <button className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest rounded-2xl transition transform active:scale-95 ${theme.activeButton} shadow-lg ${fonts.ui}`}>Amen</button>
                        </motion.div>
                    </form>
                </motion.div>
            )}
          </AnimatePresence>

        </main>

        <AudioPlayer currentTrack={currentTrack} isPlaying={isPlaying} togglePlay={() => setIsPlaying(!isPlaying)} changeTrack={setCurrentTrack} theme={theme} isUiVisible={isUiVisible} />

        {/* --- MODALS --- */}
        <AnimatePresence>
            {showPrayerInfoModal && (
                <>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{ duration: 0.15 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setShowPrayerInfoModal(false)}/>
                <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" className={`fixed top-12 bottom-12 left-6 right-6 z-50 rounded-[2.5rem] p-8 shadow-2xl ${theme.cardBg} ${theme.text} flex flex-col`}>
                    <div className="flex justify-between items-center mb-6 shrink-0">
                        <h3 className={`text-2xl font-medium opacity-90 ${fonts.ui}`}>О молитве</h3>
                        <button onClick={() => setShowPrayerInfoModal(false)} className="opacity-40 hover:opacity-80 p-2 -mr-2"><X size={24}/></button>
                    </div>
                    <div className={`flex-1 overflow-y-auto no-scrollbar pr-2 space-y-8 ${fonts.content} text-[17px] leading-[1.75] opacity-80`}>
                        <p>Молитва — это не ритуал и не официальный отчет перед Богом. Это дыхание души. В мире, где всё кричит и требует нашего внимания, молитва становится якорем, возвращающим нас к реальности.</p>
                        <div className={`p-6 rounded-[2rem] ${theme.containerBg} shadow-inner`}>
                            <p className={`text-xs font-bold uppercase tracking-widest opacity-50 mb-3 ${fonts.ui}`}>Тайная комната</p>
                            <p className="italic">«Ты же, когда молишься, войди в комнату твою и, затворив дверь твою, помолись Отцу твоему, Который втайне...» <br/><span className="text-sm opacity-60 not-italic mt-3 block">— Матфея 6:6</span></p>
                        </div>
                        <p>Зачем закрывать дверь? Тайная комната — это не обязательно чулан в вашем доме. Это состояние вашего сердца, где отключены уведомления, тревоги и чужие ожидания. Это место тотальной уязвимости. Здесь не нужно притворяться сильным.</p>
                        <div className="space-y-4">
                            <h4 className={`text-lg font-medium opacity-90 ${fonts.ui}`}>Сила дисциплины</h4>
                            <p>Мы привыкли чистить зубы и заряжать телефон каждый день, но часто забываем заряжать свой дух. Дисциплина в молитве — это не ограничение вашей свободы. Это построение прочного русла, по которому сможет течь река ваших отношений с Творцом.</p>
                        </div>
                        <div className={`p-6 rounded-[2rem] ${theme.containerBg} shadow-inner`}>
                            <h4 className={`text-lg font-medium mb-3 opacity-90 ${fonts.ui}`}>Что значит Amen?</h4>
                            <p>Слово «Аминь» (Amen) с древнееврейского означает «Истинно», «Да будет так», «Верно». Это не просто сигнал окончания связи. Это печать вашего доверия.</p>
                        </div>
                    </div>
                </motion.div>
                </>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showSupportModal && (
                <>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{ duration: 0.15 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setShowSupportModal(false)}/>
                <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" className={`fixed top-1/4 left-6 right-6 z-50 rounded-[2.5rem] p-8 shadow-2xl ${theme.cardBg} ${theme.text}`}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <Feather className={theme.iconColor} size={24} />
                            <h3 className={`text-2xl font-medium opacity-90 ${fonts.ui}`}>Ангел проекта</h3>
                        </div>
                        <button onClick={() => setShowSupportModal(false)} className="opacity-40 hover:opacity-80"><X size={24}/></button>
                    </div>
                    <p className={`text-[15px] leading-relaxed opacity-80 mb-6 ${fonts.content}`}>Amen — это пространство без рекламы. Станьте Ангелом проекта, чтобы помочь нам оплачивать серверы базы данных и продолжать развивать приложение.</p>
                    <div className={`p-5 rounded-3xl mb-8 ${theme.containerBg} shadow-inner`}>
                        <div className={`flex justify-between text-[10px] font-bold opacity-60 uppercase tracking-widest mb-3 ${fonts.ui}`}><span>Оплата серверов</span><span>45%</span></div>
                        <div className="w-full h-1.5 bg-current opacity-10 rounded-full overflow-hidden"><div className="h-full w-[45%] bg-current opacity-80 rounded-full" /></div>
                    </div>
                    <ul className={`space-y-4 mb-8 opacity-80 text-[15px] ${fonts.ui}`}>
                        <li className="flex items-center gap-3"><Feather size={18} className={theme.iconColor} /> <span>Особый знак в ленте молитв</span></li>
                        <li className="flex items-center gap-3"><Sparkles size={18} className={theme.iconColor} /> <span>Закрытый чат основателей</span></li>
                    </ul>
                    {isAngel ? (
                        <div className={`w-full py-4 rounded-2xl text-center text-[10px] font-bold uppercase tracking-widest border border-current opacity-30`}>Вы уже Ангел</div>
                    ) : (
                        <button onClick={becomeAngel} className={`w-full py-5 rounded-full text-[10px] font-bold uppercase tracking-widest ${theme.activeButton} shadow-lg active:scale-95 transition ${fonts.ui}`}>Стать Ангелом</button>
                    )}
                </motion.div>
                </>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showAnswerModal && (
                <>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{ duration: 0.15 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setShowAnswerModal(false)}/>
                <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" className={`fixed top-1/4 left-6 right-6 z-50 rounded-[2rem] p-8 shadow-2xl ${theme.cardBg} ${theme.text} border border-current border-opacity-10`}>
                    <div className="text-center mb-6">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${theme.containerBg} ${theme.iconColor} opacity-80`}><CheckCircle2 size={24} /></div>
                        <h3 className={`text-xl font-medium opacity-90 ${fonts.ui}`}>Чудо произошло?</h3>
                    </div>
                    <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Напиши краткое свидетельство..." className={`w-full p-4 rounded-xl outline-none h-32 text-sm resize-none mb-6 ${theme.containerBg} ${theme.text} ${theme.placeholderColor} opacity-90 ${fonts.content}`} />
                    <button onClick={confirmAnswer} className={`w-full py-4 rounded-full text-[10px] font-bold uppercase tracking-widest ${theme.activeButton} shadow-lg active:scale-95 transition ${fonts.ui}`}>Подтвердить</button>
                </motion.div>
                </>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showFeedbackModal && (
                <>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{ duration: 0.15 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setShowFeedbackModal(false)}/>
                <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" className={`fixed top-1/4 left-6 right-6 z-50 rounded-[2rem] p-8 shadow-2xl ${theme.cardBg} ${theme.text}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className={`text-xl font-medium opacity-90 ${fonts.ui}`}>Разработчику</h3>
                        <button onClick={() => setShowFeedbackModal(false)} className="opacity-40 hover:opacity-80"><X size={24}/></button>
                    </div>
                    <p className={`text-sm opacity-60 mb-4 leading-relaxed ${fonts.ui}`}>Нашли ошибку? Есть идея? Или просто хотите сказать спасибо? Я читаю всё.</p>
                    <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Ваше сообщение..." className={`w-full p-4 rounded-xl outline-none h-32 text-[17px] leading-relaxed resize-none mb-6 ${theme.containerBg} ${theme.text} ${theme.placeholderColor} opacity-90 ${fonts.content}`} />
                    <button onClick={sendFeedback} className={`w-full py-4 rounded-full text-[10px] font-bold uppercase tracking-widest ${theme.activeButton} shadow-lg active:scale-95 transition ${fonts.ui}`}>Отправить</button>
                </motion.div>
                </>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showThemeModal && (
                <>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{ duration: 0.15 }} className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-md" onClick={() => setShowThemeModal(false)}/>
                <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" className={`fixed top-1/2 left-6 right-6 -translate-y-1/2 z-[70] rounded-3xl p-8 shadow-2xl ${theme.cardBg} ${theme.text} max-h-[70vh] overflow-y-auto`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className={`text-xl font-medium opacity-90 ${fonts.ui}`}>Атмосфера</h3>
                        <button onClick={() => setShowThemeModal(false)} className="opacity-40 hover:opacity-80"><X size={24}/></button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.values(THEMES).map(t => (
                            <button key={t.id} onClick={() => { setCurrentThemeId(t.id); }} className={`h-24 rounded-2xl relative overflow-hidden transition-all duration-300 ${currentThemeId === t.id ? 'ring-2 ring-offset-2 ring-current scale-105' : 'opacity-80 hover:opacity-100'}`}>
                            <img src={t.bgImage} className="absolute inset-0 w-full h-full object-cover" alt={t.label} />
                            <span className={`absolute inset-0 flex items-center justify-center bg-black/30 text-white/90 text-[10px] font-bold uppercase tracking-widest shadow-sm ${fonts.ui}`}>{t.label}</span>
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
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{ duration: 0.15 }} className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-md" onClick={() => setShowLegalModal(false)}/>
                <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit" className={`fixed top-1/2 left-6 right-6 -translate-y-1/2 z-[70] rounded-3xl p-8 shadow-2xl ${theme.cardBg} ${theme.text} max-h-[70vh] overflow-y-auto`}>
                    <button onClick={() => setShowLegalModal(false)} className="absolute top-6 right-6 opacity-40 hover:opacity-80"><X size={24}/></button>
                    <div>
                        <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-6 opacity-50 ${fonts.ui}`}>Соглашение</h3>
                        <p className={`text-[15px] leading-relaxed opacity-80 whitespace-pre-line ${fonts.content}`}>{TERMS_TEXT}</p>
                    </div>
                </motion.div>
                </>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showSuccessModal && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{ duration: 0.15 }} className="fixed inset-0 z-[60] flex items-center justify-center p-8 pointer-events-none">
                    <div className={`bg-white/90 backdrop-blur-xl shadow-2xl rounded-[2.5rem] p-8 flex flex-col items-center gap-4`}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${theme.activeButton}`}><Check size={32} /></div>
                        <h3 className={`text-xl font-medium text-stone-800 opacity-90 ${fonts.ui}`}>{successMessage}</h3>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </>
  );
};

export default App;
