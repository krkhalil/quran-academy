import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useTheme } from '../hooks/usePreferences';

const POPULAR_SURAHS = [
  { id: 1, name: 'Al-Fatihah' },
  { id: 2, name: 'Al-Baqarah' },
  { id: 36, name: 'Yaseen' },
  { id: 67, name: 'Al-Mulk' },
  { id: 78, name: 'An-Naba' },
];

export default function Header() {
  const [theme, setTheme] = useTheme();

  return (
    <header className="bg-emerald-800 text-white shadow-lg dark:bg-emerald-950">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link to="/" className="text-2xl font-bold tracking-tight hover:text-emerald-100 transition">
            UK Quran Academy
          </Link>
          <div className="flex items-center gap-4">
            <SearchBar placeholder="Search Quran..." className="max-w-xs" />
            <nav className="flex items-center gap-4">
              <Link to="/" className="hover:text-emerald-100 transition">
                Surahs
              </Link>
              <Link to="/juz" className="hover:text-emerald-100 transition">
                Juz
              </Link>
              <Link to="/page/1" className="hover:text-emerald-100 transition">
                Page
              </Link>
              <Link to="/bookmarks" className="hover:text-emerald-100 transition">
                Bookmarks
              </Link>
              <a
                href={`${import.meta.env.VITE_API_BASE || '/api'}/oauth/login/`}
                className="hover:text-emerald-100 transition"
              >
                Sign in with Quran.com
              </a>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-emerald-700/50 transition"
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                {theme === 'dark' ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </nav>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-emerald-200 text-sm">Popular:</span>
          {POPULAR_SURAHS.map((s) => (
            <Link
              key={s.id}
              to={`/surah/${s.id}`}
              className="text-sm px-2 py-1 rounded bg-emerald-700/50 hover:bg-emerald-700 transition"
            >
              {s.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
