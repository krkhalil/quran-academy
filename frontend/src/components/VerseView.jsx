import AudioPlayer from './AudioPlayer';
import WordByWord from './WordByWord';
import TafsirSection from './TafsirSection';

export default function VerseView({ verse, isPlaying, onAudioEnded, onPlay, showWords, showTafsir, onBookmark, isBookmarked }) {
  const translation = verse.translations?.[0]?.text || '';

  return (
    <div
      className={`verse-item py-4 border-b border-emerald-50 last:border-0 dark:border-emerald-900/30 ${
        isPlaying ? 'bg-emerald-50/50 dark:bg-emerald-900/20' : ''
      }`}
    >
      <div className="flex gap-4 items-start">
        <div className="flex flex-col items-center gap-2">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-medium dark:bg-emerald-900/50 dark:text-emerald-200">
            {verse.verse_number}
          </span>
          <AudioPlayer verse={verse} isActive={isPlaying} onEnded={onAudioEnded} onPlay={onPlay} />
          {onBookmark && (
            <button
              onClick={() => onBookmark(verse)}
              className="text-gray-400 hover:text-amber-500 dark:hover:text-amber-400"
              title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {isBookmarked ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
            </button>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-arabic text-2xl text-emerald-900 leading-loose dark:text-emerald-100" dir="rtl">
            {verse.text_uthmani}
          </p>
          {translation && (
            <p className="mt-2 text-gray-600 text-base leading-relaxed dark:text-gray-300">{translation}</p>
          )}
          {showWords && <WordByWord words={verse.words} />}
          {showTafsir && <TafsirSection verseKey={verse.verse_key} />}
        </div>
      </div>
    </div>
  );
}
