'use client';
/* eslint-disable react/react-compiler -- GSAP owns mutable Three.js scene graph state inside effects. */
import { useLayoutEffect, useRef, useState } from 'react';
import { Group } from 'three';
import type gsap from 'gsap';
import { Box, Ring } from './primitives';
import { StoryActors } from './StoryActors';
import {
  createStoryTimeline,
  configurePlayback,
  STORY_TIMING,
  type StoryFrame,
} from './storyDirector';
import type { Chapter } from '@/data/types';
import { AnnotationProjector, type AnnotationBridge } from './StageAnnotations';
import type { StorySeek } from './storyClock';

export type StoryProps = {
  chapter: Chapter;
  playing: boolean;
  speed: number;
  replayKey: number;
  seek: StorySeek | null;
  annotations?: AnnotationBridge;
  reducedMotion: boolean;
  onFrame: (f: StoryFrame) => void;
  onComplete: (id: string) => void;
};
export function StoryScene({
  chapter,
  playing,
  speed,
  replayKey,
  seek,
  reducedMotion,
  onFrame,
  onComplete,
  annotations,
}: StoryProps) {
  const [deck, setDeck] = useState<{
    slots: [Chapter | null, Chapter | null];
    active: number;
  }>({ slots: [chapter, null], active: 0 });
  // Two persistent buffers retain the actual outgoing poses; no chapter mounts until needed.
  if (deck.slots[deck.active]?.id !== chapter.id) {
    const found = deck.slots.findIndex((c) => c?.id === chapter.id);
    const next = found >= 0 ? found : 1 - deck.active;
    const slots: [Chapter | null, Chapter | null] = [...deck.slots];
    slots[next] = chapter;
    setDeck({ slots, active: next });
  }
  const groups = useRef<(Group | null)[]>([]);
  const bridge = useRef<Group>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const seekTween = useRef<gsap.core.Tween | null>(null);
  const lastReel = useRef({ id: chapter.id, replayKey });
  const callbacks = useRef({ onFrame, onComplete });
  const playback = useRef(playing);
  useLayoutEffect(() => {
    callbacks.current = { onFrame, onComplete };
    playback.current = playing;
  }, [onFrame, onComplete, playing]);
  useLayoutEffect(() => {
    const incoming = groups.current[deck.active];
    if (!incoming) return;
    timeline.current?.kill();
    const outgoing = groups.current[1 - deck.active] ?? null;
    const replay =
      lastReel.current.id === chapter.id &&
      lastReel.current.replayKey !== replayKey;
    lastReel.current = { id: chapter.id, replayKey };
    const tl = createStoryTimeline({
      incoming,
      outgoing,
      bridge: bridge.current,
      chapter,
      reducedMotion,
      replay,
      onFrame: (f) => callbacks.current.onFrame(f),
      onComplete: (id) => callbacks.current.onComplete(id),
    });
    timeline.current = tl;
    if (annotations) {
      annotations.scene = incoming;
      annotations.chapterId = chapter.id;
    }
    return () => {
      seekTween.current?.kill();
      tl.kill();
    };
  }, [chapter.id, deck.active, replayKey, reducedMotion, chapter, annotations]);
  useLayoutEffect(() => {
    if (!timeline.current) return;
    seekTween.current?.kill();
    configurePlayback(timeline.current, playing, reducedMotion, speed);
  }, [playing, speed, reducedMotion, chapter.id, replayKey]);
  useLayoutEffect(() => {
    if (!seek || !timeline.current) return;
    seekTween.current?.kill();
    const time =
      'beat' in seek
        ? STORY_TIMING.entry +
          seek.beat * STORY_TIMING.beatLength +
          (seek.beat > 0 ? 0.65 : 0)
        : Math.min(
            STORY_TIMING.duration - 0.001,
            seek.progress * STORY_TIMING.duration,
          );
    if (reducedMotion) {
      timeline.current.time('beat' in seek ? time + 2.8 : time, false).pause();
      return;
    }
    const tl = timeline.current;
    if ('progress' in seek) tl.time(time, false);
    else {
      seekTween.current = tl.tweenTo(time, {
        duration: Math.min(
          1.1,
          Math.max(0.35, Math.abs(time - tl.time()) * 0.12),
        ),
        ease: 'power2.inOut',
        onComplete: () => {
          if (playback.current) tl.play();
        },
      });
    }
  }, [seek, chapter.id, reducedMotion]);
  return (
    <>
      {deck.slots.map((item, i) => (
        <group
          key={i}
          ref={(el) => {
            groups.current[i] = el;
          }}
          visible={false}
        >
          {item && <StoryActors key={item.id} chapter={item} />}
        </group>
      ))}
      <group ref={bridge} position={[0, 2.7, -0.4]}>
        <Box s={[0.19, 0.19, 0.19]} c="#c6f77d" glow />
        <Ring r={0.22} rotation={[0.4, 0, 0.5]} tube={0.007} />
      </group>
      {annotations && (
        <AnnotationProjector
          chapter={chapter}
          bridge={annotations}
          reducedMotion={reducedMotion}
        />
      )}
    </>
  );
}
