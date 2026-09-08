'use client';
/* eslint-disable react/react-compiler -- the R3F frame loop projects animated scene objects into DOM refs. */
import { useFrame } from '@react-three/fiber';
import { Vector3, type Group, type Object3D } from 'three';
import { useLayoutEffect, useMemo } from 'react';
import { CAST_DIALOGUE, OBJECT_IDS, importantObjects } from '@/data/sceneNotes';
import { localizedNotes, localizedDialogue } from '@/data/localization';
import { useLocale } from './Locale';
import { PersonPortrait } from './PersonPortrait';
import { PEOPLE, type Chapter } from '@/data/types';
import {
  annotationBox,
  fitLabelBox,
  leaderPath,
  separateLabels,
  type LabelBox,
} from './annotationLayout';
import {
  captionWeights,
  dialogueOpacity,
  dialogueWindow,
  smoothstep,
  staticSpeaker,
  secondaryNoteOpacity,
} from './storyClock';

type Elements = {
  label?: HTMLElement | null;
  path?: SVGPathElement | null;
  dot?: SVGCircleElement | null;
  measured?: { width: number; height: number };
};
export type AnnotationBridge = {
  chapterId: string;
  scene: Group | null;
  elements: Map<string, Elements>;
};
export function createAnnotationBridge(): AnnotationBridge {
  return { chapterId: '', scene: null, elements: new Map() };
}
function elementRef<K extends 'label' | 'path' | 'dot'>(
  bridge: AnnotationBridge,
  id: string,
  key: K,
) {
  return (value: Elements[K]) => {
    const entry = bridge.elements.get(id) ?? {};
    entry[key] = value;
    if (key === 'label') entry.measured = undefined;
    bridge.elements.set(id, entry);
  };
}
export function StageAnnotations({
  chapter,
  bridge,
}: {
  chapter: Chapter;
  bridge: AnnotationBridge;
}) {
  const { locale, t } = useLocale();
  const notes = localizedNotes(locale)[chapter.id];
  const dialogue = localizedDialogue(locale)[chapter.id] ?? [];
  const objects = importantObjects(chapter.id);
  const ids = [...objects, ...dialogue.map((_, i) => `speech-${i}`)];
  useLayoutEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      for (const refs of bridge.elements.values()) {
        if (!refs.label) continue;
        refs.measured = {
          width: parseFloat(refs.label.style.width),
          height: refs.label.scrollHeight + 2,
        };
      }
    });
    for (const refs of bridge.elements.values())
      if (refs.label) observer.observe(refs.label);
    return () => observer.disconnect();
  }, [bridge, chapter.id]);
  return (
    <div className="stage-annotations" key={chapter.id}>
      <svg className="annotation-leaders" aria-hidden="true">
        {ids.map((id) => (
          <g
            key={id}
            className={id.startsWith('speech') ? 'speech-leader' : ''}
          >
            <path ref={elementRef(bridge, id, 'path')} />
            <circle r="3" ref={elementRef(bridge, id, 'dot')} />
          </g>
        ))}
      </svg>
      <ul
        className="object-callout-list"
        aria-label={t('무대 위 오브젝트 설명', 'Objects on the stage')}
      >
        {objects.map((id) => (
          <li
            key={id}
            className={`object-callout callout-${id}`}
            ref={elementRef(bridge, id, 'label')}
          >
            <strong>{notes?.[id]?.label}</strong>
            <span>{notes?.[id]?.text}</span>
          </li>
        ))}
      </ul>
      {dialogue.map((line, i) => (
        <div
          className="character-speech"
          key={line.person}
          ref={elementRef(bridge, `speech-${i}`, 'label')}
        >
          <div className="speech-identity">
            <PersonPortrait person={line.person} />
            <div className="speech-person">
              <strong>
                {t(PEOPLE[line.person].name, PEOPLE[line.person].english)}
              </strong>
              <span className="speech-disclaimer">
                {t('연출 대사', 'Scripted dialogue')}
              </span>
            </div>
          </div>
          <p>{line.text}</p>
        </div>
      ))}
    </div>
  );
}

const heights = { hero: 1.1, work: 0.8, support: 1, data: 0.4, output: 0.7 };
function isVisible(object: Object3D) {
  let parent: Object3D | null = object;
  while (parent) {
    if (!parent.visible) return false;
    parent = parent.parent;
  }
  return true;
}
export function AnnotationProjector({
  chapter,
  bridge,
  reducedMotion,
}: {
  chapter: Chapter;
  bridge: AnnotationBridge;
  reducedMotion: boolean;
}) {
  const point = useMemo(() => new Vector3(), []);
  const scale = useMemo(() => new Vector3(), []);
  useFrame(({ camera, size }) => {
    const scene = bridge.scene;
    if (!scene || bridge.chapterId !== chapter.id) return;
    const time = Number(scene.userData.storyTime ?? 0);
    const weights = captionWeights(time);
    const boxes = new Map<string, LabelBox>();
    const measure = (id: string, speech = false) => {
      const refs = bridge.elements.get(id);
      const box = annotationBox(
        speech ? 'speech' : (id as (typeof OBJECT_IDS)[number]),
        size.width,
        size.height,
      );
      if (refs?.label) {
        if (refs.measured?.width !== box.width) {
          refs.label.style.width = `${box.width}px`;
          refs.measured = {
            width: box.width,
            height: refs.label.scrollHeight + 2,
          };
        }
        Object.assign(box, fitLabelBox(box, size.height, refs.measured.height));
      }
      boxes.set(id, box);
      return box;
    };
    const objects = importantObjects(chapter.id);
    const heroBox = measure('hero');
    let otherId: string = objects[1];
    measure(otherId);
    (CAST_DIALOGUE[chapter.id] ?? []).forEach((_, i) => {
      const id = `speech-${i}`;
      measure(id, true);
      const interval = dialogueWindow(chapter, i);
      if (
        reducedMotion
          ? staticSpeaker(chapter, time) === i
          : dialogueOpacity(time, interval.start, interval.end) > 0
      )
        otherId = id;
    });
    const [primary, secondary] = separateLabels(
      heroBox,
      boxes.get(otherId)!,
      size.height,
    );
    boxes.set('hero', primary);
    boxes.set(otherId, secondary);
    const update = (
      id: string,
      target: Object3D | undefined,
      y: number,
      opacity: number,
      speech = false,
      focus = 0,
    ) => {
      const refs = bridge.elements.get(id);
      if (!refs?.label || !refs.path || !refs.dot) return;
      const box = boxes.get(id)!;
      refs.label.style.maxHeight = `${box.height}px`;
      const clipped = (refs.measured?.height ?? box.height) > box.height + 1;
      refs.label.style.overflowY = clipped ? 'auto' : '';
      refs.label.style.left = `${box.x}px`;
      refs.label.style.top = `${box.y}px`;
      if (!target || !isVisible(target)) opacity = 0;
      if (target) {
        target.getWorldScale(scale);
        opacity *= smoothstep(0.08, 0.8, Math.min(scale.x, scale.y, scale.z));
        point.set(0, y, 0);
        target.localToWorld(point);
        point.project(camera);
        point.set(
          ((point.x + 1) * size.width) / 2,
          ((1 - point.y) * size.height) / 2,
          point.z,
        );
        if (point.z < -1 || point.z > 1) opacity = 0;
        refs.path.setAttribute('d', leaderPath(box, point));
        refs.dot.setAttribute('cx', point.x.toFixed(1));
        refs.dot.setAttribute('cy', point.y.toFixed(1));
      }
      refs.label.style.pointerEvents = clipped && opacity > 0.1 ? 'auto' : '';
      refs.label.tabIndex = clipped && opacity > 0.1 ? 0 : -1;
      refs.label.dataset.annotationScroll = String(clipped && opacity > 0.1);
      refs.label.style.opacity = `${opacity}`;
      refs.label.style.transform = `translateY(${(1 - opacity) * 4}px)`;
      refs.label.style.setProperty('--callout-focus', `${focus}`);
      refs.label.setAttribute('aria-hidden', String(opacity < 0.1));
      refs.path.style.opacity = `${opacity * (speech ? 0.85 : 0.4 + focus * 0.45)}`;
      refs.dot.style.opacity = `${opacity}`;
    };
    for (const id of importantObjects(chapter.id)) {
      const focus =
        id === 'output'
          ? weights[2]
          : id === 'hero'
            ? weights[1]
            : id === 'data'
              ? weights[0]
              : 0.1;
      update(
        id,
        scene.getObjectByName(`story:${id}`),
        heights[id],
        smoothstep(0.75, 1.65, time) *
          (id === 'hero'
            ? 1
            : secondaryNoteOpacity(chapter, time, reducedMotion)),
        false,
        focus,
      );
    }
    (CAST_DIALOGUE[chapter.id] ?? []).forEach((line, i) => {
      const window = dialogueWindow(chapter, i);
      const opacity = reducedMotion
        ? i === staticSpeaker(chapter, time)
          ? 1
          : 0
        : dialogueOpacity(time, window.start, window.end);
      update(
        `speech-${i}`,
        scene.getObjectByName(
          `story:person-${chapter.people.indexOf(line.person)}`,
        ),
        1.14,
        opacity,
        true,
      );
    });
  });
  return null;
}
