import type { ObjectId } from '@/data/sceneNotes';

export type LabelBox = { x: number; y: number; width: number; height: number };
export function fitLabelBox(box: LabelBox, viewportHeight: number, measuredHeight: number): LabelBox {
  return {
    ...box,
    height: measuredHeight,
    y: Math.max(0, Math.min(box.y, viewportHeight - measuredHeight - 6)),
  };
}
/** Fixed perimeter positions keep text steady while the leader endpoints follow the set. */
export function annotationBox(
  id: ObjectId | 'speech',
  width: number,
  height: number,
): LabelBox {
  const compact = width < 620;
  const w =
    id === 'speech'
      ? Math.min(310, width - 32)
      : Math.min(compact ? 174 : 208, width * 0.44);
  const padding = compact ? 6 : 12;
  const h = id === 'speech' ? 88 : 78;
  const positions = {
    hero: [(width - w) / 2, compact ? 106 : 14],
    work: [padding, compact ? 12 : height * 0.24],
    support: [width - w - padding, compact ? 12 : height * 0.24],
    data: [padding, compact ? height * 0.7 : height * 0.63],
    output: [width - w - padding, compact ? height * 0.7 : height * 0.63],
    speech: [(width - w) / 2, height - 88],
  };
  const [x, y] = positions[id];
  return { x, y, width: w, height: h };
}
export function leaderPath(box: LabelBox, point: { x: number; y: number }) {
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const vertical = Math.abs(point.y - centerY) > Math.abs(point.x - centerX);
  const x = vertical ? centerX : point.x > centerX ? box.x + box.width : box.x;
  const y = vertical
    ? point.y > centerY
      ? box.y + box.height
      : box.y
    : centerY;
  const elbowX = vertical ? x : x + (point.x > centerX ? 18 : -18);
  const elbowY = vertical ? y + (point.y > centerY ? 14 : -14) : y;
  return `M ${x.toFixed(1)} ${y.toFixed(1)} L ${elbowX.toFixed(1)} ${elbowY.toFixed(1)} L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
}
