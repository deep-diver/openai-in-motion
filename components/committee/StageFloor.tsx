import { Box, Cylinder, Ring } from '@/components/timeline/primitives';
import { AXES, type Scene } from '@/data/committee/types';
import { stageDesign } from './sceneDesign';
/** A small, distinct architectural base for each family of miniatures. */
export default function StageFloor({ scene }: { scene: Scene }) {
  const kind = stageDesign[scene.set].floor;
  const accent = AXES[scene.axis].color;
  if (kind === 'round')
    return (
      <group>
        <Cylinder p={[0, 0.012, 0]} r={2.18} h={0.022} c="#b2c8ce" />
        <Cylinder p={[0, 0.027, 0]} r={2.1} h={0.018} c="#dce9e7" />
        <Ring p={[0, 0.042, 0]} r={2.06} c={accent} tube={0.012} />
      </group>
    );
  return (
    <group>
      <Box
        p={[0, 0.015, 0]}
        s={[4.4, 0.025, 3.5]}
        c={kind === 'grid' ? '#cbdee8' : '#dce4dd'}
        r={0.08}
      />
      {kind === 'grid'
        ? [-1, 0, 1].flatMap((x) => [
            <Box
              key={`x${x}`}
              p={[x, 0.033, 0]}
              s={[0.008, 0.003, 3.35]}
              c="#a9c5d6"
              r={0}
            />,
            <Box
              key={`z${x}`}
              p={[0, 0.033, x]}
              s={[4.3, 0.003, 0.008]}
              c="#a9c5d6"
              r={0}
            />,
          ])
        : [-1, 1].flatMap((x) =>
            [-1, 1].map((z) => (
              <group key={`${x}${z}`} position={[x * 2.03, 0.035, z * 1.57]}>
                <Box s={[0.25, 0.014, 0.035]} c="#859e9c" />
                <Box s={[0.035, 0.014, 0.25]} c="#859e9c" />
              </group>
            )),
          )}
      <Box p={[0, 0.035, -1.7]} s={[4.1, 0.012, 0.025]} c={accent} />
    </group>
  );
}
