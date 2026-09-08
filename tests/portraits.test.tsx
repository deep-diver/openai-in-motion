import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import { portraits } from '../data/portraits';
import { PEOPLE } from '../data/types';
import { chapters } from '../data/chapters';
import { LocaleContext } from '../components/timeline/Locale';
import {
  createAnnotationBridge,
  StageAnnotations,
} from '../components/timeline/StageAnnotations';

void test('all 32 cast members have locally bundled photographic assets and source credits', () => {
  assert.deepEqual(Object.keys(portraits).sort(), Object.keys(PEOPLE).sort());
  for (const [id, portrait] of Object.entries(portraits)) {
    assert.ok(portrait.src.startsWith('/portraits/'), id);
    const bytes = readFileSync(
      new URL('../public' + portrait.src, import.meta.url),
    );
    const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
    const png = bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const webp =
      bytes.subarray(0, 4).toString() === 'RIFF' &&
      bytes.subarray(8, 12).toString() === 'WEBP';
    assert.ok(
      jpeg || png || webp,
      `${id}: valid image bytes, not a downloaded HTML error`,
    );
    assert.match(portrait.sourceUrl, /^https?:\/\//);
    assert.ok(portrait.credit.length > 3 && portrait.license.length > 3);
    if (portrait.crop) {
      const c = portrait.crop;
      assert.ok(c.left >= 0 && c.top >= 0 && c.width > 0 && c.height > 0);
      assert.ok(
        c.left + c.width <= c.imageWidth && c.top + c.height <= c.imageHeight,
        id,
      );
    }
  }
});

void test('each speech bubble contains the matching cast portrait without adding callout panels', () => {
  for (const chapter of chapters) {
    const dom = new JSDOM(
      renderToStaticMarkup(
        <LocaleContext.Provider value="en">
          <StageAnnotations
            chapter={chapter}
            bridge={createAnnotationBridge()}
          />
        </LocaleContext.Provider>,
      ),
    );
    const document = dom.window.document;
    assert.equal(document.querySelectorAll('.object-callout').length, 2);
    const panels = [...document.querySelectorAll('.character-speech')];
    assert.equal(panels.length, chapter.people.length);
    panels.forEach((panel, i) => {
      const id = chapter.people[i];
      const img = panel.querySelector('img');
      assert.ok(img);
      assert.equal(img.getAttribute('src'), portraits[id]!.src);
      assert.equal(
        img.getAttribute('alt'),
        `Portrait of ${PEOPLE[id].english}`,
      );
      assert.match(panel.textContent ?? '', /Scripted dialogue/);
    });
    dom.window.close();
  }
});
