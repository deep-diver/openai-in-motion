'use client';
import { useLocale } from './Locale';
import { useEffect, useRef } from 'react';
import { Cpu, Flag, GitBranch } from 'lucide-react';
import { AXES, type Axis, type Chapter } from '@/data/types';
const axes: Axis[] = ['model', 'milestone', 'event'];
const icons = { model: Cpu, milestone: Flag, event: GitBranch };
const CELL = 126;
export function TimelineTracks({
  chapters,
  active,
  progress = 0,
  onSelect,
  reducedMotion,
}: {
  chapters: Chapter[];
  active: number;
  progress?: number;
  onSelect: (n: number) => void;
  reducedMotion: boolean;
}) {
  const { t } = useLocale();
  const axisLabel = (axis: Axis) =>
    t(
      AXES[axis].label,
      { model: 'Models', milestone: 'Milestones', event: 'Turning points' }[
        axis
      ],
    );
  const scroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!scroll.current) return;
    const x = active * CELL;
    const element = scroll.current;
    if (
      x < element.scrollLeft ||
      x + CELL > element.scrollLeft + element.clientWidth
    )
      element.scrollTo({
        left: Math.max(0, x - element.clientWidth * 0.4),
        behavior: reducedMotion ? 'instant' : 'smooth',
      });
  }, [active, reducedMotion]);
  return (
    <div className="tracks-layout">
      <div className="track-headings">
        <div className="track-heading-spacer mono">THREE THREADS</div>
        {axes.map((axis) => {
          const Icon = icons[axis];
          return (
            <div
              className="track-heading"
              key={axis}
              style={{ color: AXES[axis].color }}
            >
              <Icon size={14} />
              <span>
                {axisLabel(axis)}
                <small>
                  {chapters.filter((c) => c.axis === axis).length} scenes
                </small>
              </span>
            </div>
          );
        })}
      </div>
      <div
        className="tracks-scroll"
        ref={scroll}
        aria-label={t(
          '세 축으로 보는 상세 연대기',
          'Detailed timeline in three threads',
        )}
      >
        <div className="tracks-inner" style={{ width: chapters.length * CELL }}>
          <div className="track-date-row">
            {chapters.map((chapter, i) => (
              <div
                key={chapter.id}
                className={i === active ? 'current-date' : ''}
                style={{ width: CELL }}
              >
                <strong>
                  {i === 0 ||
                  chapter.date.slice(0, 4) !== chapters[i - 1].date.slice(0, 4)
                    ? chapter.date.slice(0, 4)
                    : ''}
                </strong>
                <span>
                  {chapter.dateLabel ?? chapter.date.slice(5).replace('-', '.')}
                </span>
              </div>
            ))}
          </div>
          <div
            className="track-playhead"
            aria-hidden="true"
            style={{
              left: Math.min(
                chapters.length * CELL - 1,
                (active + Math.max(0, Math.min(1, progress))) * CELL + 15,
              ),
              transition: reducedMotion ? 'none' : 'left 0.1s linear',
            }}
          />
          {axes.map((axis) => (
            <div
              key={axis}
              className="timeline-track"
              style={
                { '--track-color': AXES[axis].color } as React.CSSProperties
              }
            >
              {chapters.map((chapter, i) => (
                <div
                  className="track-cell"
                  key={chapter.id}
                  style={{ width: CELL }}
                >
                  {chapter.axis === axis ? (
                    <button
                      className={`track-event ${i === active ? 'selected' : ''} ${i < active ? 'past' : ''}`}
                      aria-current={i === active ? 'step' : undefined}
                      aria-label={`${chapter.dateLabel ?? chapter.date}, ${axisLabel(axis)}, ${chapter.title}`}
                      onClick={() => onSelect(i)}
                    >
                      <span className="event-dot" />
                      <span>{chapter.short}</span>
                    </button>
                  ) : (
                    <span className="track-empty" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
