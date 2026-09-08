'use client';
/* eslint-disable react/react-compiler -- Three.js objects are mutable external scene state; GSAP intentionally mutates them from effects. */

import { useLayoutEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { Group, type Object3D } from 'three';

export const MOTION = {
  stagger: 0.05,
  exitDuration: 0.28,
  enterDuration: 0.85,
  enterEase: 'elastic.out(1, 0.5)',
  assembleEase: 'back.out(1.7)',
} as const;

type Home = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
};
function home(actor: Object3D): Home {
  // Save authored positions once; interrupted transitions must not change them.
  return (actor.userData.home ??= {
    x: actor.position.x,
    y: actor.position.y,
    z: actor.position.z,
    rx: actor.rotation.x,
    ry: actor.rotation.y,
    rz: actor.rotation.z,
  });
}

/** A single timeline owns every transform. Repeated navigation cancels cleanly. */
export function useStageTransition(
  groups: RefObject<(Group | null)[]>,
  step: number,
  reducedMotion: boolean,
  burst: RefObject<Group | null>,
) {
  const previous = useRef<number | null>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  useLayoutEffect(() => {
    animation.current?.kill();
    const chapters = groups.current;
    const target = chapters[step];
    if (!target) return;
    chapters.forEach((g) => g?.children.forEach(home));

    if (reducedMotion) {
      chapters.forEach((group, index) => {
        if (!group) return;
        group.visible = index === step;
        group.children.forEach((actor) => {
          const p = home(actor);
          actor.scale.setScalar(step === 4 ? 1.04 : 1);
          actor.position.set(p.x, p.y, p.z);
          actor.rotation.set(p.rx, p.ry, p.rz);
        });
      });
      if (burst.current) burst.current.visible = false;
      previous.current = step;
      return;
    }

    const from = previous.current;
    const wasTargetVisible = target.visible;
    const outgoing = chapters.filter(
      (g, i): g is Group => !!g && g.visible && i !== step,
    );
    const tl = gsap.timeline();
    animation.current = tl;
    let enterAt = from === null ? 0.2 : 0;
    outgoing.forEach((group) => {
      if (group.children.every((actor) => actor.scale.lengthSq() < 0.00001)) {
        group.visible = false;
        return;
      }
      group.children.forEach((actor, index) => {
        const p = home(actor);
        const at = index * MOTION.stagger;
        const scatter = from === 1; // Server era dissolves into the ChatGPT wave.
        tl.to(
          actor.scale,
          {
            x: 0,
            y: 0,
            z: 0,
            duration: MOTION.exitDuration,
            ease: 'back.in(1.7)',
          },
          at,
        );
        tl.to(
          actor.position,
          {
            x: p.x + (scatter ? (index % 2 ? 0.65 : -0.65) : 0),
            y: p.y + (scatter ? 0.8 : -0.9),
            duration: MOTION.exitDuration,
            ease: 'power2.in',
          },
          at,
        );
        tl.to(
          actor.rotation,
          {
            z: p.rz + (scatter ? (index % 2 ? 0.6 : -0.6) : -0.07),
            duration: MOTION.exitDuration,
          },
          at,
        );
      });
      const end =
        MOTION.exitDuration +
        Math.max(0, group.children.length - 1) * MOTION.stagger;
      tl.set(group, { visible: false }, end);
      enterAt = Math.max(enterAt, end);
    });

    if (burst.current) {
      const particles = burst.current;
      particles.visible = from === 1 && outgoing.length > 0;
      if (particles.visible)
        particles.children.forEach((particle, i) => {
          const angle = i * 2.399;
          particle.position.set(
            Math.cos(angle) * 0.6,
            0.7 + (i % 4) * 0.2,
            Math.sin(angle) * 0.6,
          );
          particle.scale.setScalar(1);
          tl.to(
            particle.position,
            {
              x: Math.cos(angle) * (2 + (i % 3) * 0.3),
              y: 1.7 + (i % 5) * 0.4,
              z: Math.sin(angle) * 2,
              duration: 0.55,
              ease: 'power2.out',
            },
            0.05,
          );
          tl.to(particle.scale, { x: 0, y: 0, z: 0, duration: 0.45 }, 0.16);
        });
      tl.set(particles, { visible: false }, 0.65);
    }

    target.visible = true;
    target.children.forEach((actor, index) => {
      const p = home(actor);
      const drop = step === 0 || step === 2;
      // A rapid return to an exiting chapter reverses from its live pose.
      if (!wasTargetVisible) {
        actor.scale.setScalar(0);
        actor.position.set(p.x, p.y + (drop ? 2 : -0.8), p.z);
        actor.rotation.set(p.rx, p.ry, p.rz + (step === 1 ? 0.18 : 0));
      }
      const at = (wasTargetVisible ? 0 : enterAt) + index * MOTION.stagger;
      const scale = step === 4 ? 1.04 : 1;
      tl.to(
        actor.scale,
        {
          x: scale,
          y: scale,
          z: scale,
          duration: MOTION.enterDuration,
          ease: MOTION.enterEase,
        },
        at,
      );
      tl.to(
        actor.position,
        {
          x: p.x,
          y: p.y,
          z: p.z,
          duration: 0.72,
          ease: drop ? 'bounce.out' : MOTION.assembleEase,
        },
        at,
      );
      tl.to(
        actor.rotation,
        { x: p.rx, y: p.ry, z: p.rz, duration: 0.7, ease: MOTION.assembleEase },
        at,
      );
    });
    previous.current = step;
    return () => {
      tl.kill();
    };
  }, [groups, step, reducedMotion, burst]);
}
