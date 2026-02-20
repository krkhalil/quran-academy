import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getJuzs, getVersesByJuz } from '../api/quran';
import VerseView from '../components/VerseView';
import TajweedLegend from '../components/TajweedLegend';
import TranslationSelector from '../components/TranslationSelector';
import { useTranslation } from '../hooks/usePreferences';

export default function JuzPage() {
  const [searchParams] = useSearchParams();
  const juzFromUrl = parseInt(searchParams.get('juz'), 10);
  const [selectedJuz, setSelectedJuz] = useState(juzFromUrl >= 1 && juzFromUrl <= 30 ? juzFromUrl : 1);

  useEffect(() => {
    if (juzFromUrl >= 1 && juzFromUrl <= 30) {
      setSelectedJuz(juzFromUrl);
    }
  }, [juzFromUrl]);
  const [page, setPage] = useState(1);
  const [showTajweed, setShowTajweed] = useState(false);
  const [translationId] = useTranslation();
  const perPage = 20;

  const { data: juzsData } = useQuery({
    queryKey: ['juzs'],
    queryFn: () => getJuzs(),
    staleTime: 60 * 60 * 1000,
  });

  const { data: versesData, isLoading } = useQuery({
    queryKey: ['versesByJuz', selectedJuz, translationId, page, showTajweed],
    queryFn: () =>
      getVersesByJuz(selectedJuz, {
        translations: translationId,
        page,
        per_page: perPage,
        tajweed: showTajweed,
      }),
    staleTime: 30 * 60 * 1000,
  });

  const juzs = juzsData?.juzs || [];
  const verses = versesData?.verses || [];
  const pagination = versesData?.pagination;
  const totalPages = pagination?.total_pages || 1;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <TranslationSelector />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showTajweed}
            onChange={(e) => setShowTajweed(e.target.checked)}
            className="rounded border-emerald-300"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Tajweed</span>
        </label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Juz:</label>
        <select
          value={selectedJuz}
          onChange={(e) => {
            setSelectedJuz(parseInt(e.target.value, 10));
            setPage(1);
          }}
          className="rounded-lg border border-emerald-200 bg-white px-3 py-2 dark:border-emerald-700 dark:bg-gray-800 dark:text-gray-200"
        >
          {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              Juz {n}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => {
              setSelectedJuz(n);
              setPage(1);
            }}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              selectedJuz === n
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 dark:bg-gray-800 dark:border-emerald-900/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Juz {selectedJuz}
          </h2>
          {showTajweed && (
            <div className="mb-6">
              <TajweedLegend />
            </div>
          )}
          {verses.map((verse) => (
            <div key={verse.id} className="border-b border-emerald-50 dark:border-emerald-900/30 last:border-0">
              <VerseView verse={verse} showTajweed={showTajweed} />
              <Link
                to={`/surah/${verse.verse_key?.split(':')[0] || verse.chapter_id}`}
                className="text-xs text-emerald-600 hover:underline inline-block mb-2"
              >
                Go to Surah
              </Link>
            </div>
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
      )}
    </div>
  );
}
