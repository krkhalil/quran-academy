import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getChapters, getVerses } from '../api/quran';
import { useTranslation } from '../hooks/usePreferences';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [translationId] = useTranslation();

  const { data: chaptersData } = useQuery({
    queryKey: ['chapters'],
    queryFn: () => getChapters('en'),
    staleTime: 60 * 60 * 1000,
  });

  const chapters = chaptersData?.chapters || [];
  const query = q.toLowerCase().trim();

  const chapterResults = [];
  if (query.length >= 2) {
    for (const ch of chapters) {
      const nameMatch =
        ch.name_simple?.toLowerCase().includes(query) ||
        ch.name_arabic?.includes(query) ||
        ch.translated_name?.name?.toLowerCase().includes(query);
      if (nameMatch) {
        chapterResults.push({ type: 'chapter', ...ch });
      }
    }
  }

  // Verse-level search: fetch from first 3 surahs
  const { data: versesData1 } = useQuery({
    queryKey: ['verses', 1, translationId],
    queryFn: () => getVerses(1, { translations: translationId, per_page: 10 }),
    enabled: query.length >= 2,
  });
  const { data: versesData2 } = useQuery({
    queryKey: ['verses', 2, translationId],
    queryFn: () => getVerses(2, { translations: translationId, per_page: 50 }),
    enabled: query.length >= 2,
  });
  const { data: versesData3 } = useQuery({
    queryKey: ['verses', 3, translationId],
    queryFn: () => getVerses(3, { translations: translationId, per_page: 50 }),
    enabled: query.length >= 2,
  });

  const verseResults = [];
  if (query.length >= 2) {
    const allVerses = [
      ...(versesData1?.verses || []).map((v) => ({ ...v, chapter_id: 1 })),
      ...(versesData2?.verses || []).map((v) => ({ ...v, chapter_id: 2 })),
      ...(versesData3?.verses || []).map((v) => ({ ...v, chapter_id: 3 })),
    ];
    for (const v of allVerses) {
      const transText = v.translations?.[0]?.text || '';
      const arabicMatch = v.text_uthmani?.includes(query) || v.text_uthmani?.includes(q);
      const transMatch = transText.toLowerCase().includes(query);
      if (arabicMatch || transMatch) {
        verseResults.push(v);
      }
    }
  }

  const results = chapterResults;
  const hasVerseResults = verseResults.length > 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Search</h1>
      {!q ? (
        <p className="text-gray-600 dark:text-gray-400">Enter a search term in the header to find surahs.</p>
      ) : results.length === 0 && !hasVerseResults ? (
        <p className="text-gray-600 dark:text-gray-400">
          No results for &quot;{q}&quot;. Try surah names (Fatihah, Yaseen) or English words (mercy, lord).
        </p>
      ) : (
        <div className="space-y-6">
          {hasVerseResults && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Verses matching &quot;{q}&quot;</h2>
              <div className="space-y-2">
                {verseResults.slice(0, 20).map((v) => (
                  <Link
                    key={`${v.chapter_id}-${v.verse_number}`}
                    to={`/surah/${v.chapter_id}?verse=${v.verse_number}`}
                    className="block p-4 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 dark:bg-gray-800 dark:border-emerald-900/50"
                  >
                    <p className="font-arabic text-lg text-emerald-900 dark:text-emerald-100" dir="rtl">
                      {v.text_uthmani}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {v.translations?.[0]?.text?.slice(0, 150)}...
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {v.verse_key} • Surah {v.chapter_id}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {results.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Surahs</h2>
              <div className="space-y-2">
                {results.map((r) => (
                  <Link
                    key={r.id}
                    to={`/surah/${r.id}`}
                    className="block p-4 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 dark:bg-gray-800 dark:border-emerald-900/50"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">{r.name_simple}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                      {r.translated_name?.name} • {r.verses_count} verses
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
