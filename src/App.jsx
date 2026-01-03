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
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove 
} from "firebase/firestore";

// --- НОВАЯ КОНФИГУРАЦИЯ (ВАШИ КЛЮЧИ) ---
const firebaseConfig = {
  apiKey: "AIzaSyAnW6B3CEoFEQy08WFGKIfNVzs3TevBPtc",
  authDomain: "amen-app-b0da2.firebaseapp.com",
  projectId: "amen-app-b0da2",
  storageBucket: "amen-app-b0da2.firebasestorage.app",
  messagingSenderId: "964550407508",
  appId: "1:964550407508:web:2d6a8c18fcf461af97c4c1"
};

// ID коллекции в базе данных (можно оставить production или поменять на amen-app-b0da2)
const dbCollectionId = "amen-production"; 

const ADMIN_NAMES = ['Admin', 'Founder', 'admin', 'founder'];

// Инициализация
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- ТЕМЫ ---
const THEMES = {
  dawn: { 
    id: 'dawn', 
    bgImage: '/dawn.jpg', 
    fallbackColor: '#fff7ed', 
    cardBg: 'bg-[#fffbf7]/95', 
    text: 'text-stone-800', 
    subText: 'text-stone-500',
    accent: 'text-orange-900', 
    overlay: 'bg-[#78350f]/5',
    button: 'border border-stone-800/20 hover:bg-stone-800/5', 
    activeButton: 'bg-stone-800 text-white',
    menuBg: 'bg-[#fffbf7] text-stone-800 border-l border-stone-200',
    inputBg: 'bg-stone-900/5'
  }
};

// --- КАТЕГОРИИ (ТЕКСТ) ---
const PRAYER_CATEGORIES = [
  { id: 'focus', label: 'ФОКУС' },
  { id: 'heart', label: 'СЕРДЦЕ' },
  { id: 'family', label: 'СЕМЬЯ' },
  { id: 'work', label: 'ДЕЛО' },
  { id: 'world', label: 'МИР' },
  { id: 'thank', label: 'СПАСИБО' }
];

// --- ЗАПАСНОЙ КАЛЕНДАРЬ ---
const FALLBACK_READINGS = {
  "03-01": { title: "Начало пути", source: "Матфея 7:7", text: "Просите, и дано будет вам; ищите, и найдете...", thought: "Бог отвечает тем, кто делает шаг.", action: "Сделай первый шаг." }
};
const DAILY_WORD_DEFAULT = { title: "Тишина", source: "Псалом 46:11", text: "Остановитесь и познайте...", thought: "В суете трудно услышать шепот.", action: "Побыть в тишине" };

const AUDIO_TRACKS = [
  { id: 1, title: "Deep Prayer", url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3" },
  { id: 2, title: "Quiet Spirit", url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3" },
];

// --- КОМПОНЕНТЫ ---

const Card = ({ children, theme, className = "", onClick }) => (
  <motion.div 
    layout
    onClick={onClick} 
    className={`p-6 mb-4 backdrop-blur-sm transition-colors duration-500 border-t border-b border-current border-opacity-10 ${theme.cardBg} ${theme.text} ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
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
    <div className={`fixed bottom-0 left-0 right-0 z-40 px-6 pb-8 pt-4 backdrop-blur-xl border-t border-current border-opacity-10 ${theme.menuBg}`}>
      <audio ref={audioRef} src={currentTrack.url} onEnded={nextTrack} />
      <div className="flex items-center justify-between max-w-md mx-auto">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 truncate max-w-[120px]">
            {currentTrack.title}
        </span>
        <div className="flex items-center gap-6">
          <button onClick={togglePlay} className="text-xs font-bold uppercase tracking-widest hover:opacity-70 transition">
             {isPlaying ? "[ ПАУЗА ]" : "[ ИГРАТЬ ]"}
          </button>
          <button onClick={nextTrack} className="text-[10px] font-bold uppercase tracking-widest opacity-50 hover:opacity-100">
             СЛЕД
          </button>
        </div>
      </div>
    </div>
  );
};

const TopMenu = ({ view, setView, theme, openFeedback, isAdmin, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuItems = [
    { id: 'home', label: 'СЕГОДНЯ' },
    { id: 'word', label: 'СЛОВО' },
    { id: 'prayer', label: 'МОЛИТВА' },
    { id: 'unity', label: 'ЕДИНСТВО' },
    { id: 'profile', label: 'ПРОФИЛЬ' },
  ];

  return (
    <>
      <div className="fixed top-8 right-6 z-[60]">
        <button onClick={() => setIsOpen(!isOpen)} className={`text-xs font-bold uppercase tracking-widest px-4 py-2 bg-white/10 backdrop-blur-md ${theme.text}`}>
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
                className={`fixed top-0 right-0 bottom-0 z-50 w-64 p-8 shadow-2xl flex flex-col justify-between ${theme.menuBg}`}
            >
              <div className="flex flex-col gap-6 mt-20">
                {menuItems.map(item => (
                  <button key={item.id} onClick={() => { setView(item.id); setIsOpen(false); }} className={`text-left text-lg font-serif tracking-wide transition-opacity ${view === item.id ? 'opacity-100 underline underline-offset-4' : 'opacity-50 hover:opacity-100'}`}>
                    {item.label}
                  </button>
                ))}
                
                <div className="w-10 h-px bg-current opacity-20 my-4"></div>

                <button onClick={() => { openFeedback(); setIsOpen(false); }} className="text-left text-xs uppercase tracking-widest opacity-50 hover:opacity-100">
                    Написать автору
                </button>

                {isAdmin && (
                  <button onClick={() => { setView('admin_feedback'); setIsOpen(false); }} className="text-left text-xs uppercase tracking-widest text-orange-600">
                      Входящие (Admin)
                  </button>
                )}
              </div>
              
              <div className="mb-8">
                  <button onClick={logout} className="text-xs text-red-400 uppercase tracking-widest">Выйти</button>
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
  const [currentTheme, setCurrentTheme] = useState('dawn'); 
  const theme = THEMES[currentTheme] || THEMES.dawn;
  const [currentTrack, setCurrentTrack] = useState(AUDIO_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [myPrayers, setMyPrayers] = useState([]);
  const [publicPosts, setPublicPosts] = useState([]);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);

  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [showFocusPrayerModal, setShowFocusPrayerModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false); 
  const [expandedPrayerId, setExpandedPrayerId] = useState(null); 
  const [prayerUpdateText, setPrayerUpdateText] = useState('');
  const [focusPrayerPublic, setFocusPrayerPublic] = useState(false);
  
  const isAdmin = user && ADMIN_NAMES.includes(user.displayName);

  // Получение Слова Дня
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

  // Auth Listener
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => { 
      setUser(u); 
      setLoading(false);
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setAuthError(''); 
    setIsAuthLoading(true);
    
    const { username, password } = e.target.elements;
    const name = username.value.trim();
    const pass = password.value.trim();

    if (!name || !pass) { 
        setAuthError("Введите имя и пароль"); 
        setIsAuthLoading(false); 
        return; 
    }

    const fakeEmail = `${name.replace(/\s/g, '').toLowerCase()}@amen.app`;

    try {
      await signInWithEmailAndPassword(auth, fakeEmail, pass);
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-email') {
        try { 
            const u = await createUserWithEmailAndPassword(auth, fakeEmail, pass); 
            await updateProfile(u.user, { displayName: name }); 
        } catch (createErr) {
            if (createErr.code === 'auth/weak-password') setAuthError("Пароль слишком короткий (минимум 6 символов)");
            else if (createErr.code === 'auth/email-already-in-use') setAuthError("Имя занято, но пароль неверный");
            else setAuthError("Ошибка регистрации: " + createErr.code);
        }
      } 
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-login-credentials') {
        setAuthError("Неверный пароль для этого имени");
      } else {
        setAuthError("Ошибка: " + err.code);
      }
    }
    setIsAuthLoading(false);
  };

  const addPrayer = async (e, forcedCategory = null, forcedTitle = null) => {
    e.preventDefault();
    const title = forcedTitle || e.target.elements.title.value;
    const text = e.target.elements.text.value;
    const category = forcedCategory || e.target.elements.category.value;
    const isPublic = forcedCategory ? focusPrayerPublic : e.target.elements.pub.checked;

    if(!title.trim()) return;

    const data = { title, text, category, createdAt: serverTimestamp(), status: 'active', updates: [] };
    await addDoc(collection(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers'), data);
    
    if(isPublic) {
      await addDoc(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts'), {
        text: title + (text ? `\n\n${text}` : ""), category, authorId: user.uid, authorName: user.displayName || "Пилигрим", createdAt: serverTimestamp(), likes: []
      });
    }
    if (e.target.reset) e.target.reset();
    setShowPrayerForm(false);
    setShowFocusPrayerModal(false);
  };

  const toggleLike = async (id, likes) => {
    const ref = doc(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts', id);
    await updateDoc(ref, { likes: likes?.includes(user.uid) ? arrayRemove(user.uid) : arrayUnion(user.uid) });
  };

  useEffect(() => { if (!user) return; return onSnapshot(query(collection(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers'), orderBy('createdAt', 'desc')), snap => setMyPrayers(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, [user]);
  useEffect(() => { if (view !== 'unity') return; return onSnapshot(query(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts'), orderBy('createdAt', 'desc'), limit(50)), snap => setPublicPosts(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, [view]);

  if (loading || !dailyVerse) return <div className="h-screen bg-[#f4f5f0] flex items-center justify-center text-stone-400 font-serif italic">Amen...</div>;

  if (!user) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center p-8 bg-[#fffbf7]">
        <div className="w-full max-w-xs space-y-8">
            <div className="text-center">
               <h1 className="text-6xl font-serif text-stone-900 mb-4">Amen</h1>
               <p className="text-stone-500 text-xs uppercase tracking-[0.3em]">Тайная комната</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
               <input name="username" type="text" placeholder="Имя" className="w-full bg-transparent border-b border-stone-300 py-3 text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 transition text-center font-serif" required />
               <input name="password" type="password" placeholder="Пароль" className="w-full bg-transparent border-b border-stone-300 py-3 text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 transition text-center font-serif" required />
               {authError && <p className="text-red-600 text-[10px] uppercase tracking-wider text-center border border-red-200 p-2">{authError}</p>}
               <button disabled={isAuthLoading} className="w-full py-4 mt-4 bg-stone-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition">{isAuthLoading ? "..." : "Войти"}</button>
            </form>
            <button onClick={() => signInAnonymously(auth)} className="w-full text-stone-400 text-[10px] uppercase tracking-widest hover:text-stone-900 transition">Войти без регистрации</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`fixed inset-0 z-[-1] transition-all duration-1000 ${theme.bgImage ? 'bg-cover bg-center' : ''}`} style={{ backgroundImage: theme.bgImage ? `url(${theme.bgImage})` : 'none', backgroundColor: theme.fallbackColor }} />
      <div className={`fixed inset-0 z-[-1] transition-all duration-1000 ${theme.overlay}`} />

      <div className={`relative z-10 h-[100dvh] w-full flex flex-col max-w-md mx-auto font-serif ${theme.text} overflow-hidden`}>
        <TopMenu view={view} setView={setView} theme={theme} openFeedback={() => setShowFeedbackModal(true)} isAdmin={isAdmin} logout={() => signOut(auth)} />

        {view !== 'word' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-16 pb-6 px-8 text-center">
               <h1 className="text-3xl font-medium tracking-wide">Amen</h1>
           </motion.div>
        )}

        <main className="flex-1 overflow-y-auto px-6 pb-44 no-scrollbar">
          <AnimatePresence mode="wait">
            
            {view === 'home' && (
              <motion.div key="home" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
                <Card theme={theme} className="text-center py-12 cursor-pointer hover:opacity-90" onClick={() => setView('word')}>
                   <div className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] opacity-50 mb-4">Фокус дня</div>
                   <h2 className="text-3xl leading-tight mb-6">{dailyVerse.title}</h2>
                   <span className="text-xs font-bold uppercase tracking-widest border-b border-current pb-1">Открыть слово</span>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                  <Card theme={theme} className="flex flex-col items-center justify-center py-8">
                      <span className="text-4xl mb-2">{myPrayers.filter(p => p.status === 'active').length}</span>
                      <span className="text-[10px] font-sans uppercase tracking-widest opacity-50">В ожидании</span>
                  </Card>
                  <Card theme={theme} className="flex flex-col items-center justify-center py-8">
                      <span className="text-4xl mb-2">{myPrayers.filter(p => p.status === 'answered').length}</span>
                      <span className="text-[10px] font-sans uppercase tracking-widest opacity-50">Ответы</span>
                  </Card>
                </div>
              </motion.div>
            )}

            {view === 'word' && (
                <motion.div key="word" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex flex-col justify-center text-center">
                    <Card theme={theme} className="py-12 px-8">
                        <button onClick={() => setView('home')} className="mb-8 text-[10px] font-sans uppercase tracking-widest opacity-40 hover:opacity-100">← Назад</button>
                        <h2 className="text-2xl font-medium mb-6">{dailyVerse.title}</h2>
                        <p className="text-lg italic opacity-80 mb-8 leading-relaxed">"{dailyVerse.text}"</p>
                        <div className="text-xs font-sans font-bold uppercase tracking-widest opacity-40 mb-12">{dailyVerse.source}</div>
                        <div className="mb-12 opacity-90 text-sm leading-relaxed max-w-xs mx-auto">{dailyVerse.thought}</div>
                        <button onClick={() => setShowFocusPrayerModal(true)} className={`w-full py-4 text-xs font-bold uppercase tracking-[0.2em] transition ${theme.button}`}>
                           {dailyVerse.action}
                        </button>
                    </Card>
                </motion.div>
            )}

            {view === 'prayer' && (
                <motion.div key="prayer" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
                    <div className="flex justify-between items-center px-1 mb-4">
                        <h2 className="text-xl">Мой список</h2>
                        <button onClick={() => setShowPrayerForm(!showPrayerForm)} className="text-2xl font-light hover:opacity-50 transition">+</button>
                    </div>
                    
                    {showPrayerForm && (
                        <Card theme={theme}>
                            <form onSubmit={addPrayer}>
                              <div className="flex flex-wrap gap-2 mb-6">
                                {PRAYER_CATEGORIES.map(cat => (
                                  <label key={cat.id} className="cursor-pointer">
                                    <input type="radio" name="category" value={cat.label} className="hidden peer" defaultChecked={cat.id === 'heart'} />
                                    <span className={`px-3 py-1 text-[10px] uppercase tracking-wider border border-current border-opacity-20 peer-checked:bg-stone-800 peer-checked:text-white transition`}>{cat.label}</span>
                                  </label>
                                ))}
                              </div>
                              <input name="title" placeholder="Тема..." className="w-full bg-transparent border-b border-current border-opacity-20 py-2 text-lg outline-none mb-4 font-serif placeholder:opacity-30" autoFocus required />
                              <textarea name="text" placeholder="Детали..." className="w-full bg-transparent border-b border-current border-opacity-20 py-2 h-20 text-sm outline-none resize-none mb-6 placeholder:opacity-30"/>
                              <div className="flex justify-between items-center">
                                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest cursor-pointer opacity-60"><input name="pub" type="checkbox" /> В единство</label>
                                  <button className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest ${theme.button}`}>Сохранить</button>
                              </div>
                            </form>
                        </Card>
                    )}

                    {myPrayers.map(p => {
                        const isExpanded = expandedPrayerId === p.id;
                        return (
                          <Card key={p.id} theme={theme} onClick={() => setExpandedPrayerId(isExpanded ? null : p.id)} className={`cursor-pointer group ${p.status === 'answered' ? 'opacity-60' : ''}`}>
                                <div className="flex justify-between items-start mb-2">
                                   <div className="text-[10px] font-sans font-bold uppercase tracking-wider opacity-50">{p.category}</div>
                                   <div className="text-[10px] opacity-30">{p.createdAt?.toDate().toLocaleDateString()}</div>
                                </div>
                                <h3 className="text-xl mb-2">{p.title}</h3>
                                {isExpanded && (
                                    <div className="mt-4 border-t border-current border-opacity-10 pt-4 cursor-default" onClick={e => e.stopPropagation()}>
                                       <p className="text-sm opacity-80 mb-6 whitespace-pre-wrap">{p.text}</p>
                                       {p.updates?.map((u, i) => <div key={i} className="text-sm opacity-60 mb-2 pl-2 border-l border-current border-opacity-20">{u.text}</div>)}
                                       <div className="flex gap-2 mt-4">
                                          <input value={prayerUpdateText} onChange={e => setPrayerUpdateText(e.target.value)} placeholder="Дополнить..." className="flex-1 bg-transparent border-b border-current border-opacity-20 text-sm outline-none" />
                                          <button onClick={() => { if(prayerUpdateText) { updateDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', p.id), { updates: arrayUnion({text: prayerUpdateText, createdAt: new Date().toISOString()}) }); setPrayerUpdateText(''); } }} className="text-[10px] uppercase font-bold">ОК</button>
                                       </div>
                                       <div className="flex justify-between mt-8">
                                          <button onClick={async () => { if(confirm('Удалить?')) deleteDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', p.id)) }} className="text-[10px] text-red-400 uppercase tracking-widest">Удалить</button>
                                          {p.status !== 'answered' && <button onClick={() => updateDoc(doc(db, 'artifacts', dbCollectionId, 'users', user.uid, 'prayers', p.id), {status: 'answered'})} className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Отметить ответ</button>}
                                       </div>
                                    </div>
                                )}
                          </Card>
                        );
                    })}
                </motion.div>
            )}

            {view === 'unity' && (
                <motion.div key="unity" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-4">
                     <h2 className="text-xl text-center mb-6">Единство</h2>
                     {publicPosts.map(post => {
                         const liked = post.likes?.includes(user.uid);
                         return (
                             <Card key={post.id} theme={theme}>
                                 <div className="flex justify-between mb-4 opacity-50 text-[10px] font-sans uppercase tracking-widest">
                                     <span>{post.authorName}</span>
                                     <span>{post.category}</span>
                                 </div>
                                 <p className="mb-6 text-base font-light leading-relaxed whitespace-pre-wrap">{post.text}</p>
                                 <button onClick={() => toggleLike(post.id, post.likes)} className={`w-full py-3 text-[10px] font-bold uppercase tracking-widest transition ${liked ? 'bg-stone-800 text-white' : 'border border-current border-opacity-20 hover:bg-stone-800/5'}`}>
                                     {liked ? "МЫ ВМЕСТЕ" : "ПОДДЕРЖАТЬ"} {post.likes?.length > 0 && `(${post.likes.length})`}
                                 </button>
                                 {isAdmin && <button onClick={() => deleteDoc(doc(db, 'artifacts', dbCollectionId, 'public', 'data', 'posts', post.id))} className="mt-2 text-[10px] text-red-400 w-full text-right">DEL</button>}
                             </Card>
                         );
                     })}
                </motion.div>
            )}

            {view === 'profile' && (
                <motion.div key="profile" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center py-12">
                    <div className="w-20 h-20 mx-auto border border-current border-opacity-20 rounded-full flex items-center justify-center text-3xl font-serif mb-6">
                        {user.displayName?.[0] || "A"}
                    </div>
                    <h2 className="text-2xl mb-2">{user.displayName || "Пилигрим"}</h2>
                    <p className="text-xs uppercase tracking-widest opacity-50 mb-12">{user.email || "Тихий режим"}</p>
                    <div className="space-y-4 max-w-xs mx-auto text-sm opacity-80">
                        <p>Цифровая келья для тишины и молитвы.</p>
                        <p>Никаких отвлекающих факторов.</p>
                        <p>Только суть.</p>
                    </div>
                </motion.div>
            )}

          </AnimatePresence>
        </main>

        <AudioPlayer currentTrack={currentTrack} isPlaying={isPlaying} togglePlay={() => setIsPlaying(!isPlaying)} nextTrack={() => {}} theme={theme} />

        {/* MODALS */}
        {showFocusPrayerModal && (
            <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFocusPrayerModal(false)}/>
                <div className={`relative w-full max-w-md p-8 ${theme.cardBg} shadow-2xl rounded-t-3xl sm:rounded-3xl`}>
                    <h3 className="text-center text-xl mb-6">Твой отклик</h3>
                    <form onSubmit={(e) => addPrayer(e, "Фокус", `Ответ на: ${dailyVerse.title}`)}>
                        <textarea name="text" className="w-full bg-transparent border border-current border-opacity-20 p-4 h-32 outline-none mb-6 text-lg placeholder:opacity-30 placeholder:italic" placeholder="Слова молитвы..." autoFocus/>
                        <div className="flex justify-between items-center">
                             <button type="button" onClick={() => setFocusPrayerPublic(!focusPrayerPublic)} className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                                {focusPrayerPublic ? "Видят все" : "Личное"}
                             </button>
                             <button className={`px-8 py-3 text-xs font-bold uppercase tracking-widest ${theme.activeButton}`}>Аминь</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        
        {showFeedbackModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFeedbackModal(false)}/>
                <div className={`relative w-full max-w-md p-8 ${theme.cardBg} shadow-xl rounded-2xl`}>
                    <h3 className="text-xl mb-4">Письмо</h3>
                    <form onSubmit={async (e) => { e.preventDefault(); await addDoc(collection(db, 'artifacts', dbCollectionId, 'public', 'data', 'feedback'), { text: e.target.elements.text.value, userId: user.uid, userName: user.displayName, createdAt: serverTimestamp() }); setShowFeedbackModal(false); alert('Отправлено'); }}>
                        <textarea name="text" className="w-full bg-transparent border border-current border-opacity-20 p-3 h-32 outline-none mb-6 text-sm" placeholder="Сообщение..."/>
                        <button className="w-full py-3 bg-stone-900 text-white text-xs font-bold uppercase tracking-widest">Отправить</button>
                    </form>
                </div>
            </div>
        )}

      </div>
    </>
  );
};

export default App;
