# OpenAI — A History in Motion

React Three Fiber + GSAP + Tailwind CSS로 구현한 Single Stage Transformation 웹 앱입니다. React 19 및 Vinext/Vite를 사용합니다.

## 실행

```sh
npm install
npm run dev
```

개발 서버가 출력하는 주소에서 실행합니다. `npm run build`는 배포 빌드를, `npx tsc --noEmit`은 타입 검사를 수행합니다.

## 코드 구조

```text
app/
  page.tsx                         타임라인 콘텐츠·현재 step·화면 UI
  globals.css                      다크 테마·반응형 레이아웃·Tailwind
components/timeline/
  Stage.tsx                        Canvas·고정 카메라·영구 단상·조명
  useStageTransition.ts            GSAP 전환 타임라인과 인터럽트 처리
  useTimelineInput.ts              휠·키보드·터치 입력 → step
  objects.tsx                      5개 장면의 3D 오브젝트와 idle 동작
  primitives.tsx                   기본 3D 형태·캔버스 텍스트 라벨
```

## 전환 방식

`Platform`은 한 번 등장한 뒤 모든 장면에서 유지됩니다. 각 장면의 **직계 자식 group 하나가 하나의 애니메이션 단위**입니다. 복합 오브젝트 내부 파트는 그대로 함께 움직입니다.

1. 현재 보이는 장면의 오브젝트를 `scale → 0`으로 축소하면서 아래로 내립니다.
2. 서버 장면은 위·옆으로 흩어지며, 주황 파편을 함께 출력합니다.
3. 다음 장면의 오브젝트를 `scale: 0`으로 준비하고, 바닥 아래 또는 위에서 등장시킵니다.
4. 각 오브젝트에 **0.05초 stagger**, **elastic.out(1, 0.5)** 및 **back.out(1.7)**을 적용합니다.
5. 퇴장 완료한 장면을 `visible = false`로 숨깁니다.

수치는 `useStageTransition.ts`의 `MOTION`에서 조절합니다.

```ts
export const MOTION = {
  stagger: 0.05,
  exitDuration: 0.28,
  enterDuration: 0.85,
  enterEase: 'elastic.out(1, 0.5)',
  assembleEase: 'back.out(1.7)',
};
```

새 입력이 오면 기존 GSAP timeline을 `kill()`하고 현재 변환 상태에서 퇴장을 이어갑니다. 원래 위치는 `userData.home`에 한 번 저장하여 빠르게 이동하거나 이전 장면으로 돌아가도 위치가 누적되지 않습니다. 컴포넌트가 해제되면 timeline도 정리합니다.

`Idle`은 GSAP이 제어하는 루트 group **안쪽**에서 부유·바운스·흔들림을 처리하므로 두 애니메이션이 같은 속성을 덮어쓰지 않습니다. 숨겨진 장면은 idle 업데이트를 건너뜁니다. 사용자 OS의 `prefers-reduced-motion` 설정이 켜지면 전환과 반복 움직임을 생략합니다.

## 고정 등각 카메라

```tsx
<Canvas orthographic camera={{ position: [10, 10.65, 10], zoom: 65 }}>
```

카메라는 `[0, 0.65, 0]`을 봅니다. 카메라와 대상 사이의 방향이 `[10, 10, 10]`이므로 수평 회전 45°, 앙각 약 35.264°의 정확한 등각 투영이 됩니다. 화면 크기 변경 시 `zoom`만 조절하며 장면 전환 중에는 카메라를 움직이지 않습니다. OrbitControls는 사용하지 않습니다.

## 조작

- **Next chapter / 이전 화살표**: 다음·이전 장면
- **하단 연도**: 특정 장면으로 바로 이동
- **스크롤**: 누적 휠 임계값과 쿨다운으로 트랙패드 관성 억제
- **방향키 / Page Up·Down**: 이전·다음, **Home·End**: 처음·마지막
- **모바일 무대 스와이프**: 이전·다음 장면; 무대 밖에서는 일반 문서 스크롤
- 마지막 장면의 **처음으로**: 첫 장면으로 돌아가기

WebGL 미지원/장면 오류 시 안내와 재시도를 제공하며 설명과 타임라인은 계속 사용할 수 있습니다. 외부 3D 모델·텍스처 다운로드 없이 기본 지오메트리로 렌더링합니다.

## 장면과 날짜

| 장면 | 구성 |
|---|---|
| 2015 | 연구실 벽, 화이트보드, 책상·레트로 컴퓨터, 피자 상자, 오락기, 의자 |
| 2019–2020 | Microsoft 금고, 서버 랙, 발광 GPT-3 큐브 |
| 2022–2023 | 스마트폰, 안테나, 부유하는 말풍선, 흔들리는 이사회 의자 |
| 2024 | 영화 슬레이트, 카메라, Sora 프레임, o1 신경망 큐브 |
| 2026 | 로봇 팔, 에너지 시설, 지구본 홀로그램, 데이터센터 |

**2026은 상상적 AGI Hub 콘셉트이며 AGI 달성이나 실제 시설에 대한 주장이 아닙니다.** GPT-3는 2020년, 이사회 사건은 2023년의 사실을 각각 앞 장면과 묶었습니다. 소품은 역사적 공간을 복제한 것이 아니라 상징적 연출입니다.

공식 출처는 화면의 **About this journey**에서도 확인할 수 있습니다.

- [2015 출범 발표](https://openai.com/index/introducing-openai/)
- [2019 Microsoft 파트너십](https://openai.com/index/microsoft-invests-in-and-partners-with-openai/)
- [2020 GPT-3](https://openai.com/index/language-models-are-few-shot-learners/)
- [2022 ChatGPT](https://openai.com/index/chatgpt/)
- [2023 CEO 복귀와 이사회](https://openai.com/index/sam-altman-returns-as-ceo-openai-has-a-new-initial-board/)
- [2024 Sora 연구](https://openai.com/index/video-generation-models-as-world-simulators/)
- [2024 o1-preview](https://openai.com/index/introducing-openai-o1-preview/)

구현 참고: [R3F Canvas](https://r3f.docs.pmnd.rs/api/canvas), [GSAP easing](https://gsap.com/docs/v3/Eases/).

## 검증

- `npm test`: 빠른 연속 이동, 퇴장 중 되돌아가기, 동작 줄이기 설정 전환의 회귀 테스트
- `npm run lint:app`: 앱과 타임라인 소스의 린트 검사
- `npx tsc --noEmit`: 타입 검사
- `npm run build`: 프로덕션 빌드

브라우저의 시각·GPU 렌더링 검사는 수행하지 않았습니다. 전체 `npm run lint`에는 생성된 공용 UI 템플릿의 기존 린트 오류가 남아 있으며, 이번 앱 소스는 `lint:app`으로 별도 검증합니다.
