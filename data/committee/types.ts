export type Axis = 'strategy' | 'infrastructure' | 'society';
export type SetKind =
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
  | 'haemin';
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
  speaker: {
    person: PersonId;
    role: string;
    text: string;
    source: string;
    mode: '직접 인용' | '발언 요지' | '정책 설명';
  };
  sources: string[];
};
export const AXES = {
  strategy: { name: '전략과 결정', color: '#bad9ff' },
  infrastructure: { name: '기술과 인프라', color: '#8bdec4' },
  society: { name: '사람과 현장', color: '#f4c79c' },
};
export const PEOPLE: Record<PersonId, { name: string; role: string }> = {
  lee: { name: '이재명', role: '대통령 · 위원장' },
  lim: { name: '임문영', role: '초대 상근부위원장' },
  bae: { name: '배경훈', role: '과학기술정보통신부 장관' },
  ha: { name: '하정우', role: 'AI미래기획수석 → 상근부위원장' },
  cha: { name: '차정인', role: '국가교육위원장' },
  bengio: { name: '요슈아 벤지오', role: 'AI 연구자' },
  kim: { name: '김정관', role: '산업통상부 장관' },
  haemin: { name: '이해민', role: 'AI미래기획수석' },
};
