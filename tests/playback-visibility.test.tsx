import assert from 'node:assert/strict';
import { test } from 'node:test';
import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { usePageVisibility } from '../components/timeline/usePageVisibility';
void test('hidden tabs suspend playback, and returning preserves play or pause intent', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  let visible = 'visible';
  Object.defineProperty(document, 'visibilityState', { get: () => visible });
  const host = document.createElement('div');
  function Probe() {
    const [playing, setPlaying] = useState(true);
    const pageVisible = usePageVisibility();
    return (
      <>
        <output>{String(playing && pageVisible)}</output>
        <button aria-label="Pause" onClick={() => setPlaying(false)} />
      </>
    );
  }
  const root = createRoot(host);
  await act(async () => root.render(<Probe />));
  assert.equal(host.textContent, 'true');
  const change = async (next: string) =>
    act(async () => {
      visible = next;
      document.dispatchEvent(new dom.window.Event('visibilitychange'));
    });
  await change('hidden');
  assert.equal(host.textContent, 'false');
  await change('visible');
  assert.equal(host.textContent, 'true');
  await act(async () => host.querySelector('button')!.click());
  await change('hidden');
  await change('visible');
  assert.equal(host.textContent, 'false');
  await act(async () => root.unmount());
  dom.window.close();
});
