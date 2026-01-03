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
// Возвращаем иконки только для плеера и UI элементов, где просили
import { List, X, Check, Disc, Plus } from 'lucide-react'; 

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

// --- THEMES (Deep Matte Glass Update) ---
const THEMES = {
  dawn: { 
    id: 'dawn', 
    bgImage: '/dawn.jpg', 
    fallbackColor: '#fff7ed', 
    // Глубокое матовое стекло
    cardBg: 'bg-[#fffbf7]/60 backdrop-blur-3xl shadow-sm border border-white/40', 
    text: 'text-stone-800', 
    subText: 'text-stone-500',
    accent: 'text-orange-900', 
    overlay: 'bg-[#78350f]/5',
    button: 'border border-stone-800/10 hover:bg-stone-800/5 active:scale-95 transition-all', 
    activeButton: 'bg-stone-800 text-white shadow-lg',
    menuBg: 'bg-[#fffbf7]/90 backdrop-blur-3xl text-stone-800 border-l border-white/20',
    inputBg: 'bg-stone-900/5'
  }
};

// --- DATA ---
const PRAYER_CATEGORIES = [
  { id: 'focus', label: 'ФОКУС' },
  { id: 'heart', label: 'СЕРДЦЕ' },
  { id: 'family', label: 'СЕМЬЯ' },
  { id: 'work', label: 'ДЕЛО' },
  { id: 'world', label: 'МИР' },
  { id: 'thank', label: 'СПАСИБО' }
];

const FALLBACK_READINGS = {
  "03-01": { title: "Начало пути", source: "Матфея 7:7", text: "Просите, и дано будет вам...", thought: "Бог отвечает тем, кто делает шаг.", action: "Сделай первый шаг." }
};
const DAILY_WORD_DEFAULT = { title: "Тишина", source: "Псалом 46:11", text: "Остановитесь и познайте...", thought: "В суете трудно услышать шепот.", action: "Побыть в тишине" };

const AUDIO_TRACKS = [
  { id: 1, title: "Deep Prayer", url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3" },
  { id: 2, title: "Quiet Spirit", url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3" },
  { id: 3, title: "Atmosphere", url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3" },
  { id: 4, title: "Night Vigil", url: "https://cdn.pixabay.com/download/audio/2022/02/07/audio_03d98c227a.mp3" },
];

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
      {/* Playlist Overlay - Closes on click outside */}
      <AnimatePresence>
        {showPlaylist && (
            <>
                <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm" onClick={() => setShowPlaylist(false)} />
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className={`fixed bottom-24 left-4 right-4 z-50 rounded-2xl p-4 shadow-2xl ${theme.menuBg} max-h-60 overflow-y-auto`}
                >
                    <h4 className="text-xs font-medium uppercase tracking-widest opacity-50 mb-4 px-2">Плейлист</h4>
                    {AUDIO_TRACKS.map(track => (
                        <button 
                            key={track.id} 
                            onClick={() => { changeTrack(track); setShowPlaylist(false); }}
                            className={`w-full text-left py-3 px-2 rounded-lg text-sm font-light ${currentTrack.id === track.id ? 'bg-black/5 font-medium' : ''}`}
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
           <div className={`p-2 rounded-full bg-black/5`}>
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
  // Новая структура меню
  const menuItems = [
    { id: 'flow', label: 'ПОТОК' }, // Focus + Unity
    { id: 'diary', label: 'ДНЕВНИК' }, // Create + My Prayers
    { id: 'profile', label: 'ПРОФИЛЬ' },
  ];

  return (
    <>
      {/* Кнопка опущена ниже (top-14) */}
      <div className="fixed top-14 right-6 z-[60]">
        <button onClick={() => setIsOpen(!isOpen)} className={`text-[10px] font-medium uppercase tracking-widest px-4 py-2 rounded-full border border-stone-800/10 backdrop-blur-md ${theme.text}`}>
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
  
  // VIEW: 'flow' is now default (Focus + Unity)
  const [view, setView] = useState('flow'); 
  const [currentTheme] = useState('dawn'); 
  const theme = THEMES[currentTheme];
  
  const [currentTrack, setCurrentTrack] = useState(AUDIO_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [myPrayers, setMyPrayers] = useState([]);
  const [publicPosts, setPublicPosts] = useState([]);
  const [dailyVerse, setDailyVerse] = useState(null);

  // States for UX
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isAmenAnimating, setIsAmenAnimating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [focusPrayerPublic, setFocusPrayerPublic] = useState(false);
  
  const isAdmin = user && ADMIN_NAMES.includes(user.displayName);

  // Fetch Daily Word
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

  // Auth
  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); }), []);

  // Data Sync
  useEffect(() => { if (!user) return; return onSnapshot(query(collection(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers'), orderBy('createdAt', 'desc')), snap => setMyPrayers(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, [user]);
  useEffect(() => { return onSnapshot(query(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts'), orderBy('createdAt', 'desc'), limit(50)), snap => setPublicPosts(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); setAuthError(''); setIsAuthLoading(true);
    const { username, password } = e.target.elements;
    const fakeEmail = `${username.value.trim().replace(/\s/g, '').toLowerCase()}@amen.app`;
    try {
      await signInWithEmailAndPassword(auth, fakeEmail, password.value);
    } catch (err) {
       // Auto-create logic if not found
       if(err.code.includes('not-found') || err.code.includes('invalid-credential')) {
           try {
             const u = await createUserWithEmailAndPassword(auth, fakeEmail, password.value);
             await updateProfile(u.user, { displayName: username.value });
           } catch(ce) { setAuthError("Ошибка: " + ce.code); }
       } else { setAuthError("Ошибка: " + err.code); }
    }
    setIsAuthLoading(false);
  };

  // --- AMEN UX LOGIC ---
  const handleAmen = async (e, source = "manual") => {
    e.preventDefault();
    
    // 1. Start Animation
    setIsAmenAnimating(true);

    const title = e.target.elements.title?.value || "Молитва";
    const text = e.target.elements.text.value;
    const isPublic = source === "focus" ? focusPrayerPublic : e.target.elements.pub?.checked;
    
    // 2. Database Action (in background)
    const data = { title, text, createdAt: serverTimestamp(), status: 'active', updates: [] };
    await addDoc(collection(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers'), data);
    if(isPublic) {
      await addDoc(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts'), {
        text: title + (text ? `\n\n${text}` : ""), authorId: user.uid, authorName: user.displayName || "Пилигрим", createdAt: serverTimestamp(), likes: []
      });
    }

    // 3. Wait for 1.5s animation, then show Success
    setTimeout(() => {
        setIsAmenAnimating(false);
        setShowCreateModal(false);
        setShowSuccessModal(true);
        e.target.reset();
        
        // 4. Auto close Success after 2s
        setTimeout(() => setShowSuccessModal(false), 2000);
    }, 1500);
  };

  const toggleLike = async (id, likes) => {
    const ref = doc(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts', id);
    await updateDoc(ref, { likes: likes?.includes(user.uid) ? arrayRemove(user.uid) : arrayUnion(user.uid) });
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
      <div className={`fixed inset-0 z-[-1] bg-cover bg-center`} style={{ backgroundImage: theme.bgImage ? `url(${theme.bgImage})` : 'none', backgroundColor: theme.fallbackColor }} />
      <div className={`fixed inset-0 z-[-1] ${theme.overlay}`} />

      {/* Main Container: pt-16 for notch */}
      <div className={`relative z-10 h-[100dvh] w-full flex flex-col max-w-md mx-auto font-sans ${theme.text} overflow-hidden`}>
        <TopMenu view={view} setView={setView} theme={theme} logout={() => signOut(auth)} />

        <div className="pt-20 pb-6 px-8 text-center">
            <h1 className="text-4xl font-light tracking-tight opacity-90">Amen</h1>
        </div>

        <main className="flex-1 overflow-y-auto px-6 pb-44 no-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* --- Вкладка 1: ПОТОК (Flow) --- */}
            {view === 'flow' && (
              <motion.div key="flow" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-8">
                
                {/* 1. ФОКУС ДНЯ (Сверху) */}
                <Card theme={theme} className="text-center py-10 relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-full h-1 bg-stone-900/5" />
                   <div className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-40 mb-6">Фокус дня</div>
                   <h2 className="text-2xl font-light leading-snug mb-4 px-2">{dailyVerse.title}</h2>
                   <p className="text-sm font-light italic opacity-70 mb-8 max-w-xs mx-auto">"{dailyVerse.text}"</p>
                   
                   <div className="bg-stone-900/5 rounded-xl p-4 mb-6 mx-2">
                       <p className="text-sm opacity-90 font-light leading-relaxed">{dailyVerse.thought}</p>
                   </div>

                   <button onClick={() => setShowCreateModal(true)} className={`w-full py-4 text-xs font-medium uppercase tracking-[0.2em] transition ${theme.button}`}>
                       {dailyVerse.action}
                   </button>
                </Card>

                {/* 2. СТЕНА ЕДИНСТВА (Снизу) */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 opacity-30 justify-center mb-2">
                        <div className="w-1 h-1 bg-current rounded-full"></div>
                        <span className="text-[10px] uppercase tracking-widest">Единство</span>
                        <div className="w-1 h-1 bg-current rounded-full"></div>
                    </div>
                    {publicPosts.map(post => {
                         const liked = post.likes?.includes(user.uid);
                         return (
                             <Card key={post.id} theme={theme} className="!p-5">
                                 <div className="flex justify-between mb-3 opacity-40 text-[10px] uppercase tracking-widest">
                                     <span>{post.authorName}</span>
                                     <span>{post.createdAt?.toDate().toLocaleDateString()}</span>
                                 </div>
                                 <p className="mb-5 text-base font-light leading-relaxed whitespace-pre-wrap opacity-90">{post.text}</p>
                                 <button onClick={() => toggleLike(post.id, post.likes)} className={`w-full py-3 text-[10px] font-medium uppercase tracking-widest transition rounded-xl ${liked ? 'bg-stone-800 text-white' : 'bg-stone-900/5 hover:bg-stone-900/10'}`}>
                                     {liked ? "МЫ ВМЕСТЕ" : "ПОДДЕРЖАТЬ"} {post.likes?.length > 0 && ` • ${post.likes.length}`}
                                 </button>
                             </Card>
                         );
                     })}
                </div>
              </motion.div>
            )}

            {/* --- Вкладка 2: ЛИЧНЫЙ ДНЕВНИК (Diary) --- */}
            {view === 'diary' && (
                <motion.div key="diary" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
                    
                    {/* Большая кнопка создания */}
                    <button onClick={() => setShowCreateModal(true)} className={`w-full py-6 rounded-[2rem] border-2 border-dashed border-stone-800/10 flex items-center justify-center gap-3 text-stone-500 hover:text-stone-800 hover:border-stone-800/30 transition group ${theme.cardBg}`}>
                        <div className="p-2 bg-stone-800/5 rounded-full group-hover:bg-stone-800/10"><Plus size={20} /></div>
                        <span className="text-xs font-medium uppercase tracking-widest">Создать запись</span>
                    </button>

                    <div className="space-y-4">
                    {myPrayers.length === 0 && <div className="text-center opacity-30 py-10 font-light italic">Дневник чист...</div>}
                    {myPrayers.map(p => (
                        <Card key={p.id} theme={theme}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-medium uppercase tracking-wider opacity-40">{p.createdAt?.toDate().toLocaleDateString()}</span>
                                {p.status === 'answered' && <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-widest">Ответ</span>}
                            </div>
                            <h3 className="text-lg font-medium mb-2">{p.title}</h3>
                            <p className="text-sm font-light opacity-80 whitespace-pre-wrap leading-relaxed">{p.text}</p>
                            
                            <div className="mt-6 flex justify-end">
                                <button onClick={() => deleteDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', p.id))} className="text-[10px] text-red-400 opacity-50 hover:opacity-100 uppercase tracking-widest">Удалить</button>
                            </div>
                        </Card>
                    ))}
                    </div>
                </motion.div>
            )}

            {/* --- Вкладка 3: ПРОФИЛЬ --- */}
            {view === 'profile' && (
                <motion.div key="profile" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center py-10">
                    <Card theme={theme} className="py-12">
                        <div className="w-24 h-24 mx-auto bg-stone-800 text-white rounded-full flex items-center justify-center text-4xl font-light mb-6 shadow-xl">
                            {user.displayName?.[0] || "A"}
                        </div>
                        {/* Email убран, только имя */}
                        <h2 className="text-3xl font-light mb-2">{user.displayName || "Пилигрим"}</h2>
                        <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-12">Тайная комната</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-stone-900/5 rounded-2xl">
                                <div className="text-2xl font-light">{myPrayers.length}</div>
                                <div className="text-[9px] uppercase tracking-widest opacity-50 mt-1">Записей</div>
                            </div>
                            <div className="p-4 bg-stone-900/5 rounded-2xl">
                                <div className="text-2xl font-light">{publicPosts.filter(p => p.likes?.includes(user.uid)).length}</div>
                                <div className="text-[9px] uppercase tracking-widest opacity-50 mt-1">Поддержка</div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

          </AnimatePresence>
        </main>

        <AudioPlayer currentTrack={currentTrack} isPlaying={isPlaying} togglePlay={() => setIsPlaying(!isPlaying)} changeTrack={setCurrentTrack} theme={theme} />

        {/* --- CREATE MODAL (Used for both Focus & Diary) --- */}
        <AnimatePresence>
        {showCreateModal && (
            <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}/>
            <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring", damping:25}} className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-[2.5rem] p-8 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] ${theme.cardBg} backdrop-blur-3xl`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-light">Новая запись</h3>
                    <button onClick={() => setShowCreateModal(false)}><X size={20} className="opacity-40" /></button>
                </div>
                
                {/* АНИМАЦИЯ ОТПРАВКИ (Amen UX) */}
                {isAmenAnimating ? (
                    <div className="h-60 flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 rounded-full border-2 border-stone-800 border-t-transparent animate-spin"/>
                        <p className="text-xs font-medium uppercase tracking-widest animate-pulse">Отправка...</p>
                    </div>
                ) : (
                    <form onSubmit={(e) => handleAmen(e, view === 'flow' ? "focus" : "manual")}>
                        {view === 'diary' && (
                            <input name="title" placeholder="Тема..." className="w-full bg-transparent border-b border-stone-800/10 py-3 text-lg font-light outline-none mb-4 placeholder:opacity-30" autoFocus />
                        )}
                        <textarea name="text" className="w-full bg-stone-900/5 rounded-xl p-4 h-40 outline-none mb-6 text-base font-light placeholder:opacity-30 resize-none" placeholder={view === 'flow' ? "Твой отклик на слово..." : "Мысли, молитвы, благодарность..."} />
                        
                        <div className="flex justify-between items-center">
                             {/* Toggle Public */}
                             <div onClick={() => setFocusPrayerPublic(!focusPrayerPublic)} className="flex items-center gap-3 cursor-pointer opacity-60 hover:opacity-100 transition">
                                 <div className={`w-10 h-6 rounded-full p-1 transition-colors ${focusPrayerPublic ? 'bg-stone-800' : 'bg-stone-300'}`}>
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

        {/* --- SUCCESS "HEARD" MODAL --- */}
        <AnimatePresence>
            {showSuccessModal && (
                <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} className="fixed inset-0 z-[60] flex items-center justify-center p-8 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-stone-800 text-white rounded-full flex items-center justify-center">
                            <Check size={32} />
                        </div>
                        <h3 className="text-xl font-light tracking-wide">Услышано</h3>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </>
  );
};

export default App;
