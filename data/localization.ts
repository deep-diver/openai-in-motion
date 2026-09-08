import { chapters } from './chapters';
import translations from './en/chapters.json';
import metadata from './en/metadata.json';
import notes from './en/object-callouts.json';
import dialogue from './en/cast-dialogue.json';
import {
  CAST_DIALOGUE,
  OBJECT_NOTES,
  type DialogueLine,
  type ObjectId,
  type ObjectNote,
} from './sceneNotes';
import type { Chapter } from './types';

export type Locale = 'ko' | 'en';
type ChapterText = Pick<
  Chapter,
  'title' | 'short' | 'description' | 'detail' | 'dateLabel'
> & {
  beats: { title: string; caption: string }[];
};
const englishText = translations as Record<string, ChapterText>;
const englishMetadata = metadata as Record<string, string>;
export const englishChapters: Chapter[] = chapters.map((chapter) => {
  const text = englishText[chapter.id];
  return {
    ...chapter,
    ...text,
    beats: chapter.beats.map((beat, i) => ({
      ...beat,
      ...text.beats[i],
    })) as Chapter['beats'],
    personRoles: Object.fromEntries(
      Object.entries(chapter.personRoles ?? {}).map(([id, role]) => [
        id,
        englishMetadata[role] ?? role,
      ]),
    ),
    sources: chapter.sources.map((source) => ({
      ...source,
      title: englishMetadata[source.title] ?? source.title,
    })),
  };
});
export const localizedChapters = (locale: Locale) =>
  locale === 'en' ? englishChapters : chapters;
export const localizedNotes = (locale: Locale) =>
  locale === 'en'
    ? (notes as Record<string, Partial<Record<ObjectId, ObjectNote>>>)
    : OBJECT_NOTES;
export const localizedDialogue = (locale: Locale) =>
  locale === 'en'
    ? (dialogue as Record<string, DialogueLine[]>)
    : CAST_DIALOGUE;
