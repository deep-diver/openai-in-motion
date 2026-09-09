import definitions from './divisions.json';
import links from './division-links.json';
import { scenes } from './scenes';
import type { PersonId } from './types';
export type DivisionId =
  | 'technology'
  | 'industry'
  | 'public'
  | 'data'
  | 'society'
  | 'global'
  | 'science'
  | 'defense'
  | 'education'
  | 'democracy';
export type DivisionSelection = DivisionId | 'all';
export type DivisionLink = {
  division: DivisionId;
  relation:
    | '주관'
    | '공동 주최'
    | '참여'
    | '조직 개편'
    | '성과 보고'
    | '관련 의제';
  note: string;
  source: string;
};
export const divisions = definitions as {
  id: DivisionId;
  name: string;
  chair: string;
  question: string;
  history: string;
  sources: string[];
  person: PersonId | null;
}[];
export const divisionLinks = links as Record<string, DivisionLink[]>;
export function scenesForDivision(division: DivisionSelection) {
  return division === 'all'
    ? scenes
    : scenes.filter((s) =>
        divisionLinks[s.id]?.some((l) => l.division === division),
      );
}
