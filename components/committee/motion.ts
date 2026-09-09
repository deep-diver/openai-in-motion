import gsap from 'gsap';
const enterEase = gsap.parseEase('back.out(1.7)');
const exitEase = gsap.parseEase('power2.in');
export const SCENE_DURATION = 24;
export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
/** Incoming geometry rises while the previous scene leaves; the stage itself persists. */
export function layerPose(
  elapsed: number,
  previous: boolean,
  reduced: boolean,
) {
  const entrance = reduced ? 1 : clamp01(elapsed / 1.25);
  return {
    visible: !previous || entrance < 1,
    y: previous ? -exitEase(entrance) * 4 : (enterEase(entrance) - 1) * 3.5,
  };
}
export function entryPose(elapsed: number, index: number, reduced: boolean) {
  const t = reduced ? 1 : clamp01((elapsed - index * 0.05) / 1.2);
  return { scale: enterEase(t), y: (t - 1) * 1.3 };
}

export const navigationStart = (playing: boolean, reduced: boolean) =>
  reduced ? SCENE_DURATION : playing ? 0 : 3;

/** A short fade through empty space keeps two paragraphs from becoming a blurry double exposure. */
export function captionWeight(progress: number, index: number) {
  const active = Math.min(2, Math.floor(clamp01(progress) * 3));
  if (index !== active) return 0;
  const start = index / 3,
    end = (index + 1) / 3;
  const fadeIn = index === 0 ? 1 : clamp01((progress - start) / 0.015);
  const fadeOut = index === 2 ? 1 : clamp01((end - progress) / 0.015);
  const value = Math.min(fadeIn, fadeOut);
  return value * value * (3 - 2 * value);
}

/** Main actions settle into a readable final tableau; small ambient loops remain separate. */
export function activityTime(elapsed: number) {
  const t = clamp01((elapsed - 2) / 18);
  return t * t * (3 - 2 * t) * 18;
}
export function speakingGesture(
  progress: number,
  secondary: boolean,
  dual: boolean,
) {
  const start = dual ? (secondary ? 0.48 : 0.12) : 0.16;
  const duration = dual ? 0.32 : 0.58;
  return Math.sin(clamp01((progress - start) / duration) * Math.PI);
}
