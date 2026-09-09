export type Axis = 'strategy' | 'infrastructure' | 'society';
export type SetKind =
  | 'organisation'
  | 'defense'
  | 'media'
  | 'civic'
  | 'compute-routing'
  | 'democracy'
  | 'document-format'
  | 'assembly'
  | 'network'
  | 'compute'
  | 'models'
  | 'resilience'
  | 'workshop'
  | 'diplomacy'
  | 'document'
  | 'rights'
  | 'school'
  | 'science'
  | 'factory'
  | 'mobility'
  | 'energy'
  | 'data'
  | 'city'
  | 'handover';
export type Source = {
  title: string;
  url: string;
  publisher: string;
  published: string;
  kind: '공식 자료' | '언론 보도' | '당사자 자료';
};
export type PersonId =
  | 'lee'
  | 'lim'
  | 'bae'
  | 'ha'
  | 'cha'
  | 'bengio'
  | 'kim'
  | 'haemin'
  | 'shin'
  | 'jo'
  | 'park'
  | 'baek'
  | 'yoo'
  | 'oh'
  | 'seok'
  | 'sim'
  | 'minseok';
export type SceneSpeaker = {
  person: PersonId;
  role: string;
  text: string;
  source: string;
  mode: '직접 인용' | '발언 요지' | '정책 설명';
};

export type Scene = {
  id: string;
  date: string;
  endDate?: string;
  title: string;
  short: string;
  axis: Axis;
  set: SetKind;
  status:
    | '출범'
    | '논의'
    | '발표'
    | '의결'
    | '시행'
    | '착수'
    | '현장 점검'
    | '성과 점검';
  scope: '위원회 활동' | '연결된 국가 정책';
  summary: string;
  facts: string[];
  meaning: string;
  boundary: string;
  beats: [string, string, string];
  bridge: string;
  object: { title: string; text: string };
  label: string;
  metric?: string;
  speaker: SceneSpeaker;
  secondarySpeaker?: SceneSpeaker;
  sources: string[];
};
export const AXES = {
  strategy: { name: '전략과 결정', color: '#bad9ff' },
  infrastructure: { name: '기술과 인프라', color: '#8bdec4' },
  society: { name: '사람과 현장', color: '#f4c79c' },
};
export const PEOPLE: Record<PersonId, { name: string; role: string }> = {
  minseok: { name: '이민석', role: '교육·인재 분과장' },
  shin: { name: '신진우', role: '기술혁신·인프라 분과장' },
  jo: { name: '조준희', role: '산업AX·생태계 분과장' },
  park: { name: '박태웅', role: '공공AX 분과장' },
  baek: { name: '백은옥', role: '데이터 분과장' },
  yoo: { name: '유재연', role: '사회 분과장' },
  oh: { name: '오혜연', role: '글로벌협력 분과장' },
  seok: { name: '석차옥', role: '과학 분과장' },
  sim: { name: '심승배', role: '국방·안보 분과장' },
  lee: { name: '이재명', role: '대통령 · 위원장' },
  lim: { name: '임문영', role: '초대 상근부위원장' },
  bae: { name: '배경훈', role: '과학기술정보통신부 장관' },
  ha: { name: '하정우', role: 'AI미래기획수석 → 상근부위원장' },
  cha: { name: '차정인', role: '국가교육위원장' },
  bengio: { name: '요슈아 벤지오', role: 'AI 연구자' },
  kim: { name: '김정관', role: '산업통상부 장관' },
  haemin: { name: '이해민', role: 'AI미래기획수석' },
};
