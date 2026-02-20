import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export const getChapters = (language = 'en') =>
  api.get('/chapters/', { params: { language } }).then((r) => r.data);

export const getChapter = (chapterId, language = 'en') =>
  api.get(`/chapters/${chapterId}/`, { params: { language } }).then((r) => r.data);

export const getVerses = (chapterId, options = {}) => {
  const { translations = '131', audio = 1, words = false, tafsirs, page = 1, per_page = 20 } = options;
  return api
    .get(`/chapters/${chapterId}/verses/`, {
      params: { translations, audio, words: words.toString(), tafsirs, page, per_page },
    })
    .then((r) => r.data);
};

export const getTranslations = (language = 'en') =>
  api.get('/translations/', { params: { language } }).then((r) => r.data);

export const getRecitations = () => api.get('/recitations/').then((r) => r.data);

export const getJuzs = () => api.get('/juzs/').then((r) => r.data);

export const getVersesByJuz = (juzNumber, options = {}) => {
  const { translations = '131', page = 1, per_page = 20 } = options;
  return api
    .get(`/juzs/${juzNumber}/verses/`, {
      params: { translations, page, per_page },
    })
    .then((r) => r.data);
};

export const getVerseByKey = (verseKey, options = {}) => {
  const { translations = '131' } = options;
  return api
    .get(`/verses/by_key/${encodeURIComponent(verseKey)}/`, { params: { translations } })
    .then((r) => r.data);
};

export const getTafsirs = () => api.get('/tafsirs/').then((r) => r.data);

export const getTafsirForVerse = (tafsirId, verseKey) =>
  api.get(`/tafsirs/${tafsirId}/`, { params: { verse_key: verseKey } }).then((r) => r.data);

export const getTafsirForChapter = (tafsirId, chapterNumber) =>
  api.get(`/tafsirs/${tafsirId}/`, { params: { chapter_number: chapterNumber } }).then((r) => r.data);

export const AUDIO_BASE = 'https://verses.quran.com/';
