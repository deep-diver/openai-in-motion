'use client';
/* eslint-disable next/no-img-element -- Credited local profile photographs. */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type SetStateAction,
} from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import gsap from 'gsap';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Pause,
  Play,
  RotateCcw,
  List,
  MoveUpRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { usePageVisibility } from '@/components/timeline/usePageVisibility';
import { useTimelineInput } from '@/components/timeline/useTimelineInput';
import {
  divisions,
  divisionLinks,
  scenesForDivision,
  type DivisionSelection,
} from '@/data/committee/divisions';
import { sources } from '@/data/committee/sources';
import { AXES, PEOPLE, type Axis } from '@/data/committee/types';
import portraits from '@/data/committee/portraits.json';
import type { Clock, Projection } from './CommitteeStage';
import { SCENE_DURATION as DURATION, navigationStart } from './motion';
import './committee.css';
import SpeakerCard from './SpeakerCard';
import { sceneCast } from './sceneDesign';
import { captionWeight } from './motion';
const Stage = dynamic(() => import('./CommitteeStage'), {
  ssr: false,
  loading: () => (
    <div className="committee-canvas-fallback">3D 무대를 불러오고 있어요…</div>
  ),
});
const date = (v: string) => v.replaceAll('-', '.');
export default function CommitteeExperience() {
  const [division, setDivision] = useState<DivisionSelection>('all');
  const restoreFocus = useRef(false);
  useLayoutEffect(() => {
    if (restoreFocus.current)
      document
        .querySelector<HTMLButtonElement>(
          '.committee-division-choices button[aria-pressed="true"]',
        )
        ?.focus({ preventScroll: true });
  }, [division]);
  return (
    <CommitteeFilm
      key={division}
      division={division}
      onDivisionChange={(value) => {
        restoreFocus.current = true;
        setDivision(value);
      }}
    />
  );
}
function CommitteeFilm({
  division,
  onDivisionChange,
}: {
  division: DivisionSelection;
  onDivisionChange: (division: DivisionSelection) => void;
}) {
  const scenes = useMemo(() => scenesForDivision(division), [division]);
  const divisionInfo = divisions.find((d) => d.id === division);
  const divisionPhoto = divisionInfo?.person
    ? portraits[divisionInfo.person as keyof typeof portraits]
    : null;
  const [index, setIndex] = useState(0),
    [previous, setPrevious] = useState<number | null>(null),
    [playing, setPlaying] = useState(true),
    [speed, setSpeed] = useState(1),
    [progress, setProgress] = useState(0),
    [replay, setReplay] = useState(0),
    [reduced, setReduced] = useState(false),
    [dialog, setDialog] = useState<'sources' | 'archive' | null>(null),
    [filter, setFilter] = useState<Axis | 'all'>('all'),
    [ready, setReady] = useState(false);
  const startTime = useRef(0);
  const clock = useRef<Clock>({ time: 0, previousTime: 0, reduced: false });
  const projection: Projection = useRef({
    object: null,
    speaker: null,
    objectLine: null,
    speakerLine: null,
  });
  const tween = useRef<gsap.core.Tween | null>(null),
    state = useRef({ index, playing, speed, reduced }),
    rail = useRef<HTMLDivElement>(null);
  const onReady = useCallback(() => setReady(true), []);
  const visible = usePageVisibility();
  const scene = scenes[index],
    axis = AXES[scene.axis];
  const cast = sceneCast(scene);
  const photo = portraits[scene.speaker.person as keyof typeof portraits];
  const go = useCallback(
    (next: SetStateAction<number>) => {
      const before = state.current.index;
      const requested = typeof next === 'function' ? next(before) : next;
      const n = Math.max(0, Math.min(scenes.length - 1, requested));
      if (n === before) return;
      clock.current.previousTime = clock.current.time;
      state.current.index = n;
      startTime.current = navigationStart(
        state.current.playing,
        state.current.reduced,
      );
      setPrevious(before);
      setIndex(n);
      setProgress(startTime.current / DURATION);
    },
    [scenes.length, setPrevious, setIndex, setProgress],
  );
  useTimelineInput(go, dialog !== null, scenes.length);
  useLayoutEffect(() => {
    state.current = { index, playing, speed, reduced };
    clock.current.reduced = reduced;
  }, [index, playing, speed, reduced]);
  useLayoutEffect(() => {
    clock.current.time = 0;
    let last = -1;
    const t = gsap.to(clock.current, {
      time: DURATION,
      duration: DURATION,
      ease: 'none',
      paused: true,
      onUpdate: () => {
        const tick = Math.floor(clock.current.time * 12);
        if (tick !== last) {
          last = tick;
          setProgress(clock.current.time / DURATION);
        }
      },
      onComplete: () => {
        if (
          state.current.index < scenes.length - 1 &&
          state.current.playing &&
          !state.current.reduced
        )
          go(state.current.index + 1);
        else setPlaying(false);
      },
    });
    t.time(startTime.current, true);
    tween.current = t;
    return () => {
      t.kill();
    };
  }, [index, replay, go, scenes.length]);
  useEffect(() => {
    const t = tween.current;
    if (!t) return;
    t.timeScale(speed);
    if (reduced) {
      t.pause();
      clock.current.time = DURATION;
    } else t.paused(!ready || !playing || !visible || dialog !== null);
  }, [index, replay, playing, speed, visible, dialog, reduced, ready]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => {
      setReduced(media.matches);
      if (media.matches) setPlaying(false);
    };
    change();
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  const toggle = useCallback(() => {
    if (state.current.reduced) return;
    if (clock.current.time >= DURATION) {
      if (state.current.index === scenes.length - 1) {
        go(0);
        startTime.current = 0;
      } else {
        startTime.current = 0;
        setReplay((v) => v + 1);
      }
      setProgress(0);
      setPlaying(true);
    } else setPlaying((v) => !v);
  }, [go, scenes.length, setReplay, setProgress, setPlaying]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        e.code !== 'Space' ||
        e.repeat ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        dialog ||
        (e.target instanceof Element &&
          e.target.closest(
            'button,a,input,select,textarea,[role="slider"],[role="dialog"]',
          ))
      )
        return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [dialog, toggle]);
  useEffect(() => {
    const el = rail.current?.querySelector<HTMLButtonElement>(
      '[aria-current="step"]',
    );
    if (!el || !rail.current) return;
    const target = el.offsetLeft - rail.current.clientWidth * 0.38;
    rail.current.scrollTo({
      left: Math.max(0, target),
      behavior: reduced ? 'instant' : 'smooth',
    });
  }, [index, reduced]);
  const displayProgress = reduced ? 1 : progress;
  const beat = Math.min(2, Math.floor(displayProgress * 3));
  const remaining = Math.ceil(
    ((scenes.length - index - progress) * DURATION) / speed,
  );
  return (
    <main
      className="committee"
      style={{ '--scene-accent': axis.color } as CSSProperties}
    >
      <header className="committee-header">
        <Link href="/" className="committee-brand">
          <span className="committee-brand-symbol">↗</span>
          <span>
            HISTORY IN MOTION<small>한국 AI 정책 아카이브</small>
          </span>
        </Link>
        <nav>
          <Link href="/en">
            OpenAI 편 <ArrowUpRight size={15} />
          </Link>
          <button onClick={() => setDialog('archive')}>
            <List size={17} /> {divisionInfo ? '분과 기록' : '전체 기록'}
          </button>
        </nav>
      </header>
      <section className="committee-title">
        <div>
          <p className="committee-eyebrow">
            2025.09.08 — 2026.09.08 <span>첫 1년의 기록</span>
          </p>
          <h1>
            국가AI전략위원회의
            <br />
            <em>1년을 잇다.</em>
          </h1>
        </div>
        <p>
          전략이 결정되고, 기술이 연결되고,
          <br />
          사람의 일상으로 향하기까지.
        </p>
      </section>
      <section className="committee-divisions" aria-label="분과별 여정 선택">
        <div className="committee-division-heading">
          <strong>분과별로 따라가기</strong>
          <span>출범 8개 → 2026년 3월 10개 분과</span>
        </div>
        <div className="committee-division-choices">
          <button
            aria-pressed={division === 'all'}
            onClick={() => onDivisionChange('all')}
          >
            전체 여정 <small>{scenesForDivision('all').length}</small>
          </button>
          {divisions.map((d) => (
            <button
              key={d.id}
              aria-pressed={division === d.id}
              onClick={() => onDivisionChange(d.id)}
            >
              {d.name}
              <small>{scenesForDivision(d.id).length}</small>
            </button>
          ))}
        </div>
        {divisionInfo ? (
          <div className="committee-division-intro">
            <div>
              <span>{divisionInfo.history}</span>
              <h2>{divisionInfo.question}</h2>
              <span>
                {date(scenes[0].date)} — {date(scenes.at(-1)!.date)} · 수록 기록
                범위
              </span>
            </div>
            <div className="committee-division-person">
              {divisionPhoto && (
                <img
                  src={divisionPhoto.src}
                  width={divisionPhoto.width}
                  height={divisionPhoto.height}
                  decoding="async"
                  alt={`${divisionInfo.chair} 프로필`}
                  style={{ objectPosition: divisionPhoto.objectPosition }}
                />
              )}
              <p>
                {divisionInfo.chair}
                <small>
                  {divisionInfo.person
                    ? '기록에 등장하는 분과장'
                    : '2026년 신설 분과'}{' '}
                  · {scenes.length}개 장면
                </small>
                <a
                  href={sources[divisionInfo.sources.at(-1)!].url}
                  target="_blank"
                  rel="noreferrer"
                >
                  분과 구성 근거 ↗
                </a>
              </p>
            </div>
          </div>
        ) : (
          <p className="committee-division-help">
            분과를 선택하면 논의와 현장 활동을 이어 봅니다. 과학·인재와 교육
            TF의 개편 전 기록도 함께 담았습니다.{' '}
            <a href={sources.organisation.url} target="_blank" rel="noreferrer">
              조직 변화 ↗
            </a>
          </p>
        )}
      </section>
      {divisionInfo && (
        <p className="committee-division-legend">
          ‘주관·참여’는 자료에 명시된 활동, ‘관련 의제’는 담당 분야와 연결해
          읽는 정책입니다. 수록 장면 수는 전체 회의 횟수나 성과 순위가 아닙니다.
        </p>
      )}
      <section className="committee-theater" aria-label="위원회 여정 재생">
        <aside className="committee-story" key={scene.id}>
          <div className="committee-story-top">
            <span>{AXES[scene.axis].name}</span>
            <small>
              {String(index + 1).padStart(2, '0')} / {scenes.length}
            </small>
          </div>
          <time dateTime={scene.date}>
            {date(scene.date)}
            {scene.endDate ? ` — ${date(scene.endDate)}` : ''}
          </time>
          <h2>{scene.title}</h2>
          <div className="committee-tags">
            <span>{scene.status}</span>
            <span>{scene.scope}</span>
          </div>
          <p>{scene.summary}</p>
          <div className="committee-scene-divisions">
            {(divisionLinks[scene.id] ?? [])
              .filter((l) => division === 'all' || l.division === division)
              .map((l) => (
                <span key={l.division}>
                  {divisions.find((d) => d.id === l.division)?.name} ·{' '}
                  {l.relation}
                </span>
              ))}
          </div>
          {scene.secondarySpeaker && (
            <p className="committee-prop-note">
              <strong>{scene.object.title}</strong>
              {scene.object.text}
            </p>
          )}
          <div className="committee-beat">
            <span>장면 속 이야기</span>
            <div className="committee-caption-stack">
              {scene.beats.map((text, i) => (
                <p
                  key={text}
                  style={{
                    opacity: captionWeight(displayProgress, i),
                    transform: `translateY(${(1 - captionWeight(displayProgress, i)) * (i < beat ? -6 : 6)}px)`,
                  }}
                  aria-hidden={i !== beat}
                >
                  {text}
                </p>
              ))}
            </div>
          </div>
          <button
            className="committee-details"
            onClick={() => setDialog('sources')}
          >
            <BookOpen size={17} /> 사건 자세히 · 근거 자료{' '}
            <MoveUpRight size={17} />
          </button>
        </aside>
        <div
          className={`committee-stage${scene.secondarySpeaker ? ' committee-stage-duo' : ''}`}
        >
          <div className="committee-stage-meta">
            <span>한 무대, 이어지는 기록</span>
            <span>
              {scene.scope === '위원회 활동' ? 'COMMITTEE' : 'POLICY CONTEXT'}
            </span>
          </div>
          <Stage
            onReady={onReady}
            scene={scene}
            previous={previous === null ? null : scenes[previous]}
            clock={clock}
            projection={projection}
          />
          <svg className="committee-leaders" aria-hidden="true">
            <path
              ref={(el) => {
                projection.current.objectLine = el;
              }}
            />
            <path
              ref={(el) => {
                projection.current.speakerLine = el;
              }}
            />
          </svg>
          <div
            className={
              scene.secondarySpeaker
                ? 'committee-speaker committee-speaker-secondary'
                : 'committee-object'
            }
            ref={(el) => {
              projection.current.object = el;
            }}
          >
            {scene.secondarySpeaker ? (
              <SpeakerCard speaker={cast[0]} />
            ) : (
              <>
                <span className="committee-dot" />
                <strong>{scene.object.title}</strong>
                <p>{scene.object.text}</p>
              </>
            )}
          </div>
          <div
            className="committee-speaker"
            ref={(el) => {
              projection.current.speaker = el;
            }}
          >
            <SpeakerCard speaker={scene.speaker} />
          </div>
        </div>
      </section>
      <section className="committee-player" aria-label="재생 조작">
        <div className="committee-play-buttons">
          <button
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="이전 장면"
          >
            <ArrowLeft size={19} />
          </button>
          <button
            className="committee-play"
            onClick={toggle}
            disabled={reduced}
            aria-label={playing ? '일시정지' : '재생'}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
            <span>
              {index === scenes.length - 1 && progress >= 1
                ? '처음부터'
                : playing
                  ? '일시정지'
                  : '재생'}
            </span>
          </button>
          <button
            onClick={() => go(index + 1)}
            disabled={index === scenes.length - 1}
            aria-label="다음 장면"
          >
            <ArrowRight size={19} />
          </button>
          <button
            onClick={() => {
              startTime.current = navigationStart(playing, reduced);
              setReplay((v) => v + 1);
              setProgress(startTime.current / DURATION);
            }}
            disabled={reduced}
            aria-label="현재 장면 다시 보기"
          >
            <RotateCcw size={17} />
          </button>
        </div>
        <div className="committee-scrub">
          <Slider
            aria-label="현재 장면 재생 위치"
            min={0}
            max={24}
            step={0.1}
            value={[displayProgress * DURATION]}
            disabled={reduced}
            onValueChange={(v) => {
              const t = Array.isArray(v) ? v[0] : v;
              setPlaying(false);
              tween.current?.time(t, true);
              clock.current.time = t;
              setProgress(t / DURATION);
            }}
          />
          <span>{Math.round(displayProgress * 24)}초 / 24초</span>
        </div>
        <label className="committee-speed">
          재생 속도
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            {[0.5, 1, 1.5, 2, 3, 5].map((v) => (
              <option key={v} value={v}>
                {v}×
              </option>
            ))}
          </select>
        </label>
        <span className="committee-remaining">
          {Math.floor(remaining / 60)}분 {remaining % 60}초 남음
        </span>
      </section>
      {reduced && (
        <p className="committee-motion-note">
          기기의 동작 줄이기 설정에 따라 완성된 장면을 표시합니다. 이전·다음으로
          기록을 읽을 수 있어요.
        </p>
      )}
      <section
        className="committee-timeline"
        aria-label="세 축의 사건 타임라인"
      >
        <div className="committee-axis-labels">
          {Object.values(AXES).map((a) => (
            <span key={a.name}>
              <i style={{ background: a.color }} />
              {a.name}
            </span>
          ))}
        </div>
        <div className="committee-rail" ref={rail}>
          <div
            className="committee-track-grid"
            style={{ width: scenes.length * 132 }}
          >
            <div
              className="committee-playhead"
              style={{ left: (index + progress) * 132 }}
            />
            {(Object.keys(AXES) as Axis[]).map((a) => (
              <div className="committee-track" key={a}>
                {scenes.map((s, i) => (
                  <div className="committee-track-slot" key={s.id}>
                    {s.axis === a && (
                      <button
                        style={
                          { '--item-accent': AXES[a].color } as CSSProperties
                        }
                        onClick={() => go(i)}
                        aria-current={i === index ? 'step' : undefined}
                      >
                        <small>{s.date.slice(2).replaceAll('-', '.')}</small>
                        <span>{s.short}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="committee-footer">
        <span>{scenes.length}개 장면 · 3개의 축 · 공개 자료 기반</span>
        <span>사건 기준일 2026.09.08 · 비공식 해설 아카이브</span>
        <button onClick={() => setDialog('sources')}>
          출처와 해설 기준 <ArrowUpRight size={14} />
        </button>
      </footer>
      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      >
        <DialogContent className="committee-dialog">
          <DialogTitle>
            {dialog === 'archive'
              ? divisionInfo
                ? `${divisionInfo.name}의 기록`
                : '첫 1년, 전체 기록'
              : scene.title}
          </DialogTitle>
          <DialogDescription>
            {dialog === 'archive'
              ? '각 사건을 선택하면 해당 무대로 이동합니다.'
              : '발표 당시의 사실과 이후의 계획을 구분해 읽습니다.'}
          </DialogDescription>
          {dialog === 'archive' ? (
            <>
              <div className="committee-filters">
                {(['all', ...Object.keys(AXES)] as (Axis | 'all')[]).map(
                  (a) => (
                    <button
                      key={a}
                      aria-pressed={filter === a}
                      onClick={() => setFilter(a)}
                    >
                      {a === 'all' ? '전체' : AXES[a].name}
                    </button>
                  ),
                )}
              </div>
              <div className="committee-archive">
                {scenes.map((s, i) =>
                  filter !== 'all' && s.axis !== filter ? null : (
                    <button
                      key={s.id}
                      onClick={() => {
                        go(i);
                        setDialog(null);
                      }}
                    >
                      <time>{date(s.date)}</time>
                      <div>
                        <strong>{s.short}</strong>
                        <p>{s.summary}</p>
                      </div>
                      <span>{s.status}</span>
                    </button>
                  ),
                )}
              </div>
            </>
          ) : (
            <div className="committee-evidence">
              <p className="committee-evidence-date">
                {date(scene.date)} · {scene.scope} · {scene.status}
              </p>
              <h3>무슨 일이 있었나</h3>
              <ul>
                {scene.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <h3>이 여정에서의 의미</h3>
              <p>{scene.meaning}</p>
              {!!divisionLinks[scene.id]?.length && (
                <>
                  <h3>이 분과가 한 일</h3>
                  {divisionLinks[scene.id].map((l) => (
                    <div
                      className="committee-division-evidence"
                      key={l.division}
                    >
                      <strong>
                        {divisions.find((d) => d.id === l.division)?.name} ·{' '}
                        {l.relation}
                      </strong>
                      <p>{l.note}</p>
                      <a
                        href={sources[l.source].url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        활동 관계 근거 ↗
                      </a>
                    </div>
                  ))}
                </>
              )}
              <h3>어디까지 확인됐나</h3>
              <p>{scene.boundary}</p>
              <h3>이어지는 의제</h3>
              <p>{scene.bridge}</p>
              <h3>근거 자료</h3>
              {scene.sources.map((id) => {
                const s = sources[id];
                return (
                  <a
                    className="committee-source"
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    key={id}
                  >
                    <strong>{s.title} ↗</strong>
                    <span>
                      {s.publisher} · {s.published} · {s.kind}
                    </span>
                  </a>
                );
              })}
              <h3>인물과 표현</h3>
              <p>
                {scene.speaker.mode === '정책 설명'
                  ? '인물의 역할과 관련 정책을 설명하는 편집 문장입니다. 실제 발언이나 직접 인용이 아닙니다.'
                  : '발언은 연결된 자료에 근거합니다. 발언 요지는 뜻을 간추린 문장으로 직접 인용과 구분합니다.'}{' '}
                무대는 사건을 이해하기 위한 재구성이며 실제 현장의 복제가
                아닙니다.
              </p>
              {scene.secondarySpeaker && (
                <a
                  className="committee-source"
                  href={
                    portraits[
                      scene.secondarySpeaker.person as keyof typeof portraits
                    ].sourceUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <strong>
                    {PEOPLE[scene.secondarySpeaker.person].name} 사진 출처 ↗
                  </strong>
                  <span>
                    {
                      portraits[
                        scene.secondarySpeaker.person as keyof typeof portraits
                      ].credit
                    }{' '}
                    · 관련 활동 설명은 직접 인용이 아닙니다.
                  </span>
                </a>
              )}
              {photo && (
                <>
                  <a
                    className="committee-source"
                    href={photo.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <strong>
                      {PEOPLE[scene.speaker.person].name} 사진 출처 ↗
                    </strong>
                    <span>{photo.credit}</span>
                  </a>
                  <p className="committee-credit">
                    사진의 권리는 원저작자에게 있습니다. 프로필 사진은 사건 당시
                    촬영된 사진을 뜻하지 않습니다.
                  </p>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
