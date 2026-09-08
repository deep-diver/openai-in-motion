import type { Metadata } from 'next';
import HistoryExperience from '@/components/timeline/HistoryExperience';
export const metadata: Metadata = {
  title: 'OpenAI — A History in Motion',
  description:
    'Explore OpenAI from 2015 to 2026 through 44 animated scenes: models, milestones and people on one isometric stage.',
};
export default function Page() {
  return <HistoryExperience initialLocale="en" />;
}
