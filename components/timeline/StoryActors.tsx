'use client';
import {
  Box,
  Ball,
  Cylinder,
  Label,
  Ring,
  Plant,
  type Vec3,
} from './primitives';
import {
  Arcade,
  Antenna,
  Brain,
  Chair,
  Desk,
  Globe,
  LabWalls,
  MovieCamera,
  Phone,
  Pizza,
  PowerPlant,
  RobotArm,
  Safe,
  Server,
  Slate,
  VideoFrame,
  Whiteboard,
} from './objects';
import { AXES, PEOPLE, type Chapter, type PersonId } from '@/data/types';

function Actor({
  id,
  p = [0, 0, 0],
  children,
}: {
  id: string;
  p?: Vec3;
  children: React.ReactNode;
}) {
  return (
    <group name={`actor:${id}`} position={p}>
      <group name={`story:${id}`}>{children}</group>
    </group>
  );
}
export function Person({ id }: { id: PersonId }) {
  const p = PEOPLE[id];
  return (
    <group>
      <Cylinder p={[0, 0.04, 0]} r={0.26} h={0.08} c="#9da58d" />
      {[-0.09, 0.09].map((x) => (
        <group key={x}>
          <Box p={[x, 0.21, 0]} s={[0.12, 0.33, 0.14]} c="#505d53" />
          <Box p={[x, 0.075, 0.047]} s={[0.15, 0.1, 0.24]} c="#3e4943" />
        </group>
      ))}
      <Box p={[0, 0.53, 0]} s={[0.37, 0.4, 0.22]} c={p.color} r={0.075} />
      <Cylinder p={[0, 0.79, 0]} h={0.095} r={0.06} c={p.skin} />
      <Ball p={[0, 0.94, 0]} r={0.19} c={p.skin} />
      <mesh position={[0, 1.03, -0.04]} scale={[1, 0.65, 1]} castShadow>
        <sphereGeometry args={[0.192, 14, 10]} />
        <meshStandardMaterial color={p.hair} />
      </mesh>
      {[-0.066, 0.066].map((x) => (
        <Ball key={x} p={[x, 0.96, 0.165]} r={0.018} c="#3a372f" />
      ))}
      {p.glasses &&
        [-0.065, 0.065].map((x) => (
          <Ring
            key={x}
            p={[x, 0.967, 0.18]}
            r={0.046}
            tube={0.009}
            c="#444945"
            rotation={[0, 0, 0]}
          />
        ))}
      <group
        name="arm:left"
        position={[-0.23, 0.68, 0]}
        rotation={[0, 0, -0.12]}
      >
        <Box p={[0, -0.14, 0]} s={[0.12, 0.31, 0.13]} c={p.color} />
        <Ball p={[0, -0.32, 0]} r={0.066} c={p.skin} />
      </group>
      <group
        name="arm:right"
        position={[0.23, 0.68, 0]}
        rotation={[0, 0, 0.12]}
      >
        <Box p={[0, -0.14, 0]} s={[0.12, 0.31, 0.13]} c={p.color} />
        <Ball p={[0, -0.32, 0]} r={0.066} c={p.skin} />
      </group>
      <Label
        text={p.english}
        p={[0, 0.025, 0.51]}
        w={1.18}
        h={0.22}
        color="#5c7154"
        rotation={[-Math.PI / 2, 0, 0]}
        size={47}
      />
    </group>
  );
}
function ModelBlock({ label, color }: { label: string; color: string }) {
  return (
    <>
      <Cylinder p={[0, 0.1, 0]} r={0.72} h={0.2} c="#6f827b" />
      <Ring p={[0, 0.215, 0]} r={0.61} c={color} />
      <Box
        p={[0, 1.13, 0]}
        s={[1.25, 1.4, 1.25]}
        c={color}
        opacity={0.87}
        glow
      />
      <Label
        text={label}
        p={[0, 1.23, 0.633]}
        w={1.12}
        h={0.45}
        size={label.length > 8 ? 48 : 70}
      />
      <Label text="OPENAI" p={[0, 0.83, 0.635]} w={0.94} h={0.25} size={45} />
      <group name="model:layers">
        {[0, 1, 2].map((n) => (
          <Ring
            key={n}
            p={[0, 1.87 + n * 0.1, 0]}
            r={0.45 - n * 0.07}
            c={color}
          />
        ))}
      </group>
    </>
  );
}
function Tokens({ color }: { color: string }) {
  return (
    <>
      {Array.from({ length: 9 }, (_, i) => (
        <group
          key={i}
          name={`token:${i}`}
          position={[
            ((i % 3) - 0.9) * 0.35,
            0.13 + Math.floor(i / 3) * 0.26,
            0,
          ]}
        >
          <Box s={[0.27, 0.2, 0.26]} c={color} />
          {i < 3 && (
            <Label
              text={['A', 'I', '?'][i]}
              p={[0, 0, 0.135]}
              w={0.2}
              h={0.2}
              color="#355442"
              size={99}
            />
          )}
        </group>
      ))}
    </>
  );
}
function Document({
  title = 'CHARTER',
  color = '#dddec9',
}: {
  title?: string;
  color?: string;
}) {
  return (
    <>
      <Box p={[0, 0.04, 0]} s={[1.28, 0.08, 0.96]} c="#a5af95" />
      <group rotation={[-0.35, 0, 0]} position={[0, 0.2, -0.12]}>
        <Box p={[0, 0.55, 0]} s={[1.16, 1.1, 0.06]} c={color} />
        <Label
          text={title}
          p={[0, 0.8, 0.035]}
          w={1.02}
          h={0.24}
          color="#5c7050"
          size={52}
        />
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            p={[0, 0.55 - i * 0.15, 0.039]}
            s={[0.78, 0.025, 0.01]}
            c="#a4ae93"
            r={0}
          />
        ))}
      </group>
    </>
  );
}
function Painting({ label = 'DALL·E' }: { label?: string }) {
  return (
    <>
      <VideoFrame />
      <Box p={[0, 1.08, 0.11]} s={[0.63, 0.24, 0.03]} c="#deb584" />
      <Ball p={[-0.18, 1.34, 0.15]} r={0.13} c="#d9a3c0" />
      <Label
        text={label}
        p={[0, 1.8, 0.03]}
        w={1.3}
        h={0.3}
        color="#c8b1ef"
        size={65}
      />
    </>
  );
}
function Terminal({ label = 'CODEX' }: { label?: string }) {
  return (
    <>
      <Box p={[0, 0.96, 0]} s={[1.45, 1.5, 0.24]} c="#80958b" />
      <Box p={[0, 0.99, 0.135]} s={[1.28, 1.25, 0.025]} c="#203e34" />
      <Label
        text={label}
        p={[0, 1.36, 0.155]}
        w={1.18}
        h={0.34}
        color="#c8efb0"
        size={55}
      />
      {['> build()', '  think()', '  run()'].map((t, i) => (
        <Label
          key={t}
          text={t}
          p={[0, 1.03 - i * 0.23, 0.155]}
          w={1.03}
          h={0.24}
          size={45}
        />
      ))}
      <Box p={[0, 0.18, 0.3]} s={[1.63, 0.09, 0.76]} c="#bdc8aa" />
    </>
  );
}
function Microphone() {
  return (
    <>
      <Cylinder p={[0, 0.08, 0]} r={0.47} h={0.16} c="#80978c" />
      <Cylinder p={[0, 0.75, 0]} r={0.04} h={1.3} c="#a2b7a4" />
      <Box p={[0, 1.5, 0]} s={[0.43, 0.66, 0.42]} c="#627b72" r={0.18} />
      {[0, 1, 2, 3].map((i) => (
        <Box
          key={i}
          p={[0, 1.33 + i * 0.11, 0.22]}
          s={[0.29, 0.02, 0.014]}
          c="#bcd4bd"
          r={0}
        />
      ))}
    </>
  );
}
function Wave({ color }: { color: string }) {
  return (
    <>
      {[0.3, 0.6, 1, 0.7, 0.4, 0.9, 0.5].map((h, i) => (
        <group name={`wave:${i}`} key={i} position={[(i - 3) * 0.2, 0.7, 0]}>
          <Box s={[0.1, h, 0.12]} c={color} glow />
        </group>
      ))}
    </>
  );
}
function BoardTable() {
  return (
    <>
      <Box p={[0, 0.75, 0]} s={[2.1, 0.16, 1]} c="#ac967f" />
      {[-0.8, 0.8].map((x) => (
        <Cylinder key={x} p={[x, 0.37, 0]} r={0.08} h={0.74} c="#647567" />
      ))}
      <Label
        text="BOARD"
        p={[0, 0.84, 0]}
        w={1.2}
        h={0.47}
        rotation={[-Math.PI / 2, 0, 0]}
        color="#625f4f"
        size={66}
      />
    </>
  );
}
function Gate() {
  return (
    <>
      <Box p={[-0.7, 1.1, 0]} s={[0.17, 2.2, 0.24]} c="#a4b298" />
      <Box p={[0.7, 1.1, 0]} s={[0.17, 2.2, 0.24]} c="#a4b298" />
      <Box p={[0, 2.16, 0]} s={[1.57, 0.15, 0.24]} c="#d0d8bd" />
      <group name="gate:door" position={[-0.65, 0, 0]}>
        <Box
          p={[0.65, 1.04, 0]}
          s={[1.24, 2.04, 0.09]}
          c="#7da48b"
          opacity={0.5}
        />
      </group>
      <Label
        text="PUBLIC ACCESS"
        p={[0, 2.43, 0]}
        w={1.75}
        h={0.3}
        color="#bddc9d"
        size={43}
      />
    </>
  );
}
function GameBoard({ team = false }: { team?: boolean }) {
  return (
    <>
      <Box p={[0, 0.18, 0]} s={[2.3, 0.3, 1.65]} c="#6a8a61" />
      <Box
        p={[0, 0.341, 0]}
        s={[2.13, 0.015, 0.22]}
        c="#b9b798"
        rotation={[0, 0.5, 0]}
      />
      {Array.from({ length: team ? 5 : 1 }, (_, i) => (
        <group
          name={`game:blue:${i}`}
          key={`blue${i}`}
          position={[
            -0.75 + (i % 3) * 0.25,
            0.38,
            -0.45 + Math.floor(i / 3) * 0.3,
          ]}
        >
          <Cylinder r={0.09} h={0.16} c="#86b5e1" />
          <Ball p={[0, 0.13, 0]} r={0.09} c="#bedcff" />
        </group>
      ))}
      {Array.from({ length: team ? 5 : 1 }, (_, i) => (
        <group
          name={`game:red:${i}`}
          key={`red${i}`}
          position={[0.7 - (i % 3) * 0.22, 0.38, 0.4 - Math.floor(i / 3) * 0.3]}
        >
          <Cylinder r={0.09} h={0.16} c="#d19877" />
          <Ball p={[0, 0.13, 0]} r={0.09} c="#ecc9a1" />
        </group>
      ))}
      <Label
        text={team ? 'OPENAI FIVE' : 'SELF PLAY'}
        p={[0, 0.22, 0.841]}
        w={1.5}
        h={0.23}
        size={47}
      />
    </>
  );
}
function TaskBoard() {
  return (
    <>
      <Box p={[0, 1.07, 0]} s={[1.55, 1.7, 0.12]} c="#819980" />
      {[0, 1, 2, 3].map((i) => (
        <group
          key={i}
          name={`task:${i}`}
          position={[
            -0.38 + (i % 2) * 0.76,
            1.38 - Math.floor(i / 2) * 0.68,
            0.08,
          ]}
        >
          <Box
            s={[0.61, 0.51, 0.025]}
            c={['#c5dcb1', '#a6c8da', '#d2c09b', '#b9add3'][i]}
          />
          <Label
            text={['BALANCE', 'PLAY', 'LEARN', 'REPEAT'][i]}
            p={[0, 0, 0.025]}
            w={0.56}
            h={0.23}
            color="#496047"
            size={43}
          />
        </group>
      ))}
      <Label
        text="ENVIRONMENTS"
        p={[0, 2.1, 0]}
        w={1.7}
        h={0.27}
        color="#c8dda9"
        size={49}
      />
    </>
  );
}
function FilmScreen() {
  return (
    <>
      <Box p={[0, 1.2, 0]} s={[2.1, 1.4, 0.13]} c="#92919f" />
      <Box p={[0, 1.2, 0.08]} s={[1.91, 1.22, 0.018]} c="#536c82" />
      <Box p={[0, 0.84, 0.1]} s={[1.91, 0.44, 0.02]} c="#829276" />
      <group name="film:subject" position={[-0.52, 1.19, 0.135]}>
        <Ball r={0.19} c="#e2b688" />
        <Box p={[0, -0.18, 0]} s={[0.33, 0.13, 0.03]} c="#bd9475" />
      </group>
      <Ball p={[0.6, 1.6, 0.125]} r={0.12} c="#ead0a1" />
      <Label
        text="SORA / 00:01"
        p={[0, 0.49, 0.11]}
        w={1.7}
        h={0.26}
        color="#d9c7f5"
        size={45}
      />
    </>
  );
}
export function StoryActors({ chapter }: { chapter: Chapter }) {
  const c = AXES[chapter.axis].color;
  const people = chapter.people;
  let set: React.ReactNode;
  switch (chapter.set) {
    case 'gym':
      set = (
        <>
          <Actor id="hero" p={[0, 0, -0.6]}>
            <TaskBoard />
          </Actor>
          <Actor id="work" p={[-2, 0, -1.5]}>
            <Arcade />
          </Actor>
          <Actor id="support" p={[2, 0, -1.5]}>
            <Terminal label={chapter.short.toUpperCase()} />
          </Actor>
          <Actor id="data" p={[-1.6, 0, 0.6]}>
            <Tokens color="#abc697" />
          </Actor>
          <Actor id="output" p={[1.6, 0, 0.65]}>
            <Document title="BENCHMARK" />
          </Actor>
        </>
      );
      break;
    case 'game':
      set = (
        <>
          <Actor id="hero" p={[0, 0, -0.4]}>
            <GameBoard team={chapter.id === 'openai-five'} />
          </Actor>
          <Actor id="work" p={[-2, 0, -1.7]}>
            <Server tall={0.75} />
          </Actor>
          <Actor id="support" p={[2, 0, -1.6]}>
            <Terminal label="SELF PLAY" />
          </Actor>
          <Actor id="data" p={[-1.6, 0, 0.7]}>
            <Tokens color="#a7c797" />
          </Actor>
          <Actor id="output" p={[1.6, 0, 0.73]}>
            <Document title="LEARNING" />
          </Actor>
        </>
      );
      break;
    case 'robotics':
      set = (
        <>
          <Actor id="hero" p={[0, 0, -0.2]}>
            <RobotArm />
          </Actor>
          <Actor id="work" p={[-2, 0, -1.6]}>
            <Terminal label="SIMULATION" />
          </Actor>
          <Actor id="support" p={[2, 0, -1.6]}>
            <Server tall={0.8} />
          </Actor>
          <Actor id="data" p={[-1.7, 0, 0.65]}>
            <ModelBlock label="SIM" color={c} />
          </Actor>
          <Actor id="output" p={[1.67, 0.6, 0.63]}>
            <Box s={[0.56, 0.56, 0.56]} c="#d8ba87" />
            <Label
              text="REAL"
              p={[0, 0, 0.29]}
              w={0.48}
              h={0.24}
              color="#617352"
              size={69}
            />
          </Actor>
        </>
      );
      break;
    case 'alignment':
      set = (
        <>
          <Actor id="hero" p={[0, 0, -0.4]}>
            <ModelBlock label={chapter.model ?? 'RLHF'} color={c} />
          </Actor>
          <Actor id="work" p={[-1.98, 0, -1.55]}>
            <Document title="PREFERENCES" />
          </Actor>
          <Actor id="support" p={[1.98, 0, -1.55]}>
            <TaskBoard />
          </Actor>
          <Actor id="data" p={[-1.6, 0, 0.67]}>
            <Tokens color="#bac7a6" />
          </Actor>
          <Actor id="output" p={[1.6, 0, 0.67]}>
            <Document title="BETTER ANSWER" />
          </Actor>
        </>
      );
      break;
    case 'film':
      set = (
        <>
          <Actor id="hero" p={[0, 0, -0.4]}>
            <FilmScreen />
          </Actor>
          <Actor id="work" p={[-1.97, 0, -1.6]}>
            <MovieCamera />
          </Actor>
          <Actor id="support" p={[1.97, 0, -1.6]}>
            <Slate />
          </Actor>
          <Actor id="data" p={[-1.6, 0, 0.72]}>
            <Tokens color="#bdd4ae" />
          </Actor>
          <Actor id="output" p={[1.6, 0, 0.74]}>
            <Painting label="FRAMES" />
          </Actor>
        </>
      );
      break;
    case 'lab':
      set = (
        <>
          <Actor id="background">
            <LabWalls />
          </Actor>
          <Actor id="hero" p={[-0.8, 0, -2.35]}>
            <Whiteboard />
          </Actor>
          <Actor id="work" p={[-0.85, 0, -0.6]}>
            <Desk />
          </Actor>
          <Actor id="support" p={[2, 0, -1.57]}>
            <Arcade />
          </Actor>
          <Actor id="output" p={[1.55, 0, 0.75]}>
            <Pizza />
          </Actor>
          <Actor id="data" p={[-2.25, 0, 0.78]}>
            <Plant scale={0.9} />
          </Actor>
        </>
      );
      break;
    case 'language':
      set = (
        <>
          <Actor id="hero" p={[0.2, 0, -0.35]}>
            <ModelBlock label={chapter.model ?? chapter.short} color={c} />
          </Actor>
          <Actor id="work" p={[-2.04, 0, -1.6]}>
            <Server tall={0.84} />
          </Actor>
          <Actor id="support" p={[2, 0, -1.55]}>
            <Server tall={0.84} />
          </Actor>
          <Actor id="data" p={[-1.6, 0, 0.8]}>
            <Tokens color="#c2d6b1" />
          </Actor>
          <Actor id="output" p={[1.74, 0, 0.85]}>
            <Tokens color={c} />
          </Actor>
        </>
      );
      break;
    case 'image':
      set = (
        <>
          <Actor id="hero" p={[0.1, 0, -0.4]}>
            <Painting label={chapter.model} />
          </Actor>
          <Actor id="work" p={[-1.96, 0, -1.55]}>
            <MovieCamera />
          </Actor>
          <Actor id="support" p={[1.97, 0, -1.55]}>
            <Painting label="VISION" />
          </Actor>
          <Actor id="data" p={[-1.6, 0, 0.62]}>
            <Tokens color="#c5d5a5" />
          </Actor>
          <Actor id="output" p={[1.64, 0, 0.65]}>
            <Painting label="IMAGINE" />
          </Actor>
        </>
      );
      break;
    case 'code':
    case 'agent':
      set = (
        <>
          <Actor id="hero" p={[0, 0, -0.5]}>
            <Terminal label={chapter.model ?? chapter.short} />
          </Actor>
          <Actor id="work" p={[-2, 0, -1.6]}>
            <Server tall={0.85} />
          </Actor>
          <Actor id="support" p={[2, 0, -1.48]}>
            <Document title="TASKS" />
          </Actor>
          <Actor id="data" p={[-1.62, 0, 0.65]}>
            <Tokens color="#c3d7b0" />
          </Actor>
          <Actor id="output" p={[1.65, 0, 0.65]}>
            <RobotArm />
          </Actor>
        </>
      );
      break;
    case 'voice':
      set = (
        <>
          <Actor id="hero" p={[0, 0, -0.45]}>
            <Microphone />
          </Actor>
          <Actor id="work" p={[-1.98, 0, -1.5]}>
            <Terminal label={chapter.model ?? 'AUDIO'} />
          </Actor>
          <Actor id="support" p={[1.93, 0, -1.65]}>
            <Phone />
          </Actor>
          <Actor id="data" p={[-1.52, 0, 0.65]}>
            <Wave color="#a2cbb3" />
          </Actor>
          <Actor id="output" p={[1.55, 0, 0.72]}>
            <Tokens color={c} />
          </Actor>
        </>
      );
      break;
    case 'chat':
      set = (
        <>
          <Actor id="hero" p={[0, 0, -0.45]}>
            <Phone />
          </Actor>
          <Actor id="work" p={[-1.96, 0, -1.5]}>
            <ModelBlock label={chapter.model ?? 'GPT-3.5'} color={c} />
          </Actor>
          <Actor id="support" p={[2, 0, -1.65]}>
            <Antenna />
          </Actor>
          <Actor id="data" p={[-1.6, 0.6, 0.65]}>
            <Tokens color="#c7dcae" />
          </Actor>
          <Actor id="output" p={[1.63, 0.7, 0.7]}>
            <Tokens color={c} />
          </Actor>
        </>
      );
      break;
    case 'reasoning':
      set = (
        <>
          <Actor id="hero" p={[0, 0, -0.4]}>
            <Brain label={chapter.model ?? 'LEARNING'} />
          </Actor>
          <Actor id="work" p={[-1.95, 0, -1.65]}>
            <Terminal label={chapter.model ?? 'REASONING'} />
          </Actor>
          <Actor id="support" p={[1.97, 0, -1.6]}>
            <Server tall={0.8} />
          </Actor>
          <Actor id="data" p={[-1.62, 0, 0.75]}>
            <Tokens color="#bbcaba" />
          </Actor>
          <Actor id="output" p={[1.65, 0, 0.78]}>
            <Document title="SOLUTION" />
          </Actor>
        </>
      );
      break;
    case 'investment':
      set = (
        <>
          <Actor id="hero" p={[0.1, 0, -0.55]}>
            <Safe />
          </Actor>
          <Actor id="work" p={[-1.97, 0, -1.57]}>
            <Server tall={0.8} />
          </Actor>
          <Actor id="support" p={[1.98, 0, -1.6]}>
            <Server />
          </Actor>
          <Actor id="data" p={[-1.62, 0, 0.58]}>
            <Tokens color="#cde8a4" />
          </Actor>
          <Actor id="output" p={[1.63, 0, 0.68]}>
            <Document title="PARTNERSHIP" />
          </Actor>
        </>
      );
      break;
    case 'board':
      set = (
        <>
          <Actor id="hero" p={[0, 0, -0.5]}>
            <BoardTable />
          </Actor>
          <Actor id="work" p={[-1.82, 0, -1.43]}>
            <Chair board />
          </Actor>
          <Actor id="support" p={[1.82, 0, -1.43]}>
            <Chair board />
          </Actor>
          <Actor id="data" p={[-1.56, 0, 0.7]}>
            <Document title="DECISION" />
          </Actor>
          <Actor id="output" p={[1.63, 0, 0.63]}>
            <Chair board />
          </Actor>
        </>
      );
      break;
    case 'organization':
      set = (
        <>
          <Actor id="hero" p={[0, 0, -0.5]}>
            <Document title={chapter.model ?? 'CHARTER'} />
          </Actor>
          <Actor id="work" p={[-1.98, 0, -1.64]}>
            <group scale={0.66}>
              <Desk />
            </group>
          </Actor>
          <Actor id="support" p={[1.92, 0, -1.55]}>
            <Gate />
          </Actor>
          <Actor id="data" p={[-1.5, 0, 0.73]}>
            <Tokens color="#d8c5e5" />
          </Actor>
          <Actor id="output" p={[1.67, 0, 0.66]}>
            <Document title="MISSION" />
          </Actor>
        </>
      );
      break;
    default:
      set = (
        <>
          <Actor id="hero" p={[0, 0, -0.42]}>
            <Globe />
          </Actor>
          <Actor id="work" p={[-2.04, 0, -1.53]}>
            <Server tall={0.83} />
          </Actor>
          <Actor id="support" p={[2.06, 0, -1.47]}>
            <Server tall={0.83} />
          </Actor>
          <Actor id="data" p={[-1.7, 0, 0.67]}>
            <RobotArm />
          </Actor>
          <Actor id="output" p={[1.7, 0, 0.72]}>
            <PowerPlant />
          </Actor>
        </>
      );
      break;
  }
  return (
    <>
      {set}
      {people.map((person, i) => (
        <Actor
          key={person}
          id={`person-${i}`}
          p={[(i - (people.length - 1) / 2) * 1.2, 0, 1.98]}
        >
          <Person id={person} />
        </Actor>
      ))}
    </>
  );
}
