import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChapters } from '../api/quran';
import SurahCard from './SurahCard';

const SORT_OPTIONS = [
  { value: 'surah', label: 'Surah order' },
  { value: 'revelation', label: 'Revelation order' },
  { value: 'juz', label: 'By Juz' },
];

export default function SurahList() {
  const [sort, setSort] = useState('surah');
  const { data, isLoading, error } = useQuery({
    queryKey: ['chapters'],
    queryFn: () => getChapters('en'),
    staleTime: 60 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-600">
        <p>Failed to load chapters. Make sure the backend is running on port 8000.</p>
      </div>
    );
  }

  let chapters = data?.chapters || [];

  if (sort === 'revelation') {
    chapters = [...chapters].sort((a, b) => (a.revelation_order || 0) - (b.revelation_order || 0));
  } else if (sort === 'juz') {
    chapters = [...chapters].sort((a, b) => {
      const juzA = a.pages?.[0] ? Math.ceil(a.pages[0] / 20) : 1;
      const juzB = b.pages?.[0] ? Math.ceil(b.pages[0] / 20) : 1;
      return juzA - juzB || a.id - b.id;
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none dark:border-emerald-700 dark:bg-gray-800 dark:text-gray-200"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {chapters.map((surah) => (
          <SurahCard key={surah.id} surah={surah} />
        ))}
      </div>
    </div>
  );
}
