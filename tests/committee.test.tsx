import assert from 'node:assert/strict';
import { sceneCast, stageDesign } from '../components/committee/sceneDesign';
import {
  captionWeight,
  activityTime,
  speakingGesture,
} from '../components/committee/motion';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { scenes } from '../data/committee/scenes';
import { sources } from '../data/committee/sources';
import portraits from '../data/committee/portraits.json';
import {
  divisions,
  divisionLinks,
  scenesForDivision,
} from '../data/committee/divisions';
import { divisionSequence } from '../components/committee/divisionMotion';
import {
  layerPose,
  entryPose,
  SCENE_DURATION,
  navigationStart,
} from '../components/committee/motion';

void test('committee archive covers the confirmed year in order with traceable evidence', () => {
  assert.equal(scenes[0].date, '2025-09-08');
  assert.equal(scenes.at(-1)?.date, '2026-09-08');
  assert.equal(new Set(scenes.map((s) => s.id)).size, scenes.length);
  assert.deepEqual(
    scenes.map((s) => s.date),
    scenes.map((s) => s.date).toSorted(),
  );
  assert.equal(new Set(scenes.map((s) => s.axis)).size, 3);
  for (const s of scenes) {
    assert.ok(s.date >= '2025-09-08' && s.date <= '2026-09-08', s.id);
    assert.equal(s.beats.length, 3, s.id);
    assert.ok(s.facts.length >= 2 && s.meaning && s.boundary && s.bridge, s.id);
    assert.ok(
      s.sources.includes(s.speaker.source),
      `${s.id}: speech source must be visible`,
    );
    for (const id of s.sources) {
      assert.ok(sources[id], id);
      assert.ok(new URL(sources[id].url).protocol === 'https:');
    }
    const photo = portraits[s.speaker.person as keyof typeof portraits];
    assert.ok(photo, `${s.id}: real portrait required`);
    const bytes = readFileSync(
      new URL('../public' + photo.src, import.meta.url),
    );
    assert.ok(bytes.length > 1000);
    assert.ok(
      bytes[0] === 0xff ||
        bytes.subarray(1, 4).toString() === 'PNG' ||
        bytes.subarray(0, 4).toString() === 'RIFF',
    );
  }
});
void test('source-sensitive distinctions survive editorial changes', () => {
  const byId = (id: string) => scenes.find((s) => s.id === id)!;
  assert.match(byId('draft').boundary, /98.*99/);
  assert.match(byId('q1-review').boundary, /완료율/);
  assert.match(byId('gpu-agreement').boundary, /전량.*가동/);
  assert.match(byId('cloud').boundary, /미래 계획/);
  assert.equal(byId('ha-inauguration').speaker.role, '상근부위원장');
  assert.match(byId('caio').speaker.role, /AI미래기획수석/);
  assert.equal(byId('models').scope, '연결된 국가 정책');
  assert.equal(byId('anniversary').speaker.mode, '직접 인용');
});
void test('scene endings keep full-sized objects; only a navigation removes the outgoing set', () => {
  for (let i = 0; i < 25; i++) {
    assert.equal(entryPose(SCENE_DURATION, i, false).scale, 1);
    assert.equal(entryPose(SCENE_DURATION, i, false).y, 0);
  }
  assert.equal(layerPose(SCENE_DURATION, false, false).y, 0);
  assert.ok(layerPose(0, true, false).visible);
  assert.equal(layerPose(1.25, true, false).visible, false);
  assert.equal(layerPose(0, true, true).visible, false);
  assert.equal(layerPose(0, false, true).y, 0);
  // A staggered object hasn't started when the preceding one has.
  assert.ok(entryPose(0.04, 0, false).scale > 0);
  assert.equal(entryPose(0.04, 1, false).scale, 0);
});

void test('paused navigation reveals the selected scene without resuming playback', () => {
  assert.equal(navigationStart(false, false), 3);
  assert.equal(navigationStart(true, false), 0);
  assert.equal(navigationStart(false, true), SCENE_DURATION);
  assert.equal(layerPose(navigationStart(false, false), false, false).y, 0);
});

void test('all ten division reels are chronological, nonempty and have explicitly sourced activities', () => {
  assert.equal(divisions.length, 10);
  assert.equal(scenesForDivision('all').length, scenes.length);
  const ids = new Set(scenes.map((s) => s.id));
  for (const [id, relationships] of Object.entries(divisionLinks)) {
    assert.ok(ids.has(id), id);
    assert.equal(
      new Set(relationships.map((l) => l.division)).size,
      relationships.length,
    );
    for (const l of relationships) {
      assert.ok(divisions.some((d) => d.id === l.division));
      assert.ok(l.note && sources[l.source]);
      assert.ok(scenes.find((s) => s.id === id)!.sources.includes(l.source));
    }
  }
  for (const d of divisions) {
    const reel = scenesForDivision(d.id);
    assert.ok(reel.length >= 2, `${d.name}: multiple records needed`);
    assert.deepEqual(
      reel.map((s) => s.date),
      reel.map((s) => s.date).toSorted(),
    );
    assert.ok(
      reel.some((s) =>
        divisionLinks[s.id].some(
          (l) =>
            l.division === d.id &&
            ['주관', '공동 주최', '참여', '성과 보고'].includes(l.relation),
        ),
      ),
      `${d.name}: cannot be only related policy`,
    );
    for (const source of d.sources) assert.ok(sources[source]);
  }
  assert.ok(!scenesForDivision('defense').some((s) => s.id === 'models'));
  assert.ok(
    !scenesForDivision('education').some((s) => s.id === 'gpu-agreement'),
  );
});

void test('division history distinguishes TFs, reform decisions, implementation and reporting dates', () => {
  const get = (id: string) => scenes.find((s) => s.id === id)!;
  assert.match(get('education-tf').boundary, /10개 분과가 아니다/);
  assert.equal(get('division-reform').date, '2026-02-25');
  assert.equal(get('division-reform').status, '의결');
  assert.equal(get('expanded-organisation').date, '2026-03-25');
  assert.match(get('global-agenda').boundary, /보도일.*전월/);
  assert.match(get('global-review').boundary, /보고일.*임의로/);
  assert.match(get('democracy-review').boundary, /2027년.*미래 계획/);
  assert.equal(divisionLinks['media-dialogue'].length, 2);
  assert.equal(
    divisionLinks['compute-allocation'].find((l) => l.division === 'public')
      ?.relation,
    '참여',
  );
  assert.equal(divisionLinks.models[0].relation, '관련 의제');
});

void test('division scenes tell progressive stories and hold their results through the final caption', () => {
  const early = divisionSequence(0.2),
    middle = divisionSequence(0.5),
    last = divisionSequence(1);
  assert.equal(early.newDivisions, 0);
  assert.ok(middle.newDivisions > 0);
  assert.equal(last.newDivisions, 1);
  assert.equal(early.transfer, 0);
  assert.ok(middle.gate > 0 && middle.transfer > 0);
  assert.equal(last.transfer, 1);
  assert.ok(early.proposalRadius > last.proposalRadius);
  assert.equal(last.structured, 1);
  assert.equal(divisionSequence(0.9).structured, last.structured);
  assert.equal(divisionSequence(0.9).newDivisions, last.newDivisions);
});

void test('every foreground participant has an independent portrait and visible activity evidence', () => {
  const dual = scenes.filter((s) => s.secondarySpeaker);
  assert.equal(dual.length, 7);
  for (const scene of scenes) {
    const cast = sceneCast(scene);
    assert.ok(cast.length >= 1 && cast.length <= 2);
    assert.equal(
      new Set(cast.map((person) => person.person)).size,
      cast.length,
    );
    for (const person of cast) {
      assert.ok(
        scene.sources.includes(person.source),
        `${scene.id}: ${person.person} evidence`,
      );
      const portrait = portraits[person.person as keyof typeof portraits];
      assert.ok(portrait?.src && portrait.sourceUrl, scene.id);
      assert.ok(
        readFileSync(new URL('../public' + portrait.src, import.meta.url))
          .length > 1000,
      );
      assert.ok(person.text && person.role);
    }
    assert.ok(
      stageDesign[scene.set],
      `${scene.id}: deliberate stage composition`,
    );
    assert.ok(stageDesign[scene.set].anchor.every(Number.isFinite));
  }
  assert.deepEqual(
    sceneCast(scenes.find((s) => s.id === 'media-dialogue')!).map(
      (s) => s.person,
    ),
    ['yoo', 'baek'],
  );
  assert.deepEqual(
    sceneCast(scenes.find((s) => s.id === 'anniversary')!).map((s) => s.person),
    ['ha', 'lim'],
  );
});
void test('captions remain readable without overlapping paragraphs at either transition', () => {
  for (let i = 0; i <= 1000; i++) {
    const weights = [0, 1, 2].map((index) => captionWeight(i / 1000, index));
    assert.ok(weights.every((v) => v >= 0 && v <= 1));
    assert.ok(weights.filter((v) => v > 0).length <= 1);
    const nearBoundary =
      Math.min(Math.abs(i / 1000 - 1 / 3), Math.abs(i / 1000 - 2 / 3)) < 0.016;
    if (!nearBoundary) assert.equal(Math.max(...weights), 1);
  }
  assert.deepEqual(
    [0, 1, 2].map((i) => captionWeight(1, i)),
    [0, 0, 1],
  );
});
void test('large stage actions progress then hold while two speakers take turns', () => {
  let previous = 0;
  for (let frame = 0; frame <= 1440; frame++) {
    const seconds = frame / 60;
    const current = activityTime(seconds);
    assert.ok(current >= previous);
    previous = current;
    const primary = speakingGesture(seconds / 24, false, true);
    const secondary = speakingGesture(seconds / 24, true, true);
    assert.ok(primary < 1e-9 || secondary < 1e-9, 'gestures must take turns');
  }
  assert.equal(activityTime(0), 0);
  assert.equal(activityTime(20), activityTime(24));
  assert.equal(activityTime(24), 18);
});

void test('all displayed committee portraits are small bundled WebP assets with versioned URLs', () => {
  let total = 0;
  for (const [person, photo] of Object.entries(portraits)) {
    assert.match(
      photo.src,
      new RegExp(
        `^/committee/portraits/optimized/${person}\\.[a-f0-9]{12}\\.webp$`,
      ),
    );
    const bytes = readFileSync(
      new URL('../public' + photo.src, import.meta.url),
    );
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert.ok(photo.dataUri.startsWith('data:image/webp;base64,'));
    assert.deepEqual(
      Buffer.from(photo.dataUri.split(',')[1], 'base64'),
      bytes,
      'embedded portrait matches the local optimized asset',
    );
    assert.ok(photo.width <= 320 && photo.height <= 320);
    total += bytes.length;
    assert.ok(
      readFileSync(new URL('../public' + photo.originalSrc, import.meta.url))
        .length > 0,
    );
  }
  assert.ok(total < 100_000, `portrait download budget: ${total} bytes`);
});
