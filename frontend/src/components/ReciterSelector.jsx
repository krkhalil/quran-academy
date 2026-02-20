import { useQuery } from '@tanstack/react-query';
import { getRecitations } from '../api/quran';
import { useRecitation } from '../hooks/usePreferences';

export default function ReciterSelector({ className = '' }) {
  const [recitationId, setRecitationId] = useRecitation();
  const { data, isLoading } = useQuery({
    queryKey: ['recitations'],
    queryFn: () => getRecitations(),
    staleTime: 60 * 60 * 1000,
  });

  const recitations = data?.recitations || [];

  if (isLoading || recitations.length === 0) return null;

  return (
    <select
      value={recitationId}
      onChange={(e) => setRecitationId(e.target.value)}
      className={`rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-emerald-700 dark:bg-gray-800 dark:text-gray-200 ${className}`}
    >
      {recitations.map((r) => (
        <option key={r.id} value={r.id}>
          {r.reciter_name} {r.style ? `(${r.style})` : ''}
        </option>
      ))}
    </select>
  );
}
