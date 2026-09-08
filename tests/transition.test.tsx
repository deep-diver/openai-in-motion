import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { Group } from 'three';
import gsap from 'gsap';
import { useStageTransition } from '../components/timeline/useStageTransition';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
Object.assign(globalThis, {
  IS_REACT_ACT_ENVIRONMENT: true,
  window: dom.window,
  document: dom.window.document,
});
function fixture() {
  const groups = {
    current: Array.from({ length: 5 }, () => {
      const group = new Group();
      group.visible = false;
      for (let i = 0; i < 5; i++) {
        const actor = new Group();
        actor.position.set(i - 2, i * 0.3, -i * 0.4);
        actor.rotation.y = 0.1 * i;
        group.add(actor);
      }
      return group;
    }),
  };
  const burst = { current: new Group() };
  for (let i = 0; i < 8; i++) burst.current.add(new Group());
  return { groups, burst };
}
function settle() {
  // Advance real GSAP timelines deterministically, without a browser or timers.
  for (const animation of gsap.globalTimeline.getChildren(false, false, true))
    animation.totalProgress(1);
}
function assertFinal(
  groups: ReturnType<typeof fixture>['groups'],
  step: number,
) {
  assert.deepEqual(
    groups.current.map((g) => g.visible),
    groups.current.map((_, i) => i === step),
  );
  groups.current[step].children.forEach((actor, i) => {
    assert.ok(
      actor.position.distanceTo({
        x: i - 2,
        y: i * 0.3,
        z: -i * 0.4,
      } as import('three').Vector3) < 0.00001,
    );
    assert.ok(Math.abs(actor.rotation.y - 0.1 * i) < 0.00001);
    assert.ok(Math.abs(actor.scale.x - (step === 4 ? 1.04 : 1)) < 0.00001);
  });
}

void test('rapid retargets and return navigation restore one complete chapter at authored positions', async () => {
  const { groups, burst } = fixture();
  function Probe({ step }: { step: number }) {
    useStageTransition(groups, step, false, burst);
    return null;
  }
  let renderer!: Root;
  await act(async () => {
    renderer = createRoot(document.createElement('div'));
    renderer.render(<Probe step={0} />);
  });
  settle();
  assertFinal(groups, 0);
  await act(async () => {
    renderer.render(<Probe step={1} />);
  });
  for (const tl of gsap.globalTimeline.getChildren(false, false, true))
    tl.totalProgress(0.2);
  await act(async () => {
    renderer.render(<Probe step={2} />);
  });
  await act(async () => {
    renderer.render(<Probe step={4} />);
  });
  settle();
  assertFinal(groups, 4);
  await act(async () => {
    renderer.render(<Probe step={0} />);
  });
  settle();
  assertFinal(groups, 0);
  await act(async () => {
    renderer.unmount();
  });
});

void test('reduced motion interrupts an in-progress transition and immediately restores the target', async () => {
  const { groups, burst } = fixture();
  function Probe({
    step,
    reduced = false,
  }: {
    step: number;
    reduced?: boolean;
  }) {
    useStageTransition(groups, step, reduced, burst);
    return null;
  }
  let renderer!: Root;
  await act(async () => {
    renderer = createRoot(document.createElement('div'));
    renderer.render(<Probe step={1} />);
  });
  settle();
  await act(async () => {
    renderer.render(<Probe step={2} />);
  });
  for (const tl of gsap.globalTimeline.getChildren(false, false, true))
    tl.totalProgress(0.2);
  await act(async () => {
    renderer.render(<Probe step={2} reduced />);
  });
  assertFinal(groups, 2);
  assert.equal(burst.current.visible, false);
  await act(async () => {
    renderer.unmount();
  });
});

void test('reversing to a chapter that is still exiting preserves its visible pose', async () => {
  const { groups, burst } = fixture();
  function Probe({ step }: { step: number }) {
    useStageTransition(groups, step, false, burst);
    return null;
  }
  let renderer!: Root;
  await act(async () => {
    renderer = createRoot(document.createElement('div'));
    renderer.render(<Probe step={0} />);
  });
  settle();
  await act(async () => {
    renderer.render(<Probe step={1} />);
  });
  for (const tl of gsap.globalTimeline.getChildren(false, false, true))
    tl.time(0.12);
  const before = groups.current[0].children.map((actor) => actor.scale.x);
  await act(async () => {
    renderer.render(<Probe step={0} />);
  });
  assert.deepEqual(
    groups.current[0].children.map((actor) => actor.scale.x),
    before,
  );
  settle();
  assertFinal(groups, 0);
  await act(async () => {
    renderer.unmount();
  });
});

after(() => {
  gsap.ticker.sleep();
  dom.window.close();
});
