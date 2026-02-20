import { useState, useRef } from 'react';
import { AUDIO_BASE } from '../api/quran';
import { cleanTranslationText } from '../utils/translation';

export default function WordByWord({ words }) {
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef(null);

  if (!words || words.length === 0) return null;

  const playWord = (word) => {
    const url = word.audio_url ? `${AUDIO_BASE}${word.audio_url}` : null;
    if (!url) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play();
  };

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-emerald-600 hover:underline dark:text-emerald-400"
      >
        {expanded ? 'Hide' : 'Show'} word-by-word
      </button>
      {expanded && (
        <div className="mt-2 flex flex-wrap gap-1" dir="rtl">
          {words.map((word) => (
            <span
              key={word.id}
              className="group relative inline-flex cursor-pointer flex-col items-center rounded px-1 py-0.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              onClick={() => playWord(word)}
              title={[cleanTranslationText(word.translation?.text || ''), word.char_type_name && word.char_type_name !== 'word' ? `Tajweed: ${word.char_type_name}` : null].filter(Boolean).join(' • ')}
            >
              <span className="font-arabic text-lg text-emerald-900 dark:text-emerald-100">
                {word.text}
              </span>
              <span className="absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap max-w-xs truncate">
                {word.transliteration?.text} — {cleanTranslationText(word.translation?.text || '')}
                {word.char_type_name && word.char_type_name !== 'word' && (
                  <span className="block text-emerald-300 mt-0.5">Tajweed: {word.char_type_name}</span>
                )}
              </span>
            </span>
          ))}
        </div>
      )}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
