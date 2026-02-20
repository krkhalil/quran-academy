import { Link } from 'react-router-dom';
import SurahList from '../components/SurahList';
import { useLastRead } from '../hooks/usePreferences';

export default function HomePage() {
  const [lastRead] = useLastRead();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">The Holy Quran</h1>
      <p className="text-gray-600 mb-6 dark:text-gray-400">Select a surah to start reading</p>

      {lastRead && (
        <Link
          to={`/surah/${lastRead.chapterId}`}
          className="mb-8 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Continue reading</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {lastRead.chapterName} • Verse {lastRead.verseKey?.split(':')[1] || ''}
            </p>
          </div>
        </Link>
      )}

      <SurahList />
    </div>
  );
}
