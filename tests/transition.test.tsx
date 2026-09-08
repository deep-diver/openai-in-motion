import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import gsap from 'gsap';
import { chapters } from '../data/chapters';
import { PEOPLE } from '../data/types';
import { getHistoricalSet } from '../components/timeline/HistoricalSets';
import {
  createStoryTimeline,
  configurePlayback,
  STORY_TIMING,
  type StoryFrame,
} from '../components/timeline/storyDirector';

function actors(chapter = chapters[0]) {
  const group = new Group();
  group.visible = false;
  [
    'hero',
    'work',
    'support',
    'data',
    'output',
    ...chapter.people.map((_, i) => `person-${i}`),
  ].forEach((id, i) => {
    const actor = new Group();
    actor.name = `actor:${id}`;
    actor.position.set((i % 3) - 1, 0, Math.floor(i / 3));
    const story = new Group();
    story.name = `story:${id}`;
    for (let j = 0; j < 3; j++) {
      const child = new Group();
      child.position.set(j * 0.15, 0.1, 0);
      story.add(child);
    }
    actor.add(story);
    group.add(actor);
  });
  return group;
}
function bridge() {
  const group = new Group();
  group.add(
    new Mesh(new BoxGeometry(0.1, 0.1, 0.1), new MeshStandardMaterial()),
  );
  return group;
}

void test('all 44 scenes have valid targets, cast references, ordered dates and three scripted beats', () => {
  assert.equal(chapters.length, 44);
  assert.equal(new Set(chapters.map((c) => c.id)).size, 44);
  chapters.forEach((chapter, index) => {
    assert.equal(chapter.beats.length, 3);
    assert.ok(chapter.sources.length > 0);
    if (index > 0) assert.ok(chapter.date >= chapters[index - 1].date);
    const scene = actors(chapter);
    for (const person of chapter.people) assert.ok(PEOPLE[person]);
    for (const beat of chapter.beats)
      for (const a of beat.actions)
        assert.ok(
          scene.getObjectByName(`story:${a.target}`),
          `${chapter.id}: missing ${a.target}`,
        );
  });
});

void test('every complete film reel reaches its final beat and hides the outgoing set', () => {
  for (const chapter of chapters) {
    const incoming = actors(chapter),
      outgoing = actors(),
      spark = bridge();
    outgoing.visible = true;
    const frames: StoryFrame[] = [];
    let completed = '';
    const tl = createStoryTimeline({
      incoming,
      outgoing,
      bridge: spark,
      chapter,
      reducedMotion: false,
      onFrame: (f) => frames.push(f),
      onComplete: (id) => {
        completed = id;
      },
    }).pause();
    assert.ok(
      Math.abs(tl.duration() - STORY_TIMING.duration) < 0.001,
      chapter.id,
    );
    tl.totalProgress(1, false);
    assert.equal(outgoing.visible, false);
    assert.equal(incoming.visible, true);
    assert.equal(completed, chapter.id);
    assert.equal(frames.at(-1)?.beat, 2);
    assert.ok(
      (incoming.getObjectByName('story:output')?.scale.x ?? 0) > 0.5,
      `${chapter.id} output stays visible`,
    );
    incoming.children.forEach((actor) =>
      assert.ok(actor.scale.x > 0.99, chapter.id),
    );
    tl.kill();
    spark.traverse((o) => {
      if (o instanceof Mesh) {
        o.geometry.dispose();
        (o.material as MeshStandardMaterial).dispose();
      }
    });
  }
});

void test('backtracking during the edit preserves the visible actors instead of resetting to zero', () => {
  const first = actors(chapters[0]),
    second = actors(chapters[1]);
  const base = {
    bridge: null,
    reducedMotion: false,
    onFrame: () => {},
    onComplete: () => {},
  };
  let tl = createStoryTimeline({
    ...base,
    incoming: first,
    outgoing: null,
    chapter: chapters[0],
  }).pause();
  tl.time(2);
  tl.kill();
  tl = createStoryTimeline({
    ...base,
    incoming: second,
    outgoing: first,
    chapter: chapters[1],
  }).pause();
  tl.time(0.15);
  const snapshot = first.children.map((a) => a.scale.x);
  tl.kill();
  tl = createStoryTimeline({
    ...base,
    incoming: first,
    outgoing: second,
    chapter: chapters[0],
  }).pause();
  assert.deepEqual(
    first.children.map((a) => a.scale.x),
    snapshot,
  );
  tl.totalProgress(1);
  assert.equal(second.visible, false);
  assert.equal(first.visible, true);
  tl.kill();
});

void test('pause, beat seeking and reduced motion never accidentally complete the next scene', () => {
  const chapter = chapters[13];
  const incoming = actors(chapter);
  let completions = 0;
  let frame: StoryFrame | undefined;
  const options = {
    incoming,
    outgoing: actors(),
    bridge: null,
    chapter,
    onFrame: (f: StoryFrame) => {
      frame = f;
    },
    onComplete: () => {
      completions++;
    },
  };
  let tl = createStoryTimeline({ ...options, reducedMotion: false }).pause();
  tl.seek('beat-1', false);
  assert.equal(tl.paused(), true);
  assert.equal(frame?.beat, 1);
  assert.equal(completions, 0);
  tl.seek('beat-0', false);
  assert.equal(frame?.beat, 0);
  tl.kill();
  tl = createStoryTimeline({ ...options, reducedMotion: true });
  assert.equal(tl.paused(), true);
  assert.equal(completions, 0);
  assert.equal(frame?.beat, 2);
  assert.equal(frame?.progress, 1);
  tl.kill();
});
void test('selecting a new chapter while paused shows its new set and keeps playback stopped', () => {
  const chapter = chapters[10],
    incoming = actors(chapter),
    outgoing = actors();
  outgoing.visible = true;
  const tl = createStoryTimeline({
    incoming,
    outgoing,
    bridge: null,
    chapter,
    reducedMotion: false,
    onFrame: () => {},
    onComplete: () => {
      throw new Error('premature completion');
    },
  });
  configurePlayback(tl, false, false, 1);
  assert.equal(tl.paused(), true);
  assert.ok(tl.time() > STORY_TIMING.entry);
  assert.equal(outgoing.visible, false);
  assert.equal(incoming.visible, true);
  assert.ok(incoming.children.every((a) => a.scale.x > 0.9));
  tl.kill();
});
void test('every historical episode beyond the opening has an event-specific set', () => {
  for (const chapter of chapters.filter(
    (c) => !['openai-founding', 'future-agi-hub'].includes(c.id),
  )) {
    assert.ok(
      getHistoricalSet(chapter),
      `missing historical set: ${chapter.id}`,
    );
  }
});

void test('beat three keeps the established set at full size and holds its completed result', () => {
  for (const chapter of chapters) {
    const incoming = actors(chapter);
    const wrapper = new Group();
    wrapper.scale.setScalar(0.75);
    const line = new Group();
    line.name = 'screen:line:0';
    line.scale.set(0.8, 0.3, 1);
    wrapper.add(line);
    incoming.getObjectByName('story:output')!.add(wrapper);
    const tl = createStoryTimeline({
      incoming,
      outgoing: null,
      bridge: null,
      chapter,
      reducedMotion: false,
      onFrame: () => {},
      onComplete: () => {},
    }).pause();
    for (let t = 8; t <= 14.2; t += 0.1) {
      tl.time(t, true);
      for (const id of ['hero', 'work', 'support', 'data']) {
        const scale = incoming.getObjectByName(`story:${id}`)!.scale;
        assert.ok(
          Math.min(scale.x, scale.y, scale.z) >= 0.999,
          `${chapter.id}: ${id} shrank at ${t}`,
        );
      }
      assert.equal(
        wrapper.scale.x,
        0.75,
        `${chapter.id}: text writing resized the wrapper`,
      );
    }
    tl.time(11.3, true);
    const result = incoming.getObjectByName('story:output')!;
    const completedScale = result.scale.clone();
    assert.ok(completedScale.x >= 0.999, `${chapter.id}: result not finished`);
    tl.time(STORY_TIMING.duration, true);
    assert.deepEqual(
      result.scale.toArray(),
      completedScale.toArray(),
      `${chapter.id}: result changed during hold`,
    );
    tl.kill();
  }
});

void test('the final GPT-2 release opens only 1.5B; GPT-5 selects two independent routes', () => {
  const run = (id: string, names: string[]) => {
    const chapter = chapters.find((c) => c.id === id)!;
    const incoming = actors(chapter);
    for (const name of names) {
      const part = new Group();
      part.name = name;
      if (name.startsWith('crate:lid:') && !name.endsWith(':3'))
        part.rotation.x = -1.45;
      incoming.getObjectByName('story:hero')!.add(part);
    }
    const tl = createStoryTimeline({
      incoming,
      outgoing: null,
      bridge: null,
      chapter,
      reducedMotion: false,
      onFrame: () => {},
      onComplete: () => {},
    }).pause();
    return { incoming, tl };
  };
  const boxes = run(
    'gpt-2-full',
    [0, 1, 2, 3].map((i) => `crate:lid:${i}`),
  );
  boxes.tl.time(3, true);
  assert.equal(
    boxes.incoming.getObjectByName('crate:lid:0')!.rotation.x,
    -1.45,
  );
  assert.equal(boxes.incoming.getObjectByName('crate:lid:3')!.rotation.x, 0);
  boxes.tl.time(10, true);
  assert.equal(
    boxes.incoming.getObjectByName('crate:lid:3')!.rotation.x,
    -1.45,
  );
  boxes.tl.kill();
  const routes = run('gpt-5-2025', ['router:packet', 'router:complex']);
  routes.tl.time(3, true);
  assert.equal(
    routes.incoming.getObjectByName('router:packet')!.position.x,
    -0.7,
  );
  routes.tl.time(6.5, true);
  assert.equal(routes.incoming.getObjectByName('router:packet')!.position.x, 0);
  assert.equal(
    routes.incoming.getObjectByName('router:complex')!.position.x,
    0.7,
  );
  routes.tl.kill();
});
after(() => gsap.ticker.sleep());
