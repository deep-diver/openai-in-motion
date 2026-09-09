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
