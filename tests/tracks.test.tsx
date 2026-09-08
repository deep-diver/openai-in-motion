import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import { TimelineTracks } from '../components/timeline/TimelineTracks';
import { chapters } from '../data/chapters';
void test('the archive playhead travels within scenes and joins the next scene without a jump', () => {
  const position = (
    active: number,
    progress: number,
    reducedMotion = false,
  ) => {
    const dom = new JSDOM(
      renderToStaticMarkup(
        <TimelineTracks
          chapters={chapters}
          active={active}
          progress={progress}
          reducedMotion={reducedMotion}
          onSelect={() => {}}
        />,
      ),
    );
    const line =
      dom.window.document.querySelector<HTMLElement>('.track-playhead')!;
    const result = {
      x: parseFloat(line.style.left),
      transition: line.style.transition,
    };
    dom.window.close();
    return result;
  };
  const start = position(10, 0).x,
    mid = position(10, 0.5).x,
    end = position(10, 1).x;
  assert.ok(start < mid && mid < end);
  assert.equal(end, position(11, 0).x);
  assert.ok(position(43, 1).x < 44 * 126);
  assert.equal(position(10, 0.5, true).transition, 'none');
});
