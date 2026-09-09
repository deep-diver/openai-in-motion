const ramp = (p: number, start: number, end: number) => {
  const t = Math.max(0, Math.min(1, (p - start) / (end - start)));
  return t * t * (3 - 2 * t);
};
// Semantic actions continue through the three captions; they never erase the final set.
export function divisionSequence(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  const gather = ramp(p, 0.25, 0.72);
  return {
    newDivisions: ramp(p, 0.28, 0.52),
    gate: ramp(p, 0.25, 0.48) * 0.8,
    transfer: ramp(p, 0.48, 0.77),
    gather,
    proposalRadius: 2.05 - gather * 0.75,
    scan: -2.05 + ramp(p, 0.22, 0.78) * 4.1,
    structured: ramp(p, 0.4, 0.72),
  };
}
