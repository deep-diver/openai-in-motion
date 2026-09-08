import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import { StoryNarration } from '../components/timeline/StoryNarration';
import { chapters } from '../data/chapters';

void test('the actual scrubber input exposes its name, seconds and useful keyboard increments', () => {
  const markup = renderToStaticMarkup(
    createElement(StoryNarration, {
      chapter: chapters[0],
      progress: 0.5,
      playing: false,
      reducedMotion: false,
      onSeek: () => {},
      onScrub: () => {},
    }),
  );
  const dom = new JSDOM(markup);
  const input = dom.window.document.querySelector('input[type="range"]');
  assert.ok(input);
  assert.match(input.getAttribute('aria-label') ?? '', /재생 위치/);
  assert.equal(input.getAttribute('aria-valuetext'), '7.1초 / 14.2초');
  assert.equal(input.getAttribute('max'), '14.2');
  assert.equal(input.getAttribute('step'), '0.1');
  dom.window.close();
});
