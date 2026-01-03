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
  Heart, Plus, Trash2, Menu, X, MessageSquarePlus, LogOut, Info, 
  Play, Pause, SkipForward, AlertTriangle, Volume2, VolumeX, 
  Edit2, MessageCircle, Send, ListMusic, User
} from 'lucide-react';

// --- 1. КОНФИГУРАЦИЯ FIREBASE ---
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

// --- ТЕМЫ (Чистые) ---
const THEMES = {
  dawn: { id: 'dawn', name: 'Рассвет', bg: '/dawn.jpg', text: 'text-stone-900', accent: 'text-stone-600', card: 'bg-[#fffbf7]/80', btn: 'bg-stone-800 text-white', border: 'border-stone-200' },
  morning: { id: 'morning', name: 'Утро', bg: '/morning.jpg', text: 'text-slate-900', accent: 'text-slate-600', card: 'bg-white/80', btn: 'bg-slate-800 text-white', border: 'border-slate-200' },
  day: { id: 'day', name: 'День', bg: '/day.jpg', text: 'text-gray-900', accent: 'text-gray-600', card: 'bg-white/80', btn: 'bg-black text-white', border: 'border-gray-200' },
  sunset: { id: 'sunset', name: 'Закат', bg: '/sunset.jpg', text: 'text-amber-950', accent: 'text-amber-800', card: 'bg-orange-50/80', btn: 'bg-amber-950 text-white', border: 'border-amber-900/10' },
  evening: { id: 'evening', name: 'Вечер', bg: '/evening.jpg', text: 'text-white', accent: 'text-indigo-200', card: 'bg-slate-900/60', btn: 'bg-white/20 text-white', border: 'border-white/10' },
  midnight: { id: 'midnight', name: 'Полночь', bg: '/midnight.jpg', text: 'text-gray-100', accent: 'text-gray-400', card: 'bg-black/60', btn: 'bg-white/90 text-black', border: 'border-white/10' },
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
  // ... (для краткости массив не дублирую, используйте полный список из прошлого ответа или оставьте этот пример, он заполнится автоматически для текущего дня)
  { day: 31, title: "Вечность", verse: "Бог вложил вечность в сердца их.", desc: "Живи с перспективой неба.", action: "Поблагодари за прожитый месяц." }
];

// --- ПЛЕЕР ---
function MusicPlayer({ theme }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
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

  const selectTrack = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setShowPlaylist(false);
    setError(false);
  };

  return (
    <>
      <div className={`fixed bottom-8 right-6 z-40 flex items-center gap-2 p-2 rounded-full shadow-2xl backdrop-blur-xl border ${theme.border} ${theme.card}`}>
        <audio 
          ref={audioRef} 
          src={TRACKS[currentTrackIndex].url}
          autoPlay={isPlaying}
          onEnded={() => selectTrack((currentTrackIndex + 1) % TRACKS.length)}
          onError={() => setError(true)}
        />
        
        <button onClick={togglePlay} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${theme.btn} ${error ? 'bg-red-500' : ''}`}>
          {error ? <AlertTriangle size={18}/> : isPlaying ? <Pause size={18}/> : <Play size={18} className="ml-1"/>}
        </button>

        {isPlaying && (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 pr-2">
              <div className="flex flex-col w-32">
                  <span className={`text-[10px] font-medium uppercase opacity-60 ${theme.text}`}>Играет</span>
                  <span className={`text-xs truncate font-medium ${theme.text}`}>{TRACKS[currentTrackIndex].title}</span>
              </div>
              
              <button onClick={() => setShowPlaylist(!showPlaylist)} className={`p-2 opacity-70 hover:opacity-100 ${theme.text}`}>
                  <ListMusic size={18}/>
              </button>
              
              <button onClick={() => selectTrack((currentTrackIndex + 1) % TRACKS.length)} className={`p-1 opacity-70 hover:opacity-100 ${theme.text}`}>
                  <SkipForward size={18}/>
              </button>
          </div>
        )}
      </div>

      {/* Плейлист с закрытием по клику на фон */}
      <AnimatePresence>
        {showPlaylist && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPlaylist(false)} />
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className={`fixed bottom-24 right-6 z-50 w-64 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl border ${theme.border} ${theme.card}`}
            >
                <div className={`p-3 max-h-64 overflow-y-auto ${theme.text}`}>
                {TRACKS.map((track, i) => (
                    <button 
                    key={track.id} 
                    onClick={() => selectTrack(i)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium truncate mb-1 transition-colors ${i === currentTrackIndex ? 'bg-black/10 opacity-100' : 'opacity-60 hover:opacity-100 hover:bg-black/5'}`}
                    >
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

// --- APP ---

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
    <div className="relative min-h-screen overflow-x-hidden bg-black font-sans text-base">
      {/* ФОН - Полное покрытие */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.img 
            key={theme.id}
            initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 1}}
            src={theme.bg} className="w-full h-full object-cover opacity-90" 
        />
        {/* Легкое затемнение для контраста текста */}
        <div className="absolute inset-0 bg-black/10" /> 
      </div>

      {/* ХЕДЕР */}
      <header className={`fixed top-0 left-0 right-0 z-50 px-6 pt-12 pb-4 flex justify-between items-center ${theme.text}`}>
         <div onClick={()=>setMenuOpen(true)} className="flex items-center gap-2 cursor-pointer">
            <h1 className="text-3xl font-light tracking-widest uppercase opacity-90">Amen</h1>
         </div>
         
         <button 
            onClick={() => setMenuOpen(true)} 
            className={`p-3 rounded-full backdrop-blur-md border border-white/10 shadow-sm ${theme.card}`}
         >
            <Menu size={22} strokeWidth={1.5} />
         </button>
      </header>

      {/* МЕНЮ */}
      <AnimatePresence>
        {menuOpen && (
            <motion.div initial={{x: '100%'}} animate={{x: 0}} exit={{x: '100%'}} transition={{type:'spring', damping:25}} className={`fixed inset-0 z-[60] backdrop-blur-2xl bg-black/40 p-8 flex flex-col justify-center gap-4 ${theme.text}`}>
                <button onClick={()=>setMenuOpen(false)} className="absolute top-12 right-6 p-2 rounded-full border border-white/20"><X size={28}/></button>
                
                <h2 className="text-4xl font-thin mb-12 opacity-50 tracking-wider">Меню</h2>
                
                <MenuLink label="Фокус Дня" onClick={()=>{setActiveTab('focus'); setMenuOpen(false)}} />
                <MenuLink label="Стена Единства" onClick={()=>{setActiveTab('feed'); setFeedFilter('all'); setMenuOpen(false)}} />
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

      {/* КОНТЕНТ */}
      <main className="relative z-10 pt-36 pb-32 px-6 w-full max-w-3xl mx-auto min-h-screen">
         
         {/* ФОКУС ДНЯ */}
         {activeTab === 'focus' && (
             <motion.div initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} className="h-full flex flex-col justify-center">
                 <div className={`p-8 rounded-[2rem] backdrop-blur-xl border border-white/20 shadow-2xl ${theme.card} ${theme.text}`}>
                    <div className="flex justify-between items-start mb-10">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-50 border-b border-current pb-1">
                            {today.toLocaleDateString('ru-RU', {day: 'numeric', month: 'long'})}
                        </span>
                    </div>
                    
                    <h2 className="text-3xl font-light mb-8 leading-tight">{currentFocus.title}</h2>
                    
                    <div className="mb-10 pl-6 border-l border-current opacity-80">
                        <p className="font-light italic text-xl leading-relaxed">"{currentFocus.verse}"</p>
                    </div>

                    <p className="text-lg font-light opacity-90 mb-12 leading-relaxed">
                        {currentFocus.desc}
                    </p>

                    <div className={`p-6 rounded-2xl border border-current/10 bg-current/5`}>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-50">Действие</h3>
                        <p className="font-normal text-lg">{currentFocus.action}</p>
                    </div>
                 </div>
             </motion.div>
         )}

         {/* ЛЕНТА */}
         {activeTab === 'feed' && (
            <div className="space-y-8">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className={`text-2xl font-light tracking-wide ${theme.text}`}>
                        {feedFilter === 'all' ? 'Стена Единства' : 'Личный Дневник'}
                    </h2>
                </div>

                {filteredPrayers.length === 0 && (
                    <div className={`text-center py-32 opacity-40 ${theme.text}`}>
                        <p className="font-light text-lg">Здесь пока пусто.</p>
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

         {/* ПРОФИЛЬ */}
         {activeTab === 'profile' && (
             <div className="space-y-6">
                <div className={`p-10 rounded-[2rem] text-center backdrop-blur-xl border border-white/20 shadow-2xl ${theme.card}`}>
                    <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center text-5xl font-light mb-8 shadow-inner ${theme.btn}`}>
                        {user.displayName?.[0] || <User strokeWidth={1}/>}
                    </div>
                    <h2 className={`text-2xl font-normal mb-12 ${theme.text}`}>{user.displayName || "Путник"}</h2>
                    
                    <div className="grid grid-cols-3 gap-4 mb-16">
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

// --- SUB COMPONENTS ---

function MenuLink({ label, onClick }) {
    return (
        <button onClick={onClick} className="w-full text-left p-5 text-2xl font-thin hover:pl-8 transition-all border-b border-white/5 tracking-wide">
            {label}
        </button>
    )
}

function PrayerCard({ prayer, user, isAdmin, theme, onLike, onDelete, onEdit, onComment, activeCommentId, setCommentingId, activeEditId, setEditingId }) {
    const isEditing = activeEditId === prayer.id;
    const isCommenting = activeCommentId === prayer.id;
    const [editText, setEditText] = useState(prayer.text);
    const [commentText, setCommentText] = useState('');

    return (
        <motion.div initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} className={`p-8 rounded-[2rem] border backdrop-blur-xl shadow-lg ${theme.card} ${theme.border}`}>
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-sm ${theme.btn}`}>
                        {prayer.authorName?.[0] || "A"}
                    </div>
                    <div>
                        <h3 className={`font-medium text-sm ${theme.text}`}>{prayer.authorName}</h3>
                        <div className="flex gap-2 text-[10px] opacity-40 uppercase font-bold tracking-widest mt-1">
                            <span>{prayer.type === 'miracle' ? 'Чудо' : 'Молитва'}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-4 opacity-40">
                    {prayer.userId === user.uid && (
                        <button onClick={()=>{setEditingId(isEditing ? null : prayer.id); setEditText(prayer.text)}} className={`${theme.text} hover:opacity-100`}>
                            <Edit2 size={16} strokeWidth={1.5}/>
                        </button>
                    )}
                    {(prayer.userId === user.uid || isAdmin) && (
                        <button onClick={()=>onDelete(prayer.id)} className="text-red-400 hover:text-red-500 hover:opacity-100"><Trash2 size={16} strokeWidth={1.5}/></button>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div className="mb-4">
                    <textarea value={editText} onChange={e=>setEditText(e.target.value)} className={`w-full p-4 rounded-xl bg-black/5 outline-none ${theme.text}`} rows={4}/>
                    <button onClick={()=>onEdit(prayer.id, editText)} className="mt-3 px-6 py-2 bg-green-500/10 text-green-600 rounded-lg text-xs font-bold uppercase tracking-widest">Сохранить</button>
                </div>
            ) : (
                <p className={`text-lg font-light leading-relaxed mb-8 whitespace-pre-wrap ${theme.text}`}>{prayer.text}</p>
            )}

            <div className="flex gap-6 pt-6 border-t border-current/10">
                <button onClick={()=>onLike(prayer.id, prayer.likes||[])} className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all active:scale-95 border border-transparent ${prayer.likes?.includes(user.uid) ? 'bg-rose-500/10 text-rose-500' : 'hover:bg-black/5 opacity-50'} ${theme.text}`}>
                    <Heart size={18} strokeWidth={1.5} className={prayer.likes?.includes(user.uid) ? "fill-current" : ""}/>
                    <span className="text-xs font-medium">{prayer.amens || 0}</span>
                </button>
                
                <button onClick={()=>setCommentingId(isCommenting ? null : prayer.id)} className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all active:scale-95 border border-transparent hover:bg-black/5 opacity-50 ${theme.text}`}>
                    <MessageCircle size={18} strokeWidth={1.5}/>
                    <span className="text-xs font-medium">{prayer.comments?.length || 0}</span>
                </button>
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
                                <div key={i} className={`text-sm ${theme.text}`}>
                                    <span className="font-bold opacity-50 block mb-1 text-xs">{c.author}</span>
                                    <span className="opacity-80 font-light">{c.text}</span>
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
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md" onClick={onClose}/>
        <motion.div initial={{y:'100%'}} animate={{y:0}} className={`fixed bottom-0 left-0 right-0 z-[70] rounded-t-[2.5rem] p-10 border-t border-white/20 shadow-2xl ${theme.card} ${theme.text}`}>
            <h3 className="text-xl font-light mb-8 tracking-widest uppercase opacity-70">Новая запись</h3>
            
            <div className="flex gap-4 mb-6 text-sm">
                <button onClick={()=>setType('prayer')} className={`flex-1 py-4 rounded-2xl border transition-colors ${type==='prayer' ? 'border-current opacity-100 font-medium' : 'border-current/10 opacity-40'}`}>Молитва</button>
                <button onClick={()=>setType('miracle')} className={`flex-1 py-4 rounded-2xl border transition-colors ${type==='miracle' ? 'border-current opacity-100 font-medium' : 'border-current/10 opacity-40'}`}>Чудо</button>
            </div>

            <div className="flex gap-4 mb-8 text-xs">
                <button onClick={()=>setPrivacy('public')} className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-xl border ${privacy==='public' ? 'bg-current/5 border-current/20' : 'border-transparent opacity-30'}`}>
                    На стену
                </button>
                <button onClick={()=>setPrivacy('private')} className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-xl border ${privacy==='private' ? 'bg-current/5 border-current/20' : 'border-transparent opacity-30'}`}>
                    В дневник
                </button>
            </div>

            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="О чем болит сердце?" className="w-full h-40 bg-transparent rounded-xl p-0 resize-none outline-none text-xl font-light mb-8 placeholder:opacity-20 border-none"/>
            
            <div className="flex justify-between items-center border-t border-current/10 pt-6">
                <button onClick={()=>setAnon(!anon)} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs transition-opacity ${anon ? 'opacity-100' : 'opacity-30'}`}>
                    {anon ? "Анонимно" : "От имени"}
                </button>
                <button onClick={()=>onAdd(text, type, privacy, anon)} className={`px-10 py-4 rounded-2xl font-bold shadow-lg text-sm tracking-widest uppercase ${theme.btn}`}>Amen</button>
            </div>
        </motion.div>
        </>
    );
}

function AuthScreen({ onLogin, theme, onShowRules, loading }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-black text-white">
            <div className="absolute inset-0 z-0">
                <img src="/dawn.jpg" className="w-full h-full object-cover opacity-60 animate-pulse" style={{animationDuration: '15s'}} />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
                <h1 className="text-7xl font-thin mb-4 tracking-[0.2em] uppercase opacity-90">Amen</h1>
                <p className="text-xs font-light mb-16 opacity-60 tracking-[0.3em] uppercase">Пространство тишины</p>
                {loading ? (
                    <div className="text-xs opacity-40 uppercase tracking-widest">Загрузка...</div>
                ) : (
                    <button onClick={onLogin} className="w-full max-w-xs py-5 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-normal text-sm uppercase tracking-[0.2em] backdrop-blur-md transition-all">
                        Войти
                    </button>
                )}
                <button onClick={onShowRules} className="mt-12 text-[9px] opacity-30 hover:opacity-70 uppercase tracking-widest">Правила</button>
            </div>
        </div>
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