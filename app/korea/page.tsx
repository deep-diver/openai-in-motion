import type { Metadata } from 'next';
import CommitteeExperience from '@/components/committee/CommitteeExperience';
export const metadata: Metadata = {
  title: '국가AI전략위원회 — 첫 1년의 기록',
  description:
    '2025년 9월 8일부터 2026년 9월 8일까지. 전략과 결정, 기술과 인프라, 사람과 현장이 연결되는 3D 모션 아카이브.',
};
export default function Page() {
  return <CommitteeExperience />;
}
