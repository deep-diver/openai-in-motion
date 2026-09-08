'use client';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import gsap from 'gsap';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  Info,
  Pause,
  Play,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { TimelineTracks } from '@/components/timeline/TimelineTracks';
import { useTimelineInput } from '@/components/timeline/useTimelineInput';
import { chapters } from '@/data/chapters';
import { AXES, PEOPLE } from '@/data/types';
import type { StoryFrame } from '@/components/timeline/storyDirector';
import {
  dialogueWindow,
  staticSpeaker,
  STORY_TIMING,
  type StorySeek,
} from '@/components/timeline/storyClock';
import { StoryNarration } from '@/components/timeline/StoryNarration';
const Stage = dynamic(() => import('@/components/timeline/Stage'), {
  ssr: false,
  loading: () => <div className="scene-loader">다음 이야기를 준비하는 중…</div>,
});
const years = [...new Set(chapters.map((c) => c.date.slice(0, 4)))];
export default function Home() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [seek, setSeek] = useState<StorySeek | null>(null);
  const [frame, setFrame] = useState<StoryFrame>({
    chapterId: chapters[0].id,
    progress: 0,
    beat: 0,
    phase: 'transition',
  });
  const chapter = chapters[step];
  const axis = AXES[chapter.axis];
  const activeBeat = frame.chapterId === chapter.id ? frame.beat : 0;
  const progress = frame.chapterId === chapter.id ? frame.progress : 0;
  const activeSpeaker = staticSpeaker(
    chapter,
    progress * STORY_TIMING.duration,
  );
  const finished =
    step === chapters.length - 1 && progress >= 0.999 && !playing;
  const remaining = Math.ceil(
    ((chapters.length - step - progress) * STORY_TIMING.duration) / speed,
  );
  const copyRef = useRef<HTMLElement>(null);
  const stateRef = useRef({
    step,
    playing,
    autoAdvance,
    reducedMotion,
    progress,
  });
  useLayoutEffect(() => {
    stateRef.current = { step, playing, autoAdvance, reducedMotion, progress };
  }, [step, playing, autoAdvance, reducedMotion, progress]);
  const navigate: Dispatch<SetStateAction<number>> = useCallback((next) => {
    setSeek(null);
    setStep((current) =>
      Math.max(
        0,
        Math.min(
          chapters.length - 1,
          typeof next === 'function' ? next(current) : next,
        ),
      ),
    );
  }, []);
  useTimelineInput(navigate, infoOpen, chapters.length);
  const togglePlay = useCallback(() => {
    const state = stateRef.current;
    if (state.reducedMotion) return;
    if (state.progress >= 0.999 && !state.playing) {
      if (state.step === chapters.length - 1) setStep(0);
      setReplayKey((k) => k + 1);
      setSeek(null);
      setPlaying(true);
    } else setPlaying((p) => !p);
  }, []);
  const onFrame = useCallback((next: StoryFrame) => setFrame(next), []);
  const onComplete = useCallback((id: string) => {
    const state = stateRef.current;
    if (chapters[state.step].id !== id) return;
    if (
      state.playing &&
      state.autoAdvance &&
      !state.reducedMotion &&
      state.step < chapters.length - 1
    ) {
      setSeek(null);
      setStep(state.step + 1);
    } else setPlaying(false);
  }, []);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(media.matches);
      if (media.matches) setPlaying(false);
    };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (
        event.code !== 'Space' ||
        event.isComposing ||
        event.shiftKey ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        infoOpen ||
        (event.target instanceof Element &&
          event.target.closest(
            'button,a,input,textarea,[role="slider"],[data-slot="slider"],[role="switch"],[role="dialog"]',
          ))
      )
        return;
      event.preventDefault();
      if (event.repeat) return;
      togglePlay();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [infoOpen, togglePlay]);
  useLayoutEffect(() => {
    if (!copyRef.current || reducedMotion) return;
    const children = copyRef.current.children;
    const tween = gsap.fromTo(
      children,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.03, ease: 'power2.out' },
    );
    return () => {
      tween.kill();
      gsap.set(children, { clearProps: 'opacity,transform' });
    };
  }, [step, reducedMotion]);
  const replay = () => {
    setReplayKey((v) => v + 1);
    setSeek(null);
    setPlaying(!reducedMotion);
  };
  return (
    <main
      className="app-shell documentary"
      style={{ '--accent': axis.color } as React.CSSProperties}
    >
      <header className="site-header">
        <div className="brand">
          <Asterisk strokeWidth={1.5} />
          <span>OpenAI</span>
          <span className="brand-divider" />
          <span className="brand-sub">A history in motion</span>
        </div>
        <div className="header-center">
          MODELS <span>·</span> MILESTONES <span>·</span> PEOPLE
        </div>
        <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
          <DialogTrigger className="about-button">
            이 여정에 대하여 <Info size={15} />
          </DialogTrigger>
          <DialogContent className="max-w-xl p-7 max-h-[85svh] overflow-y-auto">
            <DialogTitle className="text-xl">
              하나의 무대, 세 갈래의 역사
            </DialogTitle>
            <DialogDescription>
              2015–2026 · {chapters.length}개 장면의 움직이는 연대기
            </DialogDescription>
            <div className="dialog-article">
              <p>
                모델의 변천, 큰 이정표, 조직의 주요 사건을 서로 다른 세 축으로
                따라갑니다. 각 장면의 동작과 대사는 하나의 재생 흐름으로
                이어집니다.
              </p>
              <p>
                재생하면 장면들이 순서대로 이어집니다. 스크롤과 방향키는 장면을
                이동하고, 스페이스바는 재생을 조절합니다. 하단의 점이나 연도를
                눌러 원하는 시점으로 바로 이동할 수 있습니다. 터치 화면에서는
                무대를 좌우로 밀어 장면을 바꾸고, 위아래로 밀어 페이지를
                읽습니다.
              </p>
              <p>
                인물과 공간은 사실을 설명하기 위한 상징적인 미니어처입니다. 실제
                모습·현장 동작·발언을 재현한 것이 아닙니다. 말풍선은 실제 인용이
                아닌 장면 설명을 위한 연출 대사입니다. 인물 역할은 각 공식
                발표의 저자·기여자 또는 당시 직책을 기준으로 합니다.
              </p>
              <p>
                날짜는 원칙적으로 공식 발표일이며, 확인된 정밀도에 따라 월
                단위로 표시한 장면도 있습니다. 마지막 AGI Hub는 미래 콘셉트로,
                AGI 달성을 의미하지 않습니다.
              </p>
              <p>
                OpenAI와 무관한 비공식 프로젝트입니다. 기록 확인 기준: 2026년
                9월 8일.
              </p>
              <div className="source-list">
                <p className="mono">현재 장면의 공식 출처</p>
                {chapter.sources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {source.title} ↗
                  </a>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>
      <section className="experience" aria-label="OpenAI 역사 다큐멘터리">
        <article
          className="chapter-copy"
          ref={copyRef}
          aria-live={playing ? 'off' : 'polite'}
          aria-atomic="true"
        >
          <div className="chapter-marker mono">
            <span className="live-dot" />
            {axis.english}
            <span className="chapter-separator">/</span>
            {String(step + 1).padStart(2, '0')} OF {chapters.length}
          </div>
          <div className="date-lockup">
            <h1 className="year-title">{chapter.date.slice(0, 4)}</h1>
            <span className="date-detail mono">
              {chapter.dateLabel ?? chapter.date.slice(5).replace('-', ' / ')}
            </span>
          </div>
          <h2 className="chapter-title">{chapter.title}</h2>
          <p className="chapter-desc">{chapter.description}</p>
          <div className="fact-note">
            <span className="fact-dot" />
            <p>{chapter.detail}</p>
          </div>
          {chapter.people.length > 0 && (
            <div className="cast-list">
              <p className="cast-heading">등장인물 · 눌러서 대사 보기</p>
              <div className="cast-members">
                {chapter.people.map((id, i) => {
                  const p = PEOPLE[id];
                  return (
                    <button
                      className={`cast-member ${activeSpeaker === i ? 'is-speaking' : ''}`}
                      key={id}
                      aria-pressed={activeSpeaker === i}
                      aria-label={`${p.name}의 연출 대사 보기`}
                      onClick={() => {
                        setPlaying(false);
                        setSeek({
                          serial: Date.now(),
                          progress:
                            (dialogueWindow(chapter, i).start + 1) /
                            STORY_TIMING.duration,
                        });
                      }}
                    >
                      <span
                        className="person-initial"
                        style={{ background: p.color }}
                      >
                        {p.english
                          .split(' ')
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join('')}
                      </span>
                      <div>
                        <strong>{p.name}</strong>
                        <small>{chapter.personRoles?.[id] ?? p.role}</small>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <a
            className="source-link"
            href={chapter.sources[0]?.url}
            target="_blank"
            rel="noreferrer"
          >
            <BookOpen size={12} /> 공식 기록 읽기 <ArrowUpRight size={12} />
          </a>
        </article>
        <div className="scene-view">
          <div className="scene-caption mono">
            <span className="live-dot" />
            {chapter.concept
              ? 'FUTURE CONCEPT'
              : playing
                ? 'STORY PLAYING'
                : 'STORY PAUSED'}
            <span className="caption-rule" />
            {String(step + 1).padStart(2, '0')}
          </div>
          <figure
            className="scene-canvas"
            aria-label={`${chapter.date}, ${chapter.title}. ${chapter.beats[activeBeat].caption}`}
          >
            <Stage
              chapter={chapter}
              playing={playing && !infoOpen}
              speed={speed}
              replayKey={replayKey}
              seek={seek}
              reducedMotion={reducedMotion}
              onFrame={onFrame}
              onComplete={onComplete}
            />
          </figure>
          <StoryNarration
            chapter={chapter}
            progress={progress}
            playing={playing}
            reducedMotion={reducedMotion}
            onSeek={setSeek}
            onScrub={() => setPlaying(false)}
          />
        </div>
      </section>
      <footer className="film-footer">
        <div className="playback-bar">
          <div className="playback-left">
            <button
              className="play-button"
              onClick={togglePlay}
              aria-label={
                finished
                  ? '전체 이야기 처음부터 재생'
                  : playing
                    ? '일시정지'
                    : '이야기 재생'
              }
              disabled={reducedMotion}
            >
              {playing ? <Pause size={17} /> : <Play size={17} />}
            </button>
            <button
              className="replay-button"
              onClick={replay}
              aria-label="현재 장면 다시 재생"
            >
              <RotateCcw size={15} />
            </button>
            <span className="playback-label">
              {reducedMotion
                ? '동작 줄이기 적용'
                : finished
                  ? '여정 완료'
                  : playing
                    ? '이야기 재생 중'
                    : '이야기 일시정지'}
            </span>
            <button
              className="speed-button mono"
              aria-label={`현재 ${speed}배속, 눌러서 재생 속도 변경`}
              onClick={() =>
                setSpeed((s) =>
                  s === 1 ? 1.5 : s === 1.5 ? 2 : s === 2 ? 3 : 1,
                )
              }
            >
              {speed}×
            </button>
          </div>
          <div className="journey-progress">
            <progress
              value={step + progress}
              max={chapters.length}
              aria-label="전체 이야기 진행률"
            />
            <span className="mono">
              {step + 1} / {chapters.length} ·{' '}
              {finished
                ? '완료'
                : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')} 남음`}
            </span>
          </div>
          <div className="playback-right">
            <label className="autoplay-label" htmlFor="auto-advance">
              이어 보기
              <Switch
                id="auto-advance"
                checked={autoAdvance}
                onCheckedChange={setAutoAdvance}
                aria-label="다음 장면 자동 재생"
                size="sm"
              />
            </label>
            <button
              className="scene-nav-button"
              disabled={step === 0}
              aria-label="이전 장면"
              onClick={() => navigate(step - 1)}
            >
              <ArrowLeft size={17} />
            </button>
            <button
              className="next-scene"
              onClick={() => {
                if (step === chapters.length - 1) {
                  navigate(0);
                  setPlaying(!reducedMotion);
                } else navigate(step + 1);
              }}
            >
              {step === chapters.length - 1 ? '처음부터' : '다음 장면'}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
        <div className="year-navigation">
          <span className="mono">EXPLORE THE ARCHIVE</span>
          <nav aria-label="연도 바로가기">
            {years.map((year) => (
              <button
                key={year}
                className={chapter.date.startsWith(year) ? 'current' : ''}
                aria-current={
                  chapter.date.startsWith(year) ? 'date' : undefined
                }
                onClick={() =>
                  navigate(chapters.findIndex((c) => c.date.startsWith(year)))
                }
              >
                {year}
              </button>
            ))}
          </nav>
          <span className="archive-count mono">{chapters.length} SCENES</span>
        </div>
        <TimelineTracks
          chapters={chapters}
          active={step}
          onSelect={navigate}
          reducedMotion={reducedMotion}
        />
        <div className="footer-bottom">
          <span>하나의 무대에서 이어지는 인공지능의 역사</span>
          <span className="keyboard-hint">
            <span className="keycap">← →</span> 장면 이동{' '}
            <span className="keycap">space</span> 재생 / 정지
          </span>
          <span className="mono">2015 — 2026</span>
        </div>
      </footer>
    </main>
  );
}
