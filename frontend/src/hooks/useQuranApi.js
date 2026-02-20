import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChapters,
  getChapter,
  getVerses,
  getVersesByJuz,
  getTranslations,
  getRecitations,
  getJuzs,
  getVerseByKey,
  getTafsirs,
  getTafsirForVerse,
} from '../api/quran';

export function useChapters(language = 'en') {
  return useQuery({
    queryKey: ['chapters', language],
    queryFn: () => getChapters(language),
    staleTime: 60 * 60 * 1000,
  });
}

export function useChapter(chapterId, language = 'en') {
  return useQuery({
    queryKey: ['chapter', chapterId, language],
    queryFn: () => getChapter(chapterId, language),
    enabled: !!chapterId,
  });
}

export function useVerses(chapterId, options = {}) {
  return useQuery({
    queryKey: ['verses', chapterId, options],
    queryFn: () => getVerses(chapterId, options),
    enabled: !!chapterId,
    staleTime: 30 * 60 * 1000,
  });
}

export function useVersesByJuz(juzNumber, options = {}) {
  return useQuery({
    queryKey: ['versesByJuz', juzNumber, options],
    queryFn: () => getVersesByJuz(juzNumber, options),
    enabled: !!juzNumber,
    staleTime: 30 * 60 * 1000,
  });
}

export function useTranslations(language = 'en') {
  return useQuery({
    queryKey: ['translations', language],
    queryFn: () => getTranslations(language),
    staleTime: 60 * 60 * 1000,
  });
}

export function useRecitations() {
  return useQuery({
    queryKey: ['recitations'],
    queryFn: () => getRecitations(),
    staleTime: 60 * 60 * 1000,
  });
}

export function useJuzs() {
  return useQuery({
    queryKey: ['juzs'],
    queryFn: () => getJuzs(),
    staleTime: 60 * 60 * 1000,
  });
}

export function useVerseByKey(verseKey, options = {}) {
  return useQuery({
    queryKey: ['verse', verseKey, options],
    queryFn: () => getVerseByKey(verseKey, options),
    enabled: !!verseKey,
  });
}

export function useTafsirs() {
  return useQuery({
    queryKey: ['tafsirs'],
    queryFn: () => getTafsirs(),
    staleTime: 60 * 60 * 1000,
  });
}

export function useTafsirForVerse(tafsirId, verseKey, enabled = true) {
  return useQuery({
    queryKey: ['tafsir', tafsirId, verseKey],
    queryFn: () => getTafsirForVerse(tafsirId, verseKey),
    enabled: enabled && !!verseKey,
    staleTime: 60 * 60 * 1000,
  });
}
