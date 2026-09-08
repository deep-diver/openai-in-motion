import { CatmullRomCurve3, Vector3, type Group } from 'three';
import type gsap from 'gsap';
import type { Chapter } from '@/data/types';
import { dialogueWindow } from './storyClock';

/** One moving thread carries an input through the work, model, and result.
 * Linear samples of a spline avoid the stop-at-every-cue rhythm of separate tweens.
 */
export function addContinuousMotion(
  tl: gsap.core.Timeline,
  scene: Group,
  bridge: Group | null,
  chapter: Chapter,
) {
  if (bridge) {
    const above = (id: string, height: number) => {
      const actor = scene.getObjectByName(`actor:${id}`);
      const p = actor?.userData.storyHome;
      return new Vector3(p?.x ?? 0, height, p?.z ?? 0);
    };
    const curve = new CatmullRomCurve3([
      new Vector3(0, 2.7, -0.4),
      above('data', 1.65),
      above('work', 2.1),
      above('hero', 2.3),
      above('output', 1.6),
      new Vector3(0.55, 2.55, 0),
      new Vector3(0, 2.7, -0.4),
    ]);
    const start = 1.2,
      length = 11.6,
      samples = 64;
    for (let i = 1; i <= samples; i++) {
      const point = curve.getPointAt(i / samples);
      tl.to(
        bridge.position,
        {
          x: point.x,
          y: point.y,
          z: point.z,
          duration: length / samples,
          ease: 'none',
        },
        start + ((i - 1) * length) / samples,
      );
    }
    tl.to(
      bridge.rotation,
      { y: '+=' + Math.PI * 2, duration: length, ease: 'none' },
      start,
    );
  }
  chapter.people.forEach((_, i) => {
    const person = scene.getObjectByName(`story:person-${i}`);
    const mouth = person?.getObjectByName('face:mouth');
    const arm = person?.getObjectByName('arm:right');
    const { start, end } = dialogueWindow(chapter, i);
    if (mouth)
      tl.to(
        mouth.scale,
        {
          y: 2.2,
          duration: 0.13,
          repeat: Math.floor((end - start - 1) / 0.26) * 2 - 1,
          yoyo: true,
          ease: 'sine.inOut',
        },
        start + 0.55,
      );
    if (arm)
      tl.to(
        arm.rotation,
        { y: -0.32, duration: 0.75, repeat: 3, yoyo: true, ease: 'sine.inOut' },
        start + 0.6,
      );
  });
}
