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

/** Overlapping subtitles preserve continuity at both story boundaries. */
export function captionWeight(progress: number, index: number) {
  const blend = (edge: number) => {
    const t = clamp01((progress - edge + 0.035) / 0.07);
    return t * t * (3 - 2 * t);
  };
  if (index === 0) return 1 - blend(1 / 3);
  if (index === 1) return blend(1 / 3) - blend(2 / 3);
  return blend(2 / 3);
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
