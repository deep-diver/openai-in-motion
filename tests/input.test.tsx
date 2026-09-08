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
  const slider = document.createElement('span');
  slider.setAttribute('role', 'slider');
  document.body.appendChild(slider);
  slider.dispatchEvent(
    new dom.window.KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    }),
  );
  assert.equal(step, 1, 'slider arrows scrub time rather than switch chapters');
  slider.remove();
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
void test('vertical stage gestures scroll; horizontal swipes navigate and cancelled touches do not', async () => {
  let step = 0;
  const setStep: Dispatch<SetStateAction<number>> = (next) => {
    step = typeof next === 'function' ? next(step) : next;
  };
  function Probe() {
    useTimelineInput(setStep, false, 44);
    return null;
  }
  const root = createRoot(document.createElement('div'));
  await act(async () => root.render(<Probe />));
  const stage = document.createElement('div');
  stage.className = 'scene-view';
  document.body.appendChild(stage);
  const touch = (type: string, x: number, y: number) => {
    const event = new dom.window.Event(type, { bubbles: true });
    Object.defineProperties(event, {
      touches: { value: [{ clientX: x, clientY: y }] },
      changedTouches: { value: [{ clientX: x, clientY: y }] },
    });
    stage.dispatchEvent(event);
  };
  touch('touchstart', 200, 300);
  touch('touchend', 190, 100);
  assert.equal(step, 0, 'vertical scroll must not change the scene');
  touch('touchstart', 200, 300);
  touch('touchcancel', 200, 300);
  touch('touchend', 50, 300);
  assert.equal(step, 0, 'cancelled gesture must not navigate');
  touch('touchstart', 200, 300);
  touch('touchend', 50, 290);
  assert.equal(
    step,
    1,
    'the first deliberate horizontal swipe works immediately',
  );
  const wheel = new dom.window.WheelEvent('wheel', {
    deltaY: 120,
    bubbles: true,
    cancelable: true,
  });
  stage.dispatchEvent(wheel);
  assert.equal(
    wheel.defaultPrevented,
    false,
    'the stage does not trap wheel scrolling on an overflowing page',
  );
  stage.remove();
  await act(async () => root.unmount());
});
void test('switches, editable regions and Shift combinations retain their native keys', async () => {
  let step = 0;
  const setStep: Dispatch<SetStateAction<number>> = (next) => {
    step = typeof next === 'function' ? next(step) : next;
  };
  function Probe() {
    useTimelineInput(setStep, false, 44);
    return null;
  }
  const root = createRoot(document.createElement('div'));
  await act(async () => root.render(<Probe />));
  for (const attr of [
    'role="switch"',
    'role="combobox"',
    'role="spinbutton"',
    'contenteditable=""',
    'contenteditable="plaintext-only"',
  ]) {
    const holder = document.createElement('div');
    holder.innerHTML = `<div ${attr}>Edit</div>`;
    document.body.appendChild(holder);
    const key = new dom.window.KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    holder.firstElementChild!.dispatchEvent(key);
    assert.equal(key.defaultPrevented, false, attr);
    assert.equal(step, 0, attr);
    holder.remove();
  }
  const key = new dom.window.KeyboardEvent('keydown', {
    key: 'ArrowRight',
    shiftKey: true,
    bubbles: true,
    cancelable: true,
  });
  document.body.dispatchEvent(key);
  assert.equal(key.defaultPrevented, false);
  assert.equal(step, 0);
  await act(async () => root.unmount());
});
after(() => dom.window.close());
