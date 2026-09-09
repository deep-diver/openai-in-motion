import { clamp01 } from './motion';
/** Keep the citation on screen for roughly four seconds even at 5× playback. */
export function evidenceWindow(
  progress: number,
  speed: number,
  reduced: boolean,
) {
  if (reduced) return { opacity: 0, remaining: 0, visible: false };
  const start = speed >= 3 ? 0.08 : 0.32;
  const end = speed >= 3 ? 0.96 : 0.82;
  const fade = Math.min(0.04 * speed, 0.08);
  const smooth = (t: number) => {
    const v = clamp01(t);
    return v * v * (3 - 2 * v);
  };
  const opacity = Math.min(
    smooth((progress - start) / fade),
    smooth((end - progress) / fade),
  );
  return {
    opacity,
    visible: opacity > 0,
    remaining: clamp01((end - progress) / (end - start)),
  };
}
