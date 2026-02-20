import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTafsirForVerse } from '../api/quran';

export default function TafsirSection({ verseKey, tafsirId = '169' }) {
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['tafsir', tafsirId, verseKey],
    queryFn: () => getTafsirForVerse(tafsirId, verseKey),
    enabled: expanded && !!verseKey,
    staleTime: 60 * 60 * 1000,
  });

  const tafsirs = data?.tafsirs || [];
  const hasContent = tafsirs.length > 0;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-amber-600 hover:underline dark:text-amber-400"
      >
        {expanded ? 'Hide' : 'Show'} Tafsir
      </button>
      {expanded && (
        <div className="mt-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
          {isLoading || isFetching ? (
            <p className="text-sm text-gray-500">Loading tafsir...</p>
          ) : hasContent ? (
            tafsirs.map((t) => (
              <div key={t.id} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.text}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">
              Tafsir is not available for this verse. Ensure QF_CLIENT_ID and QF_CLIENT_SECRET are set in backend/.env.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
