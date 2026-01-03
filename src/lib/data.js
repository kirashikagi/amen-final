// --- ТЕМЫ ОФОРМЛЕНИЯ ---
export const THEMES = {
  dawn: { id: 'dawn', name: 'Рассвет', bg: '/dawn.jpg', text: 'text-stone-900', accent: 'text-orange-600', card: 'bg-white/80', btn: 'bg-stone-900 text-white' },
  morning: { id: 'morning', name: 'Утро', bg: '/morning.jpg', text: 'text-gray-900', accent: 'text-sky-600', card: 'bg-white/90', btn: 'bg-sky-900 text-white' },
  day: { id: 'day', name: 'День', bg: '/day.jpg', text: 'text-slate-900', accent: 'text-blue-600', card: 'bg-white/95', btn: 'bg-black text-white' },
  sunset: { id: 'sunset', name: 'Закат', bg: '/sunset.jpg', text: 'text-amber-950', accent: 'text-red-600', card: 'bg-orange-50/90', btn: 'bg-amber-950 text-white' },
  evening: { id: 'evening', name: 'Вечер', bg: '/evening.jpg', text: 'text-white', accent: 'text-purple-300', card: 'bg-slate-900/60', btn: 'bg-white text-slate-900' },
  midnight: { id: 'midnight', name: 'Полночь', bg: '/midnight.jpg', text: 'text-gray-200', accent: 'text-indigo-400', card: 'bg-black/80', btn: 'bg-gray-800 text-white' },
};

// --- МУЗЫКА ---
export const TRACKS = [
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

// --- ФОКУС ДНЯ (ЦИТАТЫ) ---
export const DAILY_FOCUS = [
  "Любовь долготерпит, милосердствует, любовь не завидует...",
  "Всё могу в укрепляющем меня Иисусе Христе.",
  "Господь — пастырь мой; я ни в чем не буду нуждаться.",
  "Придите ко Мне все труждающиеся и обремененные...",
  "Будьте тверды и мужественны, не бойтесь."
];

export const ADMIN_EMAILS = ["admin@amen.com", "founder@amen.com"]; // Замените на реальные email или ID, если используете Auth