import { useRef, useState, useEffect, useCallback } from 'react';
import { AUDIO_BASE } from '../api/quran';

export function useAudio(url, { onPlay } = {}) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [url]);

  const play = useCallback(() => {
    if (!url) return;
    const audio = audioRef.current;
    setError(false);
    onPlay?.();
    audio?.play().catch(() => setError(true));
    setPlaying(true);
  }, [url, onPlay]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (playing) pause();
    else play();
  }, [playing, play, pause]);

  const seek = useCallback((percent) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = percent * audio.duration;
    setCurrentTime(audio.currentTime);
  }, []);

  const fullUrl = url ? `${AUDIO_BASE}${url}` : null;

  return {
    audioRef,
    playing,
    currentTime,
    duration,
    error,
    play,
    pause,
    toggle,
    seek,
    url: fullUrl,
  };
}
