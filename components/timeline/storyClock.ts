import type { Chapter } from '@/data/types';

export const STORY_TIMING = {
  entry: 1.25,
  beatLength: 3,
  duration: 14.2,
  stagger: 0.05,
} as const;
export const cueTime = (index: number) =>
  STORY_TIMING.entry + index * STORY_TIMING.beatLength;
export const smoothstep = (a: number, b: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** The three editorial cues overlap; they never stop or restart the scene clock. */
export function captionWeights(time: number): [number, number, number] {
  const first = smoothstep(cueTime(1) - 0.6, cueTime(1) + 0.6, time);
  const second = smoothstep(cueTime(2) - 0.6, cueTime(2) + 0.6, time);
  return [1 - first, first - second, second];
}
export function dialogueWindow(chapter: Chapter, index: number) {
  const count = chapter.people.length;
  const start = count === 1 ? 2 : 1.6 + index * 5;
  return { start, end: Math.min(13.5, start + (count === 1 ? 8 : 4.8)) };
}
export function dialogueOpacity(time: number, start: number, end: number) {
  return (
    smoothstep(start, start + 0.5, time) *
    (1 - smoothstep(end - 0.55, end, time))
  );
}
export function staticSpeaker(chapter: Chapter, time: number) {
  return chapter.people.findIndex((_, i) => {
    const { start, end } = dialogueWindow(chapter, i);
    return time >= start && time < end;
  });
}
/** The secondary note leaves before a character speaks, keeping at most two panels visible. */
export function secondaryNoteOpacity(
  chapter: Chapter,
  time: number,
  reducedMotion: boolean,
) {
  if (reducedMotion) return staticSpeaker(chapter, time) >= 0 ? 0 : 1;
  let occupied = 0;
  chapter.people.forEach((_, i) => {
    const { start, end } = dialogueWindow(chapter, i);
    occupied = Math.max(
      occupied,
      smoothstep(start - 0.45, start, time) *
        (1 - smoothstep(end, end + 0.45, time)),
    );
  });
  return 1 - occupied;
}
export type StorySeek =
  | { serial: number; beat: number }
  | { serial: number; progress: number };
