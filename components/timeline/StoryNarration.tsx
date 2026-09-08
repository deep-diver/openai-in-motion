'use client';
import { useLocale } from './Locale';
import { Slider } from '@base-ui/react/slider';
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
  const { t } = useLocale();
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
              transform: `translateY(${reducedMotion ? 0 : (i - position) * 100}%)`,
            }}
          >
            <strong>{beat.title}</strong>
            <p>{beat.caption}</p>
          </div>
        ))}
      </div>
      <div className="story-scrubber">
        <Slider.Root
          className="continuous-slider"
          data-slot="slider"
          min={0}
          max={STORY_TIMING.duration}
          step={0.1}
          largeStep={1}
          value={[time]}
          thumbAlignment="edge"
          aria-label={t(
            '현재 장면의 재생 위치',
            'Playback position in this scene',
          )}
          onValueChange={(value) => {
            onScrub();
            onSeek({
              serial: Date.now(),
              progress:
                (Array.isArray(value) ? value[0] : value) /
                STORY_TIMING.duration,
            });
          }}
        >
          <Slider.Control className="narration-slider-control">
            <Slider.Track data-slot="slider-track">
              <Slider.Indicator data-slot="slider-range" />
            </Slider.Track>
            <Slider.Thumb
              data-slot="slider-thumb"
              getAriaLabel={() =>
                t(
                  `${chapter.title}, 재생 위치`,
                  `${chapter.title}, playback position`,
                )
              }
              getAriaValueText={(_, seconds) =>
                t(
                  `${seconds.toFixed(1)}초 / ${STORY_TIMING.duration}초`,
                  `${seconds.toFixed(1)} of ${STORY_TIMING.duration} seconds`,
                )
              }
            />
          </Slider.Control>
        </Slider.Root>
        <div className="story-cue-points">
          {chapter.beats.map((beat, i) => (
            <button
              key={i}
              title={beat.title}
              aria-label={t(
                `${beat.title} 부분으로 이동`,
                `Jump to ${beat.title}`,
              )}
              style={{ left: `${(cueTime(i) / STORY_TIMING.duration) * 100}%` }}
              onClick={() => onSeek({ serial: Date.now(), beat: i })}
            >
              <span />
            </button>
          ))}
        </div>
      </div>
      <div className="scrubber-meta">
        <span>{t('하나로 이어지는 이야기', 'One continuous story')}</span>
        <span className="mono">
          {time.toFixed(1)} / {STORY_TIMING.duration.toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
