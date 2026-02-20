import { useRef, useState, useEffect } from 'react';
import { AUDIO_BASE } from '../api/quran';

export default function AudioPlayer({ verse, isActive, onEnded, onPlay, repeat = false, playbackRate = 1 }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeatVerse, setRepeatVerse] = useState(repeat);
  const [speed, setSpeed] = useState(playbackRate);

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
    if (repeatVerse) {
      audioRef.current?.play();
    } else {
      onEnded?.();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = speed;
  }, [speed, url]);

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
    <div className="flex flex-col gap-1 w-40 sm:w-48">
      <div className="flex items-center gap-2 flex-wrap">
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
        <button
          onClick={() => setRepeatVerse((r) => !r)}
          className={`p-1 rounded ${repeatVerse ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-emerald-600'}`}
          title={repeatVerse ? 'Repeat on' : 'Repeat verse'}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
          </svg>
        </button>
        <select
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="text-xs rounded border border-gray-200 dark:border-gray-600 dark:bg-gray-700 px-1 py-0.5"
          title="Playback speed"
        >
          {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((r) => (
            <option key={r} value={r}>{r}x</option>
          ))}
        </select>
      </div>
      {error && <span className="text-xs text-red-500">Error</span>}
    </div>
  );
}
