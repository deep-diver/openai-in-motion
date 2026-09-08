'use client';
import { useMemo, type ReactNode } from 'react';
import { CatmullRomCurve3, Vector3, PlaneGeometry } from 'three';
import { Actor } from './SceneActor';
import { Ball, Box, Cylinder, Label, Ring, type Vec3 } from './primitives';
import { Chair, Server } from './objects';
import type { Chapter } from '@/data/types';

function Card({
  title,
  lines = [],
  color = '#e3e7d6',
  w = 1.5,
  h = 1.05,
}: {
  title: string;
  lines?: string[];
  color?: string;
  w?: number;
  h?: number;
}) {
  return (
    <>
      <Box p={[0, h / 2, 0]} s={[w, h, 0.09]} c={color} />
      <Label
        text={title}
        p={[0, h * 0.78, 0.055]}
        w={w * 0.9}
        h={h * 0.25}
        color="#3f5549"
        size={55}
      />
      {lines.map((line, i) => (
        <group key={i} name={`screen:line:${i}`}>
          <Label
            text={line}
            p={[0, h * (0.52 - i * 0.18), 0.056]}
            w={w * 0.9}
            h={h * 0.19}
            color="#65806c"
            size={42}
          />
        </group>
      ))}
    </>
  );
}
function Plinth({ text, color = '#90a996' }: { text: string; color?: string }) {
  return (
    <>
      <Box p={[0, 0.12, 0]} s={[1.4, 0.24, 1]} c={color} />
      <Label
        text={text}
        p={[0, 0.13, 0.511]}
        w={1.3}
        h={0.22}
        color="#eff6df"
        size={43}
      />
    </>
  );
}
function Browser({
  title,
  lines,
  variant = 'code',
}: {
  title: string;
  lines: string[];
  variant?: 'chat' | 'code' | 'sheet' | 'calendar';
}) {
  return (
    <>
      <Box p={[0, 1.22, 0]} s={[2.7, 2.1, 0.17]} c="#c6d0bd" r={0.07} />
      <Box
        p={[0, 1.26, 0.096]}
        s={[2.52, 1.83, 0.018]}
        c={variant === 'chat' ? '#f5f3e9' : '#203a34'}
      />
      <Box p={[0, 2.17, 0.099]} s={[2.55, 0.17, 0.02]} c="#a9b5a3" />
      {['#d8a17d', '#d8c688', '#88b992'].map((c, i) => (
        <Ball key={c} p={[-1.1 + i * 0.13, 2.17, 0.12]} r={0.035} c={c} />
      ))}
      <Label
        text={title}
        p={[0.16, 1.9, 0.12]}
        w={2.1}
        h={0.32}
        color={variant === 'chat' ? '#3f4c42' : '#c4e3b5'}
        size={55}
      />
      {variant === 'chat' && (
        <>
          <Box p={[-1.04, 1.25, 0.11]} s={[0.38, 1.62, 0.025]} c="#38443c" />
          <Label
            text="+ NEW"
            p={[-1.04, 1.83, 0.135]}
            w={0.34}
            h={0.16}
            size={29}
          />
        </>
      )}
      {lines.map((line, i) => (
        <group key={i} name={`screen:line:${i}`}>
          <Box
            p={[variant === 'chat' ? 0.2 : 0, 1.54 - i * 0.29, 0.12]}
            s={[variant === 'chat' ? 1.84 : 2.23, 0.22, 0.015]}
            c={variant === 'chat' ? (i % 2 ? '#dce9db' : '#efeee5') : '#2e4c41'}
          />
          <Label
            text={line}
            p={[variant === 'chat' ? 0.2 : 0, 1.54 - i * 0.29, 0.137]}
            w={variant === 'chat' ? 1.7 : 2.1}
            h={0.2}
            color={variant === 'chat' ? '#53674f' : '#c0dda8'}
            size={40}
          />
        </group>
      ))}
      <Cylinder p={[0, 0.19, 0]} r={0.055} h={0.38} c="#a1b297" />
      <Box p={[0, 0.04, 0.12]} s={[1.05, 0.07, 0.65]} c="#7e9781" />
    </>
  );
}
function Tower({
  label,
  layers = 5,
  color = '#9bc3de',
  metric,
}: {
  label: string;
  layers?: number;
  color?: string;
  metric?: string;
}) {
  return (
    <>
      <Plinth text={metric ?? 'TRANSFORMER'} color="#66888c" />
      {Array.from({ length: layers }, (_, i) => (
        <group name={`layer:${i}`} key={i}>
          <Box
            p={[0, 0.35 + i * 0.17, 0]}
            s={[1.1, 0.11, 0.85]}
            c={i % 2 ? color : '#d5e5dc'}
          />
        </group>
      ))}
      <Label
        text={label}
        p={[0, 0.59 + layers * 0.17, 0]}
        w={1.8}
        h={0.44}
        color="#dcefff"
        size={70}
      />
    </>
  );
}
function ModelCrates({
  openAll = false,
  finalRelease = false,
  labels = ['124M', '355M', '774M', '1.5B'],
  locks = true,
}: {
  openAll?: boolean;
  finalRelease?: boolean;
  labels?: string[];
  locks?: boolean;
}) {
  return (
    <>
      {labels.map((label, i) => (
        <group
          key={label}
          position={[(i - (labels.length - 1) / 2) * 1.03, 0, 0]}
        >
          <Box
            p={[0, 0.35 + i * 0.06, 0]}
            s={[0.84, 0.7 + i * 0.12, 0.8]}
            c={i === 3 ? '#91abc4' : '#abc1c5'}
          />
          <group
            name={`crate:lid:${i}`}
            position={[0, 0.7 + i * 0.12, -0.4]}
            rotation={[openAll || (finalRelease && i < 3) ? -1.45 : 0, 0, 0]}
          >
            <Box p={[0, 0.045, 0.4]} s={[0.91, 0.09, 0.87]} c="#d6e2d7" />
          </group>
          <Label
            text={label}
            p={[0, 0.37, 0.411]}
            w={0.72}
            h={0.3}
            color="#2a5369"
            size={77}
          />
          {locks && !(finalRelease && i < 3) && (
            <group
              name={`crate:lock:${i}`}
              position={[0, 0.65 + i * 0.08, 0.45]}
            >
              <Box s={[0.13, 0.17, 0.08]} c="#c8b17a" />
              <Ring
                p={[0, 0.1, 0]}
                r={0.058}
                rotation={[0, 0, 0]}
                c="#a59972"
                tube={0.012}
              />
            </group>
          )}
        </group>
      ))}
    </>
  );
}
function DataCards({ labels }: { labels: string[] }) {
  return (
    <>
      {labels.map((text, i) => (
        <group
          key={text}
          name={`data:card:${i}`}
          position={[0, 0.07 + i * 0.11, -i * 0.07]}
          rotation={[0, (i - 1) * 0.09, 0]}
        >
          <Box
            s={[1.3, 0.07, 0.65]}
            c={['#c8ddba', '#c9dce7', '#e5d2ae'][i % 3]}
          />
          <Label
            text={text}
            p={[0, 0.041, 0]}
            w={1.19}
            h={0.35}
            color="#496957"
            rotation={[-Math.PI / 2, 0, 0]}
            size={48}
          />
        </group>
      ))}
    </>
  );
}
function CartPole() {
  return (
    <>
      <Box p={[0, 0.1, 0]} s={[2.2, 0.2, 1.3]} c="#9caf94" />
      <Box p={[0, 0.216, 0]} s={[2, 0.04, 0.12]} c="#4c6655" />
      <group name="cart:body">
        <Box p={[0, 0.4, 0]} s={[0.7, 0.31, 0.47]} c="#c3d698" />
        {[-0.24, 0.24].map((x) => (
          <Cylinder
            key={x}
            p={[x, 0.27, 0.22]}
            r={0.09}
            h={0.1}
            rotation={[Math.PI / 2, 0, 0]}
            c="#445e4a"
          />
        ))}
        <group name="cart:pole" position={[0, 0.53, 0]}>
          <Cylinder p={[0, 0.58, 0]} r={0.039} h={1.16} c="#d2ae7e" />
          <Ball p={[0, 1.17, 0]} r={0.065} c="#e2bc84" />
        </group>
      </group>
      <Label
        text="CARTPOLE"
        p={[0, 0.1, 0.663]}
        w={1.7}
        h={0.25}
        color="#eff3dc"
        size={61}
      />
    </>
  );
}
function GameField({ team = false }: { team?: boolean }) {
  return (
    <>
      <Box p={[0, 0.15, 0]} s={[2.5, 0.3, 2]} c="#708862" />
      <Box
        p={[0, 0.312, 0]}
        s={[2.35, 0.02, 0.29]}
        c="#c1b99a"
        rotation={[0, -0.62, 0]}
      />
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.93, 0.32, side * 0.68]}>
          <Cylinder
            r={0.18}
            top={0.13}
            h={0.49}
            c={side < 0 ? '#82b3d6' : '#cc927c'}
          />
          <Box
            p={[0, 0.33, 0]}
            s={[0.34, 0.14, 0.32]}
            c={side < 0 ? '#aecde4' : '#e0b7a0'}
          />
        </group>
      ))}
      {[0, 1].map((teamId) =>
        Array.from({ length: team ? 5 : 1 }, (_, i) => (
          <group
            key={`${teamId}${i}`}
            name={`game:${teamId ? 'red' : 'blue'}:${i}`}
            position={[
              (teamId ? 0.48 : -0.48) + (i % 3) * 0.18,
              0.41,
              (teamId ? 0.34 : -0.42) + Math.floor(i / 3) * 0.2,
            ]}
          >
            <Cylinder r={0.07} h={0.16} c={teamId ? '#d99d80' : '#80b6de'} />
            <Ball
              p={[0, 0.13, 0]}
              r={0.075}
              c={teamId ? '#f0c1a6' : '#cee8f8'}
            />
          </group>
        )),
      )}
      <Label
        text={team ? '5 vs 5 / SELF PLAY' : 'BOT vs DENDI'}
        p={[0, 0.15, 1.013]}
        w={2.25}
        h={0.25}
        color="#eff3dc"
        size={57}
      />
    </>
  );
}
function RobotHand() {
  return (
    <>
      <Cylinder p={[0, 0.13, 0]} r={0.53} h={0.26} c="#718a80" />
      <Cylinder p={[0, 0.51, 0]} r={0.16} h={0.7} c="#c7d0bd" />
      <Box p={[0, 0.89, 0]} s={[0.6, 0.19, 0.57]} c="#bdcbbf" />
      {[-0.24, -0.08, 0.08, 0.24].map((x, i) => (
        <group
          key={x}
          name={`hand:finger:${i}`}
          position={[x, 0.97, -0.21]}
          rotation={[-0.2, 0, 0]}
        >
          <Box p={[0, 0.2, 0]} s={[0.11, 0.4, 0.11]} c="#d5e0d0" />
          <group position={[0, 0.4, 0]} rotation={[0.6, 0, 0]}>
            <Box p={[0, 0.13, 0]} s={[0.1, 0.27, 0.1]} c="#9faf9f" />
          </group>
        </group>
      ))}
      <group
        name="hand:thumb"
        position={[-0.32, 0.94, 0.15]}
        rotation={[0, 0, 0.6]}
      >
        <Box p={[0, 0.2, 0]} s={[0.12, 0.4, 0.13]} c="#cbd7c5" />
      </group>
      <group name="hand:block" position={[0, 1.32, 0.04]}>
        <Box s={[0.42, 0.42, 0.42]} c="#c5a3bd" />
        <Label
          text="A"
          p={[0, 0, 0.217]}
          w={0.35}
          h={0.31}
          color="#eff2db"
          size={120}
        />
        <Label
          text="B"
          p={[0.217, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          w={0.35}
          h={0.31}
          color="#eff2db"
          size={120}
        />
      </group>
    </>
  );
}
function Dog() {
  return (
    <group>
      <mesh position={[0, 0.48, 0]} scale={[0.55, 0.28, 0.25]} castShadow>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#c6a578" />
      </mesh>
      <Ball p={[0.36, 0.77, 0]} r={0.23} c="#d3b487" />
      <Box p={[0.53, 0.73, 0.03]} s={[0.28, 0.15, 0.2]} c="#dbc393" />
      {[-0.31, 0.26].map((x) =>
        [-0.15, 0.15].map((z) => (
          <Cylinder
            key={`${x}${z}`}
            p={[x, 0.23, z]}
            r={0.05}
            h={0.45}
            c="#ba976b"
          />
        )),
      )}
      <Box
        p={[0.27, 0.7, 0.2]}
        s={[0.16, 0.34, 0.06]}
        c="#8f704f"
        rotation={[0, 0, 0.1]}
      />
      <Ball p={[0.43, 0.81, 0.19]} r={0.025} c="#353b2c" />
      <Cylinder
        p={[-0.61, 0.56, 0]}
        r={0.035}
        h={0.4}
        c="#bd996d"
        rotation={[0, 0, -1]}
      />
    </group>
  );
}
function AvocadoChair() {
  return (
    <>
      <mesh position={[0, 0.94, -0.15]} scale={[0.53, 0.73, 0.2]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#638b4d" />
      </mesh>
      <mesh position={[0, 0.96, 0.015]} scale={[0.45, 0.63, 0.115]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#c2d484" />
      </mesh>
      <mesh position={[0, 0.54, 0.17]} scale={[0.47, 0.12, 0.41]} castShadow>
        <sphereGeometry args={[1, 24, 12]} />
        <meshStandardMaterial color="#a9c16c" />
      </mesh>
      <Ball p={[0, 0.82, 0.14]} r={0.215} c="#a78157" />
      {[-0.28, 0.28].map((x) =>
        [-0.18, 0.35].map((z) => (
          <Cylinder
            key={`${x}${z}`}
            p={[x, 0.25, z]}
            r={0.043}
            h={0.5}
            c="#9b815b"
            rotation={[0, 0, x * 0.35]}
          />
        )),
      )}
    </>
  );
}
function AstronautHorse() {
  return (
    <group>
      <mesh position={[0, 0.7, 0]} scale={[0.65, 0.3, 0.24]} castShadow>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#bf9c70" />
      </mesh>
      {[-0.45, 0.35].map((x) =>
        [-0.17, 0.17].map((z) => (
          <Cylinder
            key={`${x}${z}`}
            p={[x, 0.35, z]}
            r={0.055}
            h={0.69}
            c="#ad895f"
          />
        )),
      )}
      <Cylinder
        p={[0.44, 1, 0]}
        r={0.12}
        h={0.65}
        c="#c5a276"
        rotation={[0, 0, -0.32]}
      />
      <Box p={[0.6, 1.31, 0]} s={[0.48, 0.23, 0.22]} c="#cbaa7d" />
      <Box p={[-0.17, 1.13, 0]} s={[0.31, 0.41, 0.34]} c="#e5e9db" />
      <Ball p={[-0.17, 1.52, 0]} r={0.23} c="#eef0e0" />
      <Ball p={[0.01, 1.54, 0.05]} r={0.15} c="#738d9a" />
      {[-0.22, 0.22].map((z) => (
        <Box key={z} p={[-0.06, 0.99, z]} s={[0.4, 0.14, 0.14]} c="#d5ddcf" />
      ))}
      <Box p={[-0.38, 1.13, 0]} s={[0.15, 0.35, 0.3]} c="#c3ccbd" />
    </group>
  );
}
function PreferenceDesk({ instruct = false }: { instruct?: boolean }) {
  return (
    <>
      <Box p={[0, 0.13, 0]} s={[2.7, 0.26, 1.15]} c="#a5b59b" />
      {[-0.71, 0.71].map((x, i) => (
        <group key={x} position={[x, 0.27, 0]} name={`preference:panel:${i}`}>
          <Card
            title={instruct ? `ANSWER ${i + 1}` : `CLIP ${i ? 'B' : 'A'}`}
            lines={
              instruct
                ? [i ? 'Helpful response' : 'Unhelpful response']
                : ['HOPPER', i ? 'BACKFLIP' : 'FALL']
            }
            w={1.15}
            h={0.9}
            color={i ? '#c8dda9' : '#d8c8ba'}
          />
          <group name={`preference:vote:${i}`} position={[0, 1.13, 0.02]}>
            <Ball r={0.16} c={i ? '#b7de83' : '#b2b3a4'} />
            <Label
              text={i ? '✓' : '×'}
              p={[0, 0, 0.17]}
              w={0.27}
              h={0.27}
              color="#3e6347"
              size={99}
            />
          </group>
        </group>
      ))}
    </>
  );
}
function Banner({ text }: { text: string }) {
  return (
    <Label
      text={text}
      p={[0, 2.65, -0.6]}
      w={3.8}
      h={0.43}
      color="#d5e3c1"
      size={58}
    />
  );
}
function Set({
  hero,
  work,
  support,
  data,
  output,
  banner,
}: {
  hero: ReactNode;
  work: ReactNode;
  support: ReactNode;
  data: ReactNode;
  output: ReactNode;
  banner?: string;
}) {
  return (
    <>
      <Actor id="hero" p={[0, 0, -0.25]}>
        {hero}
        {banner && <Banner text={banner} />}
      </Actor>
      <Actor id="work" p={[-2.03, 0, -1.6]}>
        <group scale={0.78}>{work}</group>
      </Actor>
      <Actor id="support" p={[2.03, 0, -1.6]}>
        <group scale={0.78}>{support}</group>
      </Actor>
      <Actor id="data" p={[-1.8, 0, 0.84]}>
        <group scale={0.75}>{data}</group>
      </Actor>
      <Actor id="output" p={[1.8, 0, 0.84]}>
        <group scale={0.75}>{output}</group>
      </Actor>
    </>
  );
}
export function getHistoricalSet(chapter: Chapter): ReactNode | null {
  switch (chapter.id) {
    case 'gym-beta':
      return (
        <Set
          hero={<CartPole />}
          work={
            <Card title="OPENAI GYM" lines={['RESET → STEP', 'ENVIRONMENT']} />
          }
          support={<Card title="REWARD" lines={['+1  +1  +1', 'BALANCE']} />}
          data={<DataCards labels={['ACTION', 'OBSERVATION']} />}
          output={
            <Card title="BENCHMARK" lines={['SAME TASK', 'COMPARE RESULTS']} />
          }
          banner="GYM / CARTPOLE"
        />
      );
    case 'universe':
      return (
        <Set
          hero={
            <Browser
              title="UNIVERSE"
              lines={[
                'GAMES + WEBSITES + APPS',
                'ONE AGENT INTERFACE',
                'OBSERVE → ACT',
              ]}
            />
          }
          work={<Card title="ATARI" lines={['PIXELS', 'KEYBOARD']} />}
          support={<Card title="BROWSER" lines={['SCREEN', 'MOUSE']} />}
          data={<DataCards labels={['VNC', 'ACTIONS']} />}
          output={<Card title="ENVIRONMENTS" lines={['SHARED INTERFACE']} />}
          banner="UNIVERSE"
        />
      );
    case 'human-preferences':
    case 'instructgpt':
      return (
        <Set
          hero={<PreferenceDesk instruct={chapter.id === 'instructgpt'} />}
          work={<Card title="HUMAN FEEDBACK" lines={['COMPARE', 'RANK']} />}
          support={<Tower label={chapter.model ?? 'RL AGENT'} layers={4} />}
          data={<DataCards labels={['A or B?', 'PREFERENCE']} />}
          output={
            <Card
              title={
                chapter.id === 'instructgpt'
                  ? 'FOLLOW INSTRUCTIONS'
                  : 'BACKFLIP LEARNED'
              }
              lines={['FEEDBACK → LEARNING']}
            />
          }
          banner={
            chapter.id === 'instructgpt'
              ? 'INSTRUCTGPT / RLHF'
              : 'LEARNING FROM HUMAN PREFERENCES'
          }
        />
      );
    case 'dota-1v1':
    case 'openai-five':
      return (
        <Set
          hero={<GameField team={chapter.id === 'openai-five'} />}
          work={
            <Card
              title="DOTA 2"
              lines={[
                chapter.id === 'openai-five' ? 'FIVE AGENTS' : '1 vs 1',
                'SELF PLAY',
              ]}
            />
          }
          support={<Server tall={0.8} />}
          data={<DataCards labels={['PRACTICE', 'SELF PLAY']} />}
          output={
            <Card
              title={
                chapter.id === 'openai-five' ? 'TEAMWORK' : 'MID-LANE DUEL'
              }
              lines={[
                chapter.id === 'openai-five'
                  ? 'LEARNED POLICY'
                  : 'BOT 2–0 DENDI',
              ]}
            />
          }
          banner={
            chapter.id === 'openai-five' ? 'OPENAI FIVE' : 'OPENAI vs DENDI'
          }
        />
      );
    case 'dactyl':
      return (
        <Set
          hero={<RobotHand />}
          work={
            <Card title="SIMULATION" lines={['RANDOMIZED', 'ENVIRONMENTS']} />
          }
          support={
            <Card
              title="REAL ROBOT"
              lines={['FIVE FINGERS', 'BLOCK ROTATION']}
            />
          }
          data={<DataCards labels={['SIM → REAL']} />}
          output={<Card title="DACTYL" lines={['DEXTERITY', 'TRANSFERRED']} />}
          banner="DACTYL / SIM TO REAL"
        />
      );
    case 'gpt-1':
      return (
        <Set
          hero={<Tower label="GPT-1" layers={8} metric="PRETRAIN → FINETUNE" />}
          work={<Card title="PRETRAIN" lines={['UNLABELED TEXT']} />}
          support={<Card title="FINETUNE" lines={['LANGUAGE TASKS']} />}
          data={<DataCards labels={['BOOKS', 'TEXT']} />}
          output={
            <Card title="ONE FOUNDATION" lines={['CLASSIFY', 'ANSWER']} />
          }
          banner="GENERATIVE PRE-TRAINING"
        />
      );
    case 'gpt-2-staged':
    case 'gpt-2-full':
      return (
        <Set
          hero={<ModelCrates finalRelease={chapter.id === 'gpt-2-full'} />}
          work={
            <Card
              title="GPT-2"
              lines={[
                chapter.id === 'gpt-2-full'
                  ? 'FINAL RELEASE'
                  : 'STAGED RELEASE',
              ]}
            />
          }
          support={
            <Card
              title={
                chapter.id === 'gpt-2-full' ? 'RELEASE REPORT' : 'EVALUATION'
              }
              lines={['CAPABILITY', 'MISUSE RISK']}
            />
          }
          data={<DataCards labels={['PROMPT', 'CONTINUATION']} />}
          output={
            <Card
              title={
                chapter.id === 'gpt-2-full'
                  ? '1.5B RELEASED'
                  : 'SMALL MODEL FIRST'
              }
              lines={[chapter.id === 'gpt-2-full' ? 'NOV 2019' : 'FEB 2019']}
            />
          }
          banner={
            chapter.id === 'gpt-2-full'
              ? 'GPT-2 / THE FINAL BOX OPENS'
              : 'GPT-2 / STAGED RELEASE'
          }
        />
      );
    case 'gpt-3':
      return (
        <Set
          hero={
            <Tower label="GPT-3" layers={10} metric="175 BILLION PARAMETERS" />
          }
          work={
            <Card
              title="FEW-SHOT"
              lines={['A FEW EXAMPLES', 'NO FINETUNING']}
            />
          }
          support={<Server tall={1.05} />}
          data={<DataCards labels={['sea → mer', 'sky → ciel', 'tree → ?']} />}
          output={<Card title="tree → arbre" lines={['LEARN FROM CONTEXT']} />}
          banner="GPT-3 / 175B"
        />
      );
    case 'api-private-beta':
      return (
        <Set
          hero={
            <Browser
              title="OPENAI API"
              lines={['POST /completions', 'prompt: hello', 'response: ...']}
            />
          }
          work={<Tower label="GPT-3" layers={5} />}
          support={<Card title="PRIVATE BETA" lines={['JUNE 2020']} />}
          data={<DataCards labels={['PYTHON', 'JAVASCRIPT']} />}
          output={<Card title="APPLICATION" lines={['API CONNECTED']} />}
          banner="MODELS MEET DEVELOPERS"
        />
      );
    case 'clip':
      return (
        <Set
          hero={
            <>
              <Plinth text="IMAGE" />
              <group name="clip:dog" position={[0, 0.26, 0]}>
                <Dog />
              </group>
            </>
          }
          work={
            <Card
              title="TEXT"
              lines={['a photo of a cat', 'a photo of a dog']}
            />
          }
          support={<Tower label="CLIP" layers={4} />}
          data={<DataCards labels={['IMAGE + TEXT', 'MATCH MEANING']} />}
          output={
            <Card title="✓ a photo of a dog" lines={['ZERO-SHOT MATCH']} />
          }
          banner="CLIP / CONNECTING TEXT AND IMAGES"
        />
      );
    case 'dall-e':
      return (
        <Set
          hero={
            <group name="image:avocado" scale={1.35}>
              <AvocadoChair />
            </group>
          }
          work={
            <Card
              title="PROMPT"
              lines={['an armchair in the', 'shape of an avocado']}
            />
          }
          support={<Card title="DALL·E" lines={['TEXT → IMAGE']} />}
          data={<DataCards labels={['AVOCADO', 'ARMCHAIR']} />}
          output={
            <group scale={0.73}>
              <AvocadoChair />
            </group>
          }
          banner="THE AVOCADO ARMCHAIR"
        />
      );
    case 'dall-e-2':
      return (
        <Set
          hero={
            <group name="image:astronaut" scale={1.2}>
              <AstronautHorse />
            </group>
          }
          work={
            <Card title="PROMPT" lines={['an astronaut', 'riding a horse']} />
          }
          support={
            <Card
              title="DALL·E 2"
              lines={['HIGHER RESOLUTION', 'VARIATIONS']}
            />
          }
          data={<DataCards labels={['TEXT', 'IMAGE']} />}
          output={
            <Card
              title="RESEARCH PREVIEW"
              lines={['APRIL 2022', 'CREATE + EDIT']}
            />
          }
          banner="AN ASTRONAUT RIDING A HORSE"
        />
      );
    case 'codex-2021':
      return (
        <Set
          hero={
            <Browser
              title="OPENAI CODEX"
              lines={[
                '# say hello to a user',
                'def greet(name):',
                '  return "Hello, " + name',
              ]}
            />
          }
          work={<Card title="NATURAL LANGUAGE" lines={['Write a function']} />}
          support={<Tower label="CODEX" layers={5} />}
          data={<DataCards labels={['REQUEST', 'CODE']} />}
          output={<Card title="Hello, world!" lines={['PROGRAM RUNNING']} />}
          banner="WORDS BECOME CODE"
        />
      );
    case 'whisper':
      return (
        <Set
          hero={
            <Browser
              title="WHISPER"
              lines={['안녕하세요 → Hello', 'Hola → Hello', 'Bonjour → Hello']}
            />
          }
          work={<AudioInput />}
          support={<Card title="OPEN SOURCE" lines={['MODEL + CODE']} />}
          data={<DataCards labels={['AUDIO', 'LANGUAGES']} />}
          output={
            <Card
              title="TRANSCRIPTION"
              lines={['원어 자막', 'ENGLISH TRANSLATION']}
            />
          }
          banner="WHISPER / AUDIO TO TEXT"
        />
      );
    case 'chatgpt-launch':
      return (
        <Set
          hero={
            <Browser
              title="ChatGPT"
              variant="chat"
              lines={[
                'Hello!',
                'How can I help you today?',
                'Explain it more simply.',
                'Sure. Let us try again.',
              ]}
            />
          }
          work={
            <Card
              title="RESEARCH PREVIEW"
              lines={['NOV 30, 2022', 'FREE TO TRY']}
            />
          }
          support={<Tower label="GPT-3.5" layers={4} />}
          data={<DataCards labels={['QUESTION', 'FOLLOW-UP']} />}
          output={<Card title="USER FEEDBACK" lines={['HELPFUL?  ↑  ↓']} />}
          banner="CHATGPT / THE CONVERSATION BEGINS"
        />
      );
    default:
      return getRecentSet(chapter);
  }
}
function AudioInput() {
  return (
    <>
      <Cylinder p={[-0.38, 0.12, 0]} r={0.3} h={0.15} c="#849c90" />
      <Cylinder p={[-0.38, 0.5, 0]} r={0.04} h={0.8} c="#c4d1be" />
      <Box p={[-0.38, 1.05, 0]} s={[0.4, 0.65, 0.35]} c="#537868" r={0.16} />
      {Array.from({ length: 7 }, (_, i) => (
        <group key={i} name={`wave:${i}`} position={[0.02 + i * 0.14, 0.9, 0]}>
          <Box s={[0.055, 0.22 + (i % 3) * 0.15, 0.06]} c="#c3dda4" />
        </group>
      ))}
      <Label
        text="MULTILINGUAL AUDIO"
        p={[0, 1.7, 0]}
        w={2.1}
        h={0.28}
        size={48}
      />
    </>
  );
}
function Wire({ points, c = '#d3bd79' }: { points: Vec3[]; c?: string }) {
  const curve = useMemo(
    () => new CatmullRomCurve3(points.map((p) => new Vector3(...p))),
    [points],
  );
  return (
    <mesh>
      <tubeGeometry args={[curve, 24, 0.024, 6, false]} />
      <meshStandardMaterial color={c} roughness={0.5} />
    </mesh>
  );
}
function MSBridge({ expanded = false }: { expanded?: boolean }) {
  return (
    <>
      <group position={[-0.91, 0, 0]}>
        <Box p={[0, 0.65, 0]} s={[0.92, 1.3, 1]} c="#b4c4aa" />
        <Label
          text="OpenAI"
          p={[0, 0.81, 0.51]}
          w={0.83}
          h={0.3}
          color="#43674e"
          size={70}
        />
      </group>
      <group position={[0.91, 0, 0]}>
        <Box p={[0, 0.88, 0]} s={[0.92, 1.76, 1]} c="#8dabc0" />
        {['#f35325', '#81bc06', '#05a6f0', '#ffba08'].map((color, i) => (
          <Box
            key={color}
            p={[-0.13 + (i % 2) * 0.27, 1.2 - Math.floor(i / 2) * 0.27, 0.514]}
            s={[0.24, 0.24, 0.02]}
            c={color}
          />
        ))}
        <Label
          text="Azure"
          p={[0, 0.56, 0.516]}
          w={0.78}
          h={0.26}
          color="#e5f2eb"
          size={68}
        />
      </group>
      {[0, 1, 2].map((i) => (
        <group
          name={`bridge:part:${i}`}
          key={i}
          position={[-0.3 + i * 0.3, 0.55, 0]}
        >
          <Box s={[0.32, 0.12, 0.46]} c="#8ebac1" />
        </group>
      ))}
      <Label
        text={expanded ? 'MULTI-YEAR PARTNERSHIP' : '$1 BILLION / 2019'}
        p={[0, 2.03, 0.14]}
        w={2.9}
        h={0.38}
        color="#d2e6c0"
        size={61}
      />
    </>
  );
}
function Boardroom({
  returning = false,
  musk = false,
}: {
  returning?: boolean;
  musk?: boolean;
}) {
  return (
    <>
      <Box p={[0, 0.67, 0]} s={[2.75, 0.17, 1.24]} c="#ab9274" />
      {[-1, 1].map((x) => (
        <Cylinder key={x} p={[x, 0.31, 0]} h={0.62} r={0.07} c="#6c7a64" />
      ))}
      <group position={[0, 0, -0.74]}>
        <Chair board />
      </group>
      <group name="board:oldplate" position={[0, 0.82, 0.1]}>
        <Box s={[1.24, 0.25, 0.12]} c={musk ? '#b8bba7' : '#e0cdab'} />
        <Label
          text={musk ? 'ELON MUSK' : 'SAM / CEO'}
          p={[0, 0, 0.066]}
          w={1.13}
          h={0.23}
          color="#4e624d"
          size={65}
        />
      </group>
      {returning &&
        ['BRET', 'LARRY', 'ADAM'].map((name, i) => (
          <group
            name={`board:newseat:${i}`}
            key={name}
            position={[(i - 1) * 0.91, 0, 0.76]}
          >
            <group scale={0.67}>
              <Chair board />
            </group>
            <Label
              text={name}
              p={[0, 1.05, 0.81]}
              w={0.81}
              h={0.24}
              color="#d1e2bc"
              size={62}
            />
          </group>
        ))}
      <Label
        text={
          musk
            ? 'BOARD DEPARTURE'
            : returning
              ? 'CEO RETURN + NEW BOARD'
              : 'LEADERSHIP TRANSITION'
        }
        p={[0, 1.9, 0.18]}
        w={3.1}
        h={0.37}
        color="#d9bdd8"
        size={53}
      />
    </>
  );
}
function OrgStructure({ pbc = false }: { pbc?: boolean }) {
  return (
    <>
      <Box p={[0, 1.95, 0]} s={[2.25, 0.58, 0.74]} c="#bbc8a6" />
      <Label
        text={pbc ? 'OPENAI FOUNDATION' : 'NONPROFIT'}
        p={[0, 1.98, 0.38]}
        w={2.1}
        h={0.3}
        color="#4b6b49"
        size={63}
      />
      <Box p={[0, 1.34, 0]} s={[0.08, 0.65, 0.08]} c="#c2dca4" glow />
      <group name="org:operating">
        <Box p={[0, 0.7, 0]} s={[2.35, 0.75, 1.15]} c="#9d86b3" />
        <Label
          text={pbc ? 'OPENAI GROUP PBC' : 'OPENAI LP'}
          p={[0, 0.84, 0.585]}
          w={2.17}
          h={0.3}
          color="#f0e4f4"
          size={67}
        />
        <Label
          text={pbc ? 'NONPROFIT CONTROL' : 'CAPPED RETURNS'}
          p={[0, 0.53, 0.585]}
          w={2.1}
          h={0.26}
          color="#eadcf1"
          size={49}
        />
      </group>
    </>
  );
}
function VGAExample() {
  return (
    <>
      <group rotation={[-0.25, 0, 0]} position={[0.65, 0, -0.15]}>
        <Box p={[0, 1.05, 0]} s={[0.96, 1.95, 0.16]} c="#d4dcc9" r={0.07} />
        <Box p={[0, 1.1, 0.09]} s={[0.78, 1.62, 0.018]} c="#566e76" />
        <Label text="PHONE" p={[0, 1.23, 0.105]} w={0.69} h={0.3} size={73} />
      </group>
      <group name="vga:plug" position={[-0.63, 0.67, 0.3]}>
        <Box s={[0.89, 0.4, 0.52]} c="#5d94c3" />
        <Box p={[0.49, 0, 0]} s={[0.19, 0.3, 0.38]} c="#b0bdc0" />
        {[0, 1, 2].map((row) =>
          [0, 1, 2, 3, 4].map((col) => (
            <Cylinder
              key={`${row}${col}`}
              p={[0.61, (row - 1) * 0.085, (col - 2) * 0.065]}
              r={0.018}
              h={0.1}
              c="#d3d9cb"
              rotation={[0, 0, Math.PI / 2]}
            />
          )),
        )}
      </group>
      <Wire
        points={[
          [-1.02, 0.65, 0.3],
          [-1.3, 0.36, 0.05],
          [-0.63, 0.29, -0.4],
          [0.65, 0.25, -0.2],
        ]}
        c="#839a99"
      />
    </>
  );
}
function TokyoStreet() {
  return (
    <>
      <Box p={[0, 0.09, 0]} s={[2.6, 0.18, 1.65]} c="#67716b" />
      <Box p={[0, 0.19, 0.42]} s={[2.5, 0.02, 0.45]} c="#454e4d" />
      {[-1, -0.34, 0.4, 1].map((x, i) => (
        <group key={x} position={[x, 0, -0.51]}>
          <Box
            p={[0, 0.76 + (i % 2) * 0.23, 0]}
            s={[0.53, 1.5 + (i % 2) * 0.46, 0.43]}
            c={['#728185', '#8f9290', '#6d7886', '#92958b'][i]}
          />
          <Box
            p={[0, 1.15 + (i % 2) * 0.16, 0.225]}
            s={[0.19, 0.66, 0.016]}
            c={i % 2 ? '#e4a5a5' : '#acc6d3'}
            glow
          />
          <Label
            text={['TOKYO', '東京', 'SORA', '夜'][i]}
            p={[0, 0.71, 0.228]}
            w={0.45}
            h={0.23}
            color="#e7d8d1"
            size={52}
          />
        </group>
      ))}
      <group name="tokyo:walker" position={[-0.89, 0.2, 0.44]}>
        <Cylinder p={[0, 0.32, 0]} r={0.11} h={0.38} c="#bb6660" />
        <Box p={[0, 0.64, 0]} s={[0.25, 0.28, 0.17]} c="#333d39" />
        <Ball p={[0, 0.91, 0]} r={0.13} c="#cfb391" />
        {[-0.07, 0.07].map((x) => (
          <Cylinder key={x} p={[x, 0.1, 0]} r={0.034} h={0.21} c="#373e38" />
        ))}
        <Box p={[0, 0.94, 0.11]} s={[0.2, 0.035, 0.025]} c="#393e35" />
      </group>
    </>
  );
}
function OmniDemo() {
  return (
    <>
      <Box p={[0.62, 1.15, 0]} s={[1.4, 1.8, 0.1]} c="#edf0df" />
      <Label
        text="GPT-4o"
        p={[0.62, 1.74, 0.061]}
        w={1.27}
        h={0.32}
        color="#416453"
        size={75}
      />
      <Label
        text="3x + 1 = 10"
        p={[0.62, 1.23, 0.061]}
        w={1.27}
        h={0.3}
        color="#517a65"
        size={65}
      />
      <group name="omni:answer">
        <Label
          text="x = 3"
          p={[0.62, 0.8, 0.061]}
          w={1.2}
          h={0.3}
          color="#759854"
          size={77}
        />
      </group>
      <Cylinder p={[-0.75, 0.16, 0.15]} r={0.36} h={0.2} c="#7d9d8b" />
      <Cylinder p={[-0.75, 0.67, 0.15]} r={0.04} h={0.9} c="#b1c5a9" />
      <Box p={[-0.75, 1.22, 0.15]} s={[0.38, 0.6, 0.34]} c="#3e6756" r={0.15} />
      <Box p={[-0.72, 1.88, 0.03]} s={[0.54, 0.33, 0.32]} c="#7c978a" />
      <Cylinder
        p={[-0.72, 1.88, 0.22]}
        r={0.12}
        h={0.12}
        rotation={[Math.PI / 2, 0, 0]}
        c="#bad5c3"
      />
      <group name="omni:signal">
        <Ring
          p={[-0.75, 1.22, 0.4]}
          r={0.34}
          c="#b5e1b0"
          rotation={[0, 0, 0]}
        />
      </group>
    </>
  );
}
function ReasoningBoard({ tools = false }: { tools?: boolean }) {
  return (
    <>
      <Box p={[0, 0.12, 0]} s={[2.55, 0.24, 1.65]} c="#a8a6b4" />
      {['THINK', 'CHECK', 'ANSWER'].map((label, i) => (
        <group key={label} position={[(i - 1) * 0.82, 0.26, 0]}>
          <Box
            p={[0, 0.14, 0]}
            s={[0.7, 0.28, 0.78]}
            c={i === 2 ? '#b8dba7' : '#b5accd'}
          />
          <Label
            text={tools ? ['SEARCH', 'PYTHON', 'VISION'][i] : label}
            p={[0, 0.14, 0.4]}
            w={0.64}
            h={0.2}
            color="#535574"
            size={42}
          />
          {tools && i === 0 && (
            <group position={[0, 0.71, 0]}>
              <Ring r={0.2} tube={0.035} rotation={[0, 0, 0]} c="#c4d9e8" />
              <Cylinder
                p={[0.2, -0.23, 0]}
                r={0.035}
                h={0.28}
                c="#c4d9e8"
                rotation={[0, 0, 0.7]}
              />
            </group>
          )}
          {tools && i === 1 && (
            <group position={[0, 0.64, 0]}>
              <Box s={[0.59, 0.46, 0.09]} c="#374f53" />
              <Label
                text=">_"
                p={[0, 0, 0.052]}
                w={0.49}
                h={0.3}
                color="#c7efb4"
                size={75}
              />
            </group>
          )}
          {tools && i === 2 && (
            <group position={[0, 0.66, 0]}>
              <Box s={[0.55, 0.44, 0.08]} c="#c4d8d8" />
              <Ball p={[-0.14, 0.1, 0.05]} r={0.06} c="#e8cf88" />
              <Box
                p={[0, -0.06, 0.05]}
                s={[0.28, 0.23, 0.025]}
                c="#829b85"
                rotation={[0, 0, 0.6]}
              />
            </group>
          )}
          {!tools && (
            <Label
              text={['3x + 1 = 10', '3x = 9', 'x = 3'][i]}
              p={[0, 0.7, 0]}
              w={0.76}
              h={0.24}
              color="#e3dcee"
              size={45}
            />
          )}
        </group>
      ))}
      <group name="reason:cursor" position={[-0.82, 0.43, 0.57]}>
        <Ball r={0.12} c="#ebd391" glow />
      </group>
      <Label
        text={tools ? 'TOOLS + REASONING' : 'REASON BEFORE ANSWERING'}
        p={[0, 1.31, 0]}
        w={2.9}
        h={0.34}
        color="#c9b9ed"
        size={57}
      />
    </>
  );
}
function CraneSite() {
  return (
    <>
      <Box p={[0, 0.06, 0]} s={[2.8, 0.12, 1.9]} c="#8aa5b0" />
      <Label
        text="TEXAS / STARGATE"
        p={[0, 0.127, 0.64]}
        w={2.4}
        h={0.38}
        color="#e4eadd"
        rotation={[-Math.PI / 2, 0, 0]}
        size={64}
      />
      <Box p={[-1.01, 1.15, -0.46]} s={[0.15, 2.3, 0.16]} c="#d0ae6e" />
      <Box p={[-0.25, 2.2, -0.46]} s={[1.8, 0.13, 0.16]} c="#d9bd7c" />
      <Cylinder p={[0.53, 1.57, -0.46]} r={0.013} h={1.12} c="#667c73" />
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          name={`build:rack:${i}`}
          position={[-0.5 + i * 0.65, 0.14, -0.04]}
        >
          <Box p={[0, 0.37, 0]} s={[0.5, 0.74, 0.58]} c="#a8bbab" />
          {[0, 1, 2].map((n) => (
            <Box
              key={n}
              p={[0, 0.2 + n * 0.16, 0.3]}
              s={[0.37, 0.055, 0.02]}
              c="#597a78"
            />
          ))}
        </group>
      ))}
      <Label
        text="PLANNED INFRASTRUCTURE"
        p={[0, 2.64, 0.03]}
        w={3.2}
        h={0.32}
        color="#d6e5c5"
        size={54}
      />
    </>
  );
}
function RoutingGate({ style = false }: { style?: boolean }) {
  return (
    <>
      <Box p={[0, 0.17, 0]} s={[2.5, 0.34, 1.4]} c="#7d9786" />
      {[-0.7, 0.7].map((x, i) => (
        <group key={x} position={[x, 0.35, 0]}>
          <Box
            p={[0, 0.55, 0]}
            s={[0.86, 1.1, 0.72]}
            c={i ? '#aea1ce' : '#a7c9ab'}
          />
          <Label
            text={style ? (i ? 'THINKING' : 'INSTANT') : i ? 'DEEPER' : 'FAST'}
            p={[0, 0.68, 0.371]}
            w={0.8}
            h={0.26}
            color="#3e6155"
            size={53}
          />
          <Label
            text={
              style ? (i ? 'ADAPTIVE' : 'WARMER') : i ? 'REASON' : 'RESPOND'
            }
            p={[0, 0.3, 0.371]}
            w={0.8}
            h={0.2}
            color="#4e6b5c"
            size={42}
          />
        </group>
      ))}
      <group name="router:packet" position={[0, 1.98, 0]}>
        <Box s={[0.23, 0.18, 0.23]} c="#e4d795" />
      </group>
      <group name="router:complex" position={[0.25, 2.26, 0]}>
        <Box s={[0.23, 0.18, 0.23]} c="#c0a7df" />
      </group>
    </>
  );
}
function ConversationStyle() {
  return (
    <>
      <Browser
        title="GPT-5.1 / YOUR STYLE"
        variant="chat"
        lines={[
          'Explain this to me.',
          'Of course. Let us work',
          'through it together.',
        ]}
      />
      <group position={[0, 0.21, 0.6]}>
        <Box s={[2.55, 0.26, 0.33]} c="#b6c6b1" />
        <Label
          text="PROFESSIONAL     FRIENDLY"
          p={[0, 0.03, 0.173]}
          w={2.43}
          h={0.18}
          color="#4e6d52"
          size={43}
        />
        <group name="style:selector" position={[-0.86, 0.23, 0]}>
          <Ball r={0.105} c="#e9cc8d" glow />
        </group>
      </group>
    </>
  );
}
function Workforce() {
  return (
    <>
      <Box p={[0, 1.02, 0]} s={[2.6, 1.94, 0.12]} c="#d7dfca" />
      <Label
        text="WORKFORCE PLANNER"
        p={[0, 1.78, 0.07]}
        w={2.38}
        h={0.28}
        color="#466450"
        size={60}
      />
      {['TEAM A', 'TEAM B', 'TEAM C'].map((name, i) => (
        <group key={name}>
          <Label
            text={name}
            p={[-0.89, 1.34 - i * 0.4, 0.077]}
            w={0.6}
            h={0.2}
            color="#5a755a"
            size={40}
          />
          <Box
            p={[0.39, 1.34 - i * 0.4, 0.076]}
            s={[1.45, 0.26, 0.01]}
            c="#becfb6"
          />
          <group
            name={`planner:bar:${i}`}
            position={[-0.03 + i * 0.12, 1.34 - i * 0.4, 0.09]}
          >
            <Box
              s={[0.77, 0.22, 0.027]}
              c={['#a0c7b0', '#a9bdd7', '#d1b88d'][i]}
            />
          </group>
        </group>
      ))}
    </>
  );
}
function RaceGame() {
  return (
    <>
      <Box p={[0, 0.14, 0]} s={[2.6, 0.28, 1.75]} c="#80a77b" />
      <Box p={[0, 0.292, 0]} s={[2.4, 0.02, 1.56]} c="#62706c" />
      <Box p={[0, 0.306, 0]} s={[1.64, 0.024, 0.92]} c="#9dba86" />
      <group name="race:car" position={[-0.97, 0.4, -0.58]}>
        <Box s={[0.36, 0.14, 0.22]} c="#cf8e75" />
        <Box p={[0, 0.11, 0]} s={[0.18, 0.12, 0.19]} c="#dce5d2" />
        {[-0.12, 0.12].map((x) =>
          [-0.12, 0.12].map((z) => (
            <Ball key={`${x}${z}`} p={[x, -0.04, z]} r={0.054} c="#344f43" />
          )),
        )}
      </group>
      <Label
        text="GENERATED RACING GAME"
        p={[0, 1.42, -0.25]}
        w={2.8}
        h={0.32}
        color="#c6ddad"
        size={50}
      />
    </>
  );
}
function ComputerUse() {
  return (
    <>
      <group position={[-0.69, 0.32, 0]}>
        <Card
          title="EMAIL"
          lines={['Meeting request', 'Tuesday, 10:00']}
          w={1.2}
          h={1.55}
        />
      </group>
      <group position={[0.69, 0.32, 0]}>
        <Card
          title="CALENDAR"
          lines={['MON TUE WED', '09  10  11']}
          w={1.2}
          h={1.55}
        />
        <group name="calendar:event" position={[0, 0.53, 0.065]}>
          <Box s={[0.88, 0.22, 0.03]} c="#a3c6a7" />
          <Label
            text="MEETING"
            p={[0, 0, 0.019]}
            w={0.81}
            h={0.19}
            color="#436952"
            size={46}
          />
        </group>
      </group>
      <group name="computer:cursor" position={[-0.74, 1.08, 0.23]}>
        <Cylinder
          r={0.1}
          top={0}
          h={0.31}
          c="#eaeedc"
          rotation={[0, 0, -0.4]}
        />
      </group>
    </>
  );
}
function Surface({ inverted = false }: { inverted?: boolean }) {
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(1.8, 1.8, 22, 22);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        z = p.getY(i);
      p.setXYZ(
        i,
        x,
        (inverted ? 1 : 0) + (inverted ? -0.7 : 0.7) * (x * x + z * z),
        z,
      );
    }
    g.computeVertexNormals();
    return g;
  }, [inverted]);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={inverted ? '#aec8d6' : '#d3b58d'}
        transparent
        opacity={0.65}
        side={2}
        roughness={0.6}
      />
    </mesh>
  );
}
function Quadrics() {
  return (
    <>
      <Box p={[0, 0.08, 0]} s={[2.2, 0.16, 2.2]} c="#849993" />
      <group position={[0, 0.2, 0]}>
        <Surface />
        <Surface inverted />
        <group name="quadrics:intersection">
          <Ring
            p={[0, 0.5, 0]}
            r={Math.sqrt(1 / 1.4)}
            c="#d9796c"
            tube={0.025}
          />
        </group>
      </group>
      <Label
        text="TWO SURFACES · ONE INTERSECTION"
        p={[0, 1.95, 0]}
        w={3.2}
        h={0.33}
        color="#d6e3cd"
        size={48}
      />
    </>
  );
}
function ThreeEngines() {
  return (
    <>
      {['SOL', 'TERRA', 'LUNA'].map((name, i) => (
        <group key={name} position={[(i - 1) * 0.94, 0, 0]}>
          <Box p={[0, 0.14, 0]} s={[0.8, 0.28, 0.9]} c="#8f9e90" />
          <group name={`engine:${i}`} position={[0, 0.87, 0]}>
            {i === 0 ? (
              <Ball r={0.35} c="#e6c27e" glow />
            ) : i === 1 ? (
              <Box s={[0.59, 0.65, 0.59]} c="#96b9a1" />
            ) : (
              <Ball r={0.28} c="#bbc8d1" />
            )}
          </group>
          <Label
            text={name}
            p={[0, 0.3, 0.46]}
            w={0.77}
            h={0.22}
            color="#e8efdd"
            size={65}
          />
          <Label
            text={['FLAGSHIP', 'BALANCED', 'EFFICIENT'][i]}
            p={[0, 1.57, 0]}
            w={0.9}
            h={0.23}
            color="#d4e0c5"
            size={43}
          />
        </group>
      ))}
    </>
  );
}
function PCB() {
  return (
    <>
      <Box p={[0, 0.13, 0]} s={[2.55, 0.26, 1.94]} c="#4c8665" />
      {[-1, 1].map((x) =>
        [-0.73, 0.73].map((z) => (
          <Cylinder
            key={`${x}${z}`}
            p={[x, 0.268, z]}
            h={0.016}
            r={0.065}
            c="#d6c6a1"
          />
        )),
      )}
      {[
        [-0.64, -0.4],
        [0.58, 0.26],
        [0.2, -0.53],
      ].map(([x, z], i) => (
        <group name={`pcb:chip:${i}`} key={i} position={[x, 0.39, z]}>
          <Box s={[0.52, 0.22, 0.4]} c="#3c5146" />
          {[-1, 1].map((side) =>
            [0, 1, 2, 3].map((n) => (
              <Box
                key={`${side}${n}`}
                p={[side * 0.29, 0, (n - 1.5) * 0.09]}
                s={[0.12, 0.07, 0.035]}
                c="#c8c8ac"
              />
            )),
          )}
        </group>
      ))}
      {[
        [-0.28, -0.4, 0.75],
        [0.1, 0.27, 0.9],
        [-0.6, 0.59, 0.9],
      ].map(([x, z, w], i) => (
        <group name={`pcb:trace:${i}`} key={i} position={[x, 0.276, z]}>
          <Box p={[w / 2, 0, 0]} s={[w, 0.012, 0.034]} c="#dfb777" r={0} />
        </group>
      ))}
      <Label
        text="KiCad / PCB LAYOUT + ROUTING"
        p={[0, 1.5, -0.1]}
        w={3.3}
        h={0.36}
        color="#d8e9c7"
        size={52}
      />
    </>
  );
}
function ChiefBaton() {
  return (
    <>
      <group position={[-0.8, 0, 0]}>
        <Plinth text="ILYA" />
        <Card title="CHIEF SCIENTIST" lines={['2015 → 2024']} w={1.15} h={1} />
      </group>
      <group position={[0.8, 0, 0]}>
        <Plinth text="JAKUB" />
        <Card title="CHIEF SCIENTIST" lines={['MAY 2024 →']} w={1.15} h={1} />
      </group>
      <group name="chief:baton" position={[-0.81, 1.44, 0.2]}>
        <Cylinder
          h={0.6}
          r={0.057}
          c="#d6c386"
          rotation={[0, 0, Math.PI / 2]}
        />
      </group>
    </>
  );
}
function getRecentSet(c: Chapter): ReactNode | null {
  switch (c.id) {
    case 'microsoft-partnership':
    case 'microsoft-partnership-2023':
      return (
        <Set
          hero={<MSBridge expanded={c.id.endsWith('2023')} />}
          work={<Card title="RESEARCH" lines={['OPENAI']} />}
          support={<Server />}
          data={<DataCards labels={['COMPUTE', 'PARTNERSHIP']} />}
          output={
            <Card
              title={c.id.endsWith('2023') ? 'MULTI-YEAR' : '$1 BILLION'}
              lines={['ANNOUNCED INVESTMENT']}
            />
          }
        />
      );
    case 'openai-lp':
    case 'recapitalization-2025':
      return (
        <Set
          hero={<OrgStructure pbc={c.id === 'recapitalization-2025'} />}
          work={<Card title="MISSION" lines={['BENEFIT HUMANITY']} />}
          support={<Card title="CONTROL" lines={['NONPROFIT']} />}
          data={<DataCards labels={['CAPITAL', 'RESEARCH']} />}
          output={
            <Card
              title={c.id === 'openai-lp' ? 'CAPPED RETURNS' : 'PBC'}
              lines={['MISSION CONTINUES']}
            />
          }
        />
      );
    case 'musk-board-departure':
    case 'board-removal-2023':
    case 'altman-return-2023':
      return (
        <Set
          hero={
            <Boardroom
              musk={c.id === 'musk-board-departure'}
              returning={c.id === 'altman-return-2023'}
            />
          }
          work={<Card title="OFFICIAL ANNOUNCEMENT" lines={[c.date]} />}
          support={
            <Card
              title={
                c.id === 'board-removal-2023'
                  ? 'INTERIM CEO'
                  : c.id === 'altman-return-2023'
                    ? 'NEW INITIAL BOARD'
                    : 'BOARD'
              }
              lines={
                c.id === 'board-removal-2023'
                  ? ['MIRA MURATI']
                  : c.id === 'altman-return-2023'
                    ? ['BRET · LARRY · ADAM']
                    : ['ELON DEPARTS']
              }
            />
          }
          data={<DataCards labels={['LEADERSHIP', 'ANNOUNCEMENT']} />}
          output={
            <Card
              title={
                c.id === 'altman-return-2023'
                  ? 'SAM RETURNS'
                  : c.id === 'board-removal-2023'
                    ? 'MIRA / INTERIM CEO'
                    : 'EMPTY BOARD SEAT'
              }
              lines={['OFFICIAL RECORD']}
            />
          }
        />
      );
    case 'gpt-4-2023':
      return (
        <Set
          hero={<VGAExample />}
          work={
            <Card
              title="VISUAL INPUT"
              lines={['What is unusual', 'about this image?']}
            />
          }
          support={<Tower label="GPT-4" layers={7} />}
          data={<DataCards labels={['IMAGE', 'QUESTION']} />}
          output={
            <Card
              title="VGA ≠ PHONE CHARGER"
              lines={['IMAGE UNDERSTANDING', 'RESEARCH PREVIEW']}
            />
          }
          banner="GPT-4 / UNDERSTANDING THE IMAGE"
        />
      );
    case 'devday-2023':
      return (
        <Set
          hero={
            <Browser
              title="OPENAI DEVDAY"
              lines={[
                'GPT-4 TURBO / 128K',
                'ASSISTANTS API',
                'BUILD WITH OPENAI',
              ]}
            />
          }
          work={<Card title="GPTs" lines={['CUSTOM ASSISTANTS']} />}
          support={<Card title="API" lines={['TOOLS', 'MULTIMODAL']} />}
          data={<DataCards labels={['DEVELOPER', 'IDEAS']} />}
          output={<Card title="NOV 6, 2023" lines={['FIRST DEVDAY']} />}
          banner="THE FIRST DEVDAY"
        />
      );
    case 'sora-research-2024':
      return (
        <Set
          hero={<TokyoStreet />}
          work={
            <Card
              title="PROMPT"
              lines={['A stylish woman', 'walks down Tokyo']}
            />
          }
          support={
            <Card title="SORA" lines={['RESEARCH PREVIEW', 'FEB 2024']} />
          }
          data={<DataCards labels={['SPACE', 'TIME', 'PATCHES']} />}
          output={<Card title="MOVING WORLD" lines={['TEXT → VIDEO']} />}
          banner="SORA / TOKYO IN MOTION"
        />
      );
    case 'gpt-4o-2024':
      return (
        <Set
          hero={<OmniDemo />}
          work={<Card title="CAMERA" lines={['VISUAL INPUT']} />}
          support={<Card title="VOICE" lines={['REAL-TIME DEMO']} />}
          data={<DataCards labels={['SEE', 'HEAR', 'RESPOND']} />}
          output={
            <Card title="OMNI" lines={['ONE MODEL', 'MULTIPLE MODALITIES']} />
          }
          banner="GPT-4o / SEE, HEAR, SPEAK"
        />
      );
    case 'chief-scientist-transition-2024':
      return (
        <Set
          hero={<ChiefBaton />}
          work={<Card title="ILYA SUTSKEVER" lines={['DEPARTURE']} />}
          support={<Card title="JAKUB PACHOCKI" lines={['APPOINTMENT']} />}
          data={<DataCards labels={['RESEARCH', 'CONTINUITY']} />}
          output={<Card title="CHIEF SCIENTIST" lines={['JAKUB PACHOCKI']} />}
          banner="A CHANGE IN RESEARCH LEADERSHIP"
        />
      );
    case 'o1-preview-2024':
    case 'o3-o4-mini-2025':
      return (
        <Set
          hero={<ReasoningBoard tools={c.id === 'o3-o4-mini-2025'} />}
          work={<Card title="PROBLEM" lines={['REASON', 'VERIFY']} />}
          support={
            <Card
              title={c.model ?? 'REASONING'}
              lines={
                c.id === 'o3-o4-mini-2025'
                  ? ['SEARCH + CODE + VISION']
                  : ['THINK BEFORE ANSWERING']
              }
            />
          }
          data={<DataCards labels={['QUESTION', 'EVIDENCE']} />}
          output={<Card title="CHECKED ANSWER" lines={['STEPS → RESULT']} />}
          banner={
            c.id === 'o3-o4-mini-2025'
              ? 'o3 + o4-mini / TOOL USE'
              : 'o1-preview / REASONING'
          }
        />
      );
    case 'stargate-2025':
      return (
        <Set
          hero={<CraneSite />}
          work={<Card title="$500B" lines={['4 YEARS', 'PLANNED']} />}
          support={
            <Card title="STARGATE" lines={['AI INFRASTRUCTURE', 'JAN 2025']} />
          }
          data={<DataCards labels={['BLUEPRINT', 'POWER + COMPUTE']} />}
          output={
            <Card
              title="PLANNED EXPANSION"
              lines={['$500B / 4 YEARS', 'PLANNED']}
            />
          }
        />
      );
    case 'gpt-4-1-2025':
      return (
        <Set
          hero={
            <ModelCrates
              openAll
              labels={['GPT-4.1', 'MINI', 'NANO']}
              locks={false}
            />
          }
          work={<Card title="1M TOKEN CONTEXT" lines={['LONG DOCUMENTS']} />}
          support={<Card title="GPT-4.1" lines={['MINI + NANO', 'API']} />}
          data={<DataCards labels={['CODE', 'LONG CONTEXT']} />}
          output={
            <Browser
              title="CODE EDIT"
              lines={['- old implementation', '+ improved implementation']}
            />
          }
          banner="GPT-4.1 / MINI / NANO"
        />
      );
    case 'gpt-5-1-2025':
      return (
        <Set
          hero={<ConversationStyle />}
          work={<Card title="INSTANT" lines={['WARMER', 'CONVERSATIONAL']} />}
          support={<Card title="THINKING" lines={['ADAPTIVE REASONING']} />}
          data={<DataCards labels={['QUESTION', 'STYLE']} />}
          output={<Card title="YOUR PREFERENCE" lines={['TONE + REASONING']} />}
          banner="GPT-5.1 / A MORE PERSONAL CONVERSATION"
        />
      );
    case 'gpt-5-2025':
      return (
        <Set
          hero={<RoutingGate />}
          work={<Card title="QUESTION" lines={['HOW MUCH REASONING?']} />}
          support={
            <Card title={c.model ?? 'GPT-5'} lines={['ROUTE TO A RESPONSE']} />
          }
          data={<DataCards labels={['SIMPLE', 'COMPLEX']} />}
          output={<Card title="ONE CONVERSATION" lines={['FAST + DEEP']} />}
          banner={c.model?.toUpperCase()}
        />
      );
    case 'gpt-5-2-2025':
      return (
        <Set
          hero={<Workforce />}
          work={<Card title="REQUEST" lines={['PLAN STAFFING']} />}
          support={<Card title="GPT-5.2" lines={['KNOWLEDGE WORK']} />}
          data={<DataCards labels={['PEOPLE', 'DATES', 'CONSTRAINTS']} />}
          output={<Card title="WORKFORCE PLAN" lines={['ASSIGNMENTS READY']} />}
          banner="GPT-5.2 / WORKFORCE PLANNING"
        />
      );
    case 'gpt-5-3-codex-2026':
      return (
        <Set
          hero={<RaceGame />}
          work={
            <Browser
              title="CODEX"
              lines={['build a racing game', 'update handling', 'run tests']}
            />
          }
          support={<Card title="GPT-5.3-CODEX" lines={['BUILD + ITERATE']} />}
          data={<DataCards labels={['PROMPT', 'FEEDBACK']} />}
          output={<Card title="PLAYABLE RESULT" lines={['RACING GAME DEMO']} />}
          banner="GPT-5.3-CODEX / BUILD A GAME"
        />
      );
    case 'gpt-5-4-2026':
      return (
        <Set
          hero={<ComputerUse />}
          work={<Card title="REQUEST" lines={['SCHEDULE A MEETING']} />}
          support={<Card title="GPT-5.4" lines={['COMPUTER USE']} />}
          data={<DataCards labels={['EMAIL', 'AVAILABILITY']} />}
          output={
            <Card title="CALENDAR UPDATED" lines={['NATIVE COMPUTER USE']} />
          }
          banner="GPT-5.4 / EMAIL TO CALENDAR"
        />
      );
    case 'gpt-5-5-2026':
      return (
        <Set
          hero={<Quadrics />}
          work={<Card title="SURFACE A" lines={['QUADRATIC MODEL']} />}
          support={<Card title="SURFACE B" lines={['QUADRATIC MODEL']} />}
          data={<DataCards labels={['EQUATIONS', 'VISUALIZE']} />}
          output={<Card title="INTERSECTION" lines={['SOLVE + VISUALIZE']} />}
          banner="GPT-5.5 / COMPLEX WORK"
        />
      );
    case 'gpt-5-6-2026':
      return (
        <Set
          hero={<ThreeEngines />}
          work={<Card title="GPT-5.6" lines={['THREE MODEL OPTIONS']} />}
          support={<Card title="WORKLOAD" lines={['MATCH THE MODEL']} />}
          data={<DataCards labels={['TASK', 'BUDGET', 'DEPTH']} />}
          output={
            <Card title="MODEL SELECTED" lines={['SOL · TERRA · LUNA']} />
          }
          banner="GPT-5.6 / SOL · TERRA · LUNA"
        />
      );
    case 'gpt-6-astra-2026':
      return (
        <Set
          hero={<PCB />}
          work={<Card title="SCHEMATIC" lines={['PCB COMPONENTS']} />}
          support={<Card title="GPT-6 ASTRA" lines={['STAGED ROLLOUT']} />}
          data={<DataCards labels={['PLACE', 'ROUTE']} />}
          output={
            <Card
              title="KiCad DESIGN"
              lines={['SOFTWARE LAYOUT', 'STAGED ACCESS']}
            />
          }
          banner="ASTRA / PCB DESIGN IN KICAD"
        />
      );
    default:
      return null;
  }
}
