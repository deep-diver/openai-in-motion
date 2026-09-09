import type { Scene, SetKind } from '@/data/committee/types';
import type { Vec3 } from '@/components/timeline/primitives';
export const stageDesign: Record<
  SetKind,
  { floor: 'round' | 'workbench' | 'grid'; anchor: Vec3 }
> = {
  assembly: { floor: 'round', anchor: [0, 0.8, 0] },
  organisation: { floor: 'round', anchor: [0, 0.75, 0] },
  network: { floor: 'grid', anchor: [0, 1, 0] },
  compute: { floor: 'grid', anchor: [0, 0.9, 0] },
  models: { floor: 'grid', anchor: [0, 1, 0] },
  resilience: { floor: 'grid', anchor: [0, 0.8, 0] },
  workshop: { floor: 'workbench', anchor: [0, 0.9, 0] },
  diplomacy: { floor: 'round', anchor: [0, 1.3, 0] },
  document: { floor: 'workbench', anchor: [0, 0.3, 0] },
  rights: { floor: 'workbench', anchor: [0, 1, 0] },
  school: { floor: 'workbench', anchor: [0, 1, -0.4] },
  science: { floor: 'round', anchor: [0, 1.55, 0] },
  factory: { floor: 'workbench', anchor: [0, 0.9, 0] },
  mobility: { floor: 'round', anchor: [0, 0.25, 0] },
  energy: { floor: 'grid', anchor: [0, 1, 0] },
  data: { floor: 'grid', anchor: [0, 1, 0] },
  city: { floor: 'grid', anchor: [0, 0.6, 0] },
  handover: { floor: 'workbench', anchor: [0, 0.5, 0] },
  defense: { floor: 'grid', anchor: [-1.45, 1, -0.2] },
  media: { floor: 'workbench', anchor: [0, 0.85, 0] },
  civic: { floor: 'round', anchor: [0, 0.7, 0] },
  'compute-routing': { floor: 'grid', anchor: [0, 0.8, 0] },
  democracy: { floor: 'round', anchor: [0, 0.8, 0] },
  'document-format': { floor: 'workbench', anchor: [1.2, 0.85, 0] },
};
export const sceneCast = (scene: Scene) =>
  scene.secondarySpeaker
    ? [scene.secondarySpeaker, scene.speaker]
    : [scene.speaker];
