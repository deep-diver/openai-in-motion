import callouts from './object-callouts.json';
import dialogue from './cast-dialogue.json';
import type { PersonId } from './types';

export const OBJECT_IDS = [
  'hero',
  'work',
  'support',
  'data',
  'output',
] as const;
export type ObjectId = (typeof OBJECT_IDS)[number];
export type ObjectNote = { label: string; text: string };
export type DialogueLine = { person: PersonId; text: string };
export const OBJECT_NOTES = callouts as Record<
  string,
  Record<ObjectId, ObjectNote>
>;
export const CAST_DIALOGUE = dialogue as Record<string, DialogueLine[]>;

/** Two editorially chosen objects per scene; no rotating list of secondary labels. */
export const SECONDARY_OBJECT: Record<string, ObjectId> = {
  'openai-founding': 'work',
  'gym-beta': 'support',
  universe: 'data',
  'human-preferences': 'output',
  'dota-1v1': 'output',
  'musk-board-departure': 'support',
  'gpt-1': 'data',
  'openai-five': 'output',
  dactyl: 'work',
  'gpt-2-staged': 'output',
  'openai-lp': 'output',
  'microsoft-partnership': 'output',
  'gpt-2-full': 'output',
  'gpt-3': 'data',
  'api-private-beta': 'output',
  clip: 'work',
  'dall-e': 'work',
  'codex-2021': 'output',
  instructgpt: 'output',
  'dall-e-2': 'work',
  whisper: 'work',
  'chatgpt-launch': 'output',
  'microsoft-partnership-2023': 'support',
  'gpt-4-2023': 'output',
  'devday-2023': 'work',
  'board-removal-2023': 'support',
  'altman-return-2023': 'support',
  'sora-research-2024': 'work',
  'gpt-4o-2024': 'output',
  'chief-scientist-transition-2024': 'output',
  'o1-preview-2024': 'work',
  'stargate-2025': 'work',
  'gpt-4-1-2025': 'work',
  'o3-o4-mini-2025': 'output',
  'gpt-5-2025': 'data',
  'recapitalization-2025': 'support',
  'gpt-5-1-2025': 'support',
  'gpt-5-2-2025': 'data',
  'gpt-5-3-codex-2026': 'work',
  'gpt-5-4-2026': 'work',
  'gpt-5-5-2026': 'output',
  'gpt-5-6-2026': 'data',
  'gpt-6-astra-2026': 'work',
  'future-agi-hub': 'data',
};
export function importantObjects(chapterId: string): readonly ObjectId[] {
  return ['hero', SECONDARY_OBJECT[chapterId] ?? 'output'];
}
