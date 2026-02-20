import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getVersesByPage } from '../api/quran';
import VerseView from '../components/VerseView';
import TajweedLegend from '../components/TajweedLegend';
import TranslationSelector from '../components/TranslationSelector';
import ReciterSelector from '../components/ReciterSelector';
import { useTranslation, useRecitation, useLastRead, useBookmarks, useNotes } from '../hooks/usePreferences';

const TOTAL_PAGES = 604;

export default function PageViewPage() {
  const { pageNum } = useParams();
  const page = Math.min(TOTAL_PAGES, Math.max(1, parseInt(pageNum, 10) || 1));
  const [wordByWord, setWordByWord] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [showTajweed, setShowTajweed] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [playingVerseKey, setPlayingVerseKey] = useState(null);

  const [translationId] = useTranslation();
  const [, setLastRead] = useLastRead();
  const [bookmarks, { toggleBookmark, isBookmarked }] = useBookmarks();
  const [notes, { setNote, getNote }] = useNotes();

  const [recitationId] = useRecitation();
  const { data: versesData, isLoading } = useQuery({
    queryKey: ['verses-by-page', page, translationId, recitationId, wordByWord],
    queryFn: () => getVersesByPage(page, { translations: translationId, audio: parseInt(recitationId, 10), words: wordByWord }),
    enabled: !!page,
    staleTime: 30 * 60 * 1000,
  });

  const verses = versesData?.verses || [];
  const firstVerse = verses[0];

  useEffect(() => {
    if (verses.length > 0 && firstVerse) {
      const [chId] = firstVerse.verse_key.split(':');
      setLastRead({
        chapterId: parseInt(chId, 10),
        verseKey: firstVerse.verse_key,
        chapterName: `Page ${page}`,
        pageNumber: page,
      });
    }
  }, [page, verses, firstVerse, setLastRead]);

  const handleAudioEnded = () => {
    const idx = verses.findIndex((v) => v.verse_key === playingVerseKey);
    if (idx >= 0 && idx < verses.length - 1) {
      setPlayingVerseKey(verses[idx + 1].verse_key);
    } else {
      setPlayingVerseKey(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="text-emerald-600 hover:underline mb-6 inline-block dark:text-emerald-400">
        ← Back
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <TranslationSelector />
        <ReciterSelector />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={wordByWord}
            onChange={(e) => setWordByWord(e.target.checked)}
            className="rounded border-emerald-300"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Word-by-word</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showTafsir}
            onChange={(e) => setShowTafsir(e.target.checked)}
            className="rounded border-emerald-300"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Tafsir</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showTajweed}
            onChange={(e) => setShowTajweed(e.target.checked)}
            className="rounded border-emerald-300"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Tajweed</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showNotes}
            onChange={(e) => setShowNotes(e.target.checked)}
            className="rounded border-emerald-300"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Notes</span>
        </label>
      </div>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Page {page} of {TOTAL_PAGES}</h1>
        <div className="flex gap-2 items-center">
          <Link
            to={`/page/${Math.max(1, page - 1)}`}
            className="rounded-lg border border-emerald-200 px-4 py-2 text-sm hover:bg-emerald-50 dark:border-emerald-700 dark:hover:bg-emerald-900/30"
          >
            ← Prev
          </Link>
          <input
            type="number"
            min={1}
            max={TOTAL_PAGES}
            value={page}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 1 && v <= TOTAL_PAGES) {
                window.location.href = `/page/${v}`;
              }
            }}
            className="w-16 rounded border border-emerald-200 px-2 py-1 text-center dark:border-emerald-700 dark:bg-gray-800"
          />
          <Link
            to={`/page/${Math.min(TOTAL_PAGES, page + 1)}`}
            className="rounded-lg border border-emerald-200 px-4 py-2 text-sm hover:bg-emerald-50 dark:border-emerald-700 dark:hover:bg-emerald-900/30"
          >
            Next →
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 dark:bg-gray-800 dark:border-emerald-900/50">
        {showTajweed && (
          <div className="mb-6">
            <TajweedLegend />
          </div>
        )}
        {verses.map((verse) => (
          <VerseView
            key={verse.id}
            verse={verse}
            isPlaying={verse.verse_key === playingVerseKey}
            onAudioEnded={handleAudioEnded}
            onPlay={() => setPlayingVerseKey(verse.verse_key)}
            showWords={wordByWord}
            showTafsir={showTafsir}
            showTajweed={showTajweed}
            onBookmark={toggleBookmark}
            isBookmarked={isBookmarked(verse.verse_key)}
            note={showNotes ? getNote(verse.verse_key) : undefined}
            onNoteChange={showNotes ? setNote : undefined}
          />
        ))}
      </div>
    </div>
  );
}
