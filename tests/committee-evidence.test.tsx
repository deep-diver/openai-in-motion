import assert from 'node:assert/strict';
import { test } from 'node:test';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import SourceOverlay from '../components/committee/SourceOverlay';
import { evidenceWindow } from '../components/committee/evidenceMotion';
import { stageText } from '../components/committee/stageText';
import { scenes } from '../data/committee/scenes';
import { sources } from '../data/committee/sources';

void test('source cards enter and leave inside each scene, including fast and reduced playback', () => {
  for (const speed of [0.5, 1, 1.5, 2, 3, 5]) {
    assert.equal(evidenceWindow(0, speed, false).visible, false);
    assert.equal(evidenceWindow(1, speed, false).visible, false);
    assert.equal(evidenceWindow(0.5, speed, false).opacity, 1);
    for (let i = 0; i <= 100; i++) {
      const frame = evidenceWindow(i / 100, speed, false);
      assert.ok(frame.opacity >= 0 && frame.opacity <= 1);
      assert.ok(frame.remaining >= 0 && frame.remaining <= 1);
      assert.equal(evidenceWindow(i / 100, speed, true).visible, false);
    }
  }
  let visibleFrames = 0;
  for (let i = 0; i < 1000; i++)
    if (evidenceWindow(i / 1000, 5, false).visible) visibleFrames++;
  assert.ok(
    ((visibleFrames / 1000) * 24) / 5 > 4,
    'fast playback still allows four seconds to notice the source',
  );
});

void test('a citation links the actual scene source, holds on keyboard focus, and releases on dismissal', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  let held = false,
    opened = 0;
  const onHold = (value: boolean) => {
    held = value;
  };
  const onOpen = () => {
    opened++;
  };
  const render = (progress: number, scene = scenes[0]) =>
    root.render(
      <SourceOverlay
        key={scene.id}
        scene={scene}
        progress={progress}
        speed={1}
        reduced={false}
        onHold={onHold}
        onOpen={onOpen}
      />,
    );
  await act(async () => render(0));
  assert.equal(host.querySelector('section'), null);
  await act(async () => render(0.5));
  const link = host.querySelector('a')!;
  assert.equal(link.href, sources[scenes[0].sources[0]].url);
  assert.ok(host.textContent!.includes(sources[scenes[0].sources[0]].title));
  await act(async () => link.focus());
  assert.equal(held, true);
  await act(async () =>
    (
      host.querySelector(
        '.committee-source-overlay-actions button',
      ) as HTMLButtonElement
    ).click(),
  );
  assert.equal(opened, 1);
  await act(async () =>
    (
      host.querySelector(
        '[aria-label="이 장면의 근거 알림 닫기"]',
      ) as HTMLButtonElement
    ).click(),
  );
  assert.equal(held, false);
  assert.equal(host.querySelector('section'), null);
  await act(async () => render(0.5, scenes[1]));
  assert.ok(
    host.querySelector('section'),
    'a different scene gets its own citation',
  );
  await act(async () => root.unmount());
  assert.equal(held, false);
  dom.window.close();
});

void test('short Korean stage labels preserve proper names and numeric milestones', () => {
  assert.equal(stageText('DEFENSE\nDATA'), '국방\n데이터');
  assert.equal(stageText('COPYRIGHT'), '저작권');
  assert.equal(stageText('260,000 GPUs'), '260,000 GPUs');
  assert.equal(stageText('SKT'), 'SKT');
});
