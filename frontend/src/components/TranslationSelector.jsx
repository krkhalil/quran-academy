import { useQuery } from '@tanstack/react-query';
import { getTranslations } from '../api/quran';
import { useTranslation } from '../hooks/usePreferences';

export default function TranslationSelector({ className = '' }) {
  const [translationId, setTranslationId] = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['translations'],
    queryFn: () => getTranslations('en'),
    staleTime: 60 * 60 * 1000,
  });

  const translations = data?.translations || [];

  if (isLoading || translations.length === 0) return null;

  return (
    <select
      value={translationId}
      onChange={(e) => setTranslationId(e.target.value)}
      className={`rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-emerald-700 dark:bg-gray-800 dark:text-gray-200 ${className}`}
    >
      {translations.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name} {t.author_name ? `(${t.author_name})` : ''}
        </option>
      ))}
    </select>
  );
}
