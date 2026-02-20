import { Link, useLocation } from 'react-router-dom';

export default function JuzSidebar() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentJuz = searchParams.get('juz');

  return (
    <aside className="w-48 flex-shrink-0 hidden lg:block">
      <div className="sticky top-20 rounded-xl border border-emerald-100 bg-white p-4 dark:bg-gray-800 dark:border-emerald-900/50">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Juz</h3>
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              to={`/juz?juz=${n}`}
              className={`flex h-8 w-8 items-center justify-center rounded text-sm font-medium transition ${
                location.pathname === '/juz' && currentJuz === String(n)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-200'
              }`}
            >
              {n}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
