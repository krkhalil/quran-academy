import { Link } from 'react-router-dom';

export default function SurahCard({ surah }) {
  const translatedName = surah.translated_name?.name || surah.name_simple;
  return (
    <Link
      to={`/surah/${surah.id}`}
      className="block p-4 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:border-emerald-900/50 dark:hover:border-emerald-700"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-sm dark:bg-emerald-900/50 dark:text-emerald-200">
            {surah.id}
          </span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{surah.name_simple}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{translatedName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-arabic text-xl text-emerald-800 dark:text-emerald-300" dir="rtl">
            {surah.name_arabic}
          </p>
          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">{surah.verses_count} verses</p>
        </div>
      </div>
    </Link>
  );
}
