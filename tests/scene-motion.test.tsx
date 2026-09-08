import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { Group } from 'three';
import gsap from 'gsap';
import { chapters } from '../data/chapters';
import { createStoryTimeline } from '../components/timeline/storyDirector';

function reel(id: string, names: string[]) {
  const chapter = chapters.find((c) => c.id === id)!;
  const scene = new Group();
  for (const name of ['hero', 'work', 'support', 'data', 'output']) {
    const actor = new Group(),
      story = new Group();
    actor.name = `actor:${name}`;
    story.name = `story:${name}`;
    actor.add(story);
    scene.add(actor);
  }
  for (const name of names) {
    const part = new Group();
    part.name = name;
    scene.getObjectByName('story:hero')!.add(part);
  }
  const tl = createStoryTimeline({
    incoming: scene,
    outgoing: null,
    bridge: null,
    chapter,
    reducedMotion: false,
    onFrame: () => {},
    onComplete: () => {},
  }).pause();
  return { scene, tl, find: (name: string) => scene.getObjectByName(name)! };
}
void test('o1 reveals the worked example in order; o3 gathers separate tool evidence', () => {
  const equations = reel(
    'o1-preview-2024',
    [0, 1, 2].map((i) => `reason:equation:${i}`),
  );
  equations.tl.time(2, true);
  assert.equal(equations.find('reason:equation:0').visible, true);
  assert.equal(equations.find('reason:equation:1').visible, false);
  assert.equal(equations.find('reason:equation:2').visible, false);
  equations.tl.time(5.5, true);
  assert.equal(equations.find('reason:equation:1').visible, true);
  assert.equal(equations.find('reason:equation:2').visible, false);
  equations.tl.time(10.5, true);
  assert.equal(equations.find('reason:equation:2').visible, true);
  equations.tl.kill();
  const tools = reel(
    'o3-o4-mini-2025',
    [0, 1, 2].map((i) => `reason:evidence:${i}`),
  );
  tools.tl.time(11, true);
  for (let i = 0; i < 3; i++) {
    const card = tools.find(`reason:evidence:${i}`);
    assert.equal(card.visible, true);
    assert.ok(Math.abs(card.position.x - -(i - 1) * 0.82) < 0.001);
    assert.ok(Math.abs(card.position.z - (0.7 + i * 0.06)) < 0.001);
    if (i > 0) {
      const previous = tools.find(`reason:evidence:${i - 1}`);
      assert.ok(
        card.position.y - previous.position.y > 0.2,
        'evidence labels remain readable',
      );
      assert.ok(
        card.position.z - previous.position.z > 0.035,
        'card surfaces do not share a plane',
      );
    }
  }
  tools.tl.kill();
});
void test('Sora walks with opposing limbs and settles into its final pose', () => {
  const walk = reel('sora-research-2024', [
    'tokyo:walker',
    'tokyo:leg:0',
    'tokyo:leg:1',
    'tokyo:arm:0',
    'tokyo:arm:1',
  ]);
  walk.tl.time(2.05, true);
  const a = walk.find('tokyo:leg:0').rotation.x;
  const b = walk.find('tokyo:leg:1').rotation.x;
  assert.ok(Math.abs(a) > 0.05);
  assert.ok(Math.abs(a + b) < 0.0001);
  assert.ok(a * walk.find('tokyo:arm:0').rotation.x < 0);
  walk.tl.time(11, true);
  assert.equal(walk.find('tokyo:walker').position.x, 0.93);
  assert.equal(walk.find('tokyo:leg:0').rotation.x, 0);
  assert.equal(walk.find('tokyo:leg:1').rotation.x, 0);
  walk.tl.kill();
});
void test('the generated racing car follows a continuous loop and turns with the track', () => {
  const race = reel('gpt-5-3-codex-2026', ['race:car']);
  const car = race.find('race:car');
  race.tl.time(4.2, true);
  let last = car.position.clone(),
    yaw = car.rotation.y;
  for (let t = 4.25; t <= 10.6; t += 0.05) {
    race.tl.time(t, true);
    assert.ok(last.distanceTo(car.position) < 0.1, `position jump at ${t}`);
    assert.ok(Math.abs(car.rotation.y - yaw) < 0.7, `heading jump at ${t}`);
    assert.ok(Math.abs(car.position.x) < 1.1 && Math.abs(car.position.z) < 0.8);
    last = car.position.clone();
    yaw = car.rotation.y;
  }
  race.tl.time(10.7, true);
  assert.ok(Math.abs(car.position.x + 0.97) < 0.001);
  assert.ok(Math.abs(car.position.z + 0.58) < 0.001);
  const end = car.rotation.y;
  assert.ok(Math.abs(end) > Math.PI);
  race.tl.time(5, true);
  race.tl.time(10.7, true);
  assert.equal(car.rotation.y, end);
  race.tl.kill();
});
void test('GPT-4.1 scans the document before transferring a matched excerpt to the editor', () => {
  const context = reel('gpt-4-1-2025', ['context:scan', 'context:excerpt']);
  context.tl.time(3, true);
  assert.equal(context.find('context:excerpt').visible, false);
  context.tl.time(5.7, true);
  assert.equal(context.find('context:excerpt').visible, true);
  assert.equal(context.find('context:scan').position.y, 0.67);
  context.tl.time(9, true);
  const final = context.find('context:excerpt').position.toArray();
  assert.deepEqual(final, [1.8, 1.45, 1.28]);
  context.tl.time(2, true);
  context.tl.time(9, true);
  assert.deepEqual(context.find('context:excerpt').position.toArray(), final);
  context.tl.kill();
});
void test('the model comparison selects only Terra for its illustrated balanced task', () => {
  const engines = reel('gpt-5-6-2026', [
    'engine:task',
    'engine:selected:0',
    'engine:selected:1',
    'engine:selected:2',
  ]);
  engines.tl.time(3, true);
  for (let i = 0; i < 3; i++)
    assert.equal(engines.find(`engine:selected:${i}`).visible, false);
  engines.tl.time(10, true);
  assert.deepEqual(
    [0, 1, 2].map((i) => engines.find(`engine:selected:${i}`).visible),
    [false, true, false],
  );
  assert.deepEqual(
    engines.find('engine:task').position.toArray(),
    [0, 0.68, 0.82],
  );
  engines.tl.kill();
});
after(() => gsap.ticker.sleep());

void test('CLIP compares candidates before revealing its selected match', () => {
  const clip = reel('clip', ['clip:selection', 'clip:match']);
  clip.tl.time(3, true);
  assert.equal(clip.find('clip:match').visible, false);
  clip.tl.time(5, true);
  assert.ok(clip.find('clip:selection').position.y > 0.05);
  assert.equal(clip.find('clip:match').visible, false);
  clip.tl.time(8.2, true);
  assert.equal(clip.find('clip:selection').position.y, 0.357);
  assert.equal(clip.find('clip:match').visible, true);
  clip.tl.time(2, true);
  assert.equal(clip.find('clip:match').visible, false);
  clip.tl.kill();
});
void test('Dactyl is visible while gripping, alternates fingertips and holds the turned block', () => {
  const hand = reel('dactyl', [
    'hand:block',
    'hand:thumb',
    ...[0, 1, 2, 3].map((i) => `hand:tip:${i}`),
  ]);
  hand.tl.time(3, true);
  assert.ok(
    hand.find('story:hero').scale.x > 0.95,
    'the first grip is not hidden until beat two',
  );
  assert.ok(hand.find('hand:tip:0').rotation.x > 0.9);
  hand.tl.time(4.1, true);
  assert.ok(hand.find('hand:tip:0').rotation.x < 0.5);
  assert.ok(
    hand.find('hand:tip:1').rotation.x > 0.9,
    'opposing fingers retain the block',
  );
  hand.tl.time(7, true);
  assert.ok(hand.find('hand:tip:1').rotation.x < 0.5);
  assert.ok(hand.find('hand:tip:0').rotation.x > 0.9);
  hand.tl.time(11, true);
  assert.ok(Math.abs(hand.find('hand:block').rotation.z - Math.PI / 2) < 0.001);
  assert.ok(hand.find('hand:tip:1').rotation.x > 0.9);
  hand.tl.kill();
});
void test('GPT-4o listens and reads before its intermediate step and answer', () => {
  const omni = reel('gpt-4o-2024', [
    'omni:signal',
    'omni:scan',
    'omni:working',
    'omni:answer',
  ]);
  omni.tl.time(2.5, true);
  assert.equal(omni.find('omni:signal').visible, true);
  assert.equal(omni.find('omni:scan').visible, false);
  assert.equal(omni.find('omni:answer').visible, false);
  omni.tl.time(5, true);
  assert.equal(omni.find('omni:scan').visible, true);
  assert.equal(omni.find('omni:working').visible, false);
  omni.tl.time(6.5, true);
  assert.equal(omni.find('omni:working').visible, true);
  assert.equal(omni.find('omni:answer').visible, false);
  omni.tl.time(9, true);
  assert.equal(omni.find('omni:answer').visible, true);
  assert.equal(omni.find('omni:signal').scale.x, 1);
  omni.tl.kill();
});
void test('calendar creation follows reading, moving and clicking in order', () => {
  const computer = reel('gpt-5-4-2026', [
    'computer:request',
    'computer:cursor',
    'computer:click',
    'calendar:event',
  ]);
  computer.tl.time(3, true);
  assert.equal(computer.find('computer:request').visible, true);
  assert.equal(computer.find('computer:click').visible, false);
  assert.equal(computer.find('calendar:event').visible, false);
  computer.tl.time(7, true);
  assert.equal(computer.find('computer:cursor').position.x, 0.63);
  assert.equal(computer.find('computer:cursor').position.y, 0.71);
  assert.equal(computer.find('computer:click').visible, true);
  assert.equal(computer.find('calendar:event').visible, false);
  computer.tl.time(9, true);
  assert.equal(computer.find('computer:click').visible, false);
  assert.equal(computer.find('calendar:event').visible, true);
  computer.tl.time(3, true);
  assert.equal(computer.find('calendar:event').visible, false);
  computer.tl.kill();
});
void test('Gym corrections get smaller and finish with both cart and pole at rest', () => {
  const gym = reel('gym-beta', ['cart:body', 'cart:pole']);
  const cart = gym.find('cart:body'),
    pole = gym.find('cart:pole');
  gym.tl.time(1.4, true);
  let previous = cart.position.x;
  let early = 0,
    late = 0;
  for (let t = 1.5; t < 8.2; t += 0.05) {
    gym.tl.time(t, true);
    assert.ok(
      Math.abs(cart.position.x - previous) < 0.06,
      `cart jumped at ${t}`,
    );
    assert.ok(Math.abs(pole.rotation.z / 0.34 - cart.position.x / 0.4) < 0.001);
    if (t < 4) early = Math.max(early, Math.abs(cart.position.x));
    if (t > 6) late = Math.max(late, Math.abs(cart.position.x));
    previous = cart.position.x;
  }
  assert.ok(late < early * 0.2);
  gym.tl.time(12, true);
  assert.equal(cart.position.x, 0);
  assert.equal(pole.rotation.z, 0);
  gym.tl.time(2, true);
  gym.tl.time(12, true);
  assert.equal(cart.position.x, 0);
  gym.tl.kill();
});
