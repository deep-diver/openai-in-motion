import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { Group } from 'three';
import gsap from 'gsap';
import { chapters } from '../data/chapters';
import { createStoryTimeline } from '../components/timeline/storyDirector';

function reel(id: string, names: string[]) {
  const chapter = chapters.find(c => c.id === id)!;
  const scene = new Group();
  for (const name of ['hero', 'work', 'support', 'data', 'output']) {
    const actor = new Group(), story = new Group();
    actor.name = `actor:${name}`; story.name = `story:${name}`;
    actor.add(story); scene.add(actor);
  }
  for (const name of names) {
    const part = new Group(); part.name = name;
    scene.getObjectByName('story:hero')!.add(part);
  }
  const tl = createStoryTimeline({ incoming: scene, outgoing: null, bridge: null, chapter, reducedMotion: false, onFrame: () => {}, onComplete: () => {} }).pause();
  return { scene, tl, find: (name: string) => scene.getObjectByName(name)! };
}
void test('o1 reveals the worked example in order; o3 gathers separate tool evidence', () => {
  const equations = reel('o1-preview-2024', [0,1,2].map(i => `reason:equation:${i}`));
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
  const tools = reel('o3-o4-mini-2025', [0,1,2].map(i => `reason:evidence:${i}`));
  tools.tl.time(11, true);
  for (let i = 0; i < 3; i++) {
    const card = tools.find(`reason:evidence:${i}`);
    assert.equal(card.visible, true);
    assert.ok(Math.abs(card.position.x - (-(i - 1) * 0.82)) < 0.001);
    assert.equal(card.position.z, 0.7);
  }
  tools.tl.kill();
});
void test('Sora walks with opposing limbs and settles into its final pose', () => {
  const walk = reel('sora-research-2024', ['tokyo:walker', 'tokyo:leg:0', 'tokyo:leg:1', 'tokyo:arm:0', 'tokyo:arm:1']);
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
  let last = car.position.clone(), yaw = car.rotation.y;
  for (let t = 4.25; t <= 10.6; t += 0.05) {
    race.tl.time(t, true);
    assert.ok(last.distanceTo(car.position) < 0.1, `position jump at ${t}`);
    assert.ok(Math.abs(car.rotation.y - yaw) < 0.7, `heading jump at ${t}`);
    assert.ok(Math.abs(car.position.x) < 1.1 && Math.abs(car.position.z) < 0.8);
    last = car.position.clone(); yaw = car.rotation.y;
  }
  race.tl.time(10.7, true);
  assert.ok(Math.abs(car.position.x + 0.97) < 0.001);
  assert.ok(Math.abs(car.position.z + 0.58) < 0.001);
  const end = car.rotation.y;
  assert.ok(Math.abs(end) > Math.PI);
  race.tl.time(5, true); race.tl.time(10.7, true);
  assert.equal(car.rotation.y, end);
  race.tl.kill();
});
after(() => gsap.ticker.sleep());
