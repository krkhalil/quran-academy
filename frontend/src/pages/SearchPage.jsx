import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getChapters, searchQuran } from '../api/quran';
import { cleanTranslationText } from '../utils/translation';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const { data: chaptersData } = useQuery({
    queryKey: ['chapters'],
    queryFn: () => getChapters('en'),
    staleTime: 60 * 60 * 1000,
  });

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['search', q],
    queryFn: () => searchQuran(q, { size: 30 }),
    enabled: q.length >= 2,
    staleTime: 2 * 60 * 1000,
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

  const searchResults = searchData?.search?.results || [];
  const totalResults = searchData?.search?.total_results || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Search</h1>
      {!q ? (
        <p className="text-gray-600 dark:text-gray-400">Enter a search term in the header to find verses and surahs.</p>
      ) : searchLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {searchResults.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Verses matching &quot;{q}&quot; {totalResults > 0 && `(${totalResults} total)`}
              </h2>
              <div className="space-y-2">
                {searchResults.map((v) => {
                  const [chId, vNum] = (v.verse_key || '').split(':');
                  const transText = cleanTranslationText(v.translations?.[0]?.text || '');
                  return (
                    <Link
                      key={v.verse_id || v.verse_key}
                      to={`/surah/${chId}?verse=${vNum}`}
                      className="block p-4 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 dark:bg-gray-800 dark:border-emerald-900/50"
                    >
                      <p className="font-arabic text-lg text-emerald-900 dark:text-emerald-100" dir="rtl">
                        {v.text}
                      </p>
                      {transText && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {transText.length > 200 ? transText.slice(0, 200) + '...' : transText}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{v.verse_key}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          {chapterResults.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Surahs</h2>
              <div className="space-y-2">
                {chapterResults.map((r) => (
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
          {query.length >= 2 && searchResults.length === 0 && chapterResults.length === 0 && !searchLoading && (
            <p className="text-gray-600 dark:text-gray-400">
              No results for &quot;{q}&quot;. Try surah names (Fatihah, Yaseen) or keywords in English or Arabic.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
