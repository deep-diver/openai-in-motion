'use client';
/* eslint-disable next/no-img-element -- Locally bundled, credited portraits need no remote image proxy. */
import { useState, type CSSProperties } from 'react';
import { PEOPLE, type PersonId } from '@/data/types';
import { portraits } from '@/data/portraits';
import { useLocale } from './Locale';

/** Public profile photography, independent of the scene's symbolic 3D miniature. */
export function PersonPortrait({ person }: { person: PersonId }) {
  const { t } = useLocale();
  const [failed, setFailed] = useState(false);
  const profile = PEOPLE[person];
  const portrait = portraits[person];
  const name = t(profile.name, profile.english);
  const crop = portrait?.crop;
  const imageStyle: CSSProperties = crop
    ? {
        position: 'absolute',
        width: `${(crop.imageWidth / crop.width) * 100}%`,
        height: `${(crop.imageHeight / crop.height) * 100}%`,
        maxWidth: 'none',
        left: `${(-crop.left / crop.width) * 100}%`,
        top: `${(-crop.top / crop.height) * 100}%`,
        objectFit: 'fill',
      }
    : { objectPosition: portrait?.objectPosition ?? '50% 35%' };
  return (
    <span className="person-portrait">
      {portrait && !failed ? (
        <img
          src={portrait.src}
          alt={t(`${name}의 프로필 사진`, `Portrait of ${name}`)}
          width={64}
          height={64}
          decoding="async"
          style={imageStyle}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="portrait-fallback">
          <span aria-hidden="true">
            {profile.english
              .split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')}
          </span>
          <span className="sr-only">
            {t(
              `${name}의 사진을 불러올 수 없습니다`,
              `Photo unavailable for ${name}`,
            )}
          </span>
        </span>
      )}
    </span>
  );
}
