import { Link } from 'react-router-dom';
import { useBookmarks } from '../hooks/usePreferences';

export default function BookmarksPage() {
  const [bookmarks, { removeBookmark }] = useBookmarks();

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 dark:text-gray-400 mb-4">No bookmarks yet.</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Click the bookmark icon on any verse while reading to save it here.
        </p>
        <Link to="/" className="text-emerald-600 hover:underline mt-4 inline-block dark:text-emerald-400">
          Browse Surahs
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Bookmarks</h1>
      <div className="space-y-3">
        {bookmarks.map((b) => (
          <div
            key={b.verse_key}
            className="flex items-center justify-between p-4 rounded-xl bg-white border border-emerald-100 dark:bg-gray-800 dark:border-emerald-900/50"
          >
            <Link to={`/surah/${b.chapter_id}#verse-${b.verse_number}`} className="flex-1">
              <span className="font-arabic text-lg text-emerald-900 dark:text-emerald-100" dir="rtl">
                {b.text}
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {b.verse_key} • Verse {b.verse_number}
              </p>
            </Link>
            <button
              onClick={() => removeBookmark(b.verse_key)}
              className="ml-4 text-red-500 hover:text-red-600 p-2"
              title="Remove bookmark"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
