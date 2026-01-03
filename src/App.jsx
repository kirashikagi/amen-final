import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signOut
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, query, orderBy, onSnapshot, 
  doc, updateDoc, deleteDoc, serverTimestamp, arrayUnion, arrayRemove 
} from 'firebase/firestore';
import { 
  BookOpen, Heart, User, Plus, Trash2, Sparkles, Shield, 
  Menu, X, MessageSquarePlus, LogOut, Users, Star, Info, 
  Play, Pause, SkipForward, AlertTriangle, Volume2, VolumeX, 
  Lock, Globe, Edit2, MessageCircle, Send
} from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyAnW6B3CEoFEQy08WFGKIfNVzs3TevBPtc",
  authDomain: "amen-app-b0da2.firebaseapp.com",
  projectId: "amen-app-b0da2",
  storageBucket: "amen-app-b0da2.firebasestorage.app",
  messagingSenderId: "964550407508",
  appId: "1:964550407508:web:2d6a8c18fcf461af97c4c1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAILS = ["admin@amen.com", "founder@amen.com"];

const THEMES = {
  dawn: { id: 'dawn', name: 'Рассвет', bg: '/dawn.jpg', text: 'text-stone-900', accent: 'text-orange-600', card: 'bg-white/40', btn: 'bg-stone-900/80 text-white', border: 'border-white/40' },
  morning: { id: 'morning', name: 'Утро', bg: '/morning.jpg', text: 'text-gray-900', accent: 'text-sky-600', card: 'bg-white/50', btn: 'bg-sky-900/80 text-white', border: 'border-white/50' },
  day: { id: 'day', name: 'День', bg: '/day.jpg', text: 'text-slate-900', accent: 'text-blue-600', card: 'bg-white/60', btn: 'bg-black/80 text-white', border: 'border-white/60' },
  sunset: { id: 'sunset', name: 'Закат', bg: '/sunset.jpg', text: 'text-amber-950', accent: 'text-red-600', card: 'bg-orange-50/40', btn: 'bg-amber-950/80 text-white', border: 'border-amber-900/10' },
  evening: { id: 'evening', name: 'Вечер', bg: '/evening.jpg', text: 'text-white', accent: 'text-purple-300', card: 'bg-slate-900/40', btn: 'bg-white/20 text-white', border: 'border-white/10' },
  midnight: { id: 'midnight', name: 'Полночь', bg: '/midnight.jpg', text: 'text-gray-200', accent: 'text-indigo-400', card: 'bg-black/40', btn: 'bg-white/10 text-white', border: 'border-white/10' },
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

const JANUARY_FOCUS = [
  { day: 1, title: "Начало Пути", verse: "В начале сотворил Бог небо и землю.", desc: "Всё новое начинается с Бога. Посвяти этот год Ему.", action: "Напиши одну цель на год." },
  { day: 2, title: "Свет во тьме", verse: "И свет во тьме светит, и тьма не объяла его.", desc: "Даже маленькая искра веры разгоняет страх.", action: "Зажги свечу и помолись." },
  { day: 3, title: "Мир в сердце", verse: "Мир оставляю вам, мир Мой даю вам.", desc: "Не тревожься о завтрашнем дне.", action: "Посиди 5 минут в тишине." },
  { day: 4, title: "Сила в слабости", verse: "Сила Моя совершается в немощи.", desc: "Твоя слабость — место для Божьей силы.", action: "Признайся в одной слабости Богу." },
  { day: 5, title: "Любовь", verse: "Бог есть любовь.", desc: "Любовь — это действие, а не чувство.", action: "Сделай доброе дело тайно." },
  { day: 6, title: "Прощение", verse: "Прощайте, и прощены будете.", desc: "Обида — это яд, который ты пьешь сам.", action: "Напиши имя того, кого нужно простить." },
  { day: 7, title: "Рождество", verse: "Слава в вышних Богу.", desc: "Чудо приходит, когда его ждут.", action: "Поздравь близкого человека." },
  { day: 8, title: "Мудрость", verse: "Начало мудрости — страх Господень.", desc: "Ищи совета свыше, прежде чем решать.", action: "Прочти главу Притч." },
  { day: 9, title: "Доверие", verse: "Надейся на Господа всем сердцем.", desc: "Отпусти контроль.", action: "Скажи вслух: Я доверяю Тебе." },
  { day: 10, title: "Благодарность", verse: "За все благодарите.", desc: "Благодарность открывает двери чудесам.", action: "Напиши 3 вещи, за которые благодарен." },
  { day: 11, title: "Терпение", verse: "Претерпевший же до конца спасется.", desc: "Не торопи время.", action: "Подожди с ответом в гневе." },
  { day: 12, title: "Слово", verse: "Слово Твое — светильник ноге моей.", desc: "Библия — это карта жизни.", action: "Выучи один стих." },
  { day: 13, title: "Молитва", verse: "Непрестанно молитесь.", desc: "Разговор с Отцом меняет реальность.", action: "Молись за врагов." },
  { day: 14, title: "Радость", verse: "Радуйтесь всегда в Господе.", desc: "Радость — это выбор, а не реакция.", action: "Улыбнись прохожему." },
  { day: 15, title: "Смирение", verse: "Бог гордым противится.", desc: "Признать ошибку — признак силы.", action: "Попроси прощения первым." },
  { day: 16, title: "Вера", verse: "Вера есть осуществление ожидаемого.", desc: "Видь невидимое.", action: "Сделай шаг веры сегодня." },
  { day: 17, title: "Исцеление", verse: "Ранами Его мы исцелились.", desc: "Бог хочет твоей целостности.", action: "Помолись о больном." },
  { day: 18, title: "Щедрость", verse: "Блаженнее давать, нежели принимать.", desc: "Рука дающего не оскудеет.", action: "Пожертвуй на благое дело." },
  { day: 19, title: "Семья", verse: "Почитай отца твоего и мать.", desc: "Семья — твоя первая церковь.", action: "Позвони родителям." },
  { day: 20, title: "Дружба", verse: "Друг любит во всякое время.", desc: "Будь тем другом, которого ищешь.", action: "Напиши старому другу." },
  { day: 21, title: "Труд", verse: "Все, что делаете, делайте от души.", desc: "Твой труд — это поклонение.", action: "Сделай работу превосходно." },
  { day: 22, title: "Отдых", verse: "Остановитесь и познайте, что Я — Бог.", desc: "Покой — это оружие.", action: "Выключи телефон на час." },
  { day: 23, title: "Честность", verse: "Отвергнув ложь, говорите истину.", desc: "Правда делает свободным.", action: "Не солги сегодня ни разу." },
  { day: 24, title: "Чистота", verse: "Блаженны чистые сердцем.", desc: "Береги глаза и уши.", action: "Удали лишнее из соцсетей." },
  { day: 25, title: "Послушание", verse: "Послушание лучше жертвы.", desc: "Слушать Бога важнее, чем делать для Него.", action: "Исполни то, что откладывал." },
  { day: 26, title: "Надежда", verse: "Надежда не постыжает.", desc: "Лучшее впереди.", action: "Мечтай с Богом." },
  { day: 27, title: "Смелость", verse: "Если Бог за нас, кто против нас?", desc: "Страх — это ложь.", action: "Сделай то, чего боялся." },
  { day: 28, title: "Служение", verse: "Служите друг другу.", desc: "Величие в служении.", action: "Помоги кому-то безвозмездно." },
  { day: 29, title: "Единство", verse: "Да будут все едино.", desc: "Вместе мы сильнее.", action: "Не спорь сегодня." },
  { day: 30, title: "Обновление", verse: "Кто во Христе, тот новая тварь.", desc: "Каждый день — новый шанс.", action: "Начни новую привычку." },
  { day: 31, title: "Вечность", verse: "Бог вложил вечность в сердца их.", desc: "Живи с перспективой неба.", action: "Поблагодари за прожитый месяц." }
];

function MusicPlayer({ theme }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [error, setError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = 0.4;
        audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => setError(true));
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setError(false);
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  return (
    <div className={`fixed bottom-8 right-6 z-40 flex items-center gap-2 p-2 rounded-full shadow-2xl backdrop-blur-md border border-white/20 transition-all ${isPlaying ? 'pr-4' : ''} ${theme.card}`}>
      <audio 
        ref={audioRef} 
        src={TRACKS[currentTrackIndex].url}
        autoPlay={isPlaying}
        onEnded={nextTrack}
        onError={() => setError(true)}
      />
      
      <button onClick={togglePlay} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md border border-white/20 ${theme.btn} ${error ? 'bg-red-500' : ''}`}>
        {error ? <AlertTriangle size={18}/> : isPlaying ? <Pause size={18}/> : <Play size={18} className="ml-1"/>}
      </button>

      {isPlaying && (
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
            <div className="flex flex-col w-24">
                <span className={`text-[10px] font-bold uppercase opacity-60 ${theme.text}`}>Играет</span>
                <span className={`text-xs truncate font-serif ${theme.text}`}>{TRACKS[currentTrackIndex].title}</span>
            </div>
            <button onClick={nextTrack} className={`p-1 opacity-70 hover:opacity-100 ${theme.text}`}><SkipForward size={16}/></button>
            <button onClick={() => setIsMuted(!isMuted)} className={`p-1 opacity-70 hover:opacity-100 ${theme.text}`}>
                {isMuted ? <VolumeX size={16}/> : <Volume2 size={16}/>}
            </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prayers, setPrayers] = useState([]);
  const [activeTab, setActiveTab] = useState('focus'); 
  const [feedFilter, setFeedFilter] = useState('all'); 
  const [currentThemeId, setCurrentThemeId] = useState('day');
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [commentingId, setCommentingId] = useState(null);

  const theme = THEMES[currentThemeId];
  const today = new Date();
  const dayIndex = today.getMonth() === 0 ? today.getDate() - 1 : 0; 
  const currentFocus = JANUARY_FOCUS[dayIndex] || JANUARY_FOCUS[0];

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => {
        setUser(u);
        setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, "prayers"), orderBy("createdAt", "desc"));
    return onSnapshot(q, s => setPrayers(s.docs.map(d => ({id: d.id, ...d.data()}))));
  }, []);

  const handleSignIn = async () => await signInAnonymously(auth);

  const handleAdd = async (text, type, privacy, isAnon) => {
    if(!text.trim()) return;
    await addDoc(collection(db, "prayers"), {
        text, type, privacy, 
        userId: user.uid,
        authorName: isAnon ? "Аноним" : (user.displayName || "Путник"),
        createdAt: serverTimestamp(),
        likes: [],
        comments: [],
        amens: 0
    });
    setShowAddModal(false);
  };

  const toggleLike = async (id, likes) => {
    if(!user) return;
    const ref = doc(db, "prayers", id);
    if(likes.includes(user.uid)) {
        await updateDoc(ref, { likes: arrayRemove(user.uid), amens: likes.length - 1 });
    } else {
        await updateDoc(ref, { likes: arrayUnion(user.uid), amens: likes.length + 1 });
    }
  };

  const deletePrayer = async (id) => {
    if(confirm("Удалить запись?")) await deleteDoc(doc(db, "prayers", id));
  };

  const saveEdit = async (id, newText) => {
    await updateDoc(doc(db, "prayers", id), { text: newText });
    setEditingId(null);
  };

  const addComment = async (id, text) => {
    if(!text.trim()) return;
    const comment = {
        text,
        author: user.displayName || "Путник",
        uid: user.uid,
        createdAt: new Date().toISOString()
    };
    await updateDoc(doc(db, "prayers", id), {
        comments: arrayUnion(comment)
    });
  };

  if (!user) return <AuthScreen onLogin={handleSignIn} theme={theme} onShowRules={() => setShowDisclaimer(true)} loading={loading} />;

  const filteredPrayers = prayers.filter(p => {
    if (feedFilter === 'diary') return p.userId === user.uid;
    return p.privacy === 'public';
  });

  return (
    <div className="relative min-h-screen overflow-hidden transition-colors duration-700 bg-black">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.img 
            key={theme.id}
            initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 1}}
            src={theme.bg} className="w-full h-full object-cover opacity-60" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
      </div>

      <header className={`fixed top-0 left-0 right-0 z-50 px-6 pt-8 pb-4 flex justify-between items-center ${theme.text}`}>
         <div onClick={()=>setMenuOpen(true)} className="flex items-center gap-2">
            <h1 className="text-3xl font-serif font-bold tracking-wide drop-shadow-md cursor-pointer">Amen</h1>
         </div>
         
         <button 
            onClick={() => setMenuOpen(true)} 
            className={`mt-4 p-3 rounded-full backdrop-blur-xl border border-white/20 shadow-lg ${theme.card}`}
         >
            <Menu size={24} />
         </button>
      </header>

      <AnimatePresence>
        {menuOpen && (
            <motion.div initial={{x: '100%'}} animate={{x: 0}} exit={{x: '100%'}} transition={{type:'spring', damping:25}} className={`fixed inset-0 z-[60] backdrop-blur-xl bg-black/60 p-8 flex flex-col justify-center gap-6 ${theme.text}`}>
                <button onClick={()=>setMenuOpen(false)} className="absolute top-8 right-6 p-2 rounded-full border border-white/20"><X size={32}/></button>
                
                <h2 className="text-4xl font-serif font-bold mb-8 opacity-50">Навигация</h2>
                
                <MenuLink icon={<Star/>} label="Фокус Дня" onClick={()=>{setActiveTab('focus'); setMenuOpen(false)}} />
                <MenuLink icon={<BookOpen/>} label="Стена Единства" onClick={()=>{setActiveTab('feed'); setFeedFilter('all'); setMenuOpen(false)}} />
                <MenuLink icon={<Lock/>} label="Личный Дневник" onClick={()=>{setActiveTab('feed'); setFeedFilter('diary'); setMenuOpen(false)}} />
                <MenuLink icon={<User/>} label="Профиль" onClick={()=>{setActiveTab('profile'); setMenuOpen(false)}} />
                
                <div className="mt-auto flex gap-4">
                    <button onClick={()=>setShowAddModal(true)} className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${theme.btn}`}>
                        <Plus size={20}/> Создать
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 pt-32 pb-32 px-4 max-w-lg mx-auto min-h-screen">
         
         {activeTab === 'focus' && (
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="h-full flex flex-col justify-center">
                 <div className={`p-8 rounded-[2.5rem] backdrop-blur-xl border shadow-2xl ${theme.card} ${theme.border} ${theme.text}`}>
                    <div className="flex justify-between items-start mb-6">
                        <span className="px-4 py-1 rounded-full border border-current text-xs font-bold uppercase tracking-widest opacity-60">
                            {today.toLocaleDateString('ru-RU', {day: 'numeric', month: 'long'})}
                        </span>
                        <Sparkles className={theme.accent} />
                    </div>
                    
                    <h2 className="text-4xl font-serif font-bold mb-6 leading-tight">{currentFocus.title}</h2>
                    
                    <div className="mb-8 pl-4 border-l-2 border-current opacity-80">
                        <p className="font-serif italic text-xl leading-relaxed">"{currentFocus.verse}"</p>
                    </div>

                    <p className="text-lg opacity-90 mb-8 leading-relaxed font-light">
                        {currentFocus.desc}
                    </p>

                    <div className={`p-6 rounded-2xl border border-white/10 ${theme.btn}`}>
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-2 opacity-70">Действие сегодня</h3>
                        <p className="font-bold text-lg">{currentFocus.action}</p>
                    </div>
                 </div>
             </motion.div>
         )}

         {activeTab === 'feed' && (
            <div className="space-y-6">
                
                <div className="flex items-center justify-between mb-8 px-2">
                    <h2 className={`text-3xl font-serif font-bold ${theme.text}`}>
                        {feedFilter === 'all' ? 'Стена Единства' : 'Личный Дневник'}
                    </h2>
                    {feedFilter === 'all' ? <Globe className="opacity-50"/> : <Lock className="opacity-50"/>}
                </div>

                {filteredPrayers.length === 0 && (
                    <div className={`text-center py-20 opacity-50 ${theme.text}`}>
                        <p>Здесь пока пусто.</p>
                    </div>
                )}

                {filteredPrayers.map(p => (
                    <PrayerCard 
                        key={p.id} 
                        prayer={p} 
                        user={user} 
                        isAdmin={isAdmin} 
                        theme={theme}
                        onLike={toggleLike}
                        onDelete={deletePrayer}
                        onEdit={saveEdit}
                        onComment={addComment}
                        activeCommentId={commentingId}
                        setCommentingId={setCommentingId}
                        activeEditId={editingId}
                        setEditingId={setEditingId}
                    />
                ))}
            </div>
         )}

         {activeTab === 'profile' && (
             <div className="space-y-6">
                <div className={`p-8 rounded-[2.5rem] text-center backdrop-blur-xl border shadow-2xl ${theme.card} ${theme.border}`}>
                    <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center text-5xl font-bold mb-6 shadow-2xl border-4 border-white/20 ${theme.btn}`}>
                        {user.displayName?.[0] || <User/>}
                    </div>
                    <h2 className={`text-3xl font-serif font-bold mb-8 ${theme.text}`}>{user.displayName || "Путник"}</h2>
                    
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {Object.values(THEMES).map(t => (
                            <button key={t.id} onClick={()=>setCurrentThemeId(t.id)} className={`h-16 rounded-2xl border-2 transition-all ${currentThemeId===t.id ? 'border-white scale-105 shadow-xl' : 'border-transparent opacity-60'}`} style={{backgroundImage: `url(${t.bg})`, backgroundSize: 'cover'}} />
                        ))}
                    </div>

                    <button onClick={()=>setShowFeedback(true)} className={`w-full p-4 mb-3 rounded-2xl flex items-center justify-center gap-3 font-bold border border-white/20 ${theme.text}`}>
                        <MessageSquarePlus size={20}/> Написать автору
                    </button>
                    <button onClick={()=>auth.signOut()} className="w-full p-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-red-400 bg-red-500/10 border border-red-500/20">
                        <LogOut size={20}/> Выйти
                    </button>
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

function MenuLink({ icon, label, onClick }) {
    return (
        <button onClick={onClick} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/10 transition-colors text-2xl font-serif font-bold text-left">
            {icon} {label}
        </button>
    )
}

function PrayerCard({ prayer, user, isAdmin, theme, onLike, onDelete, onEdit, onComment, activeCommentId, setCommentingId, activeEditId, setEditingId }) {
    const isEditing = activeEditId === prayer.id;
    const isCommenting = activeCommentId === prayer.id;
    const [editText, setEditText] = useState(prayer.text);
    const [commentText, setCommentText] = useState('');

    return (
        <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} className={`p-6 rounded-[2rem] border backdrop-blur-xl shadow-lg ${theme.card} ${theme.border}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${theme.btn}`}>
                        {prayer.authorName?.[0] || "A"}
                    </div>
                    <div>
                        <h3 className={`font-bold text-sm ${theme.text}`}>{prayer.authorName}</h3>
                        <div className="flex gap-2 text-[10px] opacity-60 uppercase font-bold tracking-wider">
                            <span>{prayer.type === 'miracle' ? 'Чудо' : 'Молитва'}</span>
                            <span>•</span>
                            <span>{prayer.privacy === 'private' ? 'Личное' : 'Публичное'}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    {prayer.userId === user.uid && (
                        <button onClick={()=>{setEditingId(isEditing ? null : prayer.id); setEditText(prayer.text)}} className={`opacity-50 hover:opacity-100 ${theme.text}`}>
                            <Edit2 size={16}/>
                        </button>
                    )}
                    {(prayer.userId === user.uid || isAdmin) && (
                        <button onClick={()=>onDelete(prayer.id)} className="text-red-400 opacity-50 hover:opacity-100"><Trash2 size={16}/></button>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div className="mb-4">
                    <textarea value={editText} onChange={e=>setEditText(e.target.value)} className={`w-full p-3 rounded-xl bg-black/10 outline-none ${theme.text}`} rows={4}/>
                    <button onClick={()=>onEdit(prayer.id, editText)} className="mt-2 px-4 py-2 bg-green-500/20 text-green-500 rounded-lg text-xs font-bold uppercase">Сохранить</button>
                </div>
            ) : (
                <p className={`text-lg font-serif leading-relaxed mb-6 whitespace-pre-wrap ${theme.text}`}>{prayer.text}</p>
            )}

            <div className="flex gap-4 pt-4 border-t border-white/10">
                <button onClick={()=>onLike(prayer.id, prayer.likes||[])} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all active:scale-95 border border-transparent ${prayer.likes?.includes(user.uid) ? 'bg-rose-500/20 text-rose-500' : 'hover:border-white/20 opacity-70'} ${theme.text}`}>
                    <Heart size={20} className={prayer.likes?.includes(user.uid) ? "fill-current" : ""}/>
                    <span className="text-sm font-bold">{prayer.amens || 0}</span>
                </button>
                
                <button onClick={()=>setCommentingId(isCommenting ? null : prayer.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all active:scale-95 border border-transparent hover:border-white/20 opacity-70 ${theme.text}`}>
                    <MessageCircle size={20}/>
                    <span className="text-sm font-bold">{prayer.comments?.length || 0}</span>
                </button>
            </div>

            <AnimatePresence>
                {isCommenting && (
                    <motion.div initial={{height:0, opacity:0}} animate={{height:'auto', opacity:1}} exit={{height:0, opacity:0}} className="overflow-hidden mt-4 pt-4 border-t border-white/10">
                        <div className="flex gap-2 mb-4">
                            <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Написать..." className={`flex-1 bg-transparent border-b border-white/20 outline-none pb-2 text-sm ${theme.text} placeholder:opacity-40`}/>
                            <button onClick={()=>{onComment(prayer.id, commentText); setCommentText('')}} disabled={!commentText.trim()} className={`opacity-50 hover:opacity-100 ${theme.text}`}><Send size={18}/></button>
                        </div>
                        <div className="space-y-3">
                            {prayer.comments?.map((c, i) => (
                                <div key={i} className={`text-sm ${theme.text}`}>
                                    <span className="font-bold opacity-70">{c.author}: </span>
                                    <span className="opacity-90">{c.text}</span>
                                </div>
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
    
    if(!isOpen) return null;
    
    return (
        <>
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={onClose}/>
        <motion.div initial={{y:'100%'}} animate={{y:0}} className={`fixed bottom-0 left-0 right-0 z-[70] rounded-t-[2.5rem] p-8 border-t border-white/10 shadow-2xl ${theme.card} ${theme.text}`}>
            <h3 className="text-2xl font-serif font-bold mb-6">Новая запись</h3>
            
            <div className="flex gap-2 mb-4">
                <button onClick={()=>setType('prayer')} className={`flex-1 py-3 rounded-2xl font-bold border transition-colors ${type==='prayer' ? theme.btn : 'border-current opacity-40'}`}>Молитва</button>
                <button onClick={()=>setType('miracle')} className={`flex-1 py-3 rounded-2xl font-bold border transition-colors ${type==='miracle' ? 'bg-yellow-500 text-black border-yellow-500' : 'border-current opacity-40'}`}>Чудо</button>
            </div>

            <div className="flex gap-2 mb-6 text-sm">
                <button onClick={()=>setPrivacy('public')} className={`flex items-center justify-center gap-2 flex-1 py-2 rounded-xl border ${privacy==='public' ? 'bg-white/10 border-white/30' : 'border-transparent opacity-40'}`}>
                    <Globe size={16}/> На стену
                </button>
                <button onClick={()=>setPrivacy('private')} className={`flex items-center justify-center gap-2 flex-1 py-2 rounded-xl border ${privacy==='private' ? 'bg-white/10 border-white/30' : 'border-transparent opacity-40'}`}>
                    <Lock size={16}/> В дневник
                </button>
            </div>

            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="О чем болит сердце?" className="w-full h-32 bg-black/10 rounded-2xl p-4 resize-none outline-none text-lg mb-6 placeholder:opacity-30 border border-white/5"/>
            
            <div className="flex justify-between items-center">
                <button onClick={()=>setAnon(!anon)} className={`flex items-center gap-2 px-4 py-2 rounded-xl ${anon ? 'bg-white/20' : 'opacity-40'}`}>
                    {anon ? <Shield size={18}/> : <User size={18}/>} <span className="text-sm font-bold">{anon ? "Анонимно" : "Открыто"}</span>
                </button>
                <button onClick={()=>onAdd(text, type, privacy, anon)} className={`px-8 py-3 rounded-2xl font-bold shadow-lg ${theme.btn}`}>Amen</button>
            </div>
        </motion.div>
        </>
    );
}

function AuthScreen({ onLogin, theme, onShowRules, loading }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-black">
            <div className="absolute inset-0 z-0">
                <img src="/dawn.jpg" className="w-full h-full object-cover opacity-60 animate-pulse" style={{animationDuration: '10s'}} />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center text-stone-100">
                <Sparkles size={64} className="mb-6 text-orange-400"/>
                <h1 className="text-7xl font-serif mb-4 tracking-tighter">Amen</h1>
                <p className="text-xl font-serif mb-12 opacity-80">Пространство тишины.</p>
                {loading ? (
                    <div className="text-sm opacity-50">Загрузка...</div>
                ) : (
                    <button onClick={onLogin} className="w-full max-w-xs py-5 rounded-2xl bg-white/90 text-black font-bold text-lg shadow-2xl backdrop-blur-md active:scale-95 transition-transform">
                        Войти с миром
                    </button>
                )}
                <button onClick={onShowRules} className="mt-8 text-sm opacity-50 hover:opacity-100 underline">Правила и условия</button>
            </div>
        </div>
    );
}

function FeedbackModal({ isOpen, onClose, theme }) {
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}/>
            <div className={`relative z-10 p-8 rounded-3xl w-full max-w-sm ${theme.card} ${theme.text} ${theme.border} border`}>
                <h3 className="text-xl font-bold mb-4">Написать автору</h3>
                <textarea placeholder="Ваше сообщение..." className="w-full h-32 bg-black/10 rounded-xl p-4 mb-4 resize-none outline-none"/>
                <button onClick={()=>{alert("Отправлено!"); onClose();}} className={`w-full py-3 rounded-xl font-bold ${theme.btn}`}>Отправить</button>
            </div>
        </div>
    );
}

function RulesModal({ isOpen, onClose, theme }) {
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}/>
            <div className={`relative z-10 p-8 rounded-3xl w-full max-w-sm max-h-[80vh] overflow-y-auto ${theme.card} ${theme.text} ${theme.border} border`}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Info/> Правила и Соглашение</h3>
                <div className="space-y-4 text-sm opacity-80 leading-relaxed">
                    <p><strong>1. Дисклеймер:</strong> Приложение создано для духовной поддержки. Мы не несем ответственности за контент пользователей.</p>
                    <p><strong>2. Уважение:</strong> Оскорбления и ненависть запрещены.</p>
                    <p><strong>3. Приватность:</strong> Мы не передаем данные третьим лицам.</p>
                    <p><strong>4. Музыка:</strong> Все треки используются по лицензии Creative Commons.</p>
                </div>
                <button onClick={onClose} className={`w-full mt-6 py-3 rounded-xl font-bold ${theme.btn}`}>Я принимаю</button>
            </div>
        </div>
    );
}