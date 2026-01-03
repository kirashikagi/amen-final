import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, query, orderBy, onSnapshot, 
  doc, updateDoc, deleteDoc, serverTimestamp, arrayUnion, arrayRemove 
} from 'firebase/firestore';
import { 
  Heart, Plus, Trash2, Menu, X, MessageSquarePlus, LogOut, Info, 
  Play, Pause, SkipForward, AlertTriangle, Volume2, VolumeX, 
  Edit2, MessageCircle, Send, ListMusic, User, ArrowRight, Lock, CheckCircle2, Mail, Loader2, Sparkles, Globe
} from 'lucide-react';

// --- 0. ЛОВУШКА ОШИБОК (Чтобы не было черного экрана) ---
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("CRASH:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-red-500 p-8 flex flex-col items-center justify-center text-center font-mono text-xs">
          <h2 className="text-xl font-bold mb-4 text-white">Application Error</h2>
          <div className="bg-red-900/20 p-4 rounded border border-red-500/50 mb-6 text-left w-full overflow-auto">
            {this.state.error?.toString()}
          </div>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-white text-black rounded-full font-bold">RELOAD</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- 1. КОНФИГУРАЦИЯ ---
const firebaseConfig = {
  apiKey: "AIzaSyAnW6B3CEoFEQy08WFGKIfNVzs3TevBPtc",
  authDomain: "amen-app-b0da2.firebaseapp.com",
  projectId: "amen-app-b0da2",
  storageBucket: "amen-app-b0da2.firebasestorage.app",
  messagingSenderId: "964550407508",
  appId: "1:964550407508:web:2d6a8c18fcf461af97c4c1"
};

// Безопасная инициализация
let app, auth, db;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (e) {
    console.error("Firebase init failed:", e);
}

const ADMIN_EMAILS = ["admin@amen.internal", "founder@amen.internal"];

// --- 2. ДАННЫЕ (SAFE MODE) ---

const THEMES = {
  day: { id: 'day', name: 'День', bg: '/day.jpg', text: 'text-gray-900', textDim: 'text-gray-600', card: 'bg-white/80', btn: 'bg-black text-white', border: 'border-gray-200' },
  dawn: { id: 'dawn', name: 'Рассвет', bg: '/dawn.jpg', text: 'text-stone-900', textDim: 'text-stone-600', card: 'bg-[#fffbf7]/80', btn: 'bg-stone-800 text-white', border: 'border-stone-200' },
  morning: { id: 'morning', name: 'Утро', bg: '/morning.jpg', text: 'text-slate-900', textDim: 'text-slate-600', card: 'bg-white/80', btn: 'bg-slate-800 text-white', border: 'border-slate-200' },
  sunset: { id: 'sunset', name: 'Закат', bg: '/sunset.jpg', text: 'text-amber-950', textDim: 'text-amber-800', card: 'bg-orange-50/80', btn: 'bg-amber-950 text-white', border: 'border-amber-900/10' },
  evening: { id: 'evening', name: 'Вечер', bg: '/evening.jpg', text: 'text-white', textDim: 'text-indigo-200', card: 'bg-slate-900/60', btn: 'bg-white/20 text-white', border: 'border-white/10' },
  midnight: { id: 'midnight', name: 'Полночь', bg: '/midnight.jpg', text: 'text-gray-100', textDim: 'text-gray-400', card: 'bg-black/60', btn: 'bg-white/90 text-black', border: 'border-white/10' },
};

const TRACKS = [
  { id: 1, title: "Beautiful Worship", url: "/music/beautiful-worship.mp3" },
  { id: 2, title: "Evening Prayer", url: "/music/evening-prayer.mp3" },
  { id: 3, title: "Gospel Worship", url: "/music/gospel-worship.mp3" },
  { id: 4, title: "Gymnopédie", url: "/music/gymnopedie.mp3" },
  { id: 5, title: "Holy Grace", url: "/music/holygrace.mp3" },
  { id: 6, title: "Peace", url: "/music/peace.mp3" },
  { id: 7, title: "Prayer", url: "/music/prayer.mp3" },
  { id: 8, title: "Sunrise", url: "/music/sunrise.mp3" },
  { id: 9, title: "Worship", url: "/music/worship.mp3" }
];

// Безопасный список данных
const JANUARY_FOCUS = [
  { title: "Начало Пути", verse: "В начале сотворил Бог небо и землю.", desc: "Всё новое начинается с Бога. Посвяти этот год Ему.", action: "Напиши цель." },
  { title: "Свет", verse: "И свет во тьме светит.", desc: "Вера разгоняет страх.", action: "Зажги свечу." },
  { title: "Мир", verse: "Мир оставляю вам.", desc: "Не тревожься.", action: "Тишина 5 минут." },
  { title: "Сила", verse: "Сила в немощи.", desc: "Слабость — место для силы.", action: "Прими слабость." },
  { title: "Любовь", verse: "Бог есть любовь.", desc: "Любовь — это действие.", action: "Доброе дело." },
  { title: "Прощение", verse: "Прощайте.", desc: "Обида — это груз.", action: "Прости." },
  { title: "Чудо", verse: "Слава Богу.", desc: "Чудо рядом.", action: "Поздравь." },
  { title: "Мудрость", verse: "Начало мудрости.", desc: "Ищи совета.", action: "Читай Притчи." },
  { title: "Доверие", verse: "Надейся на Господа.", desc: "Отпусти контроль.", action: "Доверяй." },
  { title: "Спасибо", verse: "За все благодарите.", desc: "Благодарность — ключ.", action: "Скажи спасибо." },
  { title: "Терпение", verse: "Претерпевший спасется.", desc: "Не спеши.", action: "Жди." },
  { title: "Слово", verse: "Слово Твое — светильник.", desc: "Истина освобождает.", action: "Читай." },
  { title: "Молитва", verse: "Непрестанно молитесь.", desc: "Говори с Ним.", action: "Молись." },
  { title: "Радость", verse: "Радуйтесь всегда.", desc: "Радость — это выбор.", action: "Улыбнись." },
  { title: "Смирение", verse: "Бог гордым противится.", desc: "Будь прост.", action: "Смирись." },
  { title: "Вера", verse: "Вера есть осуществление.", desc: "Видь невидимое.", action: "Верь." },
  { title: "Исцеление", verse: "Ранами Его.", desc: "Будь здоров.", action: "Проси здоровья." },
  { title: "Щедрость", verse: "Блаженнее давать.", desc: "Давай щедро.", action: "Подари." },
  { title: "Семья", verse: "Почитай родителей.", desc: "Люби близких.", action: "Позвони." },
  { title: "Дружба", verse: "Друг любит всегда.", desc: "Будь верным другом.", action: "Напиши другу." },
  { title: "Труд", verse: "Делайте от души.", desc: "Труд свят.", action: "Работа." },
  { title: "Покой", verse: "Остановитесь.", desc: "Найди покой.", action: "Отдохни." },
  { title: "Истина", verse: "Говорите истину.", desc: "Не лги.", action: "Правда." },
  { title: "Чистота", verse: "Блаженны чистые.", desc: "Очисти сердце.", action: "Чистота." },
  { title: "Слух", verse: "Слушай Бога.", desc: "Он говорит.", action: "Тишина." },
  { title: "Надежда", verse: "Надежда не постыжает.", desc: "Верь в лучшее.", action: "Надейся." },
  { title: "Смелость", verse: "Не бойся.", desc: "Бог с тобой.", action: "Иди вперед." },
  { title: "Служение", verse: "Служите друг другу.", desc: "Помогай.", action: "Помоги." },
  { title: "Единство", verse: "Будьте едино.", desc: "Мы вместе.", action: "Объединяйся." },
  { title: "Новое", verse: "Творю все новое.", desc: "Начни заново.", action: "Начни." },
  { title: "Вечность", verse: "Бог вечен.", desc: "Мы вечны.", action: "Славь Его." },
];

// --- 3. КОМПОНЕНТЫ ---

function MusicPlayer({ theme }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  
  // Safe track access
  const currentTrack = TRACKS[currentTrackIndex] || TRACKS[0];

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.5;
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(e => console.log("Audio Error:", e));
    setIsPlaying(!isPlaying);
  };

  const selectTrack = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setShowPlaylist(false);
  };

  return (
    <>
      <div className={`fixed bottom-8 right-6 z-40 flex items-center gap-2 p-2 rounded-full shadow-2xl backdrop-blur-xl border ${theme.border} ${theme.card}`}>
        <audio 
          ref={audioRef} 
          src={currentTrack.url}
          autoPlay={isPlaying}
          onEnded={() => selectTrack((currentTrackIndex + 1) % TRACKS.length)}
        />
        <button onClick={togglePlay} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${theme.btn}`}>
          {isPlaying ? <Pause size={18}/> : <Play size={18} className="ml-1"/>}
        </button>
        {isPlaying && (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 pr-2">
              <div className="flex flex-col w-32">
                  <span className={`text-[10px] font-medium uppercase opacity-60 ${theme.text}`}>Играет</span>
                  <span className={`text-xs truncate font-medium ${theme.text}`}>{currentTrack.title}</span>
              </div>
              <button onClick={() => setShowPlaylist(!showPlaylist)} className={`p-2 opacity-70 hover:opacity-100 ${theme.text}`}><ListMusic size={18}/></button>
              <button onClick={() => selectTrack((currentTrackIndex + 1) % TRACKS.length)} className={`p-1 opacity-70 hover:opacity-100 ${theme.text}`}><SkipForward size={18}/></button>
          </div>
        )}
      </div>
      <AnimatePresence>
        {showPlaylist && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPlaylist(false)} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className={`fixed bottom-24 right-6 z-50 w-64 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl border ${theme.border} ${theme.card}`}>
                <div className={`p-3 max-h-64 overflow-y-auto ${theme.text}`}>
                {TRACKS.map((track, i) => (
                    <button key={i} onClick={() => selectTrack(i)} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium truncate mb-1 transition-colors ${i === currentTrackIndex ? 'bg-black/10 opacity-100' : 'opacity-60 hover:opacity-100 hover:bg-black/5'}`}>
                    {track.title}
                    </button>
                ))}
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// --- 4. ОСНОВНАЯ ЛОГИКА ---

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prayers, setPrayers] = useState([]);
  const [activeTab, setActiveTab] = useState('flow');
  const [feedFilter, setFeedFilter] = useState('all'); 
  const [currentThemeId, setCurrentThemeId] = useState('day');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [commentingId, setCommentingId] = useState(null);

  const theme = THEMES[currentThemeId] || THEMES.day;
  
  // SAFE DATA FETCHING (чтобы не было крашей)
  const today = new Date();
  const dayNum = today.getDate(); // 1-31
  // Используем модуль, чтобы всегда попадать в пределы массива
  const safeIndex = (dayNum - 1) % JANUARY_FOCUS.length;
  // Защита от undefined
  const currentFocus = JANUARY_FOCUS[safeIndex] || JANUARY_FOCUS[0]; 

  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, u => {
        setUser(u);
        setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    try {
        const q = query(collection(db, "prayers"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, 
            s => setPrayers(s.docs.map(d => ({id: d.id, ...d.data()}))),
            e => console.error("Firestore Error:", e)
        );
        return unsub;
    } catch(e) { console.error(e) }
  }, [user]);

  const handleAdd = async (text, type, privacy, isAnon) => {
    if(!text.trim()) return;
    await addDoc(collection(db, "prayers"), {
        text, type, privacy, 
        userId: user.uid,
        authorName: isAnon ? "Аноним" : (user.displayName || user.email?.split('@')[0] || "Путник"),
        createdAt: serverTimestamp(),
        likes: [], comments: [], amens: 0
    });
  };

  const toggleLike = async (id, likes) => {
    if(!user) return;
    const ref = doc(db, "prayers", id);
    if(likes.includes(user.uid)) await updateDoc(ref, { likes: arrayRemove(user.uid), amens: likes.length - 1 });
    else await updateDoc(ref, { likes: arrayUnion(user.uid), amens: likes.length + 1 });
  };

  const deletePrayer = async (id) => {
    if(confirm("Удалить?")) await deleteDoc(doc(db, "prayers", id));
  };

  const saveEdit = async (id, newText) => {
    await updateDoc(doc(db, "prayers", id), { text: newText });
    setEditingId(null);
  };

  const addComment = async (id, text) => {
    if(!text.trim()) return;
    const comment = { text, author: user.displayName || "Путник", uid: user.uid, createdAt: new Date().toISOString() };
    await updateDoc(doc(db, "prayers", id), { comments: arrayUnion(comment) });
  };

  // ЭКРАН ЗАГРУЗКИ (Показываем пока не знаем статус юзера)
  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white opacity-50" size={32} /></div>;
  }

  // ЭКРАН ВХОДА (Если юзер не вошел)
  if (!user) {
      return <AuthScreen theme={theme} onShowRules={() => setShowDisclaimer(true)} />;
  }

  const filteredPrayers = prayers.filter(p => {
    if (feedFilter === 'diary') return p.userId === user.uid;
    return p.privacy === 'public';
  });

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black font-sans text-base transition-colors duration-700">
      {/* ФОН */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-black">
        <motion.img 
            key={theme.id} initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 1}} 
            src={theme.bg} className="w-full h-full object-cover opacity-90" 
            onError={(e) => e.target.style.display = 'none'} 
        />
        <div className="absolute inset-0 bg-black/10" /> 
      </div>

      <header className={`fixed top-0 left-0 right-0 z-50 px-6 pt-16 pb-4 flex justify-between items-center ${theme.text}`}>
         <div onClick={()=>setMenuOpen(true)} className="flex items-center gap-2 cursor-pointer">
            <h1 className="text-3xl font-light tracking-widest uppercase opacity-90">Amen</h1>
         </div>
         <button onClick={() => setMenuOpen(true)} className={`p-3 rounded-full backdrop-blur-xl border border-white/10 shadow-sm ${theme.border} ${theme.card}`}>
            <Menu size={22} strokeWidth={1.5} />
         </button>
      </header>

      <AnimatePresence>
        {menuOpen && (
            <motion.div initial={{x: '100%'}} animate={{x: 0}} exit={{x: '100%'}} transition={{type:'spring', damping:25}} className={`fixed inset-0 z-[60] backdrop-blur-3xl bg-black/60 p-8 flex flex-col justify-center gap-4 ${theme.text}`}>
                <button onClick={()=>setMenuOpen(false)} className="absolute top-16 right-6 p-2 rounded-full border border-white/20"><X size={28}/></button>
                <h2 className="text-4xl font-thin mb-12 opacity-50 tracking-wider">Меню</h2>
                <MenuLink label="Поток" onClick={()=>{setActiveTab('flow'); setMenuOpen(false)}} />
                <MenuLink label="Личный Дневник" onClick={()=>{setActiveTab('feed'); setFeedFilter('diary'); setMenuOpen(false)}} />
                <MenuLink label="Профиль" onClick={()=>{setActiveTab('profile'); setMenuOpen(false)}} />
                <div className="mt-12">
                    <button onClick={()=>setShowAddModal(true)} className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 ${theme.btn}`}>
                        <Plus size={18}/> Создать запись
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 pt-32 pb-32 px-4 w-full max-w-3xl mx-auto min-h-screen">
         
         {activeTab === 'flow' && (
             <div className="space-y-12">
                 {/* КАРТОЧКА ФОКУСА (Safe Render) */}
                 {currentFocus && (
                     <motion.div initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} className={`p-8 rounded-[2rem] backdrop-blur-3xl shadow-xl border ${theme.card} ${theme.border} ${theme.text}`}>
                        <div className="flex justify-between items-start mb-8">
                            <span className="text-xs font-bold uppercase tracking-widest opacity-50 border-b border-current pb-1">
                                {today.toLocaleDateString('ru-RU', {day: 'numeric', month: 'long'})}
                            </span>
                        </div>
                        <h2 className="text-3xl font-light mb-8 leading-tight">{currentFocus.title}</h2>
                        <div className="mb-10 pl-6 border-l border-current opacity-70">
                            <p className="font-light italic text-xl leading-relaxed">"{currentFocus.verse}"</p>
                        </div>
                        <p className="text-lg font-light opacity-90 mb-10 leading-relaxed">{currentFocus.desc}</p>
                        <button onClick={() => setShowAddModal(true)} className={`w-full text-left p-6 rounded-2xl border border-current/10 bg-current/5 hover:bg-current/10 transition-colors group`}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-50">Действие</h3>
                                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                            </div>
                            <p className="font-normal text-lg">{currentFocus.action}</p>
                        </button>
                     </motion.div>
                 )}

                 <div className="space-y-8">
                    <h2 className={`text-2xl font-light tracking-wide px-2 opacity-80 ${theme.text}`}>Стена Единства</h2>
                    {publicPrayers.length === 0 && <div className={`text-center py-10 opacity-40 ${theme.text}`}>Здесь пока тихо...</div>}
                    {publicPrayers.map(p => (
                        <PrayerCard key={p.id} prayer={p} user={user} isAdmin={isAdmin} theme={theme} onLike={toggleLike} onDelete={deletePrayer} onEdit={saveEdit} onComment={addComment} activeCommentId={commentingId} setCommentingId={setCommentingId} activeEditId={editingId} setEditingId={setEditingId} />
                    ))}
                 </div>
             </div>
         )}

         {activeTab === 'feed' && feedFilter === 'diary' && (
            <div className="space-y-8">
                <button onClick={()=>setShowAddModal(true)} className={`w-full py-6 rounded-[2rem] border border-white/20 shadow-xl flex items-center justify-center gap-3 font-medium text-lg transition-transform active:scale-95 ${theme.card} ${theme.text}`}>
                    <Plus size={24} /> Создать запись
                </button>
                <h2 className={`text-2xl font-light tracking-wide px-2 opacity-80 ${theme.text}`}>Мой Дневник</h2>
                {filteredPrayers.length === 0 && <div className={`text-center py-20 opacity-40 ${theme.text}`}>Ваш дневник пуст.</div>}
                {filteredPrayers.map(p => (
                    <PrayerCard key={p.id} prayer={p} user={user} isAdmin={isAdmin} theme={theme} onLike={toggleLike} onDelete={deletePrayer} onEdit={saveEdit} onComment={addComment} activeCommentId={commentingId} setCommentingId={setCommentingId} activeEditId={editingId} setEditingId={setEditingId} />
                ))}
            </div>
         )}

         {activeTab === 'profile' && (
             <div className="space-y-6">
                <div className={`p-10 rounded-[2rem] text-center backdrop-blur-3xl border shadow-xl ${theme.card} ${theme.border}`}>
                    <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center text-5xl font-light mb-8 shadow-inner ${theme.btn}`}>
                        {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || <User strokeWidth={1}/>}
                    </div>
                    <h2 className={`text-2xl font-normal mb-2 ${theme.text}`}>{user.displayName || "Путник"}</h2>
                    
                    <div className="grid grid-cols-3 gap-4 mb-16 mt-10">
                        {Object.values(THEMES).map(t => (
                            <button key={t.id} onClick={()=>setCurrentThemeId(t.id)} className={`h-16 rounded-2xl border transition-all ${currentThemeId===t.id ? 'border-current scale-105 opacity-100' : 'border-transparent opacity-40'}`} style={{backgroundImage: `url(${t.bg})`, backgroundSize: 'cover'}} />
                        ))}
                    </div>

                    <div className="space-y-4">
                        <button onClick={()=>setShowFeedback(true)} className={`w-full p-5 rounded-2xl flex items-center justify-center gap-3 font-normal border border-current/10 hover:bg-white/5 transition-colors ${theme.text}`}>
                            <MessageSquarePlus size={20} strokeWidth={1.5}/> Написать автору
                        </button>
                        <button onClick={()=>auth.signOut()} className="w-full p-5 rounded-2xl flex items-center justify-center gap-3 font-normal text-red-400 hover:bg-red-500/5 transition-colors">
                            <LogOut size={20} strokeWidth={1.5}/> Выйти
                        </button>
                    </div>
                </div>
             </div>
         )}
      </main>

      <MusicPlayer theme={theme} />
      <AddModal isOpen={showAddModal} onClose={()=>setShowAddModal(false)} onAdd={handleAdd} theme={theme} />
      <FeedbackModal isOpen={showFeedback} onClose={()=>setShowFeedback(false)} theme={theme} />
      <RulesModal isOpen={showDisclaimer} onClose={()=>setShowDisclaimer(false)} theme={theme} />
    </div>
  );
}

// --- AUTH SCREEN (Login by Username) ---
function AuthScreen({ theme, onShowRules }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        // Добавляем технический домен, так как Firebase требует email
        const fakeEmail = `${username.toLowerCase().replace(/\s/g, '')}@amen.internal`;
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, fakeEmail, password);
            } else {
                const cred = await createUserWithEmailAndPassword(auth, fakeEmail, password);
                await updateProfile(cred.user, { displayName: username });
            }
        } catch (err) {
            if (err.code === 'auth/invalid-credential') setError('Неверный логин или пароль');
            else if (err.code === 'auth/email-already-in-use') setError('Логин занят');
            else if (err.code === 'auth/weak-password') setError('Пароль слишком простой');
            else setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-black text-white">
            <div className="absolute inset-0 z-0">
                <img src="/dawn.jpg" className="w-full h-full object-cover opacity-60" onError={(e) => e.target.style.display = 'none'} />
                <div className="absolute inset-0 bg-black/30" />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center w-full max-w-sm">
                <h1 className="text-7xl font-thin mb-4 tracking-[0.2em] uppercase opacity-90">Amen</h1>
                <p className="text-sm font-light mb-12 opacity-60 tracking-[0.3em] uppercase">Пространство тишины</p>
                <form onSubmit={handleAuth} className="w-full space-y-4 backdrop-blur-2xl bg-white/10 p-8 rounded-[2rem] border border-white/10 shadow-2xl">
                    <input type="text" placeholder="Логин" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-4 text-white outline-none focus:border-white/30"/>
                    <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-4 text-white outline-none focus:border-white/30"/>
                    {error && <p className="text-red-300 text-xs mt-2">{error}</p>}
                    <button className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm uppercase tracking-widest hover:bg-gray-200 transition-all mt-6 shadow-lg">
                        {isLogin ? 'Войти' : 'Создать'}
                    </button>
                </form>
                <div className="mt-8 flex flex-col gap-4 text-xs opacity-60 uppercase tracking-widest">
                    <button onClick={() => setIsLogin(!isLogin)} className="hover:opacity-100 transition-opacity">
                        {isLogin ? 'Нет аккаунта? Создать' : 'Уже есть? Войти'}
                    </button>
                    <div className="w-10 h-px bg-white/20 mx-auto my-2"/>
                    <button onClick={() => signInAnonymously(auth)} className="hover:opacity-100 transition-opacity">Войти как гость</button>
                </div>
            </div>
        </div>
    );
}

// --- SUB COMPONENTS ---

function MenuLink({ label, onClick }) { return <button onClick={onClick} className="w-full text-left p-5 text-2xl font-thin hover:pl-8 transition-all border-b border-white/5 tracking-wide">{label}</button> }

function PrayerCard({ prayer, user, isAdmin, theme, onLike, onDelete, onEdit, onComment, activeCommentId, setCommentingId, activeEditId, setEditingId }) {
    const isEditing = activeEditId === prayer.id;
    const isCommenting = activeCommentId === prayer.id;
    const [editText, setEditText] = useState(prayer.text);
    const [commentText, setCommentText] = useState('');

    return (
        <motion.div initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} className={`p-8 rounded-[2rem] border backdrop-blur-3xl shadow-lg ${theme.card} ${theme.border}`}>
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-sm ${theme.btn}`}>{prayer.authorName?.[0]?.toUpperCase() || "A"}</div>
                    <div>
                        <h3 className={`font-medium text-sm ${theme.text}`}>{prayer.authorName}</h3>
                        <div className="flex gap-2 text-[10px] opacity-40 uppercase font-bold tracking-widest mt-1"><span>{prayer.type === 'miracle' ? 'Чудо' : 'Молитва'}</span></div>
                    </div>
                </div>
                <div className="flex gap-4 opacity-40">
                    {prayer.userId === user.uid && <button onClick={()=>{setEditingId(isEditing ? null : prayer.id); setEditText(prayer.text)}} className={`${theme.text} hover:opacity-100`}><Edit2 size={16} strokeWidth={1.5}/></button>}
                    {(prayer.userId === user.uid || isAdmin) && <button onClick={()=>onDelete(prayer.id)} className="text-red-400 hover:text-red-500 hover:opacity-100"><Trash2 size={16} strokeWidth={1.5}/></button>}
                </div>
            </div>
            {isEditing ? (
                <div className="mb-4">
                    <textarea value={editText} onChange={e=>setEditText(e.target.value)} className={`w-full p-4 rounded-xl bg-black/5 outline-none ${theme.text}`} rows={4}/>
                    <button onClick={()=>onEdit(prayer.id, editText)} className="mt-3 px-6 py-2 bg-green-500/10 text-green-600 rounded-lg text-xs font-bold uppercase tracking-widest">Сохранить</button>
                </div>
            ) : (<p className={`text-lg font-light leading-relaxed mb-8 whitespace-pre-wrap ${theme.textDim || theme.text}`}>{prayer.text}</p>)}
            <div className="flex gap-6 pt-6 border-t border-current/10">
                <button onClick={()=>onLike(prayer.id, prayer.likes||[])} className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all active:scale-95 border border-transparent ${prayer.likes?.includes(user.uid) ? 'bg-rose-500/10 text-rose-500' : 'hover:bg-black/5 opacity-50'} ${theme.text}`}><Heart size={18} strokeWidth={1.5} className={prayer.likes?.includes(user.uid) ? "fill-current" : ""}/><span className="text-xs font-medium">{prayer.amens || 0}</span></button>
                <button onClick={()=>setCommentingId(isCommenting ? null : prayer.id)} className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all active:scale-95 border border-transparent hover:bg-black/5 opacity-50 ${theme.text}`}><MessageCircle size={18} strokeWidth={1.5}/><span className="text-xs font-medium">{prayer.comments?.length || 0}</span></button>
            </div>
            <AnimatePresence>
                {isCommenting && (
                    <motion.div initial={{height:0, opacity:0}} animate={{height:'auto', opacity:1}} exit={{height:0, opacity:0}} className="overflow-hidden mt-6 pt-6 border-t border-current/5">
                        <div className="flex gap-4 mb-6">
                            <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Написать..." className={`flex-1 bg-transparent border-b border-current/20 outline-none pb-2 text-sm ${theme.text} placeholder:opacity-30 font-light`}/>
                            <button onClick={()=>{onComment(prayer.id, commentText); setCommentText('')}} disabled={!commentText.trim()} className={`opacity-40 hover:opacity-100 ${theme.text}`}><Send size={18} strokeWidth={1.5}/></button>
                        </div>
                        <div className="space-y-4 pl-2">
                            {prayer.comments?.map((c, i) => (
                                <div key={i} className={`text-sm ${theme.text}`}><span className="font-bold opacity-50 block mb-1 text-xs">{c.author}</span><span className="opacity-80 font-light">{c.text}</span></div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function AddModal({ isOpen, onClose, onAdd, theme }) {
    const [text, setText] = useState('');
    const [type, setType] = useState('prayer');
    const [privacy, setPrivacy] = useState('public');
    const [anon, setAnon] = useState(false);
    const [status, setStatus] = useState('idle');
    if(!isOpen) return null;
    const handleSubmit = async () => {
        setStatus('sending');
        setTimeout(async () => {
            await onAdd(text, type, privacy, anon);
            setStatus('success');
            setTimeout(() => { setStatus('idle'); setText(''); onClose(); }, 2000);
        }, 1500);
    };
    return (
        <>
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md" onClick={onClose}/>
        <motion.div initial={{y:'100%'}} animate={{y:0}} className={`fixed bottom-0 left-0 right-0 z-[70] rounded-t-[2.5rem] p-10 border-t border-white/20 shadow-2xl ${theme.card} ${theme.text}`}>
            {status === 'success' ? (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                    <motion.div initial={{scale:0}} animate={{scale:1}} className="mb-4 text-green-500"><CheckCircle2 size={64} strokeWidth={1}/></motion.div>
                    <h3 className="text-2xl font-thin tracking-widest uppercase">Услышано</h3>
                </div>
            ) : status === 'sending' ? (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50 mb-4"/>
                    <p className="text-sm uppercase tracking-widest opacity-50">Отправляем...</p>
                </div>
            ) : (
                <>
                    <h3 className="text-xl font-light mb-8 tracking-widest uppercase opacity-70">Новая запись</h3>
                    <div className="flex gap-4 mb-6 text-sm">
                        <button onClick={()=>setType('prayer')} className={`flex-1 py-4 rounded-2xl border transition-colors ${type==='prayer' ? 'border-current opacity-100 font-medium' : 'border-current/10 opacity-40'}`}>Молитва</button>
                        <button onClick={()=>setType('miracle')} className={`flex-1 py-4 rounded-2xl border transition-colors ${type==='miracle' ? 'border-current opacity-100 font-medium' : 'border-current/10 opacity-40'}`}>Чудо</button>
                    </div>
                    <div className="flex gap-4 mb-8 text-xs">
                        <button onClick={()=>setPrivacy('public')} className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-xl border ${privacy==='public' ? 'bg-current/5 border-current/20' : 'border-transparent opacity-30'}`}>На стену</button>
                        <button onClick={()=>setPrivacy('private')} className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-xl border ${privacy==='private' ? 'bg-current/5 border-current/20' : 'border-transparent opacity-30'}`}>В дневник</button>
                    </div>
                    <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="О чем болит сердце?" className="w-full h-40 bg-transparent rounded-xl p-0 resize-none outline-none text-xl font-light mb-8 placeholder:opacity-20 border-none"/>
                    <div className="flex justify-between items-center border-t border-current/10 pt-6">
                        <button onClick={()=>setAnon(!anon)} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs transition-opacity ${anon ? 'opacity-100' : 'opacity-30'}`}>{anon ? "Анонимно" : "От имени"}</button>
                        <button onClick={handleSubmit} disabled={!text.trim()} className={`px-10 py-4 rounded-2xl font-bold shadow-lg text-sm tracking-widest uppercase ${theme.btn} disabled:opacity-50`}>Amen</button>
                    </div>
                </>
            )}
        </motion.div>
        </>
    );
}

function FeedbackModal({ isOpen, onClose, theme }) {
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}/>
            <div className={`relative z-10 p-10 rounded-[2.5rem] w-full max-w-sm ${theme.card} ${theme.text} ${theme.border} border shadow-2xl`}>
                <h3 className="text-xl font-light mb-6">Написать автору</h3>
                <textarea placeholder="Ваше сообщение..." className="w-full h-40 bg-transparent border border-current/20 rounded-2xl p-5 mb-6 resize-none outline-none placeholder:opacity-30 font-light text-lg"/>
                <button onClick={()=>{alert("Отправлено!"); onClose();}} className={`w-full py-4 rounded-2xl font-bold shadow-lg tracking-widest uppercase text-sm ${theme.btn}`}>Отправить</button>
            </div>
        </div>
    );
}

function RulesModal({ isOpen, onClose, theme }) {
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}/>
            <div className={`relative z-10 p-10 rounded-[2.5rem] w-full max-w-sm max-h-[80vh] overflow-y-auto ${theme.card} ${theme.text} ${theme.border} border shadow-2xl`}>
                <h3 className="text-xl font-light mb-8 flex items-center gap-3"><Info size={24} strokeWidth={1}/> Правила</h3>
                <div className="space-y-6 text-sm opacity-80 leading-loose font-light">
                    <p><strong>Дисклеймер</strong><br/>Приложение создано для духовной поддержки. Мы не несем ответственности за контент.</p>
                    <p><strong>Уважение</strong><br/>Оскорбления и ненависть запрещены.</p>
                    <p><strong>Приватность</strong><br/>Мы не передаем данные третьим лицам.</p>
                </div>
                <button onClick={onClose} className={`w-full mt-10 py-4 rounded-2xl font-bold tracking-widest uppercase text-sm ${theme.btn}`}>Принимаю</button>
            </div>
        </div>
    );
}

// Экспорт с Error Boundary
export default function AppBoundary() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return <div className="min-h-screen flex flex-col items-center justify-center bg-black text-red-500 p-8 text-center"><h2 className="text-2xl mb-4 font-bold">ОШИБКА</h2><pre className="text-xs bg-gray-900 p-4 rounded mb-4 overflow-auto max-w-full">{this.state.error?.toString()}</pre><button onClick={()=>window.location.reload()} className="bg-white text-black px-6 py-2 rounded-full">Перезагрузить</button></div>;
    }
    return this.props.children;
  }
}

// Обёртка над AppContent
function AppContent() {
    return <App />
}


