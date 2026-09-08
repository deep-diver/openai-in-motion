'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useTimelineInput } from '@/components/timeline/useTimelineInput';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  Info,
  Sparkles,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import dynamic from 'next/dynamic';

const Stage = dynamic(() => import('@/components/timeline/Stage'), {
  ssr: false,
  loading: () => <div className="scene-loader">연구소를 준비하는 중…</div>,
});
const chapters = [
  {
    year: '2015',
    title: '작은 연구소, 커다란 질문.',
    desc: '인공지능이 모두에게 이로울 수 있을까? 화이트보드 위의 아이디어와 식지 않은 열정. 모든 것은 하나의 질문에서 시작됐습니다.',
    tags: ['THE BEGINNING', 'OPEN RESEARCH'],
    milestone: '2015년 12월 11일, 비영리 연구 기관 OpenAI 출범 발표.',
    label: 'The beginning',
    object: 'THE RESEARCH LAB',
    color: '#c6f77d',
  },
  {
    year: '2019',
    title: '가능성에, 규모를 더하다.',
    desc: 'Microsoft와의 파트너십으로 더 강력한 컴퓨팅 인프라를 마련합니다. 2020년, GPT-3는 언어 모델의 새로운 가능성을 보여줍니다.',
    tags: ['2019–2020', 'MICROSOFT × GPT-3'],
    milestone: '2019년 Microsoft의 10억 달러 투자. 2020년 GPT-3 발표.',
    label: 'The scale-up',
    object: 'THE COMPUTE ENGINE',
    color: '#9ac8ff',
  },
  {
    year: '2022',
    title: '세상이 대화를 시작하다.',
    desc: '질문 하나로 누구나 AI와 대화하는 시대. ChatGPT가 일상으로 스며들고, 2023년의 이사회 혼란은 또 다른 전환점이 됩니다.',
    tags: ['2022–2023', 'CHATGPT'],
    milestone: '2022년 11월 30일, ChatGPT 연구 프리뷰 공개.',
    label: 'The conversation',
    object: 'THE RIPPLE EFFECT',
    color: '#83e4c2',
  },
  {
    year: '2024',
    title: '상상하고, 깊이 생각하다.',
    desc: '텍스트가 움직이는 세계가 되고, AI는 답하기 전 더 오래 생각합니다. Sora와 o1이 창작과 추론의 경계를 확장합니다.',
    tags: ['SORA', 'REASONING · o1'],
    milestone: '2024년 Sora 공개, 9월 o1-preview 출시.',
    label: 'The new frontier',
    object: 'THE IMAGINATION LAB',
    color: '#c7b1ff',
  },
  {
    year: '2026',
    title: '다음 장은, 아직 쓰는 중.',
    desc: '로봇 공학, 에너지, 글로벌 컴퓨팅이 하나의 무대에 만납니다. AGI 데이터센터를 상상한 미래 콘셉트입니다.',
    tags: ['FUTURE CONCEPT', 'AGI HUB'],
    milestone:
      '이 장면은 상상적 시나리오이며, AGI 달성이나 실제 시설을 뜻하지 않습니다.',
    label: 'The possibility',
    object: 'A POSSIBLE FUTURE',
    color: '#ffcb8a',
  },
];
export default function Home() {
  const [step, setStep] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const chapter = chapters[step];
  const copyRef = useRef<HTMLElement>(null);
  useTimelineInput(setStep, infoOpen);
  useLayoutEffect(() => {
    if (!copyRef.current || reducedMotion) return;
    const children = copyRef.current.children;
    const tween = gsap.fromTo(
      children,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, stagger: 0.035, duration: 0.45, ease: 'power2.out' },
    );
    return () => {
      tween.kill();
      gsap.set(children, { clearProps: 'opacity,transform' });
    };
  }, [step, reducedMotion]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return (
    <main
      className="app-shell"
      style={{ '--accent': chapter.color } as React.CSSProperties}
    >
      <header className="site-header">
        <div className="brand">
          <Asterisk strokeWidth={1.5} />
          <span>OpenAI</span>
          <span className="brand-divider" />
          <span className="brand-sub">A history in motion</span>
        </div>
        <div className="header-center">
          ONE STAGE <span>·</span> A WORLD OF CHANGE
        </div>
        <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
          <DialogTrigger className="about-button">
            About this journey <Info size={15} />
          </DialogTrigger>
          <DialogContent className="max-w-lg p-7 max-h-[85svh] overflow-y-auto">
            <DialogTitle className="text-xl">이 여정에 대하여</DialogTitle>
            <DialogDescription>
              2015년의 시작부터, 아직 쓰이지 않은 다음 장까지.
            </DialogDescription>
            <div className="dialog-article">
              <p>
                다섯 개의 미니어처 장면으로 살펴보는 OpenAI의 역사입니다.
                스크롤, 방향키 또는 Next 버튼으로 다음 시대로 이동하세요.
              </p>
              <p>
                2019 장면은 2020년 GPT-3를, 2022 장면은 2023년 이사회 사건을
                함께 다룹니다. 2026 AGI Hub는 미래를 상상한 연출입니다.
              </p>
              <p>OpenAI와 무관한 비공식 인터랙티브 프로젝트입니다.</p>
              <div className="source-list">
                <p className="mono">OFFICIAL SOURCES</p>
                <a
                  href="https://openai.com/index/introducing-openai/"
                  target="_blank"
                  rel="noreferrer"
                >
                  2015 · Introducing OpenAI ↗
                </a>
                <a
                  href="https://openai.com/index/microsoft-invests-in-and-partners-with-openai/"
                  target="_blank"
                  rel="noreferrer"
                >
                  2019 · Microsoft partnership ↗
                </a>
                <a
                  href="https://openai.com/index/language-models-are-few-shot-learners/"
                  target="_blank"
                  rel="noreferrer"
                >
                  2020 · GPT-3 ↗
                </a>
                <a
                  href="https://openai.com/index/chatgpt/"
                  target="_blank"
                  rel="noreferrer"
                >
                  2022 · Introducing ChatGPT ↗
                </a>
                <a
                  href="https://openai.com/index/sam-altman-returns-as-ceo-openai-has-a-new-initial-board/"
                  target="_blank"
                  rel="noreferrer"
                >
                  2023 · Leadership & board ↗
                </a>
                <a
                  href="https://openai.com/index/video-generation-models-as-world-simulators/"
                  target="_blank"
                  rel="noreferrer"
                >
                  2024 · Sora research ↗
                </a>
                <a
                  href="https://openai.com/index/introducing-openai-o1-preview/"
                  target="_blank"
                  rel="noreferrer"
                >
                  2024 · o1-preview ↗
                </a>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>
      <section className="experience" aria-label="OpenAI 역사 타임라인">
        <article
          ref={copyRef}
          className="chapter-copy"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="chapter-marker mono">
            <span className="live-dot" />
            CHAPTER {String(step + 1).padStart(2, '0')}{' '}
            <span style={{ color: '#647258' }}> / </span> 05
          </div>
          <h1 className="year-title">{chapter.year}</h1>
          <h2 className="chapter-title">{chapter.title}</h2>
          <p className="chapter-desc">{chapter.desc}</p>
          <div className="chapter-tags">
            {chapter.tags.map((tag) => (
              <span className="chapter-tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <div className="milestone">
            <Sparkles size={17} />
            <div>
              <small className="mono">A MOMENT THAT MATTERED</small>
              <p>{chapter.milestone}</p>
            </div>
          </div>
        </article>
        <div className="scene-view">
          <div className="scene-caption mono">
            <span className="live-dot" />{' '}
            {step === 4 ? 'FUTURE CONCEPT' : 'LIVE DIORAMA'}{' '}
            <span style={{ color: '#5f6b53' }}> / </span>{' '}
            {String(step + 1).padStart(2, '0')}
          </div>
          <figure
            className="scene-canvas"
            aria-label={`${chapter.year}년 ${chapter.object} 3D 장면`}
          >
            <Stage step={step} reducedMotion={reducedMotion} />
          </figure>
          <div className="scene-label mono">
            <span />
            {chapter.object}
            <span />
          </div>
          <div className="scene-coordinate mono">↗ 35.264°</div>
        </div>
      </section>
      <footer className="timeline-footer">
        <div className="timeline-top">
          <span className="scroll-hint">
            <ArrowDown size={14} /> 스크롤하며 시간을 여행하세요
          </span>
          <span className="progress-meta mono">
            <strong>0{step + 1}</strong> / 05
          </span>
        </div>
        <div className="timeline-row">
          <nav className="chapter-nav" aria-label="연도 선택">
            <div
              className="chapter-progress"
              style={{ width: `${step * 25}%` }}
            />
            {chapters.map((item, index) => (
              <button
                type="button"
                key={item.year}
                onClick={() => setStep(index)}
                className={index === step ? 'active' : ''}
                aria-current={index === step ? 'step' : undefined}
                aria-label={`${item.year}년 ${item.label}`}
              >
                <strong className="mono">{item.year}</strong>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="navigation-buttons">
            <button
              className="previous-button"
              aria-label="이전 장면"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              <ArrowLeft size={17} />
            </button>
            <button
              className="next-button"
              onClick={() => setStep((s) => (s + 1) % 5)}
            >
              {step === 4 ? '처음으로' : 'Next chapter'}
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            An independent exploration of OpenAI <ArrowUpRight size={12} />
          </span>
          <span className="keyboard-hint">
            <span className="keycap">←</span>
            <span className="keycap">→</span> 키보드로도 탐색할 수 있어요
          </span>
          <span className="mono">2015 — 2026</span>
        </div>
      </footer>
    </main>
  );
}
