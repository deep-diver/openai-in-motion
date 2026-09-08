import peopleData from './people.json';
export type Axis = 'model' | 'milestone' | 'event';
export type SetDesign =
  | 'lab'
  | 'language'
  | 'image'
  | 'code'
  | 'voice'
  | 'chat'
  | 'reasoning'
  | 'investment'
  | 'organization'
  | 'board'
  | 'infrastructure'
  | 'agent'
  | 'future'
  | 'gym'
  | 'game'
  | 'robotics'
  | 'alignment'
  | 'film';
export type Action =
  | 'reveal'
  | 'pulse'
  | 'grow'
  | 'rise'
  | 'write'
  | 'walk'
  | 'leave'
  | 'arrive'
  | 'scatter'
  | 'connect'
  | 'open'
  | 'orbit'
  | 'tilt'
  | 'stamp';
export type StoryBeat = {
  title: string;
  caption: string;
  actions: { target: string; action: Action }[];
};
export type PersonId = keyof typeof peopleData;
export type Chapter = {
  id: string;
  date: string;
  dateLabel?: string;
  axis: Axis;
  title: string;
  short: string;
  description: string;
  detail: string;
  set: SetDesign;
  model?: string;
  people: PersonId[];
  sources: { title: string; url: string }[];
  beats: [StoryBeat, StoryBeat, StoryBeat];
  concept?: boolean;
  personRoles?: Partial<Record<PersonId, string>>;
};
export const AXES: Record<
  Axis,
  { label: string; english: string; color: string }
> = {
  model: { label: '모델의 진화', english: 'MODELS', color: '#a9caff' },
  milestone: { label: '큰 이정표', english: 'MILESTONES', color: '#c6f77d' },
  event: { label: '주요 사건', english: 'TURNING POINTS', color: '#e7b0e7' },
};
export const PEOPLE: Record<
  PersonId,
  {
    name: string;
    english: string;
    role: string;
    color: string;
    hair: string;
    skin: string;
    glasses?: boolean;
  }
> = peopleData;
