import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { act, type Dispatch, type SetStateAction } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { useTimelineInput } from '../components/timeline/useTimelineInput';
const dom = new JSDOM('<!doctype html><html><body></body></html>');
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  Element: dom.window.Element,
  IS_REACT_ACT_ENVIRONMENT: true,
});
void test('focused navigation buttons retain arrow keys, while form fields keep their own keys', async () => {
  let step = 0;
  const setStep: Dispatch<SetStateAction<number>> = (next) => {
    step = typeof next === 'function' ? next(step) : next;
  };
  function Probe() {
    useTimelineInput(setStep, false, 44);
    return null;
  }
  const root = createRoot(document.createElement('div'));
  await act(async () => {
    root.render(<Probe />);
  });
  const button = document.createElement('button');
  document.body.appendChild(button);
  button.dispatchEvent(
    new dom.window.KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    }),
  );
  assert.equal(step, 1);
  const input = document.createElement('input');
  document.body.appendChild(input);
  input.dispatchEvent(
    new dom.window.KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    }),
  );
  assert.equal(step, 1);
  button.remove();
  input.remove();
  await act(async () => root.unmount());
});
void test('overflowing layouts keep native page scrolling outside the stage', async () => {
  let step = 0;
  const setStep: Dispatch<SetStateAction<number>> = (next) => {
    step = typeof next === 'function' ? next(step) : next;
  };
  function Probe() {
    useTimelineInput(setStep, false, 44);
    return null;
  }
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: 1000,
  });
  const root = createRoot(document.createElement('div'));
  await act(async () => root.render(<Probe />));
  const wheel = new dom.window.WheelEvent('wheel', {
    deltaY: 120,
    bubbles: true,
    cancelable: true,
  });
  document.body.dispatchEvent(wheel);
  const key = new dom.window.KeyboardEvent('keydown', {
    key: 'PageDown',
    bubbles: true,
    cancelable: true,
  });
  document.body.dispatchEvent(key);
  assert.equal(wheel.defaultPrevented, false);
  assert.equal(key.defaultPrevented, false);
  assert.equal(step, 0);
  await act(async () => root.unmount());
});
after(() => dom.window.close());
