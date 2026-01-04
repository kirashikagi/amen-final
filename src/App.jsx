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
import { List, X, Check, Disc, Plus, Image as ImageIcon, CheckCircle2, FileText, ShieldAlert, UserCog, ChevronRight } from 'lucide-react'; 

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

// --- ТЕМЫ (Скорректирована непрозрачность для читаемости) ---
const THEMES = {
  dawn: { 
    id: 'dawn', label: 'Рассвет', bgImage: '/dawn.jpg', 
    fallbackColor: '#fff7ed', 
    // Чуть плотнее фон (80) для контраста текста
    cardBg: 'bg-[#fffbf7]/80 backdrop-blur-3xl shadow-sm border border-white/60', 
    text: 'text-stone-900', subText: 'text-stone-600', 
    overlay: 'bg-[#78350f]/5', 
    button: 'border border-stone-800/20 hover:bg-stone-800/5', 
    activeButton: 'bg-stone-800 text-white shadow-lg',
    menuBg: 'bg-[#fffbf7]/95 backdrop-blur-3xl text-stone-900 border-l border-white/20'
  },
  morning: { 
    id: 'morning', label: 'Утро', bgImage: '/morning.jpg', 
    fallbackColor: '#f0f9ff', 
    cardBg: 'bg-white/80 backdrop-blur-3xl shadow-sm border border-white/60', 
    text: 'text-slate-900', subText: 'text-slate-600', 
    overlay: 'bg-sky-900/5', 
    button: 'border border-slate-800/20 hover:bg-slate-800/5', 
    activeButton: 'bg-sky-900 text-white shadow-lg',
    menuBg: 'bg-white/95 backdrop-blur-3xl text-slate-900 border-l border-white/20'
  },
  day: { 
    id: 'day', label: 'День', bgImage: '/day.jpg', 
    fallbackColor: '#fdfce7', 
    cardBg: 'bg-[#fffff0]/85 backdrop-blur-3xl shadow-sm border border-white/60', 
    text: 'text-stone-950', subText: 'text-stone-700', 
    overlay: 'bg-yellow-900/5', 
    button: 'border border-stone-900/20 hover:bg-stone-900/5', 
    activeButton: 'bg-amber-900 text-white shadow-lg',
    menuBg: 'bg-[#fffff0]/95 backdrop-blur-3xl text-stone-950 border-l border-white/20'
  },
  sunset: { 
    id: 'sunset', label: 'Закат', bgImage: '/sunset.jpg', 
    fallbackColor: '#fff1f2', 
    cardBg: 'bg-[#fff1f2]/80 backdrop-blur-3xl shadow-sm border border-white/60', 
    text: 'text-rose-950', subText: 'text-rose-800', 
    overlay: 'bg-rose-900/10', 
    button: 'border border-rose-900/20 hover:bg-rose-900/5', 
    activeButton: 'bg-rose-900 text-white shadow-lg',
    menuBg: 'bg-[#fff1f2]/95 backdrop-blur-3xl text-rose-950 border-l border-white/20'
  },
  evening: { 
    id: 'evening', label: 'Вечер', bgImage: '/evening.jpg', 
    fallbackColor: '#f5f3ff', 
    cardBg: 'bg-[#2e1065]/60 backdrop-blur-3xl shadow-sm border border-white/10', 
    text: 'text-white', subText: 'text-purple-200', 
    overlay: 'bg-[#2e1065]/40', 
    button: 'border border-white/30 hover:bg-white/10', 
    activeButton: 'bg-white text-purple-950 shadow-lg',
    menuBg: 'bg-[#2e1065]/90 backdrop-blur-3xl text-white border-l border-white/10'
  },
  midnight: { 
    id: 'midnight', label: 'Полночь', bgImage: '/midnight.jpg', 
    fallbackColor: '#020617', 
    cardBg: 'bg-black/60 backdrop-blur-3xl shadow-sm border border-white/10', 
    text: 'text-slate-100', subText: 'text-slate-400', 
    overlay: 'bg-black/60', 
    button: 'border border-white/20 hover:bg-white/5', 
    activeButton: 'bg-white text-black shadow-lg',
    menuBg: 'bg-black/90 backdrop-blur-3xl text-slate-100 border-l border-white/10'
  }
};

const FALLBACK_READINGS = {
  "03-01": { title: "Начало пути", source: "Матфея 7:7", text: "Просите, и дано будет вам; ищите, и найдете; стучите, и отворят вам.", thought: "Бог отвечает тем, кто делает шаг. Дверь открывается не перед тем, кто ждет, а перед тем, кто стучит.", action: "Сделать шаг веры" }
};
const DAILY_WORD_DEFAULT = { title: "Тишина", source: "Псалом 46:11", text: "Остановитесь и познайте, что Я — Бог.", thought: "В суете трудно услышать шепот.", action: "Побыть в тишине" };

// --- LEGAL TEXTS ---
const TERMS_TEXT = `Пользовательское соглашение\n\n1. Amen — это пространство тишины и молитвы.\n2. Мы не собираем ваши личные данные для рекламы.\n3. Ваши записи в "Дневнике" видны только вам (хранятся в базе данных Firebase).\n4. Записи, отправленные в "Единство" (с галочкой "Видят все"), становятся публичными.\n5. Будьте уважительны. Контент с ненавистью или насилием будет удален.\n\nИспользуя приложение, вы соглашаетесь с этими принципами.`;
const DISCLAIMER_TEXT = `Дисклеймер\n\nAmen не является заменой профессиональной психологической помощи.\n\nЕсли вы находитесь в кризисной ситуации, пожалуйста, обратитесь к специалистам или позвоните в службы экстренной помощи.\n\nВесь контент носит духовный и поддерживающий характер.`;

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
                    className={`fixed bottom-24 left-4 right-4 z-50 rounded-2xl p-4 shadow-2xl ${theme.menuBg} max-h-72 overflow-y-auto`}
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

      <div className={`fixed bottom-6 left-6 right-6 z-40 p-4 rounded-full backdrop-blur-xl border border-white/30 shadow-lg flex items-center justify-between ${theme.menuBg}`}>
        <audio ref={audioRef} src={currentTrack.url} onEnded={() => {}} loop />
        
        <div className="flex items-center gap-4 overflow-hidden" onClick={() => setShowPlaylist(true)}>
           <div className={`p-2 rounded-full bg-black/5 dark:bg-white/10`}>
             <Disc size={18} className={isPlaying ? "animate-spin-slow" : ""} />
           </div>
           <span className="text-xs font-medium uppercase tracking-widest truncate max-w-[150px]">
              {currentTrack.title}
           </span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={togglePlay} className="text-xs font-medium uppercase tracking-widest hover:opacity-70 transition px-2">
             {isPlaying ? "||" : "PLAY"}
          </button>
          <button onClick={() => setShowPlaylist(!showPlaylist)} className="p-2 opacity-50 hover:opacity-100">
             <List size={18} />
          </button>
        </div>
      </div>
    </>
  );
};

const TopMenu = ({ view, setView, theme, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuItems = [
    { id: 'flow', label: 'ПОТОК' }, 
    { id: 'diary', label: 'ДНЕВНИК' },
    { id: 'profile', label: 'ПРОФИЛЬ' },
  ];

  return (
    <>
      <div className="fixed top-14 right-6 z-[60]">
        <button onClick={() => setIsOpen(!isOpen)} className={`text-[10px] font-medium uppercase tracking-widest px-4 py-2 rounded-full border border-stone-800/10 backdrop-blur-md ${theme.text} hover:bg-black/5 transition`}>
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
                className={`fixed top-0 right-0 bottom-0 z-50 w-72 p-10 shadow-2xl flex flex-col justify-between ${theme.menuBg}`}
            >
              <div className="flex flex-col gap-8 mt-24">
                {menuItems.map(item => (
                  <button key={item.id} onClick={() => { setView(item.id); setIsOpen(false); }} className={`text-left text-2xl font-light tracking-wide transition-opacity ${view === item.id ? 'opacity-100 font-normal' : 'opacity-40 hover:opacity-80'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
              
              <div className="mb-8">
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

  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [focusPrayerPublic, setFocusPrayerPublic] = useState(false);
  
  // Новые состояния
  const [diaryTab, setDiaryTab] = useState('active'); // 'active' | 'answered'
  const [showLegalModal, setShowLegalModal] = useState(null); // 'terms' | 'disclaimer' | 'editName'
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
      if(!newName.trim()) return;
      await updateProfile(user, { displayName: newName });
      setShowLegalModal(null);
  };

  const handleAmen = async (e, source = "manual") => {
    e.preventDefault();
    setIsAmenAnimating(true);

    const title = e.target.elements.title?.value || "Молитва";
    const text = e.target.elements.text.value;
    const isPublic = source === "focus" ? focusPrayerPublic : e.target.elements.pub?.checked;
    
    // Если мы отправляем ответ на молитву (из дневника отвеченных), статус сразу ставим active,
    // но если пользователь хочет сразу пометить как ответ, можно добавить логику.
    // Пока все новые записи - активные.
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
        <TopMenu view={view} setView={setView} theme={theme} logout={() => signOut(auth)} />

        <div className="pt-20 pb-6 px-8 text-center">
            <h1 className="text-4xl font-light tracking-tight opacity-90 drop-shadow-sm">Amen</h1>
        </div>

        <main className="flex-1 overflow-y-auto px-6 pb-44 no-scrollbar">
          <AnimatePresence mode="wait">
            
            {view === 'flow' && (
              <motion.div key="flow" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-8">
                
                {/* ДЕТАЛЬНАЯ КАРТОЧКА СЛОВА */}
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
                   
                   <div className="bg-current bg-opacity-[0.03] rounded-2xl p-6 mb-8 mx-2 text-left">
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
                                 <button onClick={() => toggleLike(post.id, post.likes)} className={`w-full py-3 text-[10px] font-bold uppercase tracking-widest transition rounded-xl ${liked ? theme.activeButton : 'bg-current bg-opacity-5 hover:bg-opacity-10'}`}>
                                     {liked ? "МЫ ВМЕСТЕ" : "ПОДДЕРЖАТЬ"} {post.likes?.length > 0 && ` • ${post.likes.length}`}
                                 </button>
                             </Card>
                         );
                     })}
                </div>
              </motion.div>
            )}

            {view === 'diary' && (
                <motion.div key="diary" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
                    
                    {/* ПЕРЕКЛЮЧАТЕЛЬ: Текущие / Ответы */}
                    <div className="flex p-1 bg-current bg-opacity-5 rounded-full mb-6 relative">
                        <div className={`absolute top-1 bottom-1 w-1/2 bg-white shadow-sm rounded-full transition-all duration-300 ${diaryTab === 'active' ? 'left-1' : 'left-[49%]'}`} />
                        <button onClick={() => setDiaryTab('active')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest relative z-10 transition-colors ${diaryTab === 'active' ? 'text-black' : 'opacity-50'}`}>Текущие</button>
                        <button onClick={() => setDiaryTab('answered')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest relative z-10 transition-colors ${diaryTab === 'answered' ? 'text-black' : 'opacity-50'}`}>Ответы</button>
                    </div>

                    {diaryTab === 'active' && (
                        <button onClick={() => setShowCreateModal(true)} className={`w-full py-6 rounded-[2rem] border-2 border-dashed border-current border-opacity-10 flex items-center justify-center gap-3 opacity-60 hover:opacity-100 hover:border-opacity-30 transition group ${theme.cardBg}`}>
                            <div className="p-2 bg-current bg-opacity-5 rounded-full"><Plus size={20} /></div>
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
                <motion.div key="profile" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center py-6">
                    <Card theme={theme} className="py-10">
                        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl font-light mb-6 shadow-xl ${theme.activeButton}`}>
                            {user.displayName?.[0] || "A"}
                        </div>
                        <h2 className="text-3xl font-light mb-2">{user.displayName || "Пилигрим"}</h2>
                        <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-10">Тайная комната</p>
                        
                        {/* АТМОСФЕРА */}
                        <div className="flex items-center justify-center gap-2 mb-6 opacity-60">
                            <ImageIcon size={14} />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Атмосфера</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 mb-10">
                           {Object.values(THEMES).map(t => (
                             <button 
                               key={t.id} 
                               onClick={() => setCurrentThemeId(t.id)} 
                               className={`h-12 rounded-xl relative overflow-hidden transition-all duration-300 ${currentThemeId === t.id ? 'ring-2 ring-offset-2 ring-current scale-105 shadow-md' : 'opacity-60 hover:opacity-100'}`}
                             >
                               <img src={t.bgImage} className="absolute inset-0 w-full h-full object-cover" alt={t.label} />
                               <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white text-[9px] uppercase font-bold tracking-widest shadow-sm">
                                   {t.label}
                               </span>
                             </button>
                           ))}
                        </div>
                        
                        {/* МЕНЮ НАСТРОЕК */}
                        <div className="space-y-1 text-left">
                            <button onClick={() => setShowLegalModal('editName')} className="w-full p-4 hover:bg-current hover:bg-opacity-5 rounded-2xl flex items-center justify-between group transition">
                                <div className="flex items-center gap-3 opacity-70 group-hover:opacity-100">
                                    <UserCog size={18} />
                                    <span className="text-sm font-medium">Изменить имя</span>
                                </div>
                                <ChevronRight size={16} className="opacity-30" />
                            </button>
                            
                            <button onClick={() => setShowLegalModal('terms')} className="w-full p-4 hover:bg-current hover:bg-opacity-5 rounded-2xl flex items-center justify-between group transition">
                                <div className="flex items-center gap-3 opacity-70 group-hover:opacity-100">
                                    <FileText size={18} />
                                    <span className="text-sm font-medium">Пользовательское соглашение</span>
                                </div>
                                <ChevronRight size={16} className="opacity-30" />
                            </button>

                            <button onClick={() => setShowLegalModal('disclaimer')} className="w-full p-4 hover:bg-current hover:bg-opacity-5 rounded-2xl flex items-center justify-between group transition">
                                <div className="flex items-center gap-3 opacity-70 group-hover:opacity-100">
                                    <ShieldAlert size={18} />
                                    <span className="text-sm font-medium">Дисклеймер</span>
                                </div>
                                <ChevronRight size={16} className="opacity-30" />
                            </button>
                        </div>

                    </Card>
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
                        <textarea name="text" className="w-full bg-current bg-opacity-5 rounded-xl p-4 h-40 outline-none mb-6 text-base font-light placeholder:opacity-40 resize-none" placeholder={view === 'flow' ? "Твой отклик на слово..." : "Мысли, молитвы, благодарность..."} />
                        
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

        {/* --- LEGAL & SETTINGS MODAL --- */}
        <AnimatePresence>
            {showLegalModal && (
                <>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-md" onClick={() => setShowLegalModal(null)}/>
                <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className={`fixed top-1/2 left-6 right-6 -translate-y-1/2 z-[70] rounded-3xl p-8 shadow-2xl ${theme.cardBg} max-h-[70vh] overflow-y-auto`}>
                    <button onClick={() => setShowLegalModal(null)} className="absolute top-6 right-6 opacity-40 hover:opacity-100"><X size={24}/></button>
                    
                    {showLegalModal === 'editName' && (
                        <div className="text-center">
                            <h3 className="text-xl font-serif mb-6">Как вас называть?</h3>
                            <input 
                                value={newName} 
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full bg-current bg-opacity-5 rounded-xl p-4 text-center text-xl outline-none mb-6 font-serif"
                                placeholder="Ваше имя"
                            />
                            <button onClick={handleUpdateName} className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest ${theme.activeButton}`}>Сохранить</button>
                        </div>
                    )}

                    {showLegalModal === 'terms' && (
                        <div>
                            <h3 className="text-lg font-bold uppercase tracking-widest mb-6 opacity-50">Соглашение</h3>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed opacity-80 font-light">{TERMS_TEXT}</p>
                        </div>
                    )}

                    {showLegalModal === 'disclaimer' && (
                        <div>
                            <h3 className="text-lg font-bold uppercase tracking-widest mb-6 text-red-400 opacity-80">Важно</h3>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed opacity-80 font-light">{DISCLAIMER_TEXT}</p>
                        </div>
                    )}
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
