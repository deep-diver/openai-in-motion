'use client';
import Label from './StageLabel';
import {
  Box,
  Cylinder,
  Ball,
  Ring,
  type Vec3,
} from '@/components/timeline/primitives';
import type { Scene } from '@/data/committee/types';
const INK = '#203449',
  BLUE = '#5daeff',
  MINT = '#75d7bd',
  PAPER = '#f6f4e9',
  GOLD = '#edb474';
function Card({
  text,
  p = [0, 0, 0],
  color = PAPER,
}: {
  text: string;
  p?: Vec3;
  color?: string;
}) {
  return (
    <group position={p}>
      <Box s={[0.82, 0.07, 0.58]} c={color} />
      <Label
        text={text}
        p={[0, 0.04, 0]}
        w={0.72}
        h={0.35}
        color={INK}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  );
}
function Monitor({
  text,
  p,
  color = BLUE,
}: {
  text: string;
  p: Vec3;
  color?: string;
}) {
  return (
    <group position={p}>
      <Box p={[0, 0.8, 0]} s={[1.05, 0.78, 0.16]} c={INK} />
      <Box p={[0, 0.8, -0.095]} s={[0.65, 0.42, 0.06]} c="#526c80" />
      <Ball p={[0.4, 0.47, 0.105]} r={0.022} c={MINT} glow />
      <Box p={[0, 0.8, 0.09]} s={[0.92, 0.65, 0.03]} c={color} />
      <Label text={text} p={[0, 0.8, 0.12]} w={0.86} h={0.36} color={INK} />
      <Cylinder p={[0, 0.3, 0]} r={0.07} h={0.6} c={INK} />
      <Box s={[0.6, 0.06, 0.4]} c={INK} />
    </group>
  );
}
export default function DivisionSets({ scene }: { scene: Scene }) {
  switch (scene.set) {
    case 'organisation': {
      const tf = scene.id === 'education-tf';
      return (
        <>
          <Cylinder p={[0, 0.35, 0]} r={1.02} h={0.6} c={INK} />
          <Card text="AI STRATEGY" p={[0, 0.69, 0]} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            return (
              <group name="entry" key={i}>
                <Box
                  p={[Math.cos(a) * 1.85, 0.3, Math.sin(a) * 1.65]}
                  s={[0.54, 0.6, 0.5]}
                  c={i % 2 ? BLUE : MINT}
                />
                <Box
                  p={[Math.cos(a) * 0.85, 0.055, Math.sin(a) * 0.78]}
                  s={[1.6, 0.025, 0.025]}
                  rotation={[0, -a, 0]}
                  c={BLUE}
                />
              </group>
            );
          })}
          {tf
            ? ['EDU TF', 'SECURITY TF', 'REGION TF'].map((v, i) => (
                <group key={v} position={[(i - 1) * 1.15, 0, 1.1]}>
                  <group name={`org-card-${i}`}>
                    <Card text={v} p={[0, 0.9, 0]} color={GOLD} />
                  </group>
                </group>
              ))
            : [-1, 1].map((x, i) => (
                <group key={x} position={[x * 0.56, 0, -1.6]}>
                  <group name={`new-division-${i}`}>
                    <Box p={[0, 0.52, 0]} s={[0.63, 1.04, 0.6]} c={GOLD} />
                    <Label
                      text={i ? 'DEMOCRACY' : 'EDUCATION'}
                      p={[0, 1.16, 0.05]}
                      w={1.1}
                      h={0.26}
                      color={INK}
                    />
                  </group>
                </group>
              ))}
        </>
      );
    }
    case 'defense':
      return (
        <>
          <group name="entry">
            <Box p={[-1.45, 0.8, -0.2]} s={[1, 1.6, 0.85]} c={INK} />
            <Label
              text="DEFENSE\nDATA"
              p={[-1.45, 1, 0.245]}
              w={0.85}
              h={0.7}
              color={PAPER}
            />
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                p={[-1.45, 0.25 + i * 0.4, 0.26]}
                s={[0.75, 0.13, 0.04]}
                c={[BLUE, MINT, GOLD][i]}
              />
            ))}
          </group>
          <group name="entry">
            <Monitor text="CIVIL AI" p={[1.4, 0, -0.2]} />
            <Box p={[1.4, 0.09, 0.95]} s={[1.5, 0.18, 1.05]} c={MINT} />
            <Card text="TEST" p={[1.4, 0.2, 0.95]} />
          </group>
          <Box p={[0, 0.8, -0.6]} s={[0.13, 1.6, 0.13]} c={GOLD} />
          <Box p={[0, 0.8, 1]} s={[0.13, 1.6, 0.13]} c={GOLD} />
          <Box p={[0, 1.6, 0.2]} s={[0.16, 0.12, 1.72]} c={GOLD} />
          <group name="controlled-gate">
            <Box p={[0, 0.7, 0.2]} s={[0.08, 1.4, 1.48]} c={BLUE} />
          </group>
          {[0, 1, 2].map((i) => (
            <group name={`classified-${i}`} key={i}>
              <Card
                text={['OPEN', 'REVIEW', 'RESTRICTED'][i]}
                color={[MINT, GOLD, BLUE][i]}
              />
            </group>
          ))}
        </>
      );
    case 'media':
      return (
        <>
          {['KBS', 'MBC', 'SBS', 'EBS'].map((v, i) => (
            <group name="entry" key={v}>
              <Monitor
                text={v}
                p={[(i - 1.5) * 1.2, 0, -0.8]}
                color={[BLUE, MINT, GOLD, PAPER][i]}
              />
            </group>
          ))}
          <Box p={[0, 0.5, 0.65]} s={[3.6, 0.16, 1.05]} c={INK} />
          <group name="rights-book">
            <Card text="COPYRIGHT" p={[0, 0.63, 0.65]} color={GOLD} />
          </group>
          <Card text="CONTENT" p={[-1.16, 0.63, 0.65]} />
          <Card text="AI" p={[1.16, 0.63, 0.65]} color={MINT} />
          <Ring p={[0, 1.17, 0.5]} r={0.23} c={GOLD} tube={0.03} />
        </>
      );
    case 'civic':
      return (
        <>
          <Cylinder p={[0, 0.35, 0]} r={0.78} h={0.65} c={INK} />
          <Card text="DIALOGUE" p={[0, 0.73, 0]} />
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i * Math.PI) / 3;
            return (
              <group
                position={[Math.cos(a) * 1.75, 0, Math.sin(a) * 1.4]}
                key={i}
              >
                <group name={`civic-platform-${i}`}>
                  <Cylinder
                    p={[0, 0.15, 0]}
                    r={0.42}
                    h={0.3}
                    c={i % 2 ? BLUE : MINT}
                  />
                  <Ball p={[0, 0.85, 0]} r={0.17} c={GOLD} />
                  <Cylinder p={[0, 0.55, 0]} r={0.12} h={0.4} c={INK} />
                </group>
              </group>
            );
          })}
          {Array.from({ length: 4 }, (_, i) => (
            <group name={`proposal-${i}`} key={i}>
              <Card text={['ACCESS', 'SKILLS', 'WORK', 'RIGHTS'][i]} />
            </group>
          ))}
        </>
      );
    case 'compute-routing': {
      const train = scene.id === 'post-training';
      return (
        <>
          {(train
            ? ['TASK', 'MODEL', 'EVAL']
            : ['GPU', 'MEMORY', 'AGENTS']
          ).map((v, i) => (
            <group name="entry" key={v}>
              <Box
                p={[(i - 1) * 1.65, 0.7, -0.45]}
                s={[1.05, 1.4, 0.7]}
                c={INK}
              />
              <Label
                text={v}
                p={[(i - 1) * 1.65, 0.94, -0.08]}
                w={0.91}
                h={0.4}
                color={PAPER}
              />
              {[0, 1, 2].map((j) => (
                <Box
                  key={j}
                  p={[(i - 1) * 1.65, 0.26 + j * 0.18, -0.075]}
                  s={[0.78, 0.1, 0.03]}
                  c={i % 2 ? MINT : BLUE}
                />
              ))}
            </group>
          ))}
          <Ring
            p={[0, 0.1, 0.35]}
            r={1.6}
            c={MINT}
            rotation={[-Math.PI / 2, 0, 0]}
            tube={0.024}
          />
          {[0, 1, 2, 3].map((i) => (
            <group name={`resource-${i}`} key={i}>
              <Box s={[0.28, 0.16, 0.24]} c={GOLD} />
            </group>
          ))}
        </>
      );
    }
    case 'democracy':
      return (
        <>
          <Cylinder p={[0, 0.35, 0]} r={1.05} h={0.6} c={INK} />
          <Card text="PLAN" p={[0, 0.7, 0]} color={GOLD} />
          <Monitor text="PUBLIC\nFORUM" p={[0, 0.1, -1.4]} color={MINT} />
          {Array.from({ length: 6 }, (_, i) => (
            <group name={`proposal-${i}`} key={i}>
              <Card
                text={['IDEA', 'VOICE', 'ASK', 'DISCUSS', 'REVIEW', 'SHARE'][i]}
                color={i % 2 ? MINT : PAPER}
              />
            </group>
          ))}
          <Ring
            p={[0, 0.73, 0]}
            r={1.13}
            c={BLUE}
            rotation={[-Math.PI / 2, 0, 0]}
            tube={0.02}
          />
        </>
      );
    case 'document-format':
      return (
        <>
          <group name="entry">
            <Box p={[-1.35, 0.3, 0]} s={[1.35, 0.55, 1.7]} c={PAPER} />
            <Card text="HWP" p={[-1.35, 0.61, 0.5]} color={GOLD} />
            {[-0.3, 0, 0.3].map((x) => (
              <Box
                key={x}
                p={[-1.35 + x, 0.59, -0.25]}
                s={[0.025, 0.03, 0.7]}
                c={INK}
              />
            ))}
            {[-0.5, -0.2, 0.1].map((z) => (
              <Box key={z} p={[-1.35, 0.6, z]} s={[1, 0.03, 0.025]} c={INK} />
            ))}
          </group>
          <Box p={[1.2, 0.06, 0]} s={[1.6, 0.12, 1.9]} c={INK} />
          <group name="structured-document">
            <Box p={[1.2, 0.2, 0]} s={[1.4, 0.2, 1.7]} c={PAPER} />
            <Card text="STRUCTURED" p={[1.2, 0.34, 0.5]} color={MINT} />
            {[-0.55, -0.3, -0.05].map((z) => (
              <Box
                key={z}
                p={[1.2, 0.32, z]}
                s={[1.02, 0.015, 0.065]}
                c={BLUE}
              />
            ))}
          </group>
          <group name="document-scan">
            <Box p={[0, 1.15, 0]} s={[0.045, 0.03, 2.1]} c={MINT} />
            <Cylinder p={[0, 0.63, -1]} r={0.025} h={1.05} c={BLUE} />
            <Cylinder p={[0, 0.63, 1]} r={0.025} h={1.05} c={BLUE} />
          </group>
        </>
      );
    default:
      return null;
  }
}
