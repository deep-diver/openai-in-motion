import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import { chapters } from '../data/chapters';
import {
  englishChapters,
  localizedChapters,
  localizedDialogue,
  localizedNotes,
} from '../data/localization';
import { importantObjects } from '../data/sceneNotes';
import { LocaleContext } from '../components/timeline/Locale';
import { StoryNarration } from '../components/timeline/StoryNarration';
import {
  StageAnnotations,
  createAnnotationBridge,
} from '../components/timeline/StageAnnotations';
import { PEOPLE } from '../data/types';

void test('English covers all 44 scenes while preserving dates, cast, actions and source URLs', () => {
  assert.equal(englishChapters.length, 44);
  assert.equal(localizedChapters('ko'), chapters);
  assert.equal(localizedChapters('en'), englishChapters);
  for (const [i, en] of englishChapters.entries()) {
    const ko = chapters[i];
    assert.equal(en.id, ko.id);
    for (const key of [
      'date',
      'axis',
      'set',
      'model',
      'concept',
      'people',
    ] as const)
      assert.deepEqual(en[key], ko[key], `${en.id}/${key}`);
    assert.deepEqual(
      en.sources.map((s) => s.url),
      ko.sources.map((s) => s.url),
    );
    assert.deepEqual(
      en.beats.map((b) => b.actions),
      ko.beats.map((b) => b.actions),
    );
    const copy = [
      en.title,
      en.short,
      en.description,
      en.detail,
      en.dateLabel ?? '',
      ...en.beats.flatMap((b) => [b.title, b.caption]),
      ...en.sources.map((s) => s.title),
      ...Object.values(en.personRoles ?? {}),
    ];
    for (const text of copy) assert.doesNotMatch(text, /[가-힣]/, en.id);
    for (const person of en.people)
      assert.ok(en.personRoles?.[person], `${en.id}/${person} role`);
  }
  assert.match(englishChapters.at(-1)!.detail, /not a claim of achieved AGI/);
});

void test('each scene has exactly its two selected English notes and the same scripted speakers', () => {
  const notes = localizedNotes('en');
  const dialogue = localizedDialogue('en');
  for (const chapter of chapters) {
    assert.deepEqual(
      Object.keys(notes[chapter.id]),
      importantObjects(chapter.id),
    );
    assert.deepEqual(
      dialogue[chapter.id].map((d) => d.person),
      chapter.people,
    );
    for (const note of Object.values(notes[chapter.id])) {
      assert.ok(note?.label && note.text);
      assert.doesNotMatch(`${note.label} ${note.text}`, /[가-힣]/);
    }
    for (const line of dialogue[chapter.id]) {
      assert.ok(line.text.length > 10 && line.text.length < 110);
      assert.doesNotMatch(line.text, /[가-힣]/);
    }
  }
});

void test('English annotations use English names and identify explanations as scripted dialogue', () => {
  const markup = renderToStaticMarkup(
    createElement(
      LocaleContext.Provider,
      { value: 'en' },
      createElement(StageAnnotations, {
        chapter: chapters[0],
        bridge: createAnnotationBridge(),
      }),
    ),
  );
  const dom = new JSDOM(markup);
  assert.equal(
    dom.window.document.querySelectorAll('.object-callout').length,
    2,
  );
  assert.match(dom.window.document.body.textContent ?? '', /Scripted dialogue/);
  for (const id of chapters[0].people)
    assert.ok(
      dom.window.document.body.textContent?.includes(PEOPLE[id].english),
    );
  assert.doesNotMatch(dom.window.document.body.textContent ?? '', /[가-힣]/);
  dom.window.close();
});

void test('English scrubber exposes translated text and the same playback position', () => {
  const markup = renderToStaticMarkup(
    createElement(
      LocaleContext.Provider,
      { value: 'en' },
      createElement(StoryNarration, {
        chapter: englishChapters[18],
        progress: 0.5,
        playing: false,
        reducedMotion: false,
        onSeek: () => {},
        onScrub: () => {},
      }),
    ),
  );
  const dom = new JSDOM(markup);
  const input = dom.window.document.querySelector('input[type="range"]');
  assert.ok(input);
  assert.match(input.getAttribute('aria-label') ?? '', /playback position/);
  assert.equal(input.getAttribute('aria-valuetext'), '7.1 of 14.2 seconds');
  assert.equal(input.getAttribute('step'), '0.1');
  assert.doesNotMatch(dom.window.document.body.textContent ?? '', /[가-힣]/);
  dom.window.close();
});
