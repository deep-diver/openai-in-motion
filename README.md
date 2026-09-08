# OpenAI — A History in Motion

React Three Fiber + GSAP + Tailwind CSS로 만든 **Single Stage Transformation** 모션 연대기입니다. React 19 / Vinext / Vite를 사용합니다.

**2015–2026 · 44개 장면 · 132개 스토리 단계 · 32명의 관련 인물**

- 모델의 진화: 24개 장면
- 큰 이정표: 14개 장면 (마지막 미래 콘셉트 포함)
- 주요 사건: 6개 장면

## 실행

```sh
npm install
npm run dev
```

서버가 출력하는 주소에서 실행합니다.

## 코드 구조

```text
app/
  page.tsx                     현재 장면·재생 상태·인물 소개·전체 UI
  globals.css                  반응형 다큐멘터리 화면과 세 축 타임라인

data/
  chapters.json                날짜·축·사실·출처·인물·3단계 스토리
  chapters.ts                  타입이 지정된 데이터 진입점
  people.json                  인물 이름과 미니어처 외형 설정
  types.ts                     Chapter / StoryBeat / Action 타입

components/timeline/
  Stage.tsx                    고정 OrthographicCamera·영구 단상·조명
  StoryScene.tsx               두 장면 버퍼·재생/정지·속도·다시 보기·탐색
  storyDirector.ts             장면 전환과 3단계 스토리를 실행하는 GSAP 감독
  StoryActors.tsx              등장인물과 시작·미래 세트
  HistoricalSets.tsx           42개 역사 장면의 대표 데모와 사건별 세트
  historicalMotion.ts          상자 열기·보행·배선·도구 선택 등 사건별 동작
  SceneActor.tsx               전환 group과 서사 group의 분리
  objects.tsx                  연구실·서버·로봇·스마트폰 등 공용 3D 오브젝트
  primitives.tsx               기본 지오메트리·CanvasTexture 텍스트
  TimelineTracks.tsx           모델 / 이정표 / 사건의 독립된 시간 축
  useTimelineInput.ts          휠·키보드·터치로 장면 탐색

tests/
  transition.test.tsx          전체 스토리·되돌리기·탐색·동작 줄이기 검증
  input.test.tsx               포커스된 버튼의 방향키·짧은 화면의 스크롤 검증
```

## 장면은 하나의 타임라인으로 이어집니다

`Platform`과 작은 빛의 큐브는 절대 장면마다 교체되지 않습니다. 고정된 무대 위에서 이전 장면의 오브젝트가 퇴장하는 동안 다음 장면의 오브젝트가 나타납니다. 빛의 큐브가 그 사이를 이동하며 다음 이야기의 색으로 변합니다.

각 장면은 약 **14.2초**입니다.

```ts
export const STORY_TIMING = {
  entry: 1.25,
  beatLength: 3.35,
  duration: 14.2,
  stagger: 0.05,
};
```

- 퇴장: `back.in(1.7)`, 바닥 아래로 이동하며 `scale → 0`
- 등장: **0.05초 stagger**, `elastic.out(1, 0.5)` / `back.out(1.7)`
- 세 단계: `beat-0`, `beat-1`, `beat-2` GSAP 라벨로 탐색
- 세 번째 단계에서 이미 등장한 물체를 축소하지 않음
- 약 11.3초부터 완성된 결과를 유지하고, 14.2초에 다음 장면으로 전환하거나 정지
- 축소 퇴장은 다음 장면을 선택하거나 자동 전환할 때만 실행

`StoryScene`은 현재 장면과 직전 장면의 **두 버퍼만 유지**합니다. 44개 세트를 동시에 생성하지 않습니다. 빠르게 되돌아갈 때 아직 보이는 오브젝트는 현재 위치에서 전환을 이어갑니다. GSAP timeline은 교체·해제 시 정리합니다.

## 각 장면의 스토리를 작성하는 방법

`data/chapters.json`에 한 사건을 추가합니다. 실제 기록, 시각적 상징, 움직임이 분리되어 있습니다.

```ts
{
  id: 'example',
  date: '2024-09-12',
  axis: 'model',
  set: 'reasoning',
  model: 'o1-preview',
  title: '답하기 전에 추론하다',
  // description, detail, people, personRoles, sources ...
  beats: [
    {
      title: '문제를 받다',
      caption: '복잡한 질문이 연구실에 도착합니다.',
      actions: [{ target: 'data', action: 'rise' }],
    },
    {
      title: '경로를 검토하다',
      caption: '가능한 풀이를 차례로 검토합니다.',
      actions: [{ target: 'hero', action: 'pulse' }],
    },
    {
      title: '답을 만들다',
      caption: '검토한 결과가 답안으로 나타납니다.',
      actions: [{ target: 'output', action: 'reveal' }],
    },
  ],
}
```

각 세트에는 `hero`, `work`, `support`, `data`, `output` 액터와 해당 사건의 `person-0`, `person-1` 액터가 있습니다. 액터 바깥 group은 장면 전환, 안쪽 `story:*` group은 사건별 움직임을 담당하여 서로 속성을 덮어쓰지 않습니다.

지원 액션: `reveal`, `pulse`, `grow`, `rise`, `write`, `walk`, `leave`, `arrive`, `scatter`, `connect`, `open`, `orbit`, `tilt`, `stamp`.

`historicalMotion.ts`는 부품의 실제 동작을 담당합니다. GPT-2의 뚜껑은 회전하고, Sora의 인물은 도쿄 거리를 걷고, GPT-4의 VGA 플러그는 휴대폰 쪽으로 이동합니다. 텍스트는 줄 단위로 나타나고 모니터 크기는 유지됩니다. 모든 동작은 같은 GSAP 시계 안에서 실행되므로 재생·일시정지·속도·탐색에 함께 반응합니다.

대표 세트는 Gym의 CartPole, Dendi와의 Dota 대결, Dactyl의 글자 블록, DALL·E의 아보카도 의자, DALL·E 2의 말을 탄 우주비행사, 초기 ChatGPT 대화창, CEO 명패와 이사회 의자, GPT-4o의 수학 도움, Stargate 설계도와 크레인입니다. 최근 장면에는 인력 배치표, 레이싱 게임, 메일과 달력, 곡면의 교선, KiCad 회로 설계를 담았습니다. 공개 데모의 대상을 미니어처로 해석했으며 실제 인터페이스의 복제는 아닙니다.

## 세 축과 인물

하단은 같은 날짜 열을 공유하는 세 개의 독립 트랙입니다. 각 점을 누르면 해당 사건의 장면으로 이동합니다. 연도 바로가기와 선택 장면에 맞춘 가로 스크롤을 지원합니다.

샘 올트먼, 일리야 수츠케버, 그레그 브록먼, 일론 머스크, 사티아 나델라, 미라 무라티 외에도 GPT·CLIP·Whisper의 연구자, Sora·o1·GPT-4o의 기여자 등이 등장합니다. `personRoles`는 **그 장면 당시의 역할**을 표시하며 현재 직책과 구분합니다. 개별 개발자가 확인되지 않은 장면은 인물을 임의로 연결하지 않습니다.

## 고정 등각 카메라

카메라 위치는 `[10, 10.65, 10]`, 바라보는 위치는 `[0, 0.65, 0]`입니다. 방향 벡터가 `[10,10,10]`이므로 방위각 45°, 앙각 약 35.264°의 등각 투영입니다. 화면 크기 변경 시에만 `zoom`을 조절하고 장면 전환 중 카메라는 움직이지 않습니다.

## 조작과 접근성

- 재생 / 일시정지, 현재 장면 다시 보기
- 1× / 1.5× / 2× 재생 속도
- 세 단계 제목을 클릭하여 해당 시퀀스로 이동
- ‘이어 보기’로 다음 장면 자동 재생 설정
- 방향키 ← →, 스크롤, 무대 스와이프, 이전/다음 장면 버튼
- 스페이스바: 재생 / 일시정지
- 작은 화면에서 무대 밖은 일반 문서 스크롤 유지
- `prefers-reduced-motion`: 자동 모션을 생략하고 장면을 즉시 표시
- WebGL 오류 시 재시도 및 텍스트 연대기 유지

## 사실과 연출의 구분

모든 역사 장면에 공식 출처가 있습니다. 날짜는 공식 발표일을 기준으로 하며 공개 프리뷰·제품 출시·일반 제공·단계적 배포를 구분합니다. DALL·E 2처럼 확인된 정밀도가 월 단위인 날짜는 일자를 만들지 않았습니다.

모형, 공간, 등장인물의 행동은 설명을 위한 창작입니다. 실제 현장이나 발언의 재현이 아닙니다. 마지막 **AGI Hub는 미래 콘셉트이며 AGI 달성이나 실제 시설을 의미하지 않습니다.** 기록 확인 기준은 2026년 9월 8일입니다.

## 검증

```sh
npm test
npm run lint:app
npx tsc --noEmit
npm run build
```

테스트는 44개 장면의 액션 대상·인물·날짜 순서, 역사 세트 연결, 마지막 단계의 크기 유지와 결과 홀드, GPT-2 최종 상자와 GPT-5 경로 선택, 전환 도중 되돌아가기, 재생 정지와 탐색, 동작 줄이기, 입력 포커스와 페이지 스크롤을 검사합니다.

브라우저의 시각·GPU 렌더링 검사는 수행하지 않았습니다. 전체 `npm run lint`에는 초기 생성된 공용 UI 템플릿의 기존 오류가 남아 있으며, 앱 소스는 `lint:app`으로 별도 검사합니다.
