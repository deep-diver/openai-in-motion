'use client';
import type { ReactNode } from 'react';
import type { Vec3 } from './primitives';
export function Actor({
  id,
  p = [0, 0, 0],
  children,
}: {
  id: string;
  p?: Vec3;
  children: ReactNode;
}) {
  return (
    <group name={`actor:${id}`} position={p}>
      <group name={`story:${id}`}>{children}</group>
    </group>
  );
}
