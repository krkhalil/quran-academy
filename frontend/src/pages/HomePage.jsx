import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SurahList from '../components/SurahList';
import { useLastRead } from '../hooks/usePreferences';

export default function HomePage() {
  const [lastRead] = useLastRead();
  const navigate = useNavigate();
  const [jumpPage, setJumpPage] = useState('');
  const [jumpVerse, setJumpVerse] = useState('');

  const handleJumpToPage = (e) => {
    e.preventDefault();
    const p = parseInt(jumpPage, 10);
    if (p >= 1 && p <= 604) navigate(`/page/${p}`);
  };

  const handleJumpToVerse = (e) => {
    e.preventDefault();
    const match = jumpVerse.match(/^(\d+):(\d+)$/);
    if (match) {
      const [, ch, v] = match;
      navigate(`/surah/${ch}?verse=${v}`);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">The Holy Quran</h1>
      <p className="text-gray-600 mb-6 dark:text-gray-400">Select a surah to start reading</p>

      <div className="mb-6 flex flex-wrap gap-4">
        <form onSubmit={handleJumpToPage} className="flex gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Jump to page:</span>
          <input
            type="number"
            min={1}
            max={604}
            placeholder="1-604"
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            className="w-20 rounded border border-emerald-200 px-2 py-1 dark:border-emerald-700 dark:bg-gray-800"
          />
          <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-1 text-white text-sm hover:bg-emerald-700">
            Go
          </button>
        </form>
        <form onSubmit={handleJumpToVerse} className="flex gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Jump to verse:</span>
          <input
            type="text"
            placeholder="2:255"
            value={jumpVerse}
            onChange={(e) => setJumpVerse(e.target.value)}
            className="w-24 rounded border border-emerald-200 px-2 py-1 dark:border-emerald-700 dark:bg-gray-800"
          />
          <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-1 text-white text-sm hover:bg-emerald-700">
            Go
          </button>
        </form>
      </div>

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
