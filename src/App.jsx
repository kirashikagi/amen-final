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
  getDoc,
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove 
} from "firebase/firestore";
import { List, X, Check, Disc, Plus, Image as ImageIcon, CheckCircle2, FileText, ChevronRight, Heart } from 'lucide-react'; 

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
const ADMIN_NAMES = ['Admin', 'Founder', 'admin', 'founder'];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
];

// --- ТЕМЫ ---
const THEMES = {
  dawn: { 
    id: 'dawn', label: 'Рассвет', bgImage: '/dawn.jpg', 
    fallbackColor: '#fff7ed', 
    cardBg: 'bg-[#fffbf7]/80 backdrop-blur-3xl shadow-sm border border-white/40', 
    text: 'text-stone-900', subText: 'text-stone-600', 
    containerBg: 'bg-white/50',
    button: 'border border-stone-800/10 hover:bg-white/40', 
    activeButton: 'bg-stone-800 text-white shadow-md',
    menuBg: 'bg-[#fffbf7]/95 backdrop-blur-3xl text-stone-900 border-l border-white/10'
  },
  morning: { 
    id: 'morning', label: 'Утро', bgImage: '/morning.jpg', 
    fallbackColor: '#f0f9ff', 
    cardBg: 'bg-white/80 backdrop-blur-3xl shadow-sm border border-white/30', 
    text: 'text-slate-900', subText: 'text-slate-600', 
    containerBg: 'bg-white/50',
    button: 'border border-slate-800/10 hover:bg-white/40', 
    activeButton: 'bg-sky-900 text-white shadow-md',
    menuBg: 'bg-white/95 backdrop-blur-3xl text-slate-900 border-l border-white/10'
  },
  day: { 
    id: 'day', label: 'День', bgImage: '/day.jpg', 
    fallbackColor: '#fdfce7', 
    cardBg: 'bg-[#fffff0]/85 backdrop-blur-3xl shadow-sm border border-white/30', 
    text: 'text-stone-950', subText: 'text-stone-700', 
    containerBg: 'bg-white/50',
    button: 'border border-stone-900/10 hover:bg-white/40', 
    activeButton: 'bg-amber-900 text-white shadow-md',
    menuBg: 'bg-[#fffff0]/95 backdrop-blur-3xl text-stone-950 border-l border-white/10'
  },
  sunset: { 
    id: 'sunset', label: 'Закат', bgImage: '/sunset.jpg', 
    fallbackColor: '#fff1f2', 
    cardBg: 'bg-[#fff1f2]/80 backdrop-blur-3xl shadow-sm border border-white/30', 
    text: 'text-rose-950', subText: 'text-rose-800', 
    containerBg: 'bg-white/50',
    button: 'border border-rose-900/10 hover:bg-white/40', 
    activeButton: 'bg-rose-900 text-white shadow-md',
    menuBg: 'bg-[#fff1f2]/95 backdrop-blur-3xl text-rose-950 border-l border-white/10'
  },
  evening: { 
    id: 'evening', label: 'Вечер', bgImage: '/evening.jpg', 
    fallbackColor: '#f5f3ff', 
    cardBg: 'bg-[#2e1065]/60 backdrop-blur-3xl shadow-sm border border-white/10', 
    text: 'text-white', subText: 'text-purple-200', 
    containerBg: 'bg-white/10',
    button: 'border border-white/20 hover:bg-white/10', 
    activeButton: 'bg-white text-purple-950 shadow-md',
    menuBg: 'bg-[#2e1065]/90 backdrop-blur-3xl text-white border-l border-white/10'
  },
  midnight: { 
    id: 'midnight', label: 'Полночь', bgImage: '/midnight.jpg', 
    fallbackColor: '#020617', 
    cardBg: 'bg-black/60 backdrop-blur-3xl shadow-sm border border-white/10', 
    text: 'text-slate-100', subText: 'text-slate-400', 
    containerBg: 'bg-white/10',
    button: 'border border-white/10 hover:bg-white/5', 
    activeButton: 'bg-white text-black shadow-md',
    menuBg: 'bg-black/90 backdrop-blur-3xl text-slate-100 border-l border-white/10'
  }
};

const FALLBACK_READINGS = {
  "03-01": { title: "Начало пути", source: "Матфея 7:7", text: "Просите, и дано будет вам; ищите, и найдете; стучите, и отворят вам.", thought: "Бог отвечает тем, кто делает шаг. Дверь открывается не перед тем, кто ждет, а перед тем, кто стучит.", action: "Сделать шаг веры" }
};
const DAILY_WORD_DEFAULT = { title: "Тишина", source: "Псалом 46:11", text: "Остановитесь и познайте, что Я — Бог.", thought: "В суете трудно услышать шепот.", action: "Побыть в тишине" };

// --- TEXTS ---
const TERMS_TEXT = `1. Amen — это пространство тишины и молитвы.\n2. Мы не собираем ваши личные данные для рекламы.\n3. Ваши записи в "Дневнике" видны только вам.\n4. Записи в "Единстве" (с галочкой "Видят все") публичны.\n5. Будьте уважительны.`;
const DISCLAIMER_TEXT = `Amen не заменяет профессиональную помощь.\nКонтент носит духовный характер.`;

// --- COMPONENTS ---

const Card = ({ children, theme, className = "", onClick }) => (
  <motion.div 
    layout
    onClick={onClick} 
    className={`rounded-[2rem] p-6 mb-4 transition-colors duration-500 ${theme.cardBg} ${theme.text} ${className}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    {children}
  </motion.div>
);

const AudioPlayer = ({ currentTrack, isPlaying, togglePlay, changeTrack, theme }) => {
  const audioRef = useRef(null);
  const [showPlaylist, setShowPlaylist] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(e => console.log("Audio err", e));
      else audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  return (
    <>
      <AnimatePresence>
        {showPlaylist && (
            <>
                <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm" onClick={() => setShowPlaylist(false)} />
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className={`fixed bottom-20 left-4 right-4 z-50 rounded-2xl p-4 shadow-2xl ${theme.menuBg} max-h-72 overflow-y-auto`}
                >
                    <h4 className="text-xs font-medium uppercase tracking-widest opacity-50 mb-4 px-2">Фонотека</h4>
                    {AUDIO_TRACKS.map(track => (
                        <button 
                            key={track.id} 
                            onClick={() => { changeTrack(track); setShowPlaylist(false); }}
                            className={`w-full text-left py-3 px-2 rounded-lg text-sm font-light ${currentTrack.id === track.id ? 'bg-black/5 dark:bg-white/10 font-medium' : ''}`}
                        >
                            {track.title}
                        </button>
                    ))}
                </motion.div>
            </>
        )}
      </AnimatePresence>

      {/* ULTRA THIN PLAYER (H-10 = 40px) */}
      <div className={`fixed bottom-6 left-6 right-6 z-40 h-10 px-4 rounded-full backdrop-blur-xl border border-white/20 shadow-sm flex items-center justify-between ${theme.menuBg}`}>
        <audio ref={audioRef} src={currentTrack.url} onEnded={() => {}} loop />
        
        <div className="flex items-center gap-3 overflow-hidden" onClick={() => setShowPlaylist(true)}>
           <div className={`p-1 rounded-full bg-black/5 dark:bg-white/10`}>
             <Disc size={12} className={isPlaying ? "animate-spin-slow" : ""} />
           </div>
           <span className="text-[9px] font-bold uppercase tracking-widest truncate max-w-[120px] pt-0.5">
              {currentTrack.title}
           </span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={togglePlay} className="text-[9px] font-bold uppercase tracking-widest hover:opacity-60 transition pt-0.5">
             {isPlaying ? "PAUSE" : "PLAY"}
          </button>
          <button onClick={() => setShowPlaylist(!showPlaylist)} className="opacity-50 hover:opacity-100">
             <List size={14} />
          </button>
        </div>
      </div>
    </>
  );
};

// Меню теперь содержит Темы и Соглашение
const TopMenu = ({ view, setView, theme, currentTheme, setCurrentTheme, openLegal, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuItems = [
    { id: 'flow', label: 'ПОТОК' }, 
    { id: 'diary', label: 'ДНЕВНИК' },
    { id: 'profile', label: 'ПРОФИЛЬ' },
  ];

  return (
    <>
      <div className="fixed top-12 right-6 z-[60]">
        <button onClick={() => setIsOpen(!isOpen)} className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-stone-800/10 backdrop-blur-md ${theme.text} hover:bg-black/5 transition`}>
          {isOpen ? "ЗАКРЫТЬ" : "МЕНЮ"}
        </button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm`} onClick={() => setIsOpen(false)}/>
            <motion.div 
                initial={{ x: "100%" }} 
                animate={{ x: 0 }} 
                exit={{ x: "100%" }} 
                transition={{ type: "tween", duration: 0.3 }} 
                className={`fixed top-0 right-0 bottom-0 z-50 w-80 p-8 shadow-2xl flex flex-col ${theme.menuBg} overflow-y-auto`}
            >
              <div className="mt-20 space-y-6">
                {menuItems.map(item => (
                  <button key={item.id} onClick={() => { setView(item.id); setIsOpen(false); }} className={`text-left text-2xl font-light tracking-wide transition-opacity ${view === item.id ? 'opacity-100 font-normal' : 'opacity-40 hover:opacity-80'}`}>
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="my-10 border-t border-current border-opacity-10 pt-6">
                   <div className="flex items-center gap-2 mb-4 opacity-50">
                        <ImageIcon size={12} />
                        <span className="text-[9px] uppercase tracking-widest font-bold">Атмосфера</span>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                        {Object.values(THEMES).map(t => (
                            <button 
                            key={t.id} 
                            onClick={() => setCurrentTheme(t.id)} 
                            className={`h-10 rounded-lg relative overflow-hidden transition-all duration-300 ${currentTheme === t.id ? 'ring-2 ring-offset-1 ring-current' : 'opacity-60 hover:opacity-100'}`}
                            >
                            <img src={t.bgImage} className="absolute inset-0 w-full h-full object-cover" alt={t.label} />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white text-[8px] uppercase font-bold tracking-widest shadow-sm">
                                {t.label}
                            </span>
                            </button>
                        ))}
                    </div>
              </div>
              
              <div className="mt-auto space-y-4">
                  <button onClick={() => { openLegal(); setIsOpen(false); }} className="flex items-center gap-2 text-xs opacity-60 hover:opacity-100">
                     <FileText size={14}/> Соглашение
                  </button>
                  <button onClick={logout} className="text-xs text-red-400 font-medium uppercase tracking-widest">Выйти</button>
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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isAmenAnimating, setIsAmenAnimating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);

  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [focusPrayerPublic, setFocusPrayerPublic] = useState(false);
  
  const [diaryTab, setDiaryTab] = useState('active'); 
  const [newName, setNewName] = useState('');

  useEffect(() => {
    localStorage.setItem('amen-theme-id', currentThemeId);
  }, [currentThemeId]);

  useEffect(() => {
    const fetchDailyWord = async () => {
      const today = new Date();
      const key = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      try {
        const snap = await getDoc(doc(db, 'artifacts', dbCollectionId, 'public', 'daily_readings', key));
        setDailyVerse(snap.exists() ? snap.data() : (FALLBACK_READINGS[key] || DAILY_WORD_DEFAULT));
      } catch (e) {
        setDailyVerse(FALLBACK_READINGS[key] || DAILY_WORD_DEFAULT);
      }
    };
    fetchDailyWord();
  }, []);

  useEffect(() => onAuthStateChanged(auth, (u) => { 
      setUser(u); 
      setLoading(false);
      if(u) setNewName(u.displayName || "");
  }), []);

  useEffect(() => { if (!user) return; return onSnapshot(query(collection(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers'), orderBy('createdAt', 'desc')), snap => setMyPrayers(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, [user]);
  useEffect(() => { return onSnapshot(query(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts'), orderBy('createdAt', 'desc'), limit(50)), snap => setPublicPosts(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); setAuthError(''); setIsAuthLoading(true);
    const { username, password } = e.target.elements;
    const fakeEmail = `${username.value.trim().replace(/\s/g, '').toLowerCase()}@amen.app`;
    try {
      await signInWithEmailAndPassword(auth, fakeEmail, password.value);
    } catch (err) {
       if(err.code.includes('not-found') || err.code.includes('invalid-credential')) {
           try {
             const u = await createUserWithEmailAndPassword(auth, fakeEmail, password.value);
             await updateProfile(u.user, { displayName: username.value });
           } catch(ce) { setAuthError("Ошибка: " + ce.code); }
       } else { setAuthError("Ошибка: " + err.code); }
    }
    setIsAuthLoading(false);
  };

  const handleUpdateName = async () => {
      if(!newName.trim() || newName === user.displayName) return;
      await updateProfile(user, { displayName: newName });
  };

  const handleAmen = async (e, source = "manual") => {
    e.preventDefault();
    setIsAmenAnimating(true);

    const title = e.target.elements.title?.value || "Молитва";
    const text = e.target.elements.text.value;
    const isPublic = source === "focus" ? focusPrayerPublic : e.target.elements.pub?.checked;
    
    const data = { title, text, createdAt: serverTimestamp(), status: 'active', updates: [] };
    
    await addDoc(collection(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers'), data);
    
    if(isPublic) {
      await addDoc(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts'), {
        text: title + (text ? `\n\n${text}` : ""), authorId: user.uid, authorName: user.displayName || "Пилигрим", createdAt: serverTimestamp(), likes: []
      });
    }

    setTimeout(() => {
        setIsAmenAnimating(false);
        setShowCreateModal(false);
        setShowSuccessModal(true);
        e.target.reset();
        setTimeout(() => setShowSuccessModal(false), 2000);
    }, 1500);
  };

  const toggleLike = async (id, likes) => {
    const ref = doc(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts', id);
    await updateDoc(ref, { likes: likes?.includes(user.uid) ? arrayRemove(user.uid) : arrayUnion(user.uid) });
  };

  const markAsAnswered = async (prayerId) => {
      await updateDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', prayerId), {
          status: 'answered',
          answeredAt: serverTimestamp()
      });
  };

  if (loading || !dailyVerse) return <div className="h-screen bg-[#f4f5f0] flex items-center justify-center text-stone-400 font-light italic">Amen...</div>;

  if (!user) return (
      <div className="fixed inset-0 flex flex-col items-center justify-center p-8 bg-[#fffbf7]">
        <div className="w-full max-w-xs space-y-8 text-center">
             <h1 className="text-6xl font-sans font-light text-stone-900 tracking-tighter">Amen</h1>
             <p className="text-stone-400 text-[10px] uppercase tracking-[0.4em]">Пространство тишины</p>
             <form onSubmit={handleLogin} className="space-y-4 pt-8">
               <input name="username" type="text" placeholder="Имя" className="w-full bg-transparent border-b border-stone-200 py-3 text-center font-light outline-none focus:border-stone-800 transition" required />
               <input name="password" type="password" placeholder="Пароль" className="w-full bg-transparent border-b border-stone-200 py-3 text-center font-light outline-none focus:border-stone-800 transition" required />
               {authError && <p className="text-red-500 text-xs">{authError}</p>}
               <button disabled={isAuthLoading} className="w-full py-4 bg-stone-900 text-white text-xs font-medium uppercase tracking-widest">{isAuthLoading ? "..." : "Войти"}</button>
             </form>
             <button onClick={() => signInAnonymously(auth)} className="text-stone-400 text-[10px] uppercase tracking-widest">Войти тихо</button>
        </div>
      </div>
  );

  return (
    <>
      <div className={`fixed inset-0 z-[-1] bg-cover bg-center transition-all duration-1000`} style={{ backgroundImage: theme.bgImage ? `url(${theme.bgImage})` : 'none', backgroundColor: theme.fallbackColor }} />
      <div className={`fixed inset-0 z-[-1] transition-all duration-1000 ${theme.overlay}`} />

      <div className={`relative z-10 h-[100dvh] w-full flex flex-col max-w-md mx-auto font-sans ${theme.text} overflow-hidden`}>
        <TopMenu 
            view={view} 
            setView={setView} 
            theme={theme} 
            currentTheme={currentThemeId}
            setCurrentTheme={setCurrentThemeId}
            openLegal={() => setShowLegalModal(true)}
            logout={() => signOut(auth)} 
        />

        {/* ЗАГОЛОВОК ТЕПЕРЬ ОТРИСОВЫВАЕТСЯ ВНУТРИ ВЬЮХ, ЧТОБЫ "СКОЛЬЗИТЬ" В ПРОФИЛЕ */}
        {view !== 'profile' && (
             <div className="pt-28 pb-4 px-8 text-center">
                <h1 className="text-4xl font-light tracking-tight opacity-90 drop-shadow-sm">Amen</h1>
             </div>
        )}

        <main className="flex-1 overflow-y-auto px-6 pb-44 no-scrollbar">
          <AnimatePresence mode="wait">
            
            {view === 'flow' && (
              <motion.div key="flow" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-8">
                
                <Card theme={theme} className="text-center py-10 relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-full h-1 bg-current opacity-10" />
                   <div className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-50 mb-8">Фокус дня</div>
                   <h2 className="text-3xl font-normal leading-tight mb-6 px-2 font-serif">{dailyVerse.title}</h2>
                   <div className="mb-8 px-2 relative">
                       <span className="text-4xl absolute -top-4 -left-2 opacity-10 font-serif">“</span>
                       <p className="text-lg font-serif italic leading-relaxed opacity-90 relative z-10">{dailyVerse.text}</p>
                       <span className="text-4xl absolute -bottom-8 -right-2 opacity-10 font-serif">”</span>
                   </div>
                   <div className="text-xs font-medium uppercase tracking-widest opacity-40 mb-8">{dailyVerse.source}</div>
                   <div className={`${theme.containerBg} rounded-2xl p-6 mb-8 mx-2 text-left shadow-sm backdrop-blur-md`}>
                       <div className="flex gap-3">
                           <div className="w-0.5 bg-current opacity-20 rounded-full"></div>
                           <p className="text-sm font-light leading-relaxed opacity-90">{dailyVerse.thought}</p>
                       </div>
                   </div>
                   <button onClick={() => setShowCreateModal(true)} className={`w-full py-4 text-xs font-bold uppercase tracking-[0.2em] transition rounded-xl ${theme.button}`}>
                       {dailyVerse.action}
                   </button>
                </Card>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 opacity-30 justify-center mb-2">
                        <div className="w-1 h-1 bg-current rounded-full"></div>
                        <span className="text-[10px] uppercase tracking-widest">Единство</span>
                        <div className="w-1 h-1 bg-current rounded-full"></div>
                    </div>
                    {publicPosts.map(post => {
                         const liked = post.likes?.includes(user.uid);
                         return (
                             <Card key={post.id} theme={theme} className="!p-6">
                                 <div className="flex justify-between mb-4 opacity-40 text-[10px] uppercase tracking-widest font-medium">
                                     <span>{post.authorName}</span>
                                     <span>{post.createdAt?.toDate().toLocaleDateString()}</span>
                                 </div>
                                 <p className="mb-6 text-base font-light leading-relaxed whitespace-pre-wrap opacity-95">{post.text}</p>
                                 {/* КНОПКА AMEN ДЛЯ МОЛИТВЫ */}
                                 <button onClick={() => toggleLike(post.id, post.likes)} className={`w-full py-3 text-[10px] font-bold uppercase tracking-widest transition rounded-xl flex items-center justify-center gap-2 ${liked ? theme.activeButton : theme.button}`}>
                                     {liked ? "AMEN" : "AMEN"}
                                 </button>
                             </Card>
                         );
                     })}
                </div>
              </motion.div>
            )}

            {view === 'diary' && (
                <motion.div key="diary" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
                    <div className={`flex p-1 rounded-full mb-6 relative ${theme.containerBg}`}>
                        <div className={`absolute top-1 bottom-1 w-1/2 bg-white shadow-sm rounded-full transition-all duration-300 ${diaryTab === 'active' ? 'left-1' : 'left-[49%]'}`} />
                        <button onClick={() => setDiaryTab('active')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest relative z-10 transition-colors ${diaryTab === 'active' ? 'opacity-100' : 'opacity-40'}`}>Текущие</button>
                        <button onClick={() => setDiaryTab('answered')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest relative z-10 transition-colors ${diaryTab === 'answered' ? 'opacity-100' : 'opacity-40'}`}>Ответы</button>
                    </div>

                    {diaryTab === 'active' && (
                        <button onClick={() => setShowCreateModal(true)} className={`w-full py-6 rounded-[2rem] border-2 border-dashed border-current border-opacity-10 flex items-center justify-center gap-3 opacity-60 hover:opacity-100 hover:border-opacity-30 transition group ${theme.cardBg}`}>
                            <div className={`p-2 rounded-full ${theme.containerBg}`}><Plus size={20} /></div>
                            <span className="text-xs font-medium uppercase tracking-widest">Создать запись</span>
                        </button>
                    )}

                    <div className="space-y-4">
                        {myPrayers.filter(p => diaryTab === 'answered' ? p.status === 'answered' : p.status !== 'answered').length === 0 && (
                            <div className="text-center opacity-30 py-10 font-light italic">
                                {diaryTab === 'active' ? "Дневник чист..." : "Пока нет записанных ответов..."}
                            </div>
                        )}
                        {myPrayers.filter(p => diaryTab === 'answered' ? p.status === 'answered' : p.status !== 'answered').map(p => (
                            <Card key={p.id} theme={theme}>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] font-medium uppercase tracking-wider opacity-40">{p.createdAt?.toDate().toLocaleDateString()}</span>
                                    {p.status === 'answered' && <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={12}/> Ответ</span>}
                                </div>
                                <h3 className="text-lg font-medium mb-2 leading-tight">{p.title}</h3>
                                <p className="text-sm font-light opacity-90 whitespace-pre-wrap leading-relaxed mb-6">{p.text}</p>
                                <div className="pt-4 border-t border-current border-opacity-10 flex justify-between items-center">
                                    <button onClick={() => deleteDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', p.id))} className="text-[10px] text-red-400 opacity-50 hover:opacity-100 uppercase tracking-widest transition">Удалить</button>
                                    {p.status !== 'answered' && (
                                        <button onClick={() => markAsAnswered(p.id)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition">
                                            <CheckCircle2 size={14}/> Это отвечено
                                        </button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </motion.div>
            )}

            {view === 'profile' && (
                <motion.div key="profile" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center pt-28">
                    {/* ЗАГОЛОВОК AMEN ВНУТРИ ПРОФИЛЯ, ЧТОБЫ ОН СКРОЛЛИЛСЯ */}
                    <h1 className="text-4xl font-light tracking-tight opacity-90 drop-shadow-sm mb-12">Amen</h1>

                    {/* УБРАЛИ ГРАНИЦЫ И КАРТОЧКУ - ТЕПЕРЬ ПРОСТО ЭЛЕМЕНТЫ */}
                    <div className="pb-10">
                        <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center text-4xl font-light mb-8 shadow-2xl ${theme.activeButton}`}>
                            {user.displayName?.[0] || "A"}
                        </div>
                        
                        <div className="relative mb-2 px-8 group">
                            <input 
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onBlur={handleUpdateName}
                                className="w-full bg-transparent text-center text-3xl font-light outline-none border-b border-transparent focus:border-current transition placeholder:opacity-30"
                                placeholder="Ваше имя"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 transition pointer-events-none text-xs">edit</span>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-20">Тайная комната</p>
                        
                        <div className="text-center opacity-40">
                             <p className="text-[10px] leading-relaxed whitespace-pre-wrap">{DISCLAIMER_TEXT}</p>
                        </div>
                    </div>
                </motion.div>
            )}

          </AnimatePresence>
        </main>

        <AudioPlayer currentTrack={currentTrack} isPlaying={isPlaying} togglePlay={() => setIsPlaying(!isPlaying)} changeTrack={setCurrentTrack} theme={theme} />

        {/* --- CREATE MODAL --- */}
        <AnimatePresence>
        {showCreateModal && (
            <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}/>
            <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring", damping:25}} className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-[2.5rem] p-8 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] ${theme.cardBg} backdrop-blur-3xl border-t border-white/20`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-light">Новая запись</h3>
                    <button onClick={() => setShowCreateModal(false)}><X size={20} className="opacity-40" /></button>
                </div>
                
                {isAmenAnimating ? (
                    <div className="h-60 flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 rounded-full border-2 border-current border-t-transparent animate-spin"/>
                        <p className="text-xs font-medium uppercase tracking-widest animate-pulse">Отправка...</p>
                    </div>
                ) : (
                    <form onSubmit={(e) => handleAmen(e, view === 'flow' ? "focus" : "manual")}>
                        {view === 'diary' && (
                            <input name="title" placeholder="Тема..." className="w-full bg-transparent border-b border-current border-opacity-10 py-3 text-lg font-light outline-none mb-4 placeholder:opacity-40" autoFocus />
                        )}
                        <textarea name="text" className={`w-full ${theme.containerBg} rounded-xl p-4 h-40 outline-none mb-6 text-base font-light placeholder:opacity-40 resize-none`} placeholder={view === 'flow' ? "Твой отклик на слово..." : "Мысли, молитвы, благодарность..."} />
                        
                        <div className="flex justify-between items-center">
                             <div onClick={() => setFocusPrayerPublic(!focusPrayerPublic)} className="flex items-center gap-3 cursor-pointer opacity-60 hover:opacity-100 transition">
                                 <div className={`w-10 h-6 rounded-full p-1 transition-colors ${focusPrayerPublic ? theme.activeButton : 'bg-stone-300'}`}>
                                     <motion.div animate={{x: focusPrayerPublic ? 16 : 0}} className="w-4 h-4 bg-white rounded-full shadow-sm"/>
                                 </div>
                                 <span className="text-[10px] font-bold uppercase tracking-widest">{focusPrayerPublic ? "Видят все" : "Личное"}</span>
                             </div>
                             <button className={`px-10 py-4 text-xs font-bold uppercase tracking-widest rounded-xl transition transform active:scale-95 ${theme.activeButton}`}>
                                Amen
                             </button>
                        </div>
                    </form>
                )}
            </motion.div>
            </>
        )}
        </AnimatePresence>

        {/* --- LEGAL MODAL (FROM MENU) --- */}
        <AnimatePresence>
            {showLegalModal && (
                <>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-md" onClick={() => setShowLegalModal(false)}/>
                <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className={`fixed top-1/2 left-6 right-6 -translate-y-1/2 z-[70] rounded-3xl p-8 shadow-2xl ${theme.cardBg} max-h-[70vh] overflow-y-auto`}>
                    <button onClick={() => setShowLegalModal(false)} className="absolute top-6 right-6 opacity-40 hover:opacity-100"><X size={24}/></button>
                    <div>
                        <h3 className="text-lg font-bold uppercase tracking-widest mb-6 opacity-50">Соглашение</h3>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed opacity-80 font-light">{TERMS_TEXT}</p>
                    </div>
                </motion.div>
                </>
            )}
        </AnimatePresence>

        {/* --- SUCCESS MODAL --- */}
        <AnimatePresence>
            {showSuccessModal && (
                <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} className="fixed inset-0 z-[60] flex items-center justify-center p-8 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-stone-800 text-white rounded-full flex items-center justify-center">
                            <Check size={32} />
                        </div>
                        <h3 className="text-xl font-light tracking-wide text-stone-900">Услышано</h3>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </>
  );
};

export default App;
