'use client';
import { Slider } from '@/components/ui/slider';
import type { Chapter } from '@/data/types';
import {
  captionWeights,
  cueTime,
  STORY_TIMING,
  type StorySeek,
} from './storyClock';

export function StoryNarration({
  chapter,
  progress,
  playing,
  reducedMotion,
  onSeek,
  onScrub,
}: {
  chapter: Chapter;
  progress: number;
  playing: boolean;
  reducedMotion: boolean;
  onSeek: (seek: StorySeek) => void;
  onScrub: () => void;
}) {
  const time = progress * STORY_TIMING.duration;
  const weights = captionWeights(time);
  const position = weights[1] + weights[2] * 2;
  const dominant = weights[2] >= 0.5 ? 2 : weights[1] >= 0.5 ? 1 : 0;
  return (
    <div className="story-caption continuous-narration">
      <div className="narration-window" aria-live={playing ? 'off' : 'polite'}>
        {chapter.beats.map((beat, i) => (
          <div
            className="narration-line"
            key={`${chapter.id}-${i}`}
            aria-hidden={i !== dominant}
            style={{
              opacity: reducedMotion ? (i === dominant ? 1 : 0) : weights[i],
              transform: `translateY(${reducedMotion ? 0 : (i - position) * 88}px)`,
            }}
          >
            <strong>{beat.title}</strong>
            <p>{beat.caption}</p>
          </div>
        ))}
      </div>
      <div className="story-scrubber">
        <Slider
          className="continuous-slider"
          min={0}
          max={1}
          step={0.001}
          value={[progress]}
          aria-label="현재 장면의 재생 위치"
          onValueChange={(value) => {
            onScrub();
            onSeek({
              serial: Date.now(),
              progress: Array.isArray(value) ? value[0] : value,
            });
          }}
        />
        <div className="story-cue-points">
          {chapter.beats.map((beat, i) => (
            <button
              key={i}
              title={beat.title}
              aria-label={`${beat.title} 부분으로 이동`}
              style={{ left: `${(cueTime(i) / STORY_TIMING.duration) * 100}%` }}
              onClick={() => onSeek({ serial: Date.now(), beat: i })}
            >
              <span />
            </button>
          ))}
        </div>
      </div>
      <div className="scrubber-meta">
        <span>하나로 이어지는 이야기</span>
        <span className="mono">
          {time.toFixed(1)} / {STORY_TIMING.duration.toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
