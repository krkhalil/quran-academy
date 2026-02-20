import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ placeholder = 'Search...', onSearch, className = '' }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const q = query.trim();
      if (q) {
        if (onSearch) onSearch(q);
        else navigate(`/search?q=${encodeURIComponent(q)}`);
      }
    },
    [query, onSearch, navigate]
  );

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-gray-700 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-emerald-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
      />
      <button
        type="submit"
        className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        Search
      </button>
    </form>
  );
}
