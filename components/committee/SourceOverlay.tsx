'use client';
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions -- This reading region pauses playback across its native links and buttons on hover or focus; it is not itself a button. */
import { useEffect, useState } from 'react';
import { ArrowUpRight, BookOpen, X } from 'lucide-react';
import type { Scene } from '@/data/committee/types';
import { sources } from '@/data/committee/sources';
import { evidenceWindow } from './evidenceMotion';
export default function SourceOverlay({
  scene,
  progress,
  speed,
  reduced,
  onHold,
  onOpen,
}: {
  scene: Scene;
  progress: number;
  speed: number;
  reduced: boolean;
  onHold: (held: boolean) => void;
  onOpen: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const window = evidenceWindow(progress, speed, reduced);
  const visible = window.visible && !dismissed;
  const source = sources[scene.sources[0]];
  useEffect(() => {
    onHold(visible && (hovered || focused));
    return () => onHold(false);
  }, [visible, hovered, focused, onHold]);
  if (!visible) return null;
  return (
    <section
      className="committee-source-overlay"
      aria-label="이 장면의 근거 자료"
      style={{
        opacity: window.opacity,
        transform: `translateY(${(1 - window.opacity) * 12}px)`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div className="committee-source-overlay-heading">
        <span>
          <BookOpen size={16} /> 기록으로 확인하기
        </span>
        <button
          aria-label="이 장면의 근거 알림 닫기"
          onClick={() => setDismissed(true)}
        >
          <X size={17} />
        </button>
      </div>
      <p className="committee-source-overlay-publisher">
        {source.publisher} · {source.published.replaceAll('-', '.')}{' '}
        <span>{source.kind}</span>
      </p>
      <h3>{source.title}</h3>
      <div className="committee-source-overlay-actions">
        <a href={source.url} target="_blank" rel="noreferrer">
          원문 읽기 <ArrowUpRight size={15} />
        </a>
        <button onClick={onOpen}>
          근거 {scene.sources.length}건 모두 보기
        </button>
      </div>
      <p className="committee-source-overlay-hint">
        {hovered || focused
          ? '읽는 동안 재생을 잠시 멈췄어요'
          : '잠시 뒤 장면으로 돌아갑니다'}
      </p>
      <div className="committee-source-overlay-timer" aria-hidden="true">
        <i style={{ transform: `scaleX(${window.remaining})` }} />
      </div>
    </section>
  );
}
