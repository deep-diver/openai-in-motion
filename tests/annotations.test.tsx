import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import gsap from 'gsap';
import { Group } from 'three';
import { chapters } from '../data/chapters';
import {
  CAST_DIALOGUE,
  OBJECT_IDS,
  OBJECT_NOTES,
  importantObjects,
  SECONDARY_OBJECT,
} from '../data/sceneNotes';
import {
  annotationBox,
  leaderPath,
} from '../components/timeline/annotationLayout';
import {
  captionWeights,
  dialogueOpacity,
  dialogueWindow,
  cueTime,
  staticSpeaker,
  secondaryNoteOpacity,
} from '../components/timeline/storyClock';
import {
  createStoryTimeline,
  STORY_TIMING,
} from '../components/timeline/storyDirector';

void test('all 220 object notes and every cast member have concise, scene-specific copy', () => {
  for (const chapter of chapters) {
    for (const id of OBJECT_IDS) {
      assert.ok(
        OBJECT_NOTES[chapter.id][id].label.length > 1,
        `${chapter.id}/${id}`,
      );
      assert.ok(
        OBJECT_NOTES[chapter.id][id].text.length >= 8,
        `${chapter.id}/${id}`,
      );
    }
    assert.deepEqual(
      CAST_DIALOGUE[chapter.id].map((line) => line.person),
      chapter.people,
    );
    CAST_DIALOGUE[chapter.id].forEach((line, i) => {
      assert.ok(line.text.length > 10 && line.text.length < 50);
      const { start, end } = dialogueWindow(chapter, i);
      assert.ok(end <= STORY_TIMING.duration);
      assert.equal(dialogueOpacity(start - 0.1, start, end), 0);
      assert.equal(dialogueOpacity((start + end) / 2, start, end), 1);
      assert.equal(dialogueOpacity(end + 0.1, start, end), 0);
      assert.equal(
        staticSpeaker(chapter, start + 1),
        i,
        'every speaker is reachable without animation',
      );
    });
  }
});

void test('every scene selects two important objects and never shows more than two panels including dialogue', () => {
  for (const chapter of chapters) {
    const selected = importantObjects(chapter.id);
    assert.ok(SECONDARY_OBJECT[chapter.id]);
    assert.equal(new Set(selected).size, 2);
    for (const id of selected) assert.ok(OBJECT_NOTES[chapter.id][id]);
    for (const reduced of [false, true])
      for (let time = 0; time <= STORY_TIMING.duration; time += 0.05) {
        let visible =
          1 + (secondaryNoteOpacity(chapter, time, reduced) > 0.001 ? 1 : 0);
        chapter.people.forEach((_, i) => {
          const { start, end } = dialogueWindow(chapter, i);
          if (
            reduced
              ? staticSpeaker(chapter, time) === i
              : dialogueOpacity(time, start, end) > 0.001
          )
            visible++;
        });
        assert.ok(
          visible <= 2,
          `${chapter.id} shows ${visible} panels at ${time}`,
        );
      }
  }
});

void test('narration dissolves across cues without a blank or a stepped change', () => {
  for (let time = 0; time < STORY_TIMING.duration; time += 0.03) {
    const a = captionWeights(time),
      b = captionWeights(time + 0.01);
    assert.ok(Math.abs(a.reduce((sum, v) => sum + v, 0) - 1) < 1e-9);
    assert.ok(a.every((v) => v >= 0 && v <= 1));
    assert.ok(a.every((v, i) => Math.abs(v - b[i]) < 0.02));
  }
  for (const i of [1, 2]) {
    const weights = captionWeights(cueTime(i));
    assert.ok(Math.abs(weights[i - 1] - 0.5) < 1e-9);
    assert.ok(Math.abs(weights[i] - 0.5) < 1e-9);
    assert.equal(
      captionWeights(cueTime(i) + 0.65)[i],
      1,
      'cue selection ends after the dissolve',
    );
  }
});

void test('callouts remain in bounds at phone, tablet and desktop widths; lines follow the target', () => {
  for (const [width, height] of [
    [350, 580],
    [580, 580],
    [850, 530],
    [1080, 640],
  ]) {
    const boxes = [...OBJECT_IDS, 'speech' as const].map((id) =>
      annotationBox(id, width, height),
    );
    for (const box of boxes) {
      assert.ok(box.x >= 0 && box.y >= 0);
      assert.ok(box.x + box.width <= width);
      assert.ok(box.y + box.height <= height);
    }
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i],
          b = boxes[j];
        const overlap =
          Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 0 &&
          Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 0;
        assert.equal(
          overlap,
          false,
          `${width}px: label boxes ${i} and ${j} overlap`,
        );
      }
    const before = leaderPath(boxes[0], { x: 100, y: 200 });
    const after = leaderPath(boxes[0], { x: 220, y: 250 });
    assert.notEqual(before, after);
    assert.ok(after.endsWith('220.0 250.0'));
  }
});

void test('the persistent story thread keeps moving through both cue boundaries and seeks deterministically', () => {
  const chapter = chapters[0],
    scene = new Group(),
    bridge = new Group();
  for (const [i, id] of OBJECT_IDS.entries()) {
    const actor = new Group(),
      story = new Group();
    actor.name = `actor:${id}`;
    story.name = `story:${id}`;
    actor.position.set(i - 2, 0, i % 2);
    actor.add(story);
    scene.add(actor);
  }
  const tl = createStoryTimeline({
    incoming: scene,
    outgoing: null,
    bridge,
    chapter,
    reducedMotion: false,
    onFrame: () => {},
    onComplete: () => {},
  }).pause();
  for (const time of [cueTime(1), cueTime(2)]) {
    tl.time(time - 0.02, false);
    const before = bridge.position.clone();
    tl.time(time, false);
    const middle = bridge.position.clone();
    tl.time(time + 0.02, false);
    const after = bridge.position.clone();
    assert.ok(before.distanceTo(middle) > 0.001);
    assert.ok(middle.distanceTo(after) > 0.001);
    assert.ok(before.distanceTo(after) < 0.2);
    const result = after.toArray();
    tl.time(2, false);
    tl.time(time + 0.02, false);
    assert.deepEqual(bridge.position.toArray(), result);
    assert.equal(scene.userData.storyTime, time + 0.02);
  }
  tl.kill();
});
after(() => gsap.ticker.sleep());
