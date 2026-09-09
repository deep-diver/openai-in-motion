/* eslint-disable next/no-img-element -- Credited local profile photographs. */
import portraits from '@/data/committee/portraits.json';
import { PEOPLE, type SceneSpeaker } from '@/data/committee/types';
export default function SpeakerCard({ speaker }: { speaker: SceneSpeaker }) {
  const photo = portraits[speaker.person as keyof typeof portraits];
  return (
    <>
      <div className="committee-identity">
        {photo && (
          <span className="committee-face">
            <img
              src={photo.dataUri}
              width={photo.width}
              height={photo.height}
              decoding="async"
              alt={PEOPLE[speaker.person].name}
              style={{
                objectPosition: photo.objectPosition,
                ...(speaker.person === 'cha'
                  ? { transform: 'scale(1.5)', transformOrigin: '50% 20%' }
                  : {}),
              }}
            />
          </span>
        )}
        <div>
          <strong>{PEOPLE[speaker.person].name}</strong>
          <span>{speaker.role}</span>
        </div>
      </div>
      <p>{speaker.mode === '직접 인용' ? `“${speaker.text}”` : speaker.text}</p>
      <small>
        {speaker.mode === '정책 설명'
          ? '관련 활동 설명 · 실제 대사 아님'
          : speaker.mode}
      </small>
    </>
  );
}
