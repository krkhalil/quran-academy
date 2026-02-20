import { useState } from 'react';
import { TAJWEED_RULES } from '../utils/translation';

export default function TajweedLegend() {
  const [expanded, setExpanded] = useState(false);
  const rules = Object.entries(TAJWEED_RULES);

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/20 dark:border-emerald-800/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors"
      >
        <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
          Tajweed colors – hover over highlighted text for details
        </span>
        <svg
          className={`w-5 h-5 text-emerald-600 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {rules.map(([key, { color, label, desc }]) => (
            <div
              key={key}
              className="flex items-start gap-2 rounded-lg bg-white dark:bg-gray-800/50 px-3 py-2 border border-emerald-100 dark:border-emerald-800/50"
              title={desc}
            >
              <span
                className="flex-shrink-0 w-4 h-4 rounded mt-0.5"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
