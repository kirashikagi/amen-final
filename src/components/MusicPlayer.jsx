import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { TRACKS } from '../lib/data';

export function MusicPlayer({ theme }) {
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
    <div className={`fixed bottom-24 right-4 z-40 flex items-center gap-2 p-2 rounded-full shadow-2xl backdrop-blur-md border border-white/10 transition-all ${isPlaying ? 'pr-4' : ''} ${theme.card}`}>
      <audio 
        ref={audioRef} 
        src={TRACKS[currentTrackIndex].url}
        autoPlay={isPlaying}
        onEnded={nextTrack}
        onError={() => setError(true)}
      />
      
      <button onClick={togglePlay} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${theme.btn} ${error ? 'bg-red-500' : ''}`}>
        {error ? <AlertTriangle size={16}/> : isPlaying ? <Pause size={16}/> : <Play size={16} className="ml-1"/>}
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