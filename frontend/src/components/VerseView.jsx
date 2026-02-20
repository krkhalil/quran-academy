import AudioPlayer from './AudioPlayer';
import WordByWord from './WordByWord';
import TafsirSection from './TafsirSection';
import { cleanTranslationText, cleanTajweedText, renderTajweedHtml } from '../utils/translation';

export default function VerseView({ verse, isPlaying, onAudioEnded, onPlay, showWords, showTafsir, showTajweed, onBookmark, isBookmarked, note, onNoteChange, multiTranslation = false }) {
  const translations = verse.translations || [];
  const translation = cleanTranslationText(translations[0]?.text || '');
  const showMulti = multiTranslation && translations.length > 1;
  const rawTajweed = verse.text_uthmani_tajweed || '';
  const hasTajweedHtml = showTajweed && rawTajweed.includes('<tajweed');
  const arabicContent = showTajweed && rawTajweed
    ? (hasTajweedHtml ? renderTajweedHtml(rawTajweed) : cleanTajweedText(rawTajweed))
    : verse.text_uthmani;

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
          {hasTajweedHtml && arabicContent ? (
            <p
              className={`font-arabic text-2xl leading-loose ${showTajweed ? 'tajweed-text' : 'text-emerald-900 dark:text-emerald-100'}`}
              dir="rtl"
              dangerouslySetInnerHTML={{ __html: arabicContent }}
            />
          ) : (
            <p className={`font-arabic text-2xl leading-loose dark:text-emerald-100 ${showTajweed ? 'tajweed-text' : 'text-emerald-900'}`} dir="rtl">
              {arabicContent}
            </p>
          )}
          {translation && (
            <p className="mt-2 text-gray-600 text-base leading-relaxed dark:text-gray-300">{translation}</p>
          )}
          {showMulti && (
            <div className="mt-3 space-y-3">
              {translations.slice(1, 4).map((t, i) => (
                <div key={t.resource_id || i} className="rounded-lg bg-emerald-50/50 dark:bg-emerald-900/20 px-3 py-2 border border-emerald-100 dark:border-emerald-800/50">
                  {t.resource_name && (
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">{t.resource_name}</p>
                  )}
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{cleanTranslationText(t.text || '')}</p>
                </div>
              ))}
            </div>
          )}
          {showWords && <WordByWord words={verse.words} />}
          {showTafsir && <TafsirSection verseKey={verse.verse_key} />}
          {onNoteChange && (
            <div className="mt-2">
              <textarea
                value={note || ''}
                onChange={(e) => onNoteChange(verse.verse_key, e.target.value)}
                placeholder="Add a note..."
                className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm dark:border-emerald-700 dark:bg-gray-700 dark:text-gray-200"
                rows={2}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
