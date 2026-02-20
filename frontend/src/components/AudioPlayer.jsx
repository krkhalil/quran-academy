import { useRef, useState, useEffect } from 'react';
import { AUDIO_BASE } from '../api/quran';

export default function AudioPlayer({ verse, isActive, onEnded, onPlay }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const url = verse?.audio?.url ? `${AUDIO_BASE}${verse.audio.url}` : null;

  useEffect(() => {
    if (!isActive && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
  }, [isActive]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => setCurrentTime(0);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, [url]);

  const toggle = () => {
    if (!url) return;
    const audio = audioRef.current;
    if (playing) {
      audio?.pause();
    } else {
      setError(false);
      onPlay?.();
      audio?.play().catch(() => setError(true));
    }
    setPlaying(!playing);
  };

  const handleEnded = () => {
    setPlaying(false);
    setCurrentTime(0);
    onEnded?.();
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
    setCurrentTime(audio.currentTime);
  };

  const formatTime = (s) => {
    if (!isFinite(s) || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!url) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-1 w-32 sm:w-40">
      <div className="flex items-center gap-2">
        <audio ref={audioRef} src={url} onEnded={handleEnded} preload="metadata" />
        <button
          onClick={toggle}
          disabled={error}
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition ${
            isActive && playing
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300'
          }`}
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div
          className="flex-1 h-1.5 bg-gray-200 rounded-full cursor-pointer overflow-hidden dark:bg-gray-700"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-emerald-600 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 w-10 flex-shrink-0">
          {formatTime(currentTime)}/{formatTime(duration)}
        </span>
      </div>
      {error && <span className="text-xs text-red-500">Error</span>}
    </div>
  );
}
