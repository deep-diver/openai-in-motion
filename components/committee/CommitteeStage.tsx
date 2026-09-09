'use client';
/* eslint-disable react/react-compiler -- R3F scene objects are deliberately mutated by the animation clock. */
import Label from './StageLabel';
import StageFloor from './StageFloor';
import {
  Component,
  useLayoutEffect,
  useRef,
  type RefObject,
  type ReactNode,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Group, OrthographicCamera, PCFShadowMap, Vector3 } from 'three';
import { layerPose, entryPose, activityTime, speakingGesture } from './motion';
import DivisionSets from './DivisionSets';
import { divisionSequence } from './divisionMotion';
import { stageDesign } from './sceneDesign';
import {
  Box,
  Cylinder,
  Ball,
  Ring,
  type Vec3,
} from '@/components/timeline/primitives';
import { AXES, type Scene } from '@/data/committee/types';
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
function Person({
  p,
  color = INK,
  slot,
}: {
  p: Vec3;
  color?: string;
  slot: string;
}) {
  return (
    <group position={p}>
      <Cylinder p={[0, 0.005, 0]} r={0.33} h={0.045} c={color} />
      <Ring p={[0, 0.031, 0]} r={0.29} c={MINT} tube={0.009} />
      <group name={slot} position={[0, 0.86, 0]} />
      <group name="person-head" position={[0, 0.79, 0]}>
        <Ball r={0.19} c="#e5b99a" />
        <Box p={[0, 0.14, -0.02]} s={[0.32, 0.12, 0.26]} c="#30363b" />
      </group>

      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * 0.19, 0.55, 0]}
          name={side === 1 ? `person-hand-${slot}` : 'person-rest'}
        >
          <Box p={[0, -0.12, 0]} s={[0.11, 0.28, 0.13]} c={color} />
          <Ball p={[0, -0.29, 0]} r={0.065} c="#e5b99a" />
        </group>
      ))}
      <Box
        p={[0, 0.55, 0.14]}
        s={[0.14, 0.14, 0.045]}
        c={PAPER}
        rotation={[0, 0, Math.PI / 4]}
      />
      <Cylinder p={[0, 0.37, 0]} r={0.16} h={0.46} c={color} />
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
      <Box p={[0, 0.92, -0.1]} s={[w * 0.65, 0.5, 0.07]} c="#3d5367" />
      <Ball p={[w / 2 - 0.13, 0.48, 0.1]} r={0.025} c={MINT} glow />
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
      <Box p={[0, 0.025, 0]} s={[0.78, 0.07, 0.7]} c="#637c91" />
      {[-0.15, 0, 0.15].map((x) => (
        <Box key={x} p={[x, 1.54, 0]} s={[0.045, 0.018, 0.4]} c="#8299a8" />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i}>
          <Box
            p={[0, 0.27 + i * 0.23, 0.313]}
            s={[0.51, 0.15, 0.03]}
            c="#425973"
          />
          <Ball p={[-0.19, 0.27 + i * 0.23, 0.35]} r={0.026} c={color} glow />
          <Box
            p={[0.07, 0.27 + i * 0.23, 0.334]}
            s={[0.22, 0.025, 0.012]}
            c="#91a5b4"
          />
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
      <Box p={[0, -0.038, 0]} s={[1.46, 0.08, 1.86]} c="#577c96" />
      <Box s={[1.4, 0.09, 1.8]} c={PAPER} />
      <Box p={[-0.55, 0.052, 0]} s={[0.018, 0.012, 1.7]} c={GOLD} />
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
    case 'organisation':
    case 'defense':
    case 'media':
    case 'civic':
    case 'compute-routing':
    case 'democracy':
    case 'document-format':
      return <DivisionSets scene={scene} />;
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
                <group
                  position={[Math.cos(a) * 1.95, 0, Math.sin(a) * 1.95]}
                  rotation={[0, Math.PI / 2 - a, 0]}
                >
                  <Box
                    p={[0, 0.64, -0.18]}
                    s={[0.46, 0.43, 0.08]}
                    c={i % 2 ? BLUE : MINT}
                  />
                </group>
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
    const action = activityTime(t);
    const sequence = divisionSequence(p);
    const pose = layerPose(clock.current.time, previous, clock.current.reduced);
    root.current.visible = pose.visible;
    root.current.position.y = pose.y;
    // Only changing sets leave the stage. Story endings retain their complete composition.
    let entryIndex = 0;
    for (let i = 0; i < items.current.length; i++) {
      const o = items.current[i],
        n = o.name;
      if (n.startsWith('new-division-'))
        o.scale.setScalar(sequence.newDivisions);
      if (n.startsWith('org-card-'))
        o.position.y = (1 - sequence.newDivisions) * 1.5;
      if (n === 'controlled-gate') o.position.y = sequence.gate;
      if (n.startsWith('classified-')) {
        const k = Number(n.split('-')[1]);
        o.position.set(
          k === 2 ? -1.45 : -1.45 + sequence.transfer * 2.85,
          0.3 + k * 0.35,
          0.7,
        );
      }
      if (n.startsWith('civic-platform-')) {
        const k = Number(n.split('-')[2]);
        o.position.y = (k % 3) * 0.25 * (1 - sequence.gather);
      }
      if (n.startsWith('proposal-')) {
        const k = Number(n.split('-')[1]),
          a = (k * Math.PI) / 3;
        o.position.set(
          Math.cos(a) * sequence.proposalRadius,
          0.95 + Math.sin(t * 0.5 + k) * 0.035,
          Math.sin(a) * sequence.proposalRadius,
        );
      }
      if (n.startsWith('resource-')) {
        const a = action * 0.6 + (Number(n.split('-')[1]) * Math.PI) / 2;
        o.position.set(Math.cos(a) * 1.6, 0.25, 0.35 + Math.sin(a) * 1.1);
      }
      if (n === 'rights-book') o.rotation.y = Math.sin(t * 0.4) * 0.08;
      if (n === 'document-scan') o.position.x = sequence.scan;
      if (n === 'structured-document')
        o.position.y = (1 - sequence.structured) * -1.3;
      if (n === 'entry') {
        const e = entryPose(t, entryIndex++, clock.current.reduced);
        o.scale.setScalar(e.scale);
        o.position.y = e.y;
      }
      if (n.startsWith('person-hand-'))
        o.rotation.x =
          -0.18 -
          speakingGesture(
            p,
            n.endsWith('secondary'),
            !!scene.secondarySpeaker,
          ) *
            0.62;
      if (n === 'person-head')
        o.rotation.y = clock.current.reduced ? 0 : Math.sin(t * 0.6 + i) * 0.07;

      if (n === 'globe') o.rotation.y = t * 0.16;
      if (n === 'robot') o.rotation.z = Math.sin(action * 0.8 + i) * 0.18;
      if (n === 'balance') o.rotation.z = Math.sin(t * 0.7) * 0.13 * (1 - p);
      if (n === 'chip') o.position.y = Math.sin(action * 1.4) * 0.07;
      if (n === 'document') o.position.x = Math.sin(p * Math.PI * 2) * 0.35;
      if (n === 'stamp')
        o.position.y =
          -Math.min(1, Math.max(0, (p - 0.38) / 0.1)) * 0.98 +
          Math.max(0, Math.min(1, (p - 0.57) / 0.15)) * 0.98;
      if (n === 'turbine') o.rotation.z = t * 0.6;
      if (n === 'backup') o.scale.setScalar(0.65 + Math.min(1, p * 2) * 0.35);
      if (n === 'warning') o.visible = p < 0.53;
      if (n === 'scan') o.position.x = Math.sin(action * 0.55) * 2;
      if (n === 'car') {
        o.position.set(
          Math.sin(action * 0.38) * 1.55,
          0,
          Math.cos(action * 0.38) * 0.75,
        );
        o.rotation.y = -action * 0.38;
      }
      if (n.startsWith('flow')) {
        const k = Number(n.slice(4));
        o.position.set(((action * 0.6 + k * 1.1) % 3.6) - 1.8, 0.2, 0.6);
      }
      if (n.startsWith('parcel')) {
        const k = Number(n.slice(6));
        o.position.x = ((action * 0.35 + k * 1.4) % 3.8) - 1.9;
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
    <group ref={root} name={previous ? 'previous-scene' : 'active-scene'}>
      <group name="entry">
        {[-2.22, 2.22].map((x) => (
          <Box
            key={x}
            p={[x, 1.08, -2.03]}
            s={[0.08, 2.16, 0.09]}
            c="#637c91"
          />
        ))}
        <Box p={[0, 2.15, -2.03]} s={[4.96, 0.72, 0.15]} c="#5d7890" />
        <Box p={[0, 2.15, -2]} s={[4.8, 0.6, 0.13]} c={INK} />
        <Label
          text={scene.short}
          p={[0, 2.16, -1.922]}
          w={4.4}
          h={0.37}
          color={PAPER}
        />
      </group>
      <group name="anchor-object" position={stageDesign[scene.set].anchor} />
      <StageFloor scene={scene} />
      <Set scene={scene} />
      {scene.secondarySpeaker && (
        <group name="entry">
          <Person p={[-2.3, 0.04, 1.6]} color={BLUE} slot="anchor-secondary" />
        </group>
      )}
      <group name="entry">
        <Person p={[2.3, 0.04, 1.6]} color={INK} slot="anchor-primary" />
      </group>
    </group>
  );
}
function ProjectionBridge({
  projection,
  dual,
}: {
  projection: Projection;
  dual: boolean;
}) {
  const { camera, size, scene } = useThree();
  const point = useRef(new Vector3());
  const cardEdges = useRef({ object: { x: 0, y: 0 }, speaker: { x: 0, y: 0 } });
  useLayoutEffect(() => {
    const measure = () => {
      for (const key of ['object', 'speaker'] as const) {
        const box = projection.current[key];
        if (!box?.parentElement) continue;
        const stage = box.parentElement.getBoundingClientRect();
        const card = box.getBoundingClientRect();
        cardEdges.current[key] = {
          x: (key === 'object' ? card.right : card.left) - stage.left,
          y: card.top - stage.top + Math.min(card.height / 2, 48),
        };
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    for (const key of ['object', 'speaker'] as const) {
      const box = projection.current[key];
      if (box) {
        observer.observe(box);
        if (box.parentElement) observer.observe(box.parentElement);
      }
    }
    return () => observer.disconnect();
  }, [projection, dual, size.width, size.height]);
  useFrame(() => {
    const layer = scene.getObjectByName('active-scene');
    if (!layer) return;
    for (const key of ['object', 'speaker'] as const) {
      const box = projection.current[key];
      const path =
        projection.current[key === 'object' ? 'objectLine' : 'speakerLine'];
      const anchor = layer.getObjectByName(
        key === 'speaker'
          ? 'anchor-primary'
          : dual
            ? 'anchor-secondary'
            : 'anchor-object',
      );
      if (!box || !path || !anchor) continue;
      anchor.getWorldPosition(point.current).project(camera);
      const x = ((point.current.x + 1) * size.width) / 2;
      const y = ((1 - point.current.y) * size.height) / 2;
      const { x: bx, y: by } = cardEdges.current[key];
      const visible =
        layer.visible && y > 0 && y < size.height && x > 0 && x < size.width;
      path.style.opacity = visible ? '1' : '0';
      path.setAttribute(
        'd',
        `M ${x} ${y} L ${x + (bx - x) * 0.45} ${by} L ${bx} ${by} M ${x - 2.5} ${y} a 2.5 2.5 0 1 0 5 0 a 2.5 2.5 0 1 0 -5 0`,
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
      <ambientLight intensity={0.85} />
      <hemisphereLight args={['#d8edff', '#6b777c', 0.8]} />
      <directionalLight
        position={[3, 8, 5]}
        intensity={2.5}
        color="#fff0dc"
        castShadow
        shadow-bias={-0.0003}
        shadow-normalBias={0.035}
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        position={[-4, 4, -4]}
        intensity={1.6}
        color="#a6dcff"
      />
      <directionalLight
        position={[5, 2, -4]}
        intensity={0.7}
        color={AXES[scene.axis].color}
      />
      <Box p={[0, -0.46, 0]} s={[6.72, 0.14, 5.72]} c="#203b50" r={0.13} />
      <Box p={[0, -0.28, 0]} s={[6.6, 0.38, 5.6]} c="#acc2d2" r={0.13} />
      <Box
        p={[0, -0.075, 0]}
        s={[6.61, 0.035, 5.61]}
        c={AXES[scene.axis].color}
        r={0.07}
      />
      <Box p={[0, -0.025, 0]} s={[6.54, 0.1, 5.54]} c="#ecf0ec" />
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <Cylinder
            key={`${x}${z}`}
            p={[x * 3.02, 0.03, z * 2.52]}
            r={0.045}
            h={0.008}
            c="#8fa9b5"
          />
        )),
      )}
      {previous && (
        <Layer
          key={`previous-${previous.id}`}
          scene={previous}
          previous
          clock={clock}
        />
      )}
      <Layer key={scene.id} scene={scene} clock={clock} />
      <ProjectionBridge
        projection={projection}
        dual={!!scene.secondarySpeaker}
      />
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
        shadows={{ type: PCFShadowMap }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <World {...props} />
      </Canvas>
    </Boundary>
  );
}
