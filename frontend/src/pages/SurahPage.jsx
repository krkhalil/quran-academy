import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getChapter, getVerses } from '../api/quran';
import VerseView from '../components/VerseView';
import TranslationSelector from '../components/TranslationSelector';
import ReciterSelector from '../components/ReciterSelector';
import { useTranslation, useRecitation, useLastRead, useBookmarks } from '../hooks/usePreferences';

export default function SurahPage() {
  const { id } = useParams();
  const chapterId = parseInt(id, 10);
  const [page, setPage] = useState(1);
  const [wordByWord, setWordByWord] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [playingVerseKey, setPlayingVerseKey] = useState(null);

  const [translationId] = useTranslation();
  const [recitationId] = useRecitation();
  const [, setLastRead] = useLastRead();
  const [bookmarks, { toggleBookmark, isBookmarked }] = useBookmarks();

  const perPage = 20;

  const { data: chapterData, isLoading: chapterLoading } = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: () => getChapter(chapterId),
    enabled: !!chapterId,
  });

  const { data: versesData, isLoading: versesLoading } = useQuery({
    queryKey: ['verses', chapterId, translationId, recitationId, wordByWord, page],
    queryFn: () =>
      getVerses(chapterId, {
        translations: translationId,
        audio: parseInt(recitationId, 10),
        words: wordByWord,
        page,
        per_page: perPage,
      }),
    enabled: !!chapterId,
    staleTime: 30 * 60 * 1000,
  });

  const chapter = chapterData?.chapter;
  const verses = versesData?.verses || [];
  const pagination = versesData?.pagination;
  const isLoading = chapterLoading || versesLoading;

  useEffect(() => {
    if (verses.length > 0 && chapter) {
      setLastRead({
        chapterId,
        verseKey: verses[0].verse_key,
        chapterName: chapter.name_simple || `Surah ${chapterId}`,
      });
    }
  }, [chapterId, chapter, verses, setLastRead]);

  const handleAudioEnded = useCallback(() => {
    const idx = verses.findIndex((v) => v.verse_key === playingVerseKey);
    if (idx >= 0 && idx < verses.length - 1) {
      setPlayingVerseKey(verses[idx + 1].verse_key);
    } else {
      setPlayingVerseKey(null);
    }
  }, [playingVerseKey, verses]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600">Surah not found.</p>
        <Link to="/" className="text-emerald-600 hover:underline mt-4 inline-block">
          Back to Surahs
        </Link>
      </div>
    );
  }

  const translatedName = chapter.translated_name?.name || chapter.name_simple;
  const totalPages = pagination?.total_pages || 1;

  return (
    <div>
      <Link to="/" className="text-emerald-600 hover:underline mb-6 inline-block dark:text-emerald-400">
        ← Back to Surahs
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
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8 mb-8 dark:bg-gray-800 dark:border-emerald-900/50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{chapter.name_simple}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{translatedName}</p>
          <p className="font-arabic text-3xl text-emerald-800 dark:text-emerald-300 mt-4" dir="rtl">
            {chapter.name_arabic}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {chapter.verses_count} verses • {chapter.revelation_place}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 dark:bg-gray-800 dark:border-emerald-900/50">
        {chapter.bismillah_pre !== false && (
          <>
            <p className="font-arabic text-2xl text-emerald-900 text-center mb-6 dark:text-emerald-100" dir="rtl">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </p>
            <p className="text-center text-gray-500 text-sm mb-8 dark:text-gray-400">
              In the name of Allah, the Most Gracious, the Most Merciful
            </p>
          </>
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
            onBookmark={toggleBookmark}
            isBookmarked={isBookmarked(verse.verse_key)}
          />
        ))}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-emerald-200 px-4 py-2 text-sm disabled:opacity-50 dark:border-emerald-700"
            >
              Previous
            </button>
            <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-emerald-200 px-4 py-2 text-sm disabled:opacity-50 dark:border-emerald-700"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
