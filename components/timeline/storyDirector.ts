import gsap from 'gsap';
import { Color, Group, Mesh, MeshStandardMaterial, type Object3D } from 'three';
import { AXES, type Action, type Chapter } from '@/data/types';
import { addHistoricalMotion } from './historicalMotion';
import { addContinuousMotion } from './continuousMotion';
import { STORY_TIMING } from './storyClock';
export { STORY_TIMING } from './storyClock';

export type StoryFrame = {
  chapterId: string;
  beat: number;
  progress: number;
  phase: 'transition' | 'story';
};
type Pose = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  sx: number;
  sy: number;
  sz: number;
};
function pose(object: Object3D): Pose {
  return (object.userData.storyHome ??= {
    x: object.position.x,
    y: object.position.y,
    z: object.position.z,
    rx: object.rotation.x,
    ry: object.rotation.y,
    rz: object.rotation.z,
    sx: object.scale.x,
    sy: object.scale.y,
    sz: object.scale.z,
  });
}
function restore(object: Object3D) {
  const p = pose(object);
  object.position.set(p.x, p.y, p.z);
  object.rotation.set(p.rx, p.ry, p.rz);
  object.scale.set(p.sx, p.sy, p.sz);
}
function action(
  tl: gsap.core.Timeline,
  target: Object3D,
  kind: Action,
  at: number,
) {
  const p = pose(target);
  switch (kind) {
    case 'reveal':
    case 'arrive':
      tl.fromTo(
        target.scale,
        { x: 0, y: 0, z: 0 },
        {
          x: p.sx,
          y: p.sy,
          z: p.sz,
          duration: 0.75,
          ease: 'elastic.out(1, 0.5)',
        },
        at,
      );
      if (kind === 'arrive')
        tl.fromTo(
          target.position,
          { x: p.x + 1.2 },
          { x: p.x, duration: 1, ease: 'power2.out' },
          at,
        );
      break;
    case 'pulse':
      target.traverse((part) => {
        if (
          part instanceof Mesh &&
          part.material instanceof MeshStandardMaterial &&
          part.material.emissive.getHex() !== 0
        ) {
          const intensity = part.material.emissiveIntensity;
          tl.to(
            part.material,
            {
              emissiveIntensity: intensity + 0.5,
              duration: 0.4,
              yoyo: true,
              repeat: 1,
              ease: 'sine.inOut',
            },
            at,
          );
        }
      });
      break;
    case 'grow':
      tl.to(
        target.scale,
        {
          x: p.sx * 1.22,
          y: p.sy * 1.22,
          z: p.sz * 1.22,
          duration: 1.1,
          ease: 'elastic.out(1,.5)',
        },
        at,
      );
      break;
    case 'rise':
      tl.fromTo(
        target.position,
        { y: p.y - 0.55 },
        { y: p.y, duration: 0.9, ease: 'back.out(1.7)' },
        at,
      );
      break;
    case 'write': {
      const lines: Object3D[] = [];
      target.traverse((part) => {
        if (part.name.startsWith('screen:line:')) lines.push(part);
      });
      lines.forEach((line, i) => {
        const h = pose(line);
        tl.fromTo(
          line.scale,
          { x: 0 },
          { x: h.sx, duration: 0.45, ease: 'power2.out' },
          at + i * 0.22,
        );
      });
      break;
    }
    case 'walk':
      tl.to(
        target.position,
        { x: p.x + 0.36, z: p.z - 0.3, duration: 1.2, ease: 'power1.inOut' },
        at,
      );
      tl.to(
        target.rotation,
        { z: 0.07, duration: 0.16, repeat: 5, yoyo: true },
        at,
      );
      break;
    case 'leave':
      tl.to(
        target.position,
        { x: p.x + 2, y: p.y - 0.2, duration: 1.25, ease: 'power2.in' },
        at,
      );
      // Leaving is a spatial exit; people never miniaturize mid-story.
      break;
    case 'scatter':
      target.children.forEach((part, i) => {
        const h = pose(part);
        tl.to(
          part.position,
          {
            x: h.x + (i % 2 ? 0.65 : -0.65),
            y: h.y + 0.45,
            z: h.z + (i % 3) * 0.25,
            duration: 0.75,
          },
          at + i * 0.035,
        );
      });
      break;
    case 'connect':
      if (target.name === 'story:data')
        tl.to(
          target.position,
          {
            x: p.x - (target.parent?.position.x ?? 0) * 0.65,
            y: p.y + 0.4,
            z: p.z - 0.5,
            duration: 1.3,
            ease: 'power2.inOut',
          },
          at,
        );
      break;
    case 'open': {
      const door = target.getObjectByName('gate:door');
      if (door)
        tl.to(
          door.rotation,
          { y: -Math.PI * 0.58, duration: 1.25, ease: 'power2.inOut' },
          at,
        );
      else {
        tl.to(
          target.rotation,
          { y: p.ry + 0.3, duration: 0.5, yoyo: true, repeat: 1 },
          at,
        );
        tl.to(
          target.position,
          { y: p.y + 0.35, duration: 0.5, yoyo: true, repeat: 1 },
          at,
        );
      }
      break;
    }
    case 'orbit':
      tl.to(
        target.rotation,
        { y: p.ry + Math.PI * 2, duration: 2.5, ease: 'sine.inOut' },
        at,
      );
      break;
    case 'tilt':
      tl.to(
        target.rotation,
        {
          z: p.rz + 0.13,
          duration: 0.15,
          yoyo: true,
          repeat: 7,
          ease: 'sine.inOut',
        },
        at,
      );
      break;
    case 'stamp':
      tl.fromTo(
        target.position,
        { y: p.y + 0.7 },
        { y: p.y, duration: 0.75, ease: 'bounce.out' },
        at,
      );
      break;
  }
  const arm = target.getObjectByName('arm:right');
  if (arm && kind !== 'leave') {
    pose(arm);
    tl.to(
      arm.rotation,
      { z: -1.15, duration: 0.45, yoyo: true, repeat: 1, ease: 'power2.inOut' },
      at + 0.2,
    );
  }
}
export type DirectorOptions = {
  incoming: Group;
  outgoing: Group | null;
  bridge: Group | null;
  chapter: Chapter;
  reducedMotion: boolean;
  replay?: boolean;
  onFrame: (frame: StoryFrame) => void;
  onComplete: (id: string) => void;
};

/** One film reel: the edit, three scripted beats, and the handoff to the next scene. */
export function createStoryTimeline({
  incoming,
  outgoing,
  bridge,
  chapter,
  reducedMotion,
  replay = false,
  onFrame,
  onComplete,
}: DirectorOptions) {
  const preserve =
    incoming.visible && incoming.userData.chapterId === chapter.id && !replay;
  incoming.userData.chapterId = chapter.id;
  incoming.userData.storyTime = 0;
  const actors = incoming.children;
  actors.forEach((actor) => {
    pose(actor);
    actor.traverse((child) => {
      if (child !== actor) {
        pose(child);
        restore(child);
      }
    });
  });
  let lastReport = -1;
  const tl = gsap.timeline({
    paused: true,
    onUpdate: () => {
      const time = tl.time();
      incoming.userData.storyTime = time;
      const progress = time / STORY_TIMING.duration;
      const bucket = Math.floor(time * 10);
      if (bucket !== lastReport) {
        lastReport = bucket;
        onFrame({
          chapterId: chapter.id,
          progress,
          beat: Math.max(
            0,
            Math.min(
              2,
              Math.floor(
                (time - STORY_TIMING.entry + 1e-6) / STORY_TIMING.beatLength,
              ),
            ),
          ),
          phase: time < STORY_TIMING.entry ? 'transition' : 'story',
        });
      }
    },
    onComplete: () => onComplete(chapter.id),
  });
  incoming.visible = true;
  if (outgoing) {
    outgoing.children.forEach((actor, i) => {
      const p = pose(actor);
      const at = i * 0.035;
      tl.to(
        actor.scale,
        { x: 0, y: 0, z: 0, duration: 0.38, ease: 'back.in(1.7)' },
        at,
      );
      tl.to(
        actor.position,
        { y: p.y - 0.7, x: p.x * 0.85, duration: 0.4, ease: 'power2.in' },
        at,
      );
    });
    tl.set(outgoing, { visible: false }, 0.8);
  }
  actors.forEach((actor, i) => {
    const p = pose(actor);
    if (!preserve) {
      actor.scale.setScalar(0);
      actor.position.set(p.x, p.y + (i % 2 ? 1.1 : -0.6), p.z);
    }
    const at = (preserve ? 0 : 0.32) + i * STORY_TIMING.stagger;
    tl.to(
      actor.scale,
      { x: p.sx, y: p.sy, z: p.sz, duration: 0.8, ease: 'elastic.out(1, 0.5)' },
      at,
    );
    tl.to(
      actor.position,
      { x: p.x, y: p.y, z: p.z, duration: 0.7, ease: 'back.out(1.7)' },
      at,
    );
    tl.to(actor.rotation, { x: p.rx, y: p.ry, z: p.rz, duration: 0.65 }, at);
  });
  // A persistent light carries across every edit. The platform and this object never unmount.
  if (bridge) {
    const col = new Color(AXES[chapter.axis].color);
    tl.to(
      bridge.position,
      { x: -0.45, y: 3.2, z: 0.25, duration: 0.45, ease: 'power2.out' },
      0,
    );
    tl.to(
      bridge.position,
      { x: 0, y: 2.7, z: -0.4, duration: 0.7, ease: 'power2.inOut' },
      0.45,
    );
    tl.to(
      bridge.rotation,
      { y: bridge.rotation.y + Math.PI, duration: 1.15, ease: 'power2.inOut' },
      0,
    );
    bridge.traverse((part) => {
      if (
        part instanceof Mesh &&
        part.material instanceof MeshStandardMaterial
      ) {
        tl.to(
          part.material.color,
          { r: col.r, g: col.g, b: col.b, duration: 0.9 },
          0.2,
        );
        tl.to(
          part.material.emissive,
          { r: col.r, g: col.g, b: col.b, duration: 0.9 },
          0.2,
        );
      }
    });
  }
  // Results emerge during the story, not all at once with the set.
  const output = incoming.getObjectByName('story:output');
  if (output) output.scale.setScalar(0.001);
  let outputScheduled = false;
  chapter.beats.forEach((beat, index) => {
    const at = STORY_TIMING.entry + index * STORY_TIMING.beatLength;
    tl.addLabel(`beat-${index}`, at);
    beat.actions.forEach((a, i) => {
      const target = incoming.getObjectByName(`story:${a.target}`);
      if (target) {
        if (a.target === 'output' && !outputScheduled) {
          outputScheduled = true;
          if (!['reveal', 'arrive', 'grow'].includes(a.action))
            tl.set(target.scale, { x: 1, y: 1, z: 1 }, at + i * 0.18 - 0.01);
        }
        action(tl, target, a.action, at + i * 0.18);
      }
    });
  });
  // Set-specific action inside the narrative, driven by the same pause/seek clock.
  const film = incoming.getObjectByName('film:subject');
  if (film)
    tl.to(
      film.position,
      { x: 0.55, duration: 1.8, yoyo: true, repeat: 2, ease: 'sine.inOut' },
      4.6,
    );
  incoming.traverse((part) => {
    if (part.name.startsWith('game:')) {
      const p = pose(part);
      const blue = part.name.includes('blue');
      tl.to(
        part.position,
        {
          x: p.x + (blue ? 0.5 : -0.5),
          z: p.z + (blue ? 0.3 : -0.3),
          duration: 1.3,
          repeat: 3,
          yoyo: true,
          ease: 'power2.inOut',
        },
        3.2,
      );
    }
    if (part.name.startsWith('wave:')) {
      const p = pose(part);
      tl.to(
        part.scale,
        {
          y: p.sy * 0.35,
          duration: 0.3,
          repeat: 11,
          yoyo: true,
          delay: Number(part.name.split(':')[1]) * 0.07,
        },
        1.6,
      );
    }
  });
  // A future custom scene without an output cue still has a visible final result.
  if (output && !outputScheduled)
    tl.to(
      output.scale,
      { x: 1, y: 1, z: 1, duration: 0.7, ease: 'back.out(1.7)' },
      STORY_TIMING.entry + 2 * STORY_TIMING.beatLength,
    );
  addHistoricalMotion(tl, incoming, chapter);
  addContinuousMotion(tl, incoming, bridge, chapter);
  const hold = { value: 0 };
  tl.to(hold, { value: 1, duration: 0.2 }, STORY_TIMING.duration - 0.2);
  if (reducedMotion) {
    tl.totalProgress(1, true);
    incoming.userData.storyTime = STORY_TIMING.duration;
    if (outgoing) outgoing.visible = false;
    onFrame({ chapterId: chapter.id, beat: 2, progress: 1, phase: 'story' });
  } else tl.play();
  return tl;
}

/** A paused navigation displays the new scene's first beat, never its invisible frame zero. */
export function configurePlayback(
  tl: gsap.core.Timeline,
  playing: boolean,
  reducedMotion: boolean,
  speed: number,
) {
  tl.timeScale(speed);
  if (playing && !reducedMotion) tl.play();
  else {
    if (!reducedMotion && tl.time() < 0.001)
      tl.time(STORY_TIMING.entry + 1.35, false);
    tl.pause();
  }
}
