'use client';

import { Fragment, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import {
  Ball,
  Box,
  Cylinder,
  Label,
  Plant,
  Ring,
  type Vec3,
} from './primitives';

/** Ambient movement lives inside the GSAP-controlled outer object group. */
export function Idle({
  children,
  type = 'float',
  reduced = false,
  phase = 0,
}: {
  children: React.ReactNode;
  type?: 'float' | 'wobble' | 'spin' | 'bounce';
  reduced?: boolean;
  phase?: number;
}) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    // Hidden chapters cost no ambient animation work.
    let visible = true;
    for (let g = ref.current.parent; g; g = g.parent)
      if (!g.visible) {
        visible = false;
        break;
      }
    if (!visible) return;
    if (reduced) {
      ref.current.position.y = 0;
      ref.current.rotation.set(0, 0, 0);
      return;
    }
    const t = clock.elapsedTime + phase;
    if (type === 'float') ref.current.position.y = Math.sin(t * 1.4) * 0.09;
    if (type === 'bounce')
      ref.current.position.y = Math.abs(Math.sin(t * 1.6)) * 0.23;
    if (type === 'wobble') ref.current.rotation.z = Math.sin(t * 2.2) * 0.07;
    if (type === 'spin') ref.current.rotation.y = t * 0.16;
  });
  return <group ref={ref}>{children}</group>;
}
export function LabWalls() {
  return (
    <>
      <Box p={[0, 1.05, -2.47]} s={[6, 2.1, 0.13]} c="#e9e7d4" />
      <Box p={[-2.96, 1.05, -0.28]} s={[0.13, 2.1, 4.4]} c="#d9ddc9" />
      <Box p={[0, 0.12, -2.37]} s={[5.9, 0.17, 0.055]} c="#a6aa94" />
      <Box p={[-2.86, 0.12, -0.3]} s={[0.055, 0.17, 4.3]} c="#afb59c" />
      <Box p={[-2.86, 1.25, -0.6]} s={[0.04, 1.05, 1.5]} c="#a8baaf" />
      <Box p={[-2.82, 1.25, -0.6]} s={[0.05, 0.045, 1.5]} c="#f3f0df" />
      <Box p={[-2.82, 1.25, -0.6]} s={[0.05, 1.05, 0.045]} c="#f3f0df" />
      <Label
        text="OPENAI / RESEARCH"
        p={[1.7, 1.75, -2.389]}
        w={1.7}
        h={0.5}
        color="#79816c"
        size={39}
      />
    </>
  );
}
export function Whiteboard() {
  return (
    <>
      <Box p={[0, 1.57, 0]} s={[2.25, 1.16, 0.09]} c="#b9bcb1" />
      <Box p={[0, 1.57, 0.055]} s={[2.12, 1.04, 0.035]} c="#f4f4e9" />
      <Label
        text="AI FOR EVERYONE"
        p={[0, 1.85, 0.079]}
        w={1.85}
        h={0.28}
        color="#445f52"
        size={51}
      />
      <Label
        text="f(x) = a better future"
        p={[0, 1.56, 0.079]}
        w={1.8}
        h={0.27}
        color="#668565"
        size={40}
      />
      {[-0.73, -0.23, 0.27, 0.77].map((x, i) => (
        <Fragment key={i}>
          <Ring
            key={`ring${i}`}
            p={[x, 1.27, 0.08]}
            r={0.08}
            rotation={[0, 0, 0]}
            c="#7da780"
            tube={0.01}
          />
          {i < 3 && (
            <Box
              key={`line${i}`}
              p={[x + 0.25, 1.27, 0.08]}
              s={[0.28, 0.014, 0.012]}
              c="#7da780"
              r={0}
            />
          )}
        </Fragment>
      ))}
      <Box p={[0, 0.96, 0.11]} s={[2.28, 0.06, 0.2]} c="#c5c9bb" />
      <Box p={[0.45, 1.01, 0.12]} s={[0.3, 0.04, 0.04]} c="#507a67" />
    </>
  );
}
export function Desk() {
  return (
    <>
      <Box p={[0, 1.1, 0]} s={[2.8, 0.16, 1.2]} c="#c7ad7e" />
      {[-1.21, 1.21].map((x) =>
        [-0.42, 0.42].map((z) => (
          <Box
            key={`${x}${z}`}
            p={[x, 0.54, z]}
            s={[0.1, 1.08, 0.1]}
            c="#657065"
          />
        )),
      )}
      <Box p={[-0.35, 1.52, -0.25]} s={[0.88, 0.63, 0.32]} c="#d5ccb0" />
      <Box p={[-0.35, 1.54, -0.078]} s={[0.7, 0.43, 0.025]} c="#243f34" />
      <Label
        text="> hello, world_"
        p={[-0.35, 1.53, -0.06]}
        w={0.61}
        h={0.29}
        color="#aadb87"
        size={47}
      />
      <Box p={[-0.35, 1.23, -0.25]} s={[0.42, 0.15, 0.4]} c="#b9b096" />
      <Box p={[-0.35, 1.21, 0.3]} s={[0.79, 0.07, 0.26]} c="#e4ddc4" />
      {[0, 1, 2].map((n) => (
        <Box
          key={n}
          p={[-0.36, 1.251, 0.22 + n * 0.07]}
          s={[0.62, 0.005, 0.025]}
          c="#bbbca8"
          r={0}
        />
      ))}
      <Cylinder p={[0.86, 1.34, 0.04]} h={0.31} r={0.115} c="#f3f0df" />
      <Cylinder p={[0.86, 1.499, 0.04]} h={0.005} r={0.092} c="#5b4630" />
      <Ring
        p={[1, 1.35, 0.04]}
        r={0.08}
        rotation={[0, 0, 0]}
        c="#dedbc6"
        tube={0.021}
      />
      <Box
        p={[0.75, 1.2, -0.39]}
        s={[0.48, 0.04, 0.31]}
        c="#eeeee1"
        rotation={[0, 0.16, 0]}
      />
      <Box p={[-1, 1.25, -0.23]} s={[0.29, 0.16, 0.38]} c="#7e9072" />
    </>
  );
}
export function Chair({ board = false }: { board?: boolean }) {
  return (
    <>
      <Cylinder p={[0, 0.37, 0]} h={0.68} r={0.055} c="#7f8975" />
      <Box
        p={[0, 0.76, 0]}
        s={[0.69, 0.17, 0.67]}
        c={board ? '#415b51' : '#819371'}
      />
      <Box
        p={[0, 1.21, -0.3]}
        s={[0.7, 0.75, 0.13]}
        c={board ? '#415b51' : '#819371'}
      />
      <Box p={[0, 0.11, 0]} s={[0.9, 0.075, 0.075]} c="#6b7563" />
      <Box p={[0, 0.11, 0]} s={[0.075, 0.075, 0.9]} c="#6b7563" />
      {board &&
        [-0.43, 0.43].map((x) => (
          <Box key={x} p={[x, 0.95, 0]} s={[0.09, 0.07, 0.53]} c="#698071" />
        ))}
      {[-0.42, 0.42].map((x) => (
        <Ball key={x} p={[x, 0.07, 0]} r={0.07} c="#444d40" />
      ))}
    </>
  );
}
export function Arcade() {
  return (
    <>
      <Box p={[0, 0.53, 0]} s={[0.87, 1.06, 0.88]} c="#617957" />
      <Box p={[0, 1.36, -0.13]} s={[0.87, 0.98, 0.66]} c="#748b63" />
      <Box p={[0, 1.49, 0.215]} s={[0.69, 0.6, 0.045]} c="#24352c" />
      <Label
        text="OPEN"
        p={[0, 1.55, 0.245]}
        w={0.55}
        h={0.29}
        color="#b9f377"
        size={76}
      />
      {[0, 1, 2, 3].map((i) => (
        <Box
          key={i}
          p={[-0.18 + i * 0.12, 1.31, 0.245]}
          s={[0.063, 0.045, 0.012]}
          c="#b9dc80"
          r={0}
        />
      ))}
      <Box p={[0, 1.95, -0.13]} s={[0.94, 0.24, 0.76]} c="#d6c995" />
      <Label
        text="PLAY THE FUTURE"
        p={[0, 1.95, 0.26]}
        w={0.79}
        h={0.19}
        color="#4b5e40"
        size={40}
      />
      <Box p={[0, 1.045, 0.32]} s={[0.94, 0.14, 0.45]} c="#acbb8b" />
      <Cylinder p={[-0.19, 1.18, 0.32]} h={0.17} r={0.025} c="#444b3b" />
      <Ball p={[-0.19, 1.28, 0.32]} r={0.065} c="#df9a62" />
      <Cylinder p={[0.19, 1.14, 0.34]} h={0.03} r={0.055} c="#cfde89" />
      <Box p={[0, 0.67, 0.453]} s={[0.23, 0.13, 0.012]} c="#334331" />
    </>
  );
}
export function Pizza() {
  return (
    <group rotation={[0, -0.15, 0]}>
      <Box p={[0, 0.1, 0]} s={[0.78, 0.17, 0.78]} c="#d0ac74" />
      <Box p={[0, 0.196, 0]} s={[0.81, 0.04, 0.81]} c="#ead1a3" />
      <Label
        text="PIZZA"
        p={[0, 0.222, 0]}
        w={0.57}
        h={0.35}
        color="#a36d43"
        rotation={[-Math.PI / 2, 0, 0]}
        size={75}
      />
      <Box
        p={[0.05, 0.28, -0.07]}
        s={[0.81, 0.13, 0.81]}
        c="#d9b985"
        rotation={[0, 0.13, 0]}
      />
      <Label
        text="LATE NIGHT IDEAS"
        p={[0.05, 0.352, -0.07]}
        w={0.7}
        h={0.3}
        color="#866845"
        rotation={[-Math.PI / 2, 0.13, 0]}
        size={40}
      />
    </group>
  );
}
export function Server({ tall = 1 }: { tall?: number }) {
  return (
    <group scale={[1, tall, 1]}>
      <Box p={[0, 1.16, 0]} s={[0.91, 2.32, 0.93]} c="#38474c" />
      <Box p={[0, 1.16, 0.48]} s={[0.78, 2.15, 0.03]} c="#1d2c33" />
      {[0, 1, 2, 3, 4, 5, 6].map((n) => (
        <group key={n} position={[0, 0.24 + n * 0.29, 0.51]}>
          <Box s={[0.67, 0.21, 0.055]} c="#4b6069" />
          <Box p={[-0.08, 0, 0.037]} s={[0.39, 0.043, 0.02]} c="#263c47" />
          <Ball
            p={[0.245, 0, 0.054]}
            r={0.027}
            c={n % 3 ? '#83cdba' : '#a4cfff'}
            glow
          />
        </group>
      ))}
      <Box p={[0, 2.35, 0]} s={[1, 0.06, 1]} c="#6c7f82" />
    </group>
  );
}
export function Safe() {
  return (
    <>
      <Box p={[0, 0.73, 0]} s={[1.43, 1.46, 1.18]} c="#879397" />
      <Box p={[0, 0.74, 0.61]} s={[1.19, 1.2, 0.08]} c="#aeb9b4" />
      <Box p={[0.35, 0.78, 0.68]} s={[0.065, 0.37, 0.065]} c="#526770" />
      <group position={[-0.2, 0.85, 0.667]}>
        {['#f35325', '#81bc06', '#05a6f0', '#ffba08'].map((c, i) => (
          <Box
            key={c}
            p={[(i % 2) * 0.28, Math.floor(i / 2) * -0.28, 0]}
            s={[0.25, 0.25, 0.023]}
            c={c}
            r={0.005}
          />
        ))}
      </group>
      <Label
        text="MICROSOFT"
        p={[0, 0.34, 0.661]}
        w={1}
        h={0.27}
        color="#36515e"
        size={51}
      />
    </>
  );
}
export function GPTCube() {
  return (
    <>
      <Cylinder p={[0, 0.13, 0]} r={0.72} h={0.26} c="#677e87" />
      <Ring p={[0, 0.275, 0]} r={0.6} c="#9ac8ff" />
      <Box
        p={[0, 1.25, 0]}
        s={[1.24, 1.24, 1.24]}
        c="#81aed0"
        glow
        opacity={0.87}
      />
      <Label
        text="GPT-3"
        p={[0, 1.25, 0.628]}
        w={1.03}
        h={0.49}
        color="#f0fbff"
        size={77}
      />
      <Label
        text="175B"
        p={[0.628, 1.25, 0]}
        rotation={[0, Math.PI / 2, 0]}
        w={0.9}
        h={0.4}
        color="#e6f7ff"
        size={70}
      />
    </>
  );
}
export function Phone() {
  return (
    <group rotation={[0, -0.12, 0]}>
      <Box p={[0, 0.1, 0]} s={[1.7, 0.2, 0.9]} c="#68867b" />
      <Box p={[0, 1.55, 0]} s={[1.35, 2.85, 0.21]} c="#d8e5d9" r={0.13} />
      <Box p={[0, 1.58, 0.115]} s={[1.18, 2.49, 0.018]} c="#234f41" r={0.09} />
      <Box p={[0, 2.77, 0.136]} s={[0.35, 0.063, 0.014]} c="#101e18" />
      <Label text="ChatGPT" p={[0, 2.33, 0.14]} w={0.99} h={0.4} size={67} />
      <Label
        text="How can I help?"
        p={[0, 1.91, 0.14]}
        w={1.03}
        h={0.25}
        size={38}
      />
      {[0, 1, 2].map((n) => (
        <group key={n}>
          <Box
            p={[-0.02, 1.51 - n * 0.24, 0.14]}
            s={[0.91, 0.13, 0.01]}
            c={n === 0 ? '#589b7b' : '#396a55'}
          />
          <Box
            p={[-0.17, 1.51 - n * 0.24, 0.151]}
            s={[0.47, 0.02, 0.01]}
            c="#bbd9bc"
            r={0}
          />
        </group>
      ))}
      <Box p={[0, 0.6, 0.14]} s={[0.94, 0.23, 0.015]} c="#508069" />
      <Label
        text="Message ChatGPT  ↑"
        p={[0, 0.6, 0.153]}
        w={0.87}
        h={0.21}
        size={30}
      />
    </group>
  );
}
export function Bubble({
  text = 'Hello!',
  c = '#a9e5c3',
}: {
  text?: string;
  c?: string;
}) {
  return (
    <>
      <Box p={[0, 0, 0]} s={[1.14, 0.55, 0.16]} c={c} r={0.1} />
      <Box
        p={[-0.28, -0.27, 0]}
        s={[0.17, 0.2, 0.14]}
        c={c}
        rotation={[0, 0, 0.5]}
      />
      <Label
        text={text}
        p={[0, 0, 0.085]}
        w={1}
        h={0.4}
        color="#295543"
        size={52}
      />
    </>
  );
}
export function Antenna() {
  return (
    <>
      <Box p={[0, 0.12, 0]} s={[0.84, 0.24, 0.84]} c="#758c7d" />
      <Cylinder p={[0, 1.23, 0]} h={2.2} r={0.047} c="#b4cbbb" />
      <Ball p={[0, 2.35, 0]} r={0.115} c="#c5f3cc" glow />
      {[0.32, 0.57, 0.82].map((r) => (
        <Ring
          key={r}
          p={[0, 2.35, 0]}
          r={r}
          c="#78bca1"
          rotation={[0, 0, 0]}
          tube={0.012}
        />
      ))}
      <Box p={[0, 1.2, 0]} s={[0.62, 0.07, 0.08]} c="#a8c7b4" />
    </>
  );
}
export function Slate() {
  return (
    <group rotation={[0, -0.15, 0]}>
      <Box p={[0, 0.69, 0]} s={[1.66, 1.25, 0.16]} c="#3b3d4f" />
      <Label text="SORA" p={[0, 0.93, 0.09]} w={1.3} h={0.52} size={91} />
      <Label
        text="SCENE 01 / TAKE ∞"
        p={[0, 0.47, 0.09]}
        w={1.4}
        h={0.24}
        size={38}
      />
      <group position={[-0.77, 1.3, 0]} rotation={[0, 0, 0.13]}>
        <Box p={[0.77, 0.1, 0]} s={[1.75, 0.26, 0.2]} c="#e4e2ef" />
        {[0, 1, 2, 3, 4].map((n) => (
          <Box
            key={n}
            p={[0.1 + n * 0.32, 0.1, 0.106]}
            s={[0.16, 0.25, 0.01]}
            c="#505169"
            rotation={[0, 0, -0.35]}
            r={0}
          />
        ))}
      </group>
    </group>
  );
}
export function MovieCamera() {
  return (
    <>
      <Cylinder p={[0, 0.52, 0]} h={1.04} r={0.055} c="#a6a2b8" />
      {[-1, 0, 1].map((n) => (
        <group key={n} rotation={[0, n * 2.1, 0]}>
          <Cylinder
            p={[0, 0.3, 0.21]}
            h={0.68}
            r={0.035}
            c="#7f8196"
            rotation={[0.65, 0, 0]}
          />
        </group>
      ))}
      <Box p={[0, 1.27, 0]} s={[0.81, 0.6, 0.71]} c="#85829e" />
      <Cylinder
        p={[0, 1.27, 0.51]}
        h={0.42}
        r={0.23}
        c="#454959"
        rotation={[Math.PI / 2, 0, 0]}
      />
      <Cylinder
        p={[0, 1.27, 0.73]}
        h={0.015}
        r={0.18}
        c="#9fc8cf"
        rotation={[Math.PI / 2, 0, 0]}
      />
      {[-0.23, 0.23].map((x) => (
        <Cylinder
          key={x}
          p={[x, 1.76, 0]}
          h={0.28}
          r={0.29}
          c="#c2becf"
          rotation={[Math.PI / 2, 0, 0]}
        />
      ))}
      <Label
        text="01"
        p={[0, 1.26, -0.363]}
        w={0.5}
        h={0.3}
        rotation={[0, Math.PI, 0]}
      />
    </>
  );
}
export function Brain({ label = 'o1' }: { label?: string }) {
  return (
    <>
      <Cylinder p={[0, 0.15, 0]} h={0.3} r={0.84} c="#74728c" />
      <Ring p={[0, 0.32, 0]} r={0.75} c="#c7b1ff" />
      <Box
        p={[0, 1.51, 0]}
        s={[1.6, 1.6, 1.6]}
        c="#b3a3ee"
        opacity={0.12}
        r={0}
      />
      {[-0.8, 0.8].map((x) =>
        [-0.8, 0.8].map((z) => (
          <Box
            key={`${x}${z}`}
            p={[x, 1.51, z]}
            s={[0.016, 1.6, 0.016]}
            c="#b2a0ec"
            glow
            r={0}
          />
        )),
      )}
      {[0.71, 2.31].map((y) => (
        <Ring key={y} p={[0, y, 0]} r={0.87} c="#aa96e2" />
      ))}
      <group position={[0, 1.54, 0]}>
        {Array.from({ length: 24 }, (_, i) => {
          const a = i * 2.399;
          const y = (i / 23 - 0.5) * 0.76;
          const r = Math.sqrt(Math.max(0, 0.31 - y * y)) * 0.85;
          return (
            <Ball
              key={i}
              p={[Math.cos(a) * r, y, Math.sin(a) * r]}
              r={0.15}
              c={i % 3 ? '#bba3f4' : '#e2c9ff'}
              glow
            />
          );
        })}
      </group>
      <Label text={label} p={[0, 1.44, 0.85]} w={0.8} h={0.6} size={110} />
      <Label
        text="THINKING…"
        p={[0, 0.41, 0.72]}
        w={1.2}
        h={0.22}
        color="#d4c2ff"
        size={44}
      />
    </>
  );
}
export function VideoFrame() {
  return (
    <>
      <Box p={[0, 1.1, 0]} s={[1.35, 0.99, 0.12]} c="#aea7c4" />
      <Box p={[0, 1.1, 0.07]} s={[1.21, 0.84, 0.03]} c="#5b657d" />
      <Ball p={[0.32, 1.27, 0.13]} r={0.14} c="#ffd3a0" />
      <Box p={[0, 0.86, 0.1]} s={[1.21, 0.34, 0.025]} c="#8b9a89" />
      <Label
        text="TEXT → WORLD"
        p={[0, 0.59, 0.1]}
        w={1.2}
        h={0.3}
        color="#c2b3e9"
        size={40}
      />
      <Cylinder p={[0, 0.32, 0]} h={0.64} r={0.04} c="#9490a5" />
    </>
  );
}
export function RobotArm() {
  return (
    <>
      <Cylinder p={[0, 0.12, 0]} h={0.24} r={0.54} c="#788881" />
      <Cylinder p={[0, 0.37, 0]} h={0.32} r={0.31} c="#d5d9cb" />
      <group position={[0, 0.53, 0]} rotation={[0, 0, -0.4]}>
        <Box p={[0, 0.52, 0]} s={[0.3, 1.04, 0.33]} c="#e2dfc7" />
        <Ball p={[0, 1.05, 0]} r={0.22} c="#8c998c" />
        <group position={[0, 1.05, 0]} rotation={[0, 0, 1.4]}>
          <Box p={[0, 0.44, 0]} s={[0.26, 0.88, 0.27]} c="#e6e0be" />
          <Ball p={[0, 0.92, 0]} r={0.18} c="#a6b9a8" />
          <Box p={[0, 1.07, 0]} s={[0.34, 0.12, 0.24]} c="#738e85" />
          {[-0.17, 0.17].map((x) => (
            <Box key={x} p={[x, 1.23, 0]} s={[0.07, 0.27, 0.12]} c="#acbfb1" />
          ))}
        </group>
      </group>
    </>
  );
}
export function PowerPlant() {
  return (
    <>
      <Box p={[0, 0.12, 0]} s={[1.65, 0.24, 1.27]} c="#8f9a8e" />
      {[-0.4, 0.4].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Cylinder p={[0, 0.52, 0]} r={0.34} top={0.24} h={0.8} c="#d0d4bf" />
          <Cylinder p={[0, 1.1, 0]} r={0.24} top={0.32} h={0.42} c="#e6e6d5" />
          <Cylinder p={[0, 1.32, 0]} r={0.25} h={0.013} c="#819b8c" />
          <Ring p={[0, 1.32, 0]} r={0.31} c="#d4d8c1" tube={0.034} />
        </group>
      ))}
      <Box p={[0, 0.43, 0.63]} s={[1.37, 0.38, 0.2]} c="#a7b59d" />
      <Label
        text="CLEAN ENERGY"
        p={[0, 0.43, 0.74]}
        w={1.22}
        h={0.28}
        color="#3a6553"
        size={42}
      />
    </>
  );
}
const land: Vec3[] = [
  [-0.32, 0.5, 0.78],
  [-0.43, 0.36, 0.79],
  [-0.28, 0.21, 0.92],
  [-0.16, -0.05, 0.98],
  [-0.06, -0.27, 0.94],
  [0.06, -0.47, 0.81],
  [0.46, 0.32, 0.78],
  [0.58, 0.13, 0.8],
  [0.44, -0.03, 0.9],
  [0.43, -0.24, 0.83],
  [0.63, 0.45, 0.55],
  [0.73, 0.3, 0.54],
];
export function Globe() {
  return (
    <>
      <Cylinder p={[0, 0.18, 0]} h={0.36} r={0.85} c="#627f74" />
      <Ring p={[0, 0.39, 0]} r={0.76} c="#ffc98c" />
      <mesh position={[0, 1.86, 0]}>
        <sphereGeometry args={[1.04, 32, 24]} />
        <meshStandardMaterial
          color="#7fbdad"
          transparent
          opacity={0.17}
          depthWrite={false}
        />
      </mesh>
      <group position={[0, 1.86, 0]}>
        {[0, Math.PI / 4, Math.PI / 2, Math.PI * 0.75].map((a) => (
          <Ring key={a} r={1.04} rotation={[0, a, 0]} c="#8dcfb5" />
        ))}
        {[-0.64, 0, 0.64].map((y) => (
          <Ring
            key={y}
            p={[0, y, 0]}
            r={Math.sqrt(1.0816 - y * y)}
            c="#8dcfb5"
          />
        ))}
        {land.map((p, i) => (
          <Ball key={i} p={p} r={0.11} c="#d1f0b1" glow />
        ))}
        <Ring r={1.34} rotation={[0.3, 0.1, 0.4]} c="#ffcc8a" tube={0.017} />
      </group>
      <Label
        text="CONNECTED INTELLIGENCE"
        p={[0, 0.3, 0.87]}
        w={1.52}
        h={0.22}
        color="#e9dbb6"
        size={29}
      />
    </>
  );
}
export function SceneObjects({
  step,
  reducedMotion,
}: {
  step: number;
  reducedMotion: boolean;
}) {
  // Each direct child is one independently staggered actor, rooted at floor level.
  switch (step) {
    case 0:
      return (
        <>
          <group>
            <LabWalls />
          </group>
          <group position={[-1.05, 0, -2.34]}>
            <Whiteboard />
          </group>
          <group position={[-0.8, 0, -0.58]}>
            <Desk />
          </group>
          <group position={[-0.8, 0, 0.67]} rotation={[0, -0.22, 0]}>
            <Chair />
          </group>
          <group position={[1.98, 0, -1.63]}>
            <Arcade />
          </group>
          <group position={[0.95, 0, 1.35]}>
            <Pizza />
          </group>
          <group position={[-2.26, 0, 1.17]}>
            <Plant scale={0.95} />
          </group>
          <group position={[2.22, 0, 0.57]}>
            <Box p={[0, 0.16, 0]} s={[0.68, 0.32, 0.62]} c="#acb28a" />
            <Box p={[0, 0.34, 0]} s={[0.73, 0.06, 0.67]} c="#c8cba7" />
            <Label
              text="IDEAS"
              p={[0, 0.17, 0.32]}
              w={0.52}
              h={0.23}
              color="#62734e"
              size={58}
            />
          </group>
        </>
      );
    case 1:
      return (
        <>
          <group position={[-2, 0, -1.55]}>
            <Server />
          </group>
          <group position={[-0.88, 0, -1.75]}>
            <Server tall={1.2} />
          </group>
          <group position={[0.25, 0, -1.85]}>
            <Server />
          </group>
          <group position={[-1.72, 0, 0.55]}>
            <Safe />
          </group>
          <group position={[1.32, 0, 0.05]}>
            <Idle reduced={reducedMotion}>
              <GPTCube />
            </Idle>
          </group>
          <group position={[1.98, 0, -1.86]}>
            <Box p={[0, 0.14, 0]} s={[1, 0.28, 0.8]} c="#657e8b" />
            <Label
              text="COMPUTE"
              p={[0, 0.3, 0]}
              w={0.8}
              h={0.35}
              rotation={[-Math.PI / 2, 0, 0]}
              size={46}
            />
          </group>
        </>
      );
    case 2:
      return (
        <>
          <group position={[-0.55, 0, -0.3]}>
            <Phone />
          </group>
          <group position={[1.92, 0, -1.57]}>
            <Antenna />
          </group>
          <group position={[1.43, 0, 1.15]}>
            <Idle type="wobble" reduced={reducedMotion}>
              <Chair board />
            </Idle>
          </group>
          <group position={[-1.94, 2.15, 0.3]}>
            <Idle reduced={reducedMotion}>
              <Bubble text="Hello, world!" />
            </Idle>
          </group>
          <group position={[0.93, 2.65, 0.4]}>
            <Idle reduced={reducedMotion} phase={2}>
              <Bubble text="안녕하세요" c="#d7ecc4" />
            </Idle>
          </group>
          <group position={[-1.55, 0.88, 1.62]}>
            <Idle reduced={reducedMotion} phase={4}>
              <Bubble text="What if…" c="#80c5a8" />
            </Idle>
          </group>
        </>
      );
    case 3:
      return (
        <>
          <group position={[-1.72, 0, 0.4]}>
            <Slate />
          </group>
          <group position={[1.97, 0, 0.61]}>
            <MovieCamera />
          </group>
          <group position={[0.24, 0, -0.3]}>
            <Idle type="bounce" reduced={reducedMotion}>
              <Brain />
            </Idle>
          </group>
          <group position={[-1.97, 0, -1.77]}>
            <VideoFrame />
          </group>
          <group position={[1.97, 1.4, -1.74]}>
            <Idle reduced={reducedMotion}>
              <Bubble text="Let's think." c="#ccbde9" />
            </Idle>
          </group>
        </>
      );
    default:
      return (
        <>
          <group position={[-2.03, 0, 1.03]}>
            <Idle type="wobble" reduced={reducedMotion}>
              <RobotArm />
            </Idle>
          </group>
          <group position={[1.67, 0, 0.77]}>
            <PowerPlant />
          </group>
          <group position={[-0.04, 0, -0.27]}>
            <Idle reduced={reducedMotion}>
              <Globe />
            </Idle>
          </group>
          <group position={[-2.17, 0, -1.6]}>
            <Server tall={0.75} />
          </group>
          <group position={[1.85, 0, -1.72]}>
            <Server tall={0.75} />
          </group>
          <group position={[-0.27, 0.015, 1.37]}>
            <Ring r={0.47} c="#ffcb8a" />
            <Label
              text="AGI HUB"
              p={[0, 0.025, 0]}
              w={0.8}
              h={0.4}
              rotation={[-Math.PI / 2, 0, 0]}
              color="#778b64"
              size={57}
            />
          </group>
        </>
      );
  }
}
