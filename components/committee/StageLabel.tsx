'use client';
import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';
import type { Vec3 } from '@/components/timeline/primitives';
/** Local typography for the committee miniatures, including real line breaks. */
export default function StageLabel({
  text,
  p = [0, 0, 0],
  w = 1,
  h = 0.5,
  color = '#203449',
  background = 'transparent',
  size = 64,
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
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    if (background !== 'transparent') {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, 1024, 512);
    }
    const lines = text.split('\n');
    const font = Math.min(size * 2, 340 / lines.length);
    ctx.font = `600 ${font}px "Noto Sans KR", Arial, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.forEach((line, i) =>
      ctx.fillText(
        line,
        512,
        256 + (i - (lines.length - 1) / 2) * font * 1.2,
        980,
      ),
    );
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
