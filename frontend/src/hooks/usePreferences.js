import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEYS = {
  translation: 'quran_translation',
  recitation: 'quran_recitation',
  theme: 'quran_theme',
  lastRead: 'quran_last_read',
  bookmarks: 'quran_bookmarks',
};

export function useTranslation() {
  const [translationId, setTranslationIdState] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.translation) || '131'
  );
  const setTranslationId = useCallback((id) => {
    setTranslationIdState(id);
    localStorage.setItem(STORAGE_KEYS.translation, id);
  }, []);
  return [translationId, setTranslationId];
}

export function useRecitation() {
  const [recitationId, setRecitationIdState] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.recitation) || '1'
  );
  const setRecitationId = useCallback((id) => {
    setRecitationIdState(id);
    localStorage.setItem(STORAGE_KEYS.recitation, id);
  }, []);
  return [recitationId, setRecitationId];
}

export function useTheme() {
  const [theme, setThemeState] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.theme) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
  const setTheme = useCallback((t) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEYS.theme, t);
    document.documentElement.classList.toggle('dark', t === 'dark');
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  return [theme, setTheme];
}

export function useLastRead() {
  const [lastRead, setLastReadState] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.lastRead);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const setLastRead = useCallback(({ chapterId, verseKey, chapterName }) => {
    const data = { chapterId, verseKey, chapterName, at: Date.now() };
    setLastReadState(data);
    localStorage.setItem(STORAGE_KEYS.lastRead, JSON.stringify(data));
  }, []);
  return [lastRead, setLastRead];
}

export function useBookmarks() {
  const [bookmarks, setBookmarksState] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.bookmarks);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const setBookmarks = useCallback((list) => {
    setBookmarksState(list);
    localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(list));
  }, []);
  const addBookmark = useCallback((verse) => {
    setBookmarksState((prev) => {
      const exists = prev.some((b) => b.verse_key === verse.verse_key);
      if (exists) return prev;
      const chapterId = verse.chapter_id ?? parseInt(verse.verse_key?.split(':')[0], 10);
      const next = [...prev, { verse_key: verse.verse_key, verse_number: verse.verse_number, text: verse.text_uthmani?.slice(0, 50), chapter_id: chapterId }];
      localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(next));
      return next;
    });
  }, []);
  const removeBookmark = useCallback((verseKey) => {
    setBookmarksState((prev) => {
      const next = prev.filter((b) => b.verse_key !== verseKey);
      localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(next));
      return next;
    });
  }, []);
  const isBookmarked = useCallback(
    (verseKey) => bookmarks.some((b) => b.verse_key === verseKey),
    [bookmarks]
  );
  const toggleBookmark = useCallback((verse) => {
    if (isBookmarked(verse.verse_key)) {
      removeBookmark(verse.verse_key);
    } else {
      addBookmark(verse);
    }
  }, [isBookmarked, addBookmark, removeBookmark]);
  return [bookmarks, { setBookmarks, addBookmark, removeBookmark, isBookmarked, toggleBookmark }];
}
