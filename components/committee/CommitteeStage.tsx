'use client';
/* eslint-disable react/react-compiler -- R3F scene objects are deliberately mutated by the animation clock. */
import {
  Component,
  useLayoutEffect,
  useRef,
  type RefObject,
  type ReactNode,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Group, OrthographicCamera, Vector3 } from 'three';
import { layerPose, entryPose } from './motion';
import {
  Box,
  Cylinder,
  Ball,
  Ring,
  Label,
  type Vec3,
} from '@/components/timeline/primitives';
import type { Scene } from '@/data/committee/types';
export type Clock = { time: number; previousTime: number; reduced: boolean };
export type Projection = RefObject<{
  object: HTMLDivElement | null;
  speaker: HTMLDivElement | null;
  objectLine: SVGPathElement | null;
  speakerLine: SVGPathElement | null;
}>;
const INK = '#203449',
  BLUE = '#5daeff',
  MINT = '#75d7bd',
  PAPER = '#f6f4e9',
  GOLD = '#edb474';
function Camera() {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const c = camera as OrthographicCamera;
    c.position.set(11, 11.8, 11);
    c.lookAt(0, 0.8, 0);
    c.zoom = Math.min(size.width / 11.8, size.height / 9.5);
    c.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}
function Person({ p, color = INK }: { p: Vec3; color?: string }) {
  return (
    <group position={p} name="person">
      <Cylinder p={[0, 0.37, 0]} r={0.16} h={0.46} c={color} />
      <Ball p={[0, 0.79, 0]} r={0.19} c="#e5b99a" />
      <Box p={[0, 0.93, -0.02]} s={[0.32, 0.12, 0.26]} c="#30363b" />
      <Box p={[0, 0.44, 0.157]} s={[0.038, 0.22, 0.03]} c={BLUE} />
      {[-0.09, 0.09].map((x) => (
        <Box key={x} p={[x, 0.08, 0]} s={[0.11, 0.22, 0.14]} c={INK} />
      ))}
    </group>
  );
}
function Screen({
  text,
  p = [0, 0, 0],
  color = BLUE,
  w = 1.65,
}: {
  text: string;
  p?: Vec3;
  color?: string;
  w?: number;
}) {
  return (
    <group position={p}>
      <Box p={[0, 0.92, 0]} s={[w, 0.98, 0.16]} c={INK} />
      <Box p={[0, 0.92, 0.092]} s={[w - 0.13, 0.82, 0.025]} c={color} />
      <Label
        text={text}
        p={[0, 0.93, 0.111]}
        w={w - 0.2}
        h={0.58}
        color={INK}
        size={67}
      />
      <Box p={[0, 0.29, 0]} s={[0.12, 0.55, 0.13]} c={INK} />
      <Box p={[0, 0.04, 0.02]} s={[0.64, 0.08, 0.42]} c={INK} />
    </group>
  );
}
function Rack({ p = [0, 0, 0], color = BLUE }: { p?: Vec3; color?: string }) {
  return (
    <group position={p}>
      <Box p={[0, 0.78, 0]} s={[0.66, 1.5, 0.6]} c={INK} />
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i}>
          <Box
            p={[0, 0.27 + i * 0.23, 0.313]}
            s={[0.51, 0.15, 0.03]}
            c="#425973"
          />
          <Ball p={[-0.19, 0.27 + i * 0.23, 0.35]} r={0.026} c={color} glow />
        </group>
      ))}
    </group>
  );
}
function Paper({
  p = [0, 0, 0],
  text = 'AI PLAN',
}: {
  p?: Vec3;
  text?: string;
}) {
  return (
    <group position={p}>
      <Box s={[1.4, 0.09, 1.8]} c={PAPER} />
      <Label
        text={text}
        p={[0, 0.052, 0]}
        w={1.15}
        h={0.5}
        color={INK}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      {[-0.5, -0.25, 0.45, 0.65].map((z) => (
        <Box
          key={z}
          p={[0, 0.054, z]}
          s={[0.95, 0.007, 0.025]}
          c={BLUE}
          r={0}
        />
      ))}
    </group>
  );
}
function Chip({ p = [0, 0, 0], text = 'AI' }: { p?: Vec3; text?: string }) {
  return (
    <group position={p}>
      <Box s={[1, 0.25, 1]} c={INK} />
      <Box p={[0, 0.16, 0]} s={[0.64, 0.09, 0.64]} c={MINT} />
      <Label
        text={text}
        p={[0, 0.22, 0]}
        w={0.6}
        h={0.4}
        color={INK}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      {[-1, 1].flatMap((side) =>
        [-0.3, 0, 0.3].map((n) => (
          <Box
            key={`${side}${n}`}
            p={[side * 0.58, 0, n]}
            s={[0.22, 0.08, 0.08]}
            c={GOLD}
          />
        )),
      )}
    </group>
  );
}
function Building({
  p = [0, 0, 0],
  height = 0.8,
  color = BLUE,
}: {
  p?: Vec3;
  height?: number;
  color?: string;
}) {
  return (
    <group position={p}>
      <Box p={[0, height / 2, 0]} s={[0.75, height, 0.65]} c={PAPER} />
      <Box p={[0, height + 0.04, 0]} s={[0.84, 0.12, 0.74]} c={color} />
      {[-0.19, 0.19].map((x) => (
        <Box
          key={x}
          p={[x, height * 0.65, 0.335]}
          s={[0.15, 0.23, 0.015]}
          c={BLUE}
        />
      ))}
    </group>
  );
}
function Robot({ p = [0, 0, 0] }: { p?: Vec3 }) {
  return (
    <group position={p}>
      <Cylinder r={0.34} h={0.15} c={INK} />
      <group name="robot">
        <Cylinder p={[0, 0.25, 0]} r={0.12} h={0.5} c={GOLD} />
        <Ball p={[0, 0.53, 0]} r={0.16} c={INK} />
        <Box
          p={[0.28, 0.72, 0]}
          s={[0.64, 0.17, 0.18]}
          c={GOLD}
          rotation={[0, 0, 0.5]}
        />
        <Ball p={[0.55, 0.88, 0]} r={0.13} c={INK} />
        <Box
          p={[0.74, 0.75, 0]}
          s={[0.49, 0.13, 0.13]}
          c={GOLD}
          rotation={[0, 0, -0.45]}
        />
        <Box p={[0.95, 0.56, 0]} s={[0.12, 0.25, 0.24]} c={INK} />
      </group>
    </group>
  );
}
function Globe() {
  return (
    <group name="globe">
      <Ball p={[0, 1.05, 0]} r={0.77} c={BLUE} />
      {[0, Math.PI / 2].map((y) => (
        <Ring
          key={y}
          p={[0, 1.05, 0]}
          r={0.81}
          c={MINT}
          rotation={[0, y, 0.3]}
          tube={0.015}
        />
      ))}
      <Ring p={[0, 1.05, 0]} r={0.81} c={PAPER} />
    </group>
  );
}
function Set({ scene }: { scene: Scene }) {
  switch (scene.set) {
    case 'assembly':
      return (
        <>
          <Cylinder p={[0, 0.62, 0]} r={1.38} h={0.16} c={INK} />
          <Cylinder p={[0, 0.3, 0]} r={0.75} h={0.55} c="#5b7893" />
          <Paper p={[0, 0.76, 0]} text="AI STRATEGY" />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <group key={i} name="entry">
                <Box
                  p={[Math.cos(a) * 1.95, 0.29, Math.sin(a) * 1.95]}
                  s={[0.48, 0.58, 0.48]}
                  c={i % 2 ? BLUE : MINT}
                />
                <Cylinder
                  p={[Math.cos(a) * 1.3, 0.78, Math.sin(a) * 1.3]}
                  r={0.05}
                  h={0.25}
                  c={INK}
                />
              </group>
            );
          })}
        </>
      );
    case 'network':
      return (
        <>
          <Screen text="CAIO" p={[0, 0.1, 0]} w={1.5} />
          {[-2, -1, 1, 2].map((x, i) => (
            <group key={x} name="entry">
              <Building
                p={[x, 0, i % 2 ? 1.25 : -0.7]}
                height={0.65}
                color={i % 2 ? MINT : BLUE}
              />
              <Box
                p={[x / 2, 0.065, i % 2 ? 0.62 : -0.35]}
                s={[Math.abs(x), 0.035, 0.035]}
                c={BLUE}
                rotation={[0, i % 2 ? -0.5 : 0.3, 0]}
              />
            </group>
          ))}
          {[0, 1, 2].map((i) => (
            <group key={i} name={`flow${i}`}>
              <Ball r={0.07} c={MINT} glow />
            </group>
          ))}
        </>
      );
    case 'compute':
      return (
        <>
          <group name="entry">
            <Rack p={[-1.7, 0, -0.65]} />
            <Rack p={[-0.85, 0, -0.65]} />
            <Rack p={[0, 0, -0.65]} />
          </group>
          <group name="entry">
            <Rack p={[1.1, 0, -0.65]} color={MINT} />
            <Rack p={[1.95, 0, -0.65]} color={MINT} />
          </group>
          <group name="chip">
            <Chip p={[0, 0.45, 1.15]} text={scene.metric || 'GPU'} />
          </group>
          <Box p={[0, 0.06, 0.7]} s={[4.5, 0.06, 0.075]} c={MINT} />
        </>
      );
    case 'models':
      return (
        <>
          {[-2, -1, 0, 1, 2].map((x, i) => (
            <group key={x} name="entry">
              <Box
                p={[x, 0.42 + (i % 2) * 0.13, 0]}
                s={[0.76, 0.8 + (i % 2) * 0.26, 0.8]}
                c={i % 2 ? MINT : BLUE}
              />
              <Label
                text={['LG', 'SKT', 'NAVER', 'UPSTAGE', 'NC'][i]}
                p={[x, 0.5, 0.415]}
                w={0.68}
                h={0.26}
                color={INK}
              />
            </group>
          ))}
          <Box p={[0, 0.06, 1]} s={[4.7, 0.06, 0.06]} c={GOLD} />
          <group name="scan">
            <Box p={[0, 1.25, 0]} s={[0.03, 0.03, 1.6]} c={PAPER} glow />
          </group>
        </>
      );
    case 'resilience':
      return (
        <>
          <group name="entry">
            <Rack p={[-1.5, 0, 0]} color={GOLD} />
            <Label text="PRIMARY" p={[-1.5, 1.8, 0]} w={1.3} h={0.25} />
          </group>
          <group name="backup">
            <Rack p={[1.5, 0, 0]} color={MINT} />
            <Label text="RECOVERY" p={[1.5, 1.8, 0]} w={1.3} h={0.25} />
          </group>
          <Box p={[0, 0.08, 0.6]} s={[3, 0.06, 0.06]} c={GOLD} />
          <group name="flow0">
            <Ball r={0.09} c={MINT} glow />
          </group>
          <group name="warning">
            <Box p={[0, 0.85, 0]} s={[0.38, 0.6, 0.15]} c={GOLD} />
            <Label text="!" p={[0, 0.85, 0.09]} w={0.25} h={0.45} color={INK} />
          </group>
        </>
      );
    case 'workshop':
      return (
        <>
          <Box p={[0, 1.3, -1]} s={[3.8, 2, 0.15]} c={PAPER} />
          {Array.from({ length: 12 }, (_, i) => (
            <group name="entry" key={i}>
              <Box
                p={[
                  -1.35 + (i % 4) * 0.9,
                  0.7 + Math.floor(i / 4) * 0.55,
                  -0.89,
                ]}
                s={[0.58, 0.37, 0.025]}
                c={i % 3 === 0 ? GOLD : i % 3 === 1 ? BLUE : MINT}
              />
            </group>
          ))}
          <Box p={[0, 0.5, 0.75]} s={[3, 0.13, 1]} c={INK} />
          <group name="document">
            <Paper p={[0, 0.61, 0.75]} text={scene.metric || 'DRAFT'} />
          </group>
        </>
      );
    case 'diplomacy':
      return (
        <>
          <Globe />
          <group name="entry">
            <Building p={[-1.8, 0, 0]} height={0.7} />
            <Label text="KOREA" p={[-1.8, 1.25, 0.35]} w={1.2} h={0.24} />
            <Building p={[1.8, 0, 0]} height={0.7} color={GOLD} />
            <Label
              text={scene.metric || 'PARTNER'}
              p={[1.8, 1.25, 0.35]}
              w={1.2}
              h={0.24}
            />
          </group>
          <Ring p={[0, 0.08, 0]} r={2} c={MINT} />
        </>
      );
    case 'document':
      return (
        <>
          <group name="entry">
            {[0, 1, 2, 3].map((i) => (
              <Paper
                key={i}
                p={[-0.45, i * 0.12 + 0.2, 0]}
                text={i === 3 ? scene.metric || 'PLAN' : ''}
              />
            ))}
          </group>
          <group name="stamp">
            <Cylinder p={[0.55, 1.7, 0.45]} r={0.26} h={0.35} c={INK} />
            <Box p={[0.55, 1.46, 0.45]} s={[0.72, 0.15, 0.5]} c={GOLD} />
          </group>
          <Screen
            text={scene.metric || 'PLAN'}
            p={[1.7, 0, -0.8]}
            color={MINT}
            w={1.35}
          />
        </>
      );
    case 'rights':
      return (
        <>
          <Cylinder p={[0, 0.8, 0]} r={0.08} h={1.6} c={INK} />
          <group name="balance">
            <Box p={[0, 1.55, 0]} s={[3, 0.09, 0.1]} c={GOLD} />
            {[-1.2, 1.2].map((x) => (
              <group key={x}>
                <Cylinder p={[x, 1.13, 0]} r={0.019} h={0.8} c={INK} />
                <Cylinder p={[x, 0.72, 0]} r={0.56} h={0.08} c={PAPER} />
              </group>
            ))}
            <Paper p={[-1.2, 0.84, 0]} text="RIGHTS" />
            <Chip p={[1.2, 0.9, 0]} text="AI" />
          </group>
          <Box p={[0, 0.06, 0]} s={[1, 0.12, 0.7]} c={INK} />
        </>
      );
    case 'school':
      return (
        <>
          <Screen text="AI + LEARNING" p={[0, 0.3, -1]} w={3.3} />
          {[-1, 1].flatMap((x) =>
            [0.4, 1.5].map((z) => (
              <group key={`${x}${z}`} name="entry">
                <Box p={[x, 0.48, z]} s={[0.95, 0.1, 0.62]} c={PAPER} />
                <Box p={[x, 0.22, z]} s={[0.1, 0.4, 0.1]} c={INK} />
                <Box p={[x, 0.57, z]} s={[0.5, 0.07, 0.34]} c={MINT} />
              </group>
            )),
          )}
        </>
      );
    case 'science':
      return (
        <>
          <Box p={[0, 0.5, 0]} s={[3, 0.14, 1.7]} c={PAPER} />
          <Robot p={[-1, 0.7, 0]} />
          <Screen text="K-MOONSHOT" p={[1, 0.6, -0.35]} w={1.4} />
          {Array.from({ length: 8 }, (_, i) => (
            <group name={`orbit${i}`} key={i}>
              <Ball r={0.1} c={i % 2 ? MINT : BLUE} />
            </group>
          ))}
          <Cylinder p={[0, 0.75, 0.3]} r={0.22} h={0.3} c={BLUE} />
        </>
      );
    case 'factory':
      return (
        <>
          <Box p={[0, 0.36, 0]} s={[4.2, 0.2, 0.9]} c={INK} />
          {[-1.9, -1.4, -0.9, -0.4, 0.1, 0.6, 1.1, 1.6].map((x) => (
            <Cylinder
              key={x}
              p={[x, 0.5, 0]}
              r={0.075}
              h={0.9}
              rotation={[Math.PI / 2, 0, 0]}
              c="#8195a7"
            />
          ))}
          <Robot p={[-1.2, 0, -1.1]} />
          <Robot p={[1.2, 0, 1.2]} />
          {[0, 1, 2].map((i) => (
            <group key={i} name={`parcel${i}`}>
              <Box
                p={[0, 0.74, 0]}
                s={[0.4, 0.36, 0.4]}
                c={i % 2 ? MINT : GOLD}
              />
            </group>
          ))}
        </>
      );
    case 'mobility':
      return (
        <>
          <Box p={[0, 0.04, 0]} s={[4.7, 0.06, 2.8]} c={INK} />
          {[-1.7, -0.8, 0.1, 1, 1.9].map((x) => (
            <Box key={x} p={[x, 0.08, 0]} s={[0.4, 0.01, 0.04]} c={PAPER} />
          ))}
          <group name="car">
            <Box p={[0, 0.32, 0]} s={[1.05, 0.28, 0.55]} c={PAPER} />
            <Box p={[0, 0.55, 0]} s={[0.57, 0.28, 0.49]} c={BLUE} />
            {[-0.32, 0.32].flatMap((x) =>
              [-0.29, 0.29].map((z) => (
                <Cylinder
                  key={`${x}${z}`}
                  p={[x, 0.19, z]}
                  r={0.13}
                  h={0.09}
                  rotation={[Math.PI / 2, 0, 0]}
                  c={INK}
                />
              )),
            )}
            <Ring p={[0, 0.7, 0]} r={0.4} c={MINT} />
          </group>
          <Building p={[-1.7, 0, -1.7]} color={MINT} />
          <Building p={[1.2, 0, -1.7]} height={1} />
        </>
      );
    case 'energy':
      return (
        <>
          <Rack p={[1.5, 0, 0]} />
          <Rack p={[0.65, 0, 0]} />
          <Cylinder p={[-1.35, 1.05, 0]} r={0.075} h={2.1} c={PAPER} />
          <group position={[-1.35, 2.1, 0]}>
            <group name="turbine">
              {[0, 1, 2].map((i) => (
                <group key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
                  <Box p={[0, 0.4, 0]} s={[0.1, 0.83, 0.07]} c={PAPER} />
                </group>
              ))}
              <Ball r={0.12} c={MINT} />
            </group>
          </group>
          <Box p={[0, 0.07, 0]} s={[2.8, 0.04, 0.065]} c={MINT} />
          <group name="flow0">
            <Ball r={0.08} c={MINT} glow />
          </group>
        </>
      );
    case 'data':
      return (
        <>
          {[-1.65, 0, 1.65].map((x, i) => (
            <group name="entry" key={x}>
              {[0, 1, 2].map((n) => (
                <Cylinder
                  key={n}
                  p={[x, 0.2 + n * 0.3, 0]}
                  r={0.49}
                  h={0.22}
                  c={i % 2 ? MINT : BLUE}
                />
              ))}
              <Label
                text={['PUBLIC', 'DATA', 'PRIVATE'][i]}
                p={[x, 1.35, 0.4]}
                w={1.2}
                h={0.25}
              />
            </group>
          ))}
          <Box p={[0, 0.05, 0.4]} s={[3.6, 0.04, 0.04]} c={GOLD} />
          {[0, 1, 2].map((i) => (
            <group name={`flow${i}`} key={i}>
              <Ball r={0.07} c={GOLD} glow />
            </group>
          ))}
        </>
      );
    case 'city':
      return (
        <>
          {[-1.7, 0, 1.7].flatMap((x, i) =>
            [-0.8, 0.8].map((z, j) => (
              <group key={`${x}${z}`} name="entry">
                <Building
                  p={[x, 0, z]}
                  height={0.6 + ((i + j) % 3) * 0.3}
                  color={j ? MINT : BLUE}
                />
              </group>
            )),
          )}
          <Box p={[0, 0.04, 0]} s={[5, 0.06, 0.1]} c={GOLD} />
          <Box p={[0.7, 0.04, 0]} s={[0.08, 0.06, 3.5]} c={GOLD} />
          <group name="signal">
            <Ring p={[0, 1.7, 0]} r={1.6} c={MINT} />
          </group>
        </>
      );
    case 'handover':
      return (
        <>
          <group name="entry">
            <Box p={[-1.3, 0.42, 0]} s={[0.7, 0.8, 0.7]} c={BLUE} />
            <Box p={[1.3, 0.42, 0]} s={[0.7, 0.8, 0.7]} c={MINT} />
          </group>
          <Box p={[0, 0.6, 0.3]} s={[2.7, 0.12, 1.2]} c={INK} />
          <group name="document">
            <Paper p={[0, 0.73, 0.3]} text={scene.metric || 'NEXT'} />
          </group>
          <Screen text="YEAR ONE" p={[0, 0, -1.3]} w={2.1} />
        </>
      );
  }
}
function Layer({
  scene,
  previous = false,
  clock,
}: {
  scene: Scene;
  previous?: boolean;
  clock: RefObject<Clock>;
}) {
  const root = useRef<Group>(null);
  const items = useRef<Group[]>([]);
  useLayoutEffect(() => {
    items.current = [];
    root.current?.traverse((o) => {
      if (o instanceof Group && o.name) items.current.push(o);
    });
  }, [scene]);
  useFrame(() => {
    if (!root.current) return;
    const t = clock.current.reduced
      ? 24
      : previous
        ? clock.current.previousTime
        : clock.current.time;
    const p = t / 24;
    const pose = layerPose(clock.current.time, previous, clock.current.reduced);
    root.current.visible = pose.visible;
    root.current.position.y = pose.y;
    // Only changing sets leave the stage. Story endings retain their complete composition.
    for (let i = 0; i < items.current.length; i++) {
      const o = items.current[i],
        n = o.name;
      if (n === 'entry') {
        const e = entryPose(t, i, clock.current.reduced);
        o.scale.setScalar(e.scale);
        o.position.y = e.y;
      }
      if (n === 'person')
        o.rotation.z = clock.current.reduced
          ? 0
          : Math.sin(t * 1.7 + i) * 0.025;
      if (n === 'globe') o.rotation.y = t * 0.16;
      if (n === 'robot') o.rotation.z = Math.sin(t * 0.8 + i) * 0.18;
      if (n === 'balance') o.rotation.z = Math.sin(t * 0.7) * 0.13 * (1 - p);
      if (n === 'chip') o.position.y = Math.sin(t * 1.4) * 0.07;
      if (n === 'document') o.position.x = Math.sin(p * Math.PI * 2) * 0.35;
      if (n === 'stamp')
        o.position.y =
          -Math.min(1, Math.max(0, (p - 0.38) / 0.1)) * 0.98 +
          Math.max(0, Math.min(1, (p - 0.57) / 0.15)) * 0.98;
      if (n === 'turbine') o.rotation.z = t * 0.6;
      if (n === 'backup') o.scale.setScalar(0.65 + Math.min(1, p * 2) * 0.35);
      if (n === 'warning') o.visible = p < 0.53;
      if (n === 'scan') o.position.x = Math.sin(t * 0.55) * 2;
      if (n === 'car') {
        o.position.set(Math.sin(t * 0.38) * 1.55, 0, Math.cos(t * 0.38) * 0.75);
        o.rotation.y = -t * 0.38;
      }
      if (n.startsWith('flow')) {
        const k = Number(n.slice(4));
        o.position.set(((t * 0.6 + k * 1.1) % 3.6) - 1.8, 0.2, 0.6);
      }
      if (n.startsWith('parcel')) {
        const k = Number(n.slice(6));
        o.position.x = ((t * 0.35 + k * 1.4) % 3.8) - 1.9;
      }
      if (n.startsWith('orbit')) {
        const k = Number(n.slice(5)),
          a = t * 0.7 + (k * Math.PI) / 4;
        o.position.set(
          Math.cos(a) * 0.5,
          1.55 + Math.sin(a * 2) * 0.4,
          Math.sin(a) * 0.5,
        );
      }
      if (n === 'signal') o.scale.setScalar(0.85 + 0.15 * Math.sin(t));
    }
  });
  return (
    <group ref={root}>
      <group name="entry">
        <Box p={[0, 2.15, -2]} s={[4.8, 0.6, 0.13]} c={INK} />
        <Label
          text={scene.label}
          p={[0, 2.16, -1.922]}
          w={4.4}
          h={0.37}
          color={PAPER}
        />
      </group>
      <Set scene={scene} />
      <Person p={[-2.3, 0, 1.6]} color={BLUE} />
      <Person p={[2.3, 0, 1.6]} color={INK} />
    </group>
  );
}
function ProjectionBridge({ projection }: { projection: Projection }) {
  const { camera, size } = useThree();
  const point = useRef(new Vector3());
  useFrame(() => {
    for (const [key, position] of [
      ['object', [0, 1.15, 0]],
      ['speaker', [2.3, 0.8, 1.6]],
    ] as const) {
      const box = projection.current[key],
        path =
          projection.current[key === 'object' ? 'objectLine' : 'speakerLine'];
      if (!box || !path) continue;
      point.current.set(position[0], position[1], position[2]).project(camera);
      const x = ((point.current.x + 1) / 2) * size.width,
        y = ((1 - point.current.y) / 2) * size.height;
      const bx =
          key === 'object' ? box.offsetLeft + box.offsetWidth : box.offsetLeft,
        by = box.offsetTop + box.offsetHeight / 2;
      path.setAttribute(
        'd',
        `M ${x} ${y} L ${(x + bx) / 2} ${by} L ${bx} ${by}`,
      );
    }
  });
  return null;
}
function World({
  scene,
  previous,
  clock,
  projection,
}: {
  scene: Scene;
  previous: Scene | null;
  clock: RefObject<Clock>;
  projection: Projection;
}) {
  return (
    <>
      <Camera />
      <ambientLight intensity={1.4} />
      <directionalLight
        position={[3, 8, 5]}
        intensity={3}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4, 4, -4]} intensity={2} color="#9ed8ff" />
      <Box p={[0, -0.28, 0]} s={[6.6, 0.5, 5.6]} c="#bccbda" r={0.13} />
      <Box p={[0, -0.025, 0]} s={[6.54, 0.1, 5.54]} c="#ecf0ec" />
      {[-2, -1, 0, 1, 2].map((x) => (
        <Box
          key={x}
          p={[x, 0.03, 0]}
          s={[0.009, 0.006, 5.3]}
          c="#c8d5db"
          r={0}
        />
      ))}
      <Label
        text="K O R E A   /   Y E A R  O N E"
        p={[0, -0.24, 2.815]}
        w={3.6}
        h={0.24}
        color={INK}
      />
      {/* A persistent policy folio is the visual link through all of the changing sets. */}
      <Paper p={[0, 0.05, 2.4]} text="2025 → 2026" />
      {previous && (
        <Layer
          key={`previous-${previous.id}`}
          scene={previous}
          previous
          clock={clock}
        />
      )}
      <Layer key={scene.id} scene={scene} clock={clock} />
      <ProjectionBridge projection={projection} />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.55, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
}
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="committee-canvas-fallback">
        <p>이 기기에서 3D 무대를 표시하지 못했어요.</p>
        <p>아래 기록과 재생 버튼로 모든 사건을 읽을 수 있어요.</p>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function CommitteeStage(props: {
  scene: Scene;
  previous: Scene | null;
  clock: RefObject<Clock>;
  projection: Projection;
  onReady: () => void;
}) {
  return (
    <Boundary>
      <Canvas
        onCreated={props.onReady}
        orthographic
        camera={{ position: [11, 11.8, 11], zoom: 60, near: 0.1, far: 100 }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <World {...props} />
      </Canvas>
    </Boundary>
  );
}
