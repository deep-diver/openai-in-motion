'use client';

import { useEffect, useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { CanvasTexture, SRGBColorSpace } from 'three';

export type Vec3 = [number, number, number];
export function Box({
  p = [0, 0, 0],
  s = [1, 1, 1],
  c = '#e8e8d8',
  r = 0.025,
  rotation = [0, 0, 0],
  glow = false,
  opacity = 1,
}: {
  p?: Vec3;
  s?: Vec3;
  c?: string;
  r?: number;
  rotation?: Vec3;
  glow?: boolean;
  opacity?: number;
}) {
  const material = (
    <meshStandardMaterial
      color={c}
      roughness={0.56}
      metalness={0.08}
      emissive={glow ? c : '#000000'}
      emissiveIntensity={glow ? 0.65 : 0}
      transparent={opacity < 1}
      opacity={opacity}
      depthWrite={opacity === 1}
    />
  );
  return r > 0 ? (
    <RoundedBox
      position={p}
      args={s}
      radius={Math.min(r, ...s.map((n) => n / 3))}
      smoothness={2}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      {material}
    </RoundedBox>
  ) : (
    <mesh position={p} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={s} />
      {material}
    </mesh>
  );
}
export function Cylinder({
  p = [0, 0, 0],
  r = 0.1,
  h = 1,
  c = '#707967',
  rotation = [0, 0, 0],
  top,
  glow = false,
}: {
  p?: Vec3;
  r?: number;
  h?: number;
  c?: string;
  rotation?: Vec3;
  top?: number;
  glow?: boolean;
}) {
  return (
    <mesh position={p} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[top ?? r, r, h, 24]} />
      <meshStandardMaterial
        color={c}
        roughness={0.5}
        metalness={0.12}
        emissive={glow ? c : '#000000'}
        emissiveIntensity={glow ? 0.7 : 0}
      />
    </mesh>
  );
}
export function Ball({
  p = [0, 0, 0],
  r = 0.1,
  c = '#c6f77d',
  glow = false,
}: {
  p?: Vec3;
  r?: number;
  c?: string;
  glow?: boolean;
}) {
  return (
    <mesh position={p} castShadow>
      <sphereGeometry args={[r, 16, 12]} />
      <meshStandardMaterial
        color={c}
        roughness={0.4}
        emissive={glow ? c : '#000000'}
        emissiveIntensity={glow ? 1 : 0}
      />
    </mesh>
  );
}
export function Label({
  text,
  p = [0, 0, 0],
  w = 1,
  h = 0.4,
  color = '#e5eed9',
  background = 'transparent',
  size = 70,
  rotation = [0, 0, 0],
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
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    if (background !== 'transparent') {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, 512, 256);
    }
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${size}px monospace`;
    ctx.fillText(text, 256, 130, 490);
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    return result;
  }, [text, color, background, size]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={p} rotation={rotation}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        map={texture}
        transparent
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}
export function Ring({
  p = [0, 0, 0],
  r = 1,
  c = '#bbdd87',
  rotation = [Math.PI / 2, 0, 0],
  tube = 0.012,
}: {
  p?: Vec3;
  r?: number;
  c?: string;
  rotation?: Vec3;
  tube?: number;
}) {
  return (
    <mesh position={p} rotation={rotation}>
      <torusGeometry args={[r, tube, 6, 64]} />
      <meshStandardMaterial
        color={c}
        emissive={c}
        emissiveIntensity={0.7}
        roughness={0.5}
      />
    </mesh>
  );
}
export function Plant({
  p = [0, 0, 0],
  scale = 1,
}: {
  p?: Vec3;
  scale?: number;
}) {
  return (
    <group position={p} scale={scale}>
      <Cylinder p={[0, 0.22, 0]} r={0.24} top={0.29} h={0.44} c="#c5b58e" />
      <Cylinder p={[0, 0.75, 0]} h={0.75} r={0.035} c="#606b39" />
      {[0, 1, 2, 3, 4].map((v) => (
        <group
          key={v}
          rotation={[0, v * 2.4, 0]}
          position={[0, 0.56 + v * 0.12, 0]}
        >
          <mesh
            position={[0.15, 0.06, 0]}
            rotation={[0, 0, -0.6]}
            scale={[0.28, 0.095, 0.12]}
            castShadow
          >
            <sphereGeometry args={[1, 12, 8]} />
            <meshStandardMaterial color={v % 2 ? '#8f9e65' : '#697d4a'} />
            <group />
          </mesh>
        </group>
      ))}
    </group>
  );
}
