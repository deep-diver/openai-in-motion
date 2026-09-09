'use client';
/* eslint-disable react/react-compiler -- The render loop follows inherited Three.js visibility. */
import { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import type { Vec3 } from '@/components/timeline/primitives';
import { stageText } from './stageText';
/** Screen-facing DOM type remains sharp and a readable size at any camera zoom. */
export default function StageLabel({
  text,
  p = [0, 0, 0],
  w = 1,
  color = '#203449',
  background = 'transparent',
}: {
  text: string;
  p?: Vec3;
  w?: number;
  h?: number;
  color?: string;
  background?: string;
  size?: number;
  rotation?: Vec3;
}) {
  const root = useRef<Group>(null);
  const label = useRef<HTMLSpanElement>(null);
  const point = useRef(new Vector3());
  useFrame(() => {
    if (!root.current || !label.current) return;
    let visible = true;
    let changingSet = false;
    for (
      let node: Group | null = root.current;
      node;
      node = node.parent as Group | null
    ) {
      if (node.name === 'active-scene') changingSet = true;
      if (
        !node.visible ||
        node.name === 'previous-scene' ||
        node.scale.x < 0.15
      ) {
        visible = false;
        break;
      }
    }
    root.current.getWorldPosition(point.current);
    visible = visible && (!changingSet || point.current.y > 0);
    label.current.style.opacity = visible ? '1' : '0';
  });
  return (
    <group ref={root} position={p}>
      <Html center zIndexRange={[1, 0]} pointerEvents="none">
        <span
          ref={label}
          className={`committee-set-label${w > 2.5 ? ' committee-set-label-title' : ''}`}
          style={{
            opacity: 0,
            color,
            background:
              background !== 'transparent'
                ? background
                : color === '#203449'
                  ? '#f5f9f3f2'
                  : '#163044f2',
          }}
        >
          {stageText(text)}
        </span>
      </Html>
    </group>
  );
}
