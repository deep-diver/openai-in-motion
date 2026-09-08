'use client';
/* eslint-disable react/react-compiler -- Three.js objects are mutable external scene state; GSAP intentionally mutates them from effects. */

import { Canvas, useThree } from '@react-three/fiber';
import {
  Component,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Group, OrthographicCamera } from 'three';
import gsap from 'gsap';
import { Box, Cylinder, Label } from './primitives';
import { SceneObjects } from './objects';
import { useStageTransition } from './useStageTransition';

function FixedCamera() {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const ortho = camera as OrthographicCamera;
    // Equal direction components: azimuth 45°, elevation 35.264°.
    // Only viewport fit changes on resize. No orbit or camera animation.
    ortho.position.set(10, 10.65, 10);
    ortho.lookAt(0, 0.65, 0);
    ortho.zoom = Math.min(size.width / 9.8, size.height / 7.7);
    ortho.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}
function Platform({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<Group>(null);
  const initialized = useRef(false);
  useLayoutEffect(() => {
    if (!ref.current) return;
    // The platform enters once and is never replaced during a chapter change.
    if (initialized.current || reducedMotion) {
      ref.current.scale.setScalar(1);
      return;
    }
    initialized.current = true;
    const tween = gsap.fromTo(
      ref.current.scale,
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1, duration: 0.8, ease: 'back.out(1.7)' },
    );
    return () => {
      tween.kill();
    };
  }, [reducedMotion]);
  return (
    <group ref={ref}>
      <Box p={[0, -0.26, 0]} s={[6.3, 0.48, 5.5]} c="#abae95" r={0.13} />
      <Box p={[0, -0.035, 0]} s={[6.24, 0.11, 5.44]} c="#e5e3ce" r={0.07} />
      <Box p={[0, -0.32, 2.757]} s={[5.94, 0.03, 0.012]} c="#d1d4b9" r={0} />
      {[-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4].map((x) => (
        <Box
          key={`x${x}`}
          p={[x, 0.023, 0]}
          s={[0.012, 0.003, 5.2]}
          c="#c7c9b3"
          r={0}
        />
      ))}
      {[-2, -1.2, -0.4, 0.4, 1.2, 2].map((z) => (
        <Box
          key={`z${z}`}
          p={[0, 0.024, z]}
          s={[6, 0.003, 0.012]}
          c="#c7c9b3"
          r={0}
        />
      ))}
      {[-2.65, 2.65].map((x) =>
        [-2.2, 2.2].map((z) => (
          <Cylinder
            key={`${x}${z}`}
            p={[x, -0.54, z]}
            r={0.16}
            h={0.16}
            c="#637052"
          />
        )),
      )}
      <Label
        text="O P E N A I   /   A R C H I V E"
        p={[0, -0.22, 2.759]}
        w={2.4}
        h={0.22}
        color="#667352"
        size={37}
      />
    </group>
  );
}
function Scene({
  step,
  reducedMotion,
}: {
  step: number;
  reducedMotion: boolean;
}) {
  const groups = useRef<(Group | null)[]>([]);
  const burst = useRef<Group>(null);
  useStageTransition(groups, step, reducedMotion, burst);
  return (
    <>
      <FixedCamera />
      <ambientLight intensity={0.8} />
      <hemisphereLight args={['#eff6de', '#6b7657', 1.5]} />
      <directionalLight
        position={[2, 8, 4]}
        intensity={2.9}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-normalBias={0.04}
        shadow-bias={-0.0001}
      />
      <directionalLight
        position={[-5, 3, -2]}
        intensity={1.4}
        color="#ceddae"
      />
      <Platform reducedMotion={reducedMotion} />
      {Array.from({ length: 5 }, (_, i) => (
        <group
          key={i}
          ref={(el) => {
            groups.current[i] = el;
          }}
          visible={false}
        >
          <SceneObjects step={i} reducedMotion={reducedMotion} />
        </group>
      ))}
      <group ref={burst} visible={false}>
        {Array.from({ length: 26 }, (_, i) => (
          <Box
            key={i}
            s={[0.07, 0.07, 0.07]}
            c={i % 2 ? '#ffcc84' : '#f08051'}
            glow
            r={0}
          />
        ))}
      </group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.64, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <shadowMaterial transparent opacity={0.23} />
      </mesh>
    </>
  );
}
class CanvasBoundary extends Component<
  { children: ReactNode; onRetry: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-loader">
        <p>3D 장면을 불러오지 못했습니다.</p>
        <p>하드웨어 가속을 지원하는 브라우저에서 다시 시도해 주세요.</p>
        <button className="retry-button" onClick={this.props.onRetry}>
          다시 시도
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function Stage(props: { step: number; reducedMotion: boolean }) {
  const [attempt, setAttempt] = useState(0);
  return (
    <CanvasBoundary key={attempt} onRetry={() => setAttempt((n) => n + 1)}>
      <Canvas
        orthographic
        camera={{ position: [10, 10.65, 10], zoom: 65, near: 0.1, far: 100 }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        fallback={
          <div className="scene-loader">
            이 브라우저는 WebGL을 지원하지 않습니다. 타임라인의 설명은 계속
            탐색할 수 있습니다.
          </div>
        }
      >
        <Scene {...props} />
      </Canvas>
    </CanvasBoundary>
  );
}
