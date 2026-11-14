import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AudioLines, Check, ChevronDown, Pause, Play, Volume2, X } from 'lucide-react';
import { TRACKS } from '../lib/data';

const DURATIONS = [1, 5, 10];

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

export default function PrayerPause({ reading, onClose }) {
  const [duration, setDuration] = useState(5);
  const [remaining, setRemaining] = useState(5 * 60);
  const [stage, setStage] = useState('setup');
  const [soundOn, setSoundOn] = useState(false);
  const [soundUnavailable, setSoundUnavailable] = useState(false);
  const [showTrackList, setShowTrackList] = useState(false);
  const [track, setTrack] = useState(TRACKS[4]);
  const audioRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (stage !== 'active') return undefined;

    const interval = window.setInterval(() => {
      setRemaining((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return Math.max(seconds - 1, 0);
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (stage === 'active' && remaining > 0 && soundOn) {
      audio.play().catch(() => setSoundUnavailable(true));
    } else {
      audio.pause();
    }
  }, [stage, remaining, soundOn, track]);

  useEffect(() => () => audioRef.current?.pause(), []);

  const beginPause = () => {
    setRemaining(duration * 60);
    setStage('active');
  };

  const finishPause = () => {
    audioRef.current?.pause();
    onClose();
  };

  const progress = stage === 'active'
    ? ((duration * 60 - remaining) / (duration * 60)) * 100
    : 0;
  const isComplete = stage === 'active' && remaining === 0;

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-[#101512]/65 p-4 backdrop-blur-xl sm:items-center sm:p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        className="relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-[2rem] border border-white/70 bg-[#f7f4ec] px-6 pb-6 pt-8 text-stone-800 shadow-[0_30px_90px_rgba(0,0,0,0.26)] sm:px-10 sm:pb-9"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.99 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prayer-pause-title"
      >
        <audio ref={audioRef} src={track.url} loop preload="none" />

        <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />
        <button
          className="absolute right-5 top-5 rounded-full p-2 text-stone-500 transition hover:bg-stone-900/5 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800"
          onClick={onClose}
          aria-label="Закрыть молитвенную паузу"
        >
          <X size={18} />
        </button>

        <div className="mb-5 text-center">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-900/55">Тихое место</p>
          <h2 id="prayer-pause-title" className="font-serif text-3xl font-normal tracking-tight text-stone-800">
            {isComplete ? 'Побудь ещё, если хочется' : 'Останься в тишине'}
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-stone-600">
            {stage === 'setup'
              ? 'Ничего не нужно успеть. Выбери удобное время или просто побудь столько, сколько захочется.'
              : stage === 'active' && !isComplete
                ? 'Можно закрыть глаза, молиться своими словами или просто побыть здесь.'
                : 'Спасибо за эту паузу. Возвращайся в свой день в собственном ритме.'}
          </p>
        </div>

        {stage === 'setup' ? (
          <>
            <div className="mb-5">
              <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Сколько времени тебе удобно?</p>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Длительность молитвенной паузы">
                {DURATIONS.map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => setDuration(minutes)}
                    aria-pressed={duration === minutes}
                    className={`min-h-12 rounded-2xl border px-3 py-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 ${duration === minutes ? 'border-stone-800 bg-stone-800 text-white shadow-md' : 'border-stone-300/80 bg-white/55 text-stone-600 hover:bg-white'}`}
                  >
                    {minutes} {minutes === 1 ? 'минута' : 'минут'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5 rounded-2xl border border-stone-300/55 bg-white/45 px-4 py-3 text-center">
              <p className="font-serif text-sm leading-6 text-stone-700">«{reading?.text || 'В тишине и уповании крепость ваша.'}»</p>
              {reading?.source && <p className="mt-1 text-[10px] tracking-wide text-stone-500">{reading.source}</p>}
            </div>

            <div className="mb-5">
              <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Как тебе будет спокойнее?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSoundOn(false)}
                  aria-pressed={!soundOn}
                  className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 ${!soundOn ? 'border-stone-800/30 bg-stone-800/5 text-stone-800' : 'border-stone-300/80 bg-white/55 text-stone-600 hover:bg-white'}`}
                >
                  <span className="h-2 w-2 rounded-full bg-stone-400" />Тишина
                </button>
                <button
                  onClick={() => setSoundOn(true)}
                  aria-pressed={soundOn}
                  className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 ${soundOn ? 'border-stone-800/30 bg-stone-800/5 text-stone-800' : 'border-stone-300/80 bg-white/55 text-stone-600 hover:bg-white'}`}
                >
                  <AudioLines size={15} />Музыка
                </button>
              </div>

              {soundOn && (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-white/55 px-4 py-3">
                  <span className="flex min-w-0 items-center gap-2 text-xs text-stone-600"><Volume2 size={14} /><span className="truncate">{track.title}</span></span>
                  <button onClick={() => setShowTrackList((shown) => !shown)} className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900">
                    Выбрать <ChevronDown size={14} className={`transition-transform ${showTrackList ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}
              <AnimatePresence>
                {soundOn && showTrackList && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 max-h-36 overflow-y-auto rounded-xl bg-white/70 p-2"
                  >
                    {TRACKS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setTrack(item); setShowTrackList(false); }}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-stone-600 hover:bg-stone-900/5"
                      >
                        {item.title}{track.id === item.id && <Check size={14} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={beginPause} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-stone-800 px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[0_12px_28px_rgba(44,39,30,0.16)] transition hover:bg-stone-700 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 focus-visible:ring-offset-2">
              <Play size={15} fill="currentColor" />Начать паузу
            </button>
          </>
        ) : (
          <>
            <div className="relative mx-auto mb-5 flex h-40 w-40 items-center justify-center">
              <motion.div
                className="absolute inset-2 rounded-full border border-amber-900/15 bg-gradient-to-br from-white/70 to-amber-100/35 shadow-[inset_0_0_50px_rgba(148,112,61,0.06)]"
                animate={stage === 'active' && !isComplete ? { scale: [0.96, 1.03, 0.96], opacity: [0.7, 1, 0.7] } : { scale: 1, opacity: 1 }}
                transition={{ duration: 8, ease: 'easeInOut', repeat: stage === 'active' && !isComplete ? Infinity : 0 }}
              />
              <div className="relative z-10 text-center">
                <div className="font-serif text-4xl tabular-nums text-stone-700" aria-live="polite">
                  {isComplete ? '·' : formatTime(remaining)}
                </div>
                <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                  {isComplete ? 'здесь и сейчас' : 'в своём ритме'}
                </div>
              </div>
            </div>

            <div className="mb-5 h-px overflow-hidden rounded-full bg-stone-300/70" role="progressbar" aria-label="Ход молитвенной паузы" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
              <motion.div className="h-full bg-amber-800/50" animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }} />
            </div>

            <p className="mb-5 min-h-10 text-center font-serif text-lg leading-7 text-stone-600">
              {isComplete ? 'Тишина остаётся с тобой и после этой минуты.' : 'Вдохни. Отпусти спешку. Будь здесь.'}
            </p>

            {isComplete ? (
              <button onClick={finishPause} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-stone-800 px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 focus-visible:ring-offset-2">
                <Check size={16} />Вернуться спокойно
              </button>
            ) : (
              <button onClick={finishPause} className="min-h-14 w-full rounded-2xl border border-stone-300 bg-white/45 px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600 transition hover:bg-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800">
                Завершить паузу
              </button>
            )}

            {soundUnavailable && <p className="mt-4 text-center text-xs text-stone-500">Музыка недоступна, можно остаться в тишине.</p>}
          </>
        )}
      </motion.section>
    </motion.div>
  );
}
