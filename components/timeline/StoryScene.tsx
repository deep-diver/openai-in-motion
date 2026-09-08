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

export type StoryProps = {
  chapter: Chapter;
  playing: boolean;
  speed: number;
  replayKey: number;
  seek: { serial: number; beat: number } | null;
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
  const lastReel = useRef({ id: chapter.id, replayKey });
  const callbacks = useRef({ onFrame, onComplete });
  useLayoutEffect(() => {
    callbacks.current = { onFrame, onComplete };
  }, [onFrame, onComplete]);
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
    return () => {
      tl.kill();
    };
  }, [chapter.id, deck.active, replayKey, reducedMotion, chapter]);
  useLayoutEffect(() => {
    if (!timeline.current) return;
    configurePlayback(timeline.current, playing, reducedMotion, speed);
  }, [playing, speed, reducedMotion, chapter.id, replayKey]);
  useLayoutEffect(() => {
    if (!seek || !timeline.current) return;
    if (reducedMotion) {
      timeline.current
        .time(
          STORY_TIMING.entry + seek.beat * STORY_TIMING.beatLength + 3,
          true,
        )
        .pause();
      callbacks.current.onFrame({
        chapterId: chapter.id,
        beat: seek.beat,
        progress: (seek.beat + 1) / 3,
        phase: 'story',
      });
      return;
    }
    timeline.current.seek(`beat-${seek.beat}`, false);
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
    </>
  );
}
