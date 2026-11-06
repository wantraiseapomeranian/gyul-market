# 귤상회 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 카카오톡에서 열리는 가짜 감귤 상품 페이지와 당도 검사 미니게임, '귤은 없습니다' 엔딩을 정적 Next.js 페이지로 만들어 Vercel에 올린다.

**Architecture:** 단일 라우트(`/`). 상품 상세는 서버 컴포넌트로 정적 생성해 첫 화면을 빠르게 그린다. 게임은 클라이언트 컴포넌트 하나(`Game`)가 순수 리듀서(`lib/game.ts`)로 6개 화면을 전환한다. 서버 기능·API·DB·외부 런타임 요청이 없다.

**Tech Stack:** Next.js(App Router, `create-next-app@latest` 시점 안정판 고정), React 19, TypeScript, Tailwind CSS 4, Pretendard(npm, 자체 호스팅), Hahmlet(`next/font/google`, 빌드 시 자체 호스팅), Node 24 내장 테스트 러너, Playwright + @axe-core/playwright, GitHub(개인 계정), Vercel(개인 계정).

**Spec:** [PROJECT.md](PROJECT.md), [DESIGN.md](DESIGN.md), 검증은 [TEST_PLAN.md](TEST_PLAN.md)

## Global Constraints

- Node ≥ 24 (로컬 확인: v24.14.1). `package.json`에 `"type": "module"`
- `next build`는 tsconfig 범위 전체(`tests/`, `lib/*.test.ts` 포함)를 타입 검사한다. 테스트 파일의 타입 오류도 빌드와 Playwright webServer를 깨뜨린다
- 직접 만드는 CSS 클래스는 Tailwind 유틸리티 이름(`ring`, `shadow`, `border`, `container` 등)과 겹치지 않게 짓는다. 겹치면 유틸리티 스타일이 함께 생성된다
- 의존성은 scaffold 기본 + `pretendard`, `@playwright/test`, `@axe-core/playwright`만. 그 밖의 추가는 사용자 승인
- 애니메이션 라이브러리·상태 라이브러리·UI 킷을 쓰지 않는다. CSS 애니메이션과 `useReducer`만 쓴다
- 서버 기능 금지: API 라우트, Server Actions, DB, 쿠키, 분석 도구, 결제, 회원가입, 입력 폼 없음
- 런타임 외부 요청 0건. 폰트·이미지는 자체 호스팅
- '구매하기'는 상품 하단 바와 수량 시트 버튼에만(2026-11-06 D1). 주문 접수·결제 완료·배송지 입력 연출 금지(D5). 동작하지 않는 UI 금지
- 색·서체·크기·시간 값은 DESIGN.md 표의 값만 쓴다(DESIGN §2, DESIGN §6). 토큰 이름은 `ink, ink-2, mute, control, dash, line, band, paper, camellia, slate`
- 모든 화면 작업은 390×844와 360×780 스크린샷을 남기고 DESIGN.md §9 감사 기준으로 확인해야 완료다
- 커밋 메시지 끝에 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- 저장소 생성·원격 push는 G5-A, Vercel 연결·Preview는 G5-B, 사이트 공개는 G6 승인 이후에만 한다

---

## 승인 게이트

| 게이트 | 승인 범위 | 확인 방법 |
|---|---|---|
| **G4** 구현 착수 | 시안을 `docs/design/`으로 복사, `create-next-app`, 위 의존성 설치, Playwright 브라우저 내려받기, Unsplash 사진 5장 내려받기, 로컬 `git init`과 작업별 커밋 | 사용자가 채팅으로 승인 |
| **G5-A** Public 저장소 | 공개 전 Git 이력 전체·추적 파일 보안 검사, 개인 GitHub **public** 저장소 `gyul-market` 생성과 `main` push. 커밋 이메일은 GitHub noreply. Vercel 제외. 저장소 공개는 사이트 공개가 아니다 | `gh auth status` 활성 계정 = `wantraiseapomeranian`, 보안 검사 0건, 사용자 승인 |
| **G5-B** Preview | Vercel(개인 계정) 연결, Preview 배포, 카카오톡 실기기 점검 | TEST_PLAN §11 G5-B 기준 충족(성능 기준 완화 없음), 사용자 승인 |
| **G6** 정식 공개 | Production 검증 완료, 사진 결정 완료, 카카오 프로필에 링크 게시 | TEST_PLAN §11 공개 기준 충족, 사용자 승인 |

## 파일 구조

| 경로 | 책임 |
|---|---|
| `app/layout.tsx` | html·body, 폰트, metadata(OG·noindex), viewport, 인주 SVG 필터 |
| `app/page.tsx` | `<Game product={<ProductPage />} />` 조립만 |
| `app/globals.css` | Tailwind import, `@theme` 토큰, base, 컴포넌트 클래스(시안 CSS 이식), 키프레임 |
| `app/icon.svg` | 파비콘(選 인장) |
| `lib/game.ts` | 상태 타입, 리듀서, 당도 배정, 등급, 측정값, 날짜 형식 (순수 함수, React 없음) |
| `lib/game.test.ts` | 위 함수 단위 테스트 (`node --test`) |
| `components/Stamp.tsx` | `InkFilters`, `Stamp` |
| `components/Wordmark.tsx` | 워드마크 + 인장 |
| `components/SortingTag.tsx` | 선별 태그 |
| `components/BottomBar.tsx` | 하단 고정 바 |
| `components/icons.tsx` | `BackIcon`, `CheckIcon`, `ShareIcon` |
| `components/fruitImages.ts` | 시료 사진 import, 게이지 지름 |
| `components/ProductPage.tsx` | ① 상품 상세 (서버 컴포넌트) |
| `components/Game.tsx` | 클라이언트 루트: 리듀서, 타이머, 초점, 화면 선택 |
| `components/InspectionSheet.tsx` | 검사표 (② 선택·④ 결과 공용) |
| `components/screens/SelectScreen.tsx` | ② |
| `components/screens/MeasureScreen.tsx` | ③ |
| `components/screens/ResultScreen.tsx` | ④ |
| `components/screens/JudgingScreen.tsx` | ⑤ |
| `components/screens/EndingScreen.tsx` | ⑥ + 공유 |
| `assets/images/*.jpg` | hero, fruit-a/b/c, story (정적 import → next/image 최적화) |
| `public/og.jpg` | 링크 미리보기 이미지 |
| `scripts/og/og.html` | OG 이미지 합성용 HTML (빌드에 포함되지 않음) |
| `tests/helpers.ts` | 난수·시계 고정, 화면 이동 함수 |
| `tests/flow.spec.ts` | 기능·상태 전이 E2E |
| `tests/visual.spec.ts` | 시각 회귀(6화면 × 2폭) |
| `tests/a11y.spec.ts` | axe 검사, 키보드 |
| `tests/layout.spec.ts` | 폭별 넘침·고정 바·첫 화면 정보 |
| `tests/meta.spec.ts` | OG·noindex·외부 요청 0건 |
| `playwright.config.ts` | 프로젝트 m390·m360·webkit |
| `next.config.ts` | 보안 헤더, 이미지 형식 |
| `docs/design/` | 승인 시안(d2.html, 캡처) 보관 |

## 상태 전이

| 현재 | 이벤트 | 조건 | 다음 | 상태 변화 |
|---|---|---|---|---|
| product | `start{brix}` | — | select | brix 새 배정, pick=null, taps=0 |
| select | `pick{fruit}` | — | select | pick=fruit |
| select | `begin` | pick ≠ null | measure | taps=0 |
| select | `back` | — | product | pick=null |
| measure | `tap` | taps < 5 | measure | taps+1 |
| measure | `finish` | taps = 5 | result | — (UI가 5번째 탭 450ms 뒤 발생) |
| measure | `back` | — | select | taps=0, pick 유지 |
| result | `judge` | — | judging | — |
| result | `retry{brix}` | — | select | brix 새 배정, pick=null, taps=0 |
| judging | `reveal` | — | ending | — (UI가 1500ms, 축소 모션 800ms 뒤 발생) |
| ending | `retry{brix}` | — | select | brix 새 배정, pick=null, taps=0 |
| 그 밖 | 모든 이벤트 | — | 그대로 | 무시 |

게임 화면은 브라우저 history를 쓰지 않는다. 새로고침하면 상품 화면부터 다시 시작한다.

**구매 진입(T14)은 이 리듀서 밖에 있다.** `Game.tsx`의 `qty`(1~5)와 `overlay`(없음 / `qty` / `notice`)만 쓰고, 검사를 시작할 때 기존 `start{brix}`를 보낸다.

| overlay | 사건 | history | 다음 |
|---|---|---|---|
| 없음 | 상품 **구매하기** | `pushState({ov:'qty'})` | qty |
| qty | 시트 **구매하기** | `pushState({ov:'notice'})` | notice(시트는 아래에 열린 채) |
| qty·notice | 닫기 · ESC · 바깥 누름 · 뒤로가기 | `history.back()` → `popstate` | `popstate`의 `state.ov`(notice → qty → 없음) |
| notice | **당도 검사 시작하기** | `history.go(-2)` | 없음 + `start{brix}` → select |

- 같은 창을 연타로 두 번 쌓지 않는다(`history.state.ov`가 같으면 무시). 시작은 한 번만(`go(-2)` 중복 방지).
- 여는 애니메이션 중의 바깥 누름은 무시한다(앞 버튼 연타가 새 창을 닫지 않게).

---

### Task 0: 착수 준비 (G4)

**Files:**
- Create: `docs/design/d2.html`, `docs/design/shots2/*.png`, `docs/design/board2.html`

- [ ] **Step 1: G4 승인 확인.** 승인 범위가 '승인 게이트' 표의 G4와 같은지 채팅에서 확인한다.
- [ ] **Step 2: 시안 보관.** 세션 임시 폴더의 v2 시안을 복사한다.

```bash
S="$TEMP/claude/839874c7d23dfdb0/2d4ce3a1-3a83-4389-bd89-6e8a2aa8f2ac/scratchpad/gyul-board"
mkdir -p docs/design && cp "$S/d2.html" "$S/board2.html" docs/design/ && cp -r "$S/shots2" docs/design/
ls docs/design docs/design/shots2
```
Expected: `d2.html board2.html shots2` 와 png 12개. 임시 폴더가 이미 사라졌다면 DESIGN.md만으로 진행하고 사용자에게 알린다.

- [ ] **Step 3: 도구 확인.**

```bash
node --version   # v24 이상
npm --version
git config --global user.email   # 설정되어 있는지만 확인
```

### Task 1: Next.js 뼈대

**Files:**
- Create: create-next-app 산출물 전체
- Modify: `package.json`, `tsconfig.json`, `next.config.ts`
- Delete: `public/*.svg`, `app/favicon.ico`, `app/page.module.css`(있으면)

**Interfaces:**
- Produces: `npm run build`, `npm run lint`, `npm run test:unit`, `npm run test:e2e` 스크립트

- [ ] **Step 1: scaffold.** 프로젝트 루트(`docs/`만 있는 상태)에서 실행한다.

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --disable-git --yes
```
질문이 나오면 TypeScript Yes · ESLint Yes · Tailwind Yes · `src/` No · App Router Yes · import alias `@/*` · 나머지는 기본값으로 답한다. 폴더 충돌로 멈추면 `../gyul-scaffold`에 만든 뒤 내용을 루트로 옮긴다.

- [ ] **Step 2: 추가 의존성 설치.**

```bash
npm install --save-exact pretendard
npm install --save-dev --save-exact @playwright/test @axe-core/playwright
npx playwright install chromium webkit
```

- [ ] **Step 3: `package.json` 수정.** `"type": "module"`을 추가하고 scripts를 아래로 바꾼다. 버전은 설치된 값 그대로 정확히 고정한다(`^` 제거).

```json
{
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test:unit": "node --test lib/game.test.ts",
    "test:e2e": "playwright test",
    "test": "npm run test:unit && npm run test:e2e"
  }
}
```

- [ ] **Step 4: `tsconfig.json` compilerOptions에 추가.**

```json
"allowImportingTsExtensions": true,
"erasableSyntaxOnly": true
```
`erasableSyntaxOnly`를 TypeScript가 모른다고 하면(5.8 미만) 그 줄만 뺀다. 두 옵션은 Node 내장 테스트 러너가 TS 파일을 그대로 실행하기 위한 것이다(`enum`·`namespace` 금지).

- [ ] **Step 5: `next.config.ts`를 아래로 교체.**

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ['image/avif', 'image/webp'] },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 6: 보일러플레이트 제거.** `public/`의 svg, `app/favicon.ico`, `app/page.module.css`를 지우고 `app/page.tsx`를 임시로 `export default function Page() { return null; }`로 바꾼다.

- [ ] **Step 7: 빌드 확인.**

Run: `npm run build && npm run lint`
Expected: 둘 다 오류 없이 끝난다.

- [ ] **Step 8: git 초기화와 커밋.**

```bash
git init -b main
git config user.name "wantraiseapomeranian"
git config user.email "189066806+wantraiseapomeranian@users.noreply.github.com"
git add -A
git commit -m "chore: scaffold Next.js app with test scripts and security headers" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

**완료 조건:** build·lint 통과, 커밋 1개, `.gitignore`에 `node_modules`, `.next`, `test-results`, `playwright-report` 포함(없으면 추가).

### Task 2: 게임 로직 (TDD)

**Files:**
- Create: `lib/game.ts`, `lib/game.test.ts`

**Interfaces:**
- Produces:
  - `type FruitId = 'A'|'B'|'C'`, `type Size = '2S'|'S'|'M'`
  - `type Screen = 'product'|'select'|'measure'|'result'|'judging'|'ending'`
  - `type BrixMap = Record<FruitId, number>`
  - `type GameState = { screen: Screen; brix: BrixMap; pick: FruitId | null; taps: number }`
  - `type GameEvent`, `initialState`, `reduce(s, e): GameState`
  - `assignBrix(rand: () => number): BrixMap`, `gradeOf(brix: number): string`, `readingAt(final: number, taps: number): number`, `formatDocDate(d: Date): string`
  - `FRUITS`, `SIZE_OF`, `BRIX_VALUES`, `TAPS_REQUIRED = 5`, `DOC_NO = 'No.0412'`

- [ ] **Step 1: 실패하는 테스트 작성** (`lib/game.test.ts`)

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  reduce, initialState, assignBrix, gradeOf, readingAt, formatDocDate,
  BRIX_VALUES, TAPS_REQUIRED, type GameState, type GameEvent, type BrixMap,
} from './game.ts';

const FIXED: BrixMap = { A: 12.4, B: 14.2, C: 15.8 };
const run = (s: GameState, ...events: GameEvent[]) => events.reduce((acc, e) => reduce(acc, e), s);
const sorted = (m: BrixMap) => [m.A, m.B, m.C].sort((x, y) => x - y);

test('assignBrix: 세 값을 한 번씩 배정하고 여섯 가지 배정이 모두 나온다', () => {
  const seen = new Set<string>();
  for (const a of [0, 0.5, 0.99]) {
    for (const b of [0, 0.99]) {
      const seq = [a, b];
      let i = 0;
      const m = assignBrix(() => seq[i++]);
      assert.deepEqual(sorted(m), [...BRIX_VALUES]);
      seen.add(`${m.A}/${m.B}/${m.C}`);
    }
  }
  assert.equal(seen.size, 6);
});

test('assignBrix: 규격 순서와 무관하다 (M 시료가 가장 낮을 수 있다)', () => {
  assert.deepEqual(assignBrix(() => 0.999), { A: 12.4, B: 14.2, C: 15.8 });
  assert.deepEqual(assignBrix(() => 0), { A: 14.2, B: 15.8, C: 12.4 });
});

test('gradeOf: 당도 값으로 등급을 정한다', () => {
  assert.equal(gradeOf(12.4), '새콤 낚임과');
  assert.equal(gradeOf(14.2), '달콤 낚임과');
  assert.equal(gradeOf(15.8), '로얄 낚임과');
});

test('readingAt: 탭 수에 비례하고 소수 첫째 자리로 반올림, 5회에서 멈춘다', () => {
  assert.equal(readingAt(15.8, 0), 0);
  assert.equal(readingAt(12.4, 1), 2.5);
  assert.equal(readingAt(15.8, 3), 9.5);
  assert.equal(readingAt(14.2, 5), 14.2);
  assert.equal(readingAt(15.8, 7), 15.8);
});

test('formatDocDate: YYYY.MM.DD', () => {
  assert.equal(formatDocDate(new Date(2026, 10, 5)), '2026.11.05');
});

test('정상 흐름: 상품 → 선택 → 측정 → 결과 → 판정 → 엔딩', () => {
  let s = reduce(initialState, { type: 'start', brix: FIXED });
  assert.equal(s.screen, 'select');
  assert.equal(s.pick, null);
  s = run(s, { type: 'pick', fruit: 'C' }, { type: 'begin' });
  assert.equal(s.screen, 'measure');
  assert.equal(s.taps, 0);
  for (let i = 0; i < TAPS_REQUIRED; i++) s = reduce(s, { type: 'tap' });
  assert.equal(s.taps, 5);
  assert.equal(s.screen, 'measure');
  s = run(s, { type: 'finish' });
  assert.equal(s.screen, 'result');
  s = run(s, { type: 'judge' });
  assert.equal(s.screen, 'judging');
  s = run(s, { type: 'reveal' });
  assert.equal(s.screen, 'ending');
  assert.equal(s.brix.C, 15.8);
});

test('고르기 전에는 측정을 시작할 수 없다', () => {
  const s = run(initialState, { type: 'start', brix: FIXED }, { type: 'begin' });
  assert.equal(s.screen, 'select');
});

test('5회를 넘는 탭은 무시하고, 5회 전에는 결과로 가지 않는다', () => {
  let s = run(initialState, { type: 'start', brix: FIXED }, { type: 'pick', fruit: 'A' }, { type: 'begin' });
  for (let i = 0; i < 4; i++) s = reduce(s, { type: 'tap' });
  assert.equal(reduce(s, { type: 'finish' }).screen, 'measure');
  for (let i = 0; i < 3; i++) s = reduce(s, { type: 'tap' });
  assert.equal(s.taps, 5);
});

test('맞지 않는 화면의 이벤트는 무시한다', () => {
  const select = reduce(initialState, { type: 'start', brix: FIXED });
  for (const e of [{ type: 'judge' }, { type: 'reveal' }, { type: 'tap' }, { type: 'finish' }, { type: 'start', brix: FIXED }] as GameEvent[]) {
    assert.deepEqual(reduce(select, e), select);
  }
  assert.deepEqual(reduce(initialState, { type: 'pick', fruit: 'A' }), initialState);
});

test('뒤로: 선택 → 상품(선택 해제), 측정 → 선택(탭 초기화, 선택 유지), 결과에서는 무시', () => {
  let s = run(initialState, { type: 'start', brix: FIXED }, { type: 'pick', fruit: 'B' });
  assert.deepEqual(reduce(s, { type: 'back' }), { ...s, screen: 'product', pick: null });
  s = run(s, { type: 'begin' }, { type: 'tap' }, { type: 'tap' }, { type: 'back' });
  assert.equal(s.screen, 'select');
  assert.equal(s.taps, 0);
  assert.equal(s.pick, 'B');
  s = run(s, { type: 'begin' }, ...Array<GameEvent>(5).fill({ type: 'tap' }), { type: 'finish' });
  assert.deepEqual(reduce(s, { type: 'back' }), s);
});

test('다시 검사: 결과·엔딩 → 선택, 당도 재배정, 선택·탭 초기화', () => {
  const NEW: BrixMap = { A: 15.8, B: 12.4, C: 14.2 };
  const result = run(initialState, { type: 'start', brix: FIXED }, { type: 'pick', fruit: 'C' }, { type: 'begin' },
    ...Array<GameEvent>(5).fill({ type: 'tap' }), { type: 'finish' });
  for (const s of [result, run(result, { type: 'judge' }, { type: 'reveal' })]) {
    assert.deepEqual(reduce(s, { type: 'retry', brix: NEW }), { screen: 'select', brix: NEW, pick: null, taps: 0 });
  }
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module ... lib/game.ts`

- [ ] **Step 3: 구현** (`lib/game.ts`)

```ts
// 귤상회 게임 상태: React와 무관한 순수 함수. 전이 규칙은 PLAN.md '상태 전이' 표.
export type FruitId = 'A' | 'B' | 'C';
export type Size = '2S' | 'S' | 'M';
export type Screen = 'product' | 'select' | 'measure' | 'result' | 'judging' | 'ending';
export type BrixMap = Record<FruitId, number>;

export type GameState = { screen: Screen; brix: BrixMap; pick: FruitId | null; taps: number };

export type GameEvent =
  | { type: 'start'; brix: BrixMap }
  | { type: 'pick'; fruit: FruitId }
  | { type: 'begin' }
  | { type: 'tap' }
  | { type: 'finish' }
  | { type: 'judge' }
  | { type: 'reveal' }
  | { type: 'retry'; brix: BrixMap }
  | { type: 'back' };

export const FRUITS: readonly FruitId[] = ['A', 'B', 'C'];
export const SIZE_OF: Record<FruitId, Size> = { A: '2S', B: 'S', C: 'M' };
export const BRIX_VALUES = [12.4, 14.2, 15.8] as const;
export const TAPS_REQUIRED = 5;
export const DOC_NO = 'No.0412';

export const initialState: GameState = {
  screen: 'product',
  brix: { A: 12.4, B: 14.2, C: 15.8 },
  pick: null,
  taps: 0,
};

/** 연출 당도 세 값을 A·B·C에 무작위로 나눈다(Fisher–Yates). 규격·색과 무관하다(FR-6). */
export function assignBrix(rand: () => number): BrixMap {
  const v: number[] = [...BRIX_VALUES];
  for (let i = v.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [v[i], v[j]] = [v[j], v[i]];
  }
  return { A: v[0], B: v[1], C: v[2] };
}

export function gradeOf(brix: number): string {
  if (brix >= 15.8) return '로얄 낚임과';
  if (brix >= 14.2) return '달콤 낚임과';
  return '새콤 낚임과';
}

export function readingAt(final: number, taps: number): number {
  const t = Math.min(taps, TAPS_REQUIRED);
  return Math.round(((final * t) / TAPS_REQUIRED) * 10) / 10;
}

export function formatDocDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

const fresh = (brix: BrixMap): GameState => ({ screen: 'select', brix, pick: null, taps: 0 });

export function reduce(s: GameState, e: GameEvent): GameState {
  switch (e.type) {
    case 'start':
      return s.screen === 'product' ? fresh(e.brix) : s;
    case 'pick':
      return s.screen === 'select' ? { ...s, pick: e.fruit } : s;
    case 'begin':
      return s.screen === 'select' && s.pick ? { ...s, screen: 'measure', taps: 0 } : s;
    case 'tap':
      return s.screen === 'measure' && s.taps < TAPS_REQUIRED ? { ...s, taps: s.taps + 1 } : s;
    case 'finish':
      return s.screen === 'measure' && s.taps === TAPS_REQUIRED ? { ...s, screen: 'result' } : s;
    case 'judge':
      return s.screen === 'result' ? { ...s, screen: 'judging' } : s;
    case 'reveal':
      return s.screen === 'judging' ? { ...s, screen: 'ending' } : s;
    case 'retry':
      return s.screen === 'result' || s.screen === 'ending' ? fresh(e.brix) : s;
    case 'back':
      if (s.screen === 'select') return { ...s, screen: 'product', pick: null };
      if (s.screen === 'measure') return { ...s, screen: 'select', taps: 0 };
      return s;
  }
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm run test:unit`
Expected: `ℹ pass 11`, `ℹ fail 0`. 실행 경고(`MODULE_TYPELESS_PACKAGE_JSON`)가 없어야 한다. 있으면 Task 1 Step 3의 `"type": "module"`을 확인한다.

- [ ] **Step 5: 커밋**

```bash
git add lib/game.ts lib/game.test.ts
git commit -m "feat: add pure game state machine with randomized brix assignment" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

**완료 조건:** 단위 테스트 11개 통과, `npm run build` 통과.

### Task 3: 디자인 기반과 테스트 하네스

**Files:**
- Create: `app/globals.css`(교체), `app/layout.tsx`(교체), `app/icon.svg`, `components/Stamp.tsx`, `components/Wordmark.tsx`, `components/icons.tsx`, `playwright.config.ts`, `tests/helpers.ts`, `tests/meta.spec.ts`

**Interfaces:**
- Produces:
  - `InkFilters()`
  - `Stamp({ children, shape?: 'round'|'square', className?, label? })`
  - `Wordmark({ inverse?: boolean })`
  - `BackIcon`, `CheckIcon`, `ShareIcon`
  - CSS 클래스(아래 `globals.css`), 테스트 도우미 `open`, `toSelect`, `toMeasure`, `tapFruit`, `toResult`, `toJudging`, `toEnding`, `pickRow`

- [ ] **Step 1: 실패하는 테스트 작성** (`playwright.config.ts`, `tests/helpers.ts`, `tests/meta.spec.ts`)

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

// UA는 실기기와 비슷한 조건을 만들기 위한 것. 앱 코드는 UA로 분기하지 않는다.
const KAKAO_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.9.0';
const KAKAO_AOS = 'Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 KAKAOTALK 10.9.0';

export default defineConfig({
  testDir: 'tests',
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },
  use: { baseURL: 'http://localhost:3000', locale: 'ko-KR', timezoneId: 'Asia/Seoul', colorScheme: 'light' },
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
  projects: [
    { name: 'm390', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: KAKAO_IOS } },
    { name: 'm360', use: { browserName: 'chromium', viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: KAKAO_AOS } },
    { name: 'webkit', use: { browserName: 'webkit', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, testMatch: /flow\.spec\.ts/ },
  ],
});
```

```ts
// tests/helpers.ts
import { expect, type Page } from '@playwright/test';

export const NOW = new Date('2026-11-05T10:00:00+09:00');
type Fruit = 'A' | 'B' | 'C';

/** random=0.999 → 당도 배정 A 12.4 · B 14.2 · C 15.8 (assignBrix 항등). 시계는 NOW에 멈춘다. */
export async function open(page: Page, opts: { random?: number; reducedMotion?: boolean } = {}) {
  await page.addInitScript((v) => { Math.random = () => v; }, opts.random ?? 0.999);
  if (opts.reducedMotion) await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install({ time: new Date(NOW.getTime() - 60_000) });
  await page.goto('/');
  await page.clock.pauseAt(NOW);
}

export const pickRow = (page: Page, f: Fruit) =>
  page.locator('label', { has: page.getByRole('radio', { name: new RegExp(`시료 ${f}`) }) });

export async function toSelect(page: Page) {
  await page.getByRole('button', { name: /당도 검사 받기/ }).click();
  await expect(page.getByRole('heading', { name: '당도 검사', exact: true })).toBeVisible();
}

export async function toMeasure(page: Page, f: Fruit = 'C') {
  await toSelect(page);
  await pickRow(page, f).click();
  await page.getByRole('button', { name: `${f} 시료 검사 시작` }).click();
}

export async function tapFruit(page: Page, n: number) {
  const fruit = page.getByRole('button', { name: /귤 누르기/ });
  for (let i = 0; i < n; i++) await fruit.click();
}

export async function toResult(page: Page, f: Fruit = 'C') {
  await toMeasure(page, f);
  await tapFruit(page, 5);
  await page.clock.runFor(500);
  await expect(page.getByRole('heading', { name: '검사 결과' })).toBeVisible();
}

export async function toJudging(page: Page) {
  await toResult(page);
  await page.getByRole('button', { name: '최종 판정 받기' }).click();
  await expect(page.getByRole('heading', { name: '판정서를 발급하고 있습니다' })).toBeVisible();
}

export async function toEnding(page: Page) {
  await toJudging(page);
  await page.clock.runFor(1600);
  await expect(page.getByRole('heading', { name: '귤은 없습니다.' })).toBeVisible();
}
```

```ts
// tests/meta.spec.ts
import { test, expect } from '@playwright/test';
import { open } from './helpers';

test('noindex, color-scheme, viewport-fit, OG', async ({ page }) => {
  await open(page);
  const meta = (sel: string) => page.locator(sel).getAttribute('content');
  expect(await meta('meta[name="robots"]')).toContain('noindex');
  expect(await meta('meta[name="color-scheme"]')).toBe('light');
  expect(await meta('meta[name="viewport"]')).toContain('viewport-fit=cover');
  expect(await meta('meta[property="og:title"]')).toBe('제주 서귀포 햇귤 10kg · 29,900원 | 귤상회');
  expect(await meta('meta[property="og:description"]')).toBe('노지 온주밀감 2S~M 혼합 · 무료배송 · 당도 검사 10초');
  expect(await meta('meta[property="og:image"]')).toMatch(/\/og\.jpg$/);
  expect(await meta('meta[property="og:image:width"]')).toBe('1200');
  await expect(page).toHaveTitle('제주 서귀포 햇귤 10kg | 귤상회');
});

test('웹폰트가 자체 호스팅으로 로드된다', async ({ page }) => {
  await open(page);
  await page.evaluate(() => document.fonts.ready);
  // next/font가 만드는 'Hahmlet Fallback'(로컬 대체 글꼴)은 제외한다. document.fonts.check()는 글꼴이 없어도 true를 낼 수 있어 쓰지 않는다
  expect(await page.evaluate(() => [...document.fonts].some((f) => /hahmlet/i.test(f.family) && !/fallback/i.test(f.family) && f.status === 'loaded'))).toBe(true);
  expect(await page.evaluate(() => [...document.fonts].some((f) => /Pretendard/.test(f.family) && f.status === 'loaded'))).toBe(true);
});
```
`og.jpg` 응답 확인과 외부 요청 0건 검사는 Task 9의 `meta.spec.ts`에 추가한다.

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/meta.spec.ts --project=m390`
Expected: FAIL — robots meta 없음, 제목 불일치

- [ ] **Step 3: `app/globals.css` 작성** (승인 시안 d2.html의 CSS를 토큰 이름으로 옮긴 것)

```css
@import "tailwindcss";

@theme {
  --color-ink: #141414;
  --color-ink-2: #474747;
  --color-mute: #6c6c6c;
  --color-control: #8a8a8a;
  --color-dash: #b5b5b5;
  --color-line: #e7e7e7;
  --color-band: #f3f3f3;
  --color-paper: #ffffff;
  --color-camellia: #b4152b;
  --color-slate: #3b4148;
  --ease-out-quart: cubic-bezier(.25, 1, .5, 1);
  --ease-in-stamp: cubic-bezier(.7, 0, .84, 0);
}
@theme inline {
  --font-sans: "Pretendard Variable", Pretendard, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  --font-serif: var(--font-hahmlet), "Nanum Myeongjo", serif;
}

@layer base {
  html { color-scheme: light; background: var(--color-band); }
  body {
    max-width: 430px; min-height: 100dvh; margin: 0 auto;
    background: var(--color-paper); color: var(--color-ink); font-family: var(--font-sans);
    line-height: 1.5; letter-spacing: -0.01em; word-break: keep-all; -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3 { text-wrap: balance; }
  button { cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
  img { -webkit-touch-callout: none; user-select: none; }
  :focus-visible { outline: 2px solid var(--color-ink); outline-offset: 2px; }
}

@layer components {
  .screen-enter { animation: fade 160ms var(--ease-out-quart) both; }
  .has-bar { padding-bottom: calc(110px + env(safe-area-inset-bottom)); }

  /* 머리글 */
  .mainhead { position: sticky; top: 0; z-index: 10; height: 52px; display: flex; align-items: center; padding: 0 16px; background: var(--color-paper); }
  .subhead { position: sticky; top: 0; z-index: 10; height: 52px; display: grid; grid-template-columns: 44px 1fr 44px; align-items: center; padding: 0 2px; background: var(--color-paper); }
  .subhead h1 { text-align: center; font-size: 16px; font-weight: 600; }
  .icon-btn { width: 44px; height: 44px; display: grid; place-items: center; }
  .wordmark { display: flex; align-items: center; gap: 7px; font-family: var(--font-serif); font-weight: 700; font-size: 20px; line-height: 1; letter-spacing: -.03em; }
  .seal { width: 19px; height: 19px; display: grid; place-items: center; background: var(--color-camellia); color: #fff; font-family: var(--font-serif); font-weight: 700; font-size: 12px; filter: url(#ink-soft); }
  .wordmark-inverse { color: #fff; }
  .wordmark-inverse .seal { background: #fff; color: var(--color-camellia); }

  /* 도장 */
  .stamp { display: grid; place-items: center; text-align: center; color: var(--color-camellia); border: 2px solid var(--color-camellia); font-family: var(--font-serif); font-weight: 700; line-height: 1.05; filter: url(#ink); opacity: .96; }
  .stamp-round { border-radius: 9999px; }

  /* ① 상품 */
  .gallery { position: relative; }
  .gallery > img { width: 100%; height: auto; aspect-ratio: 1; object-fit: cover; }
  .tag-wrap { position: absolute; left: 16px; bottom: 20px; transform: rotate(-3deg); filter: drop-shadow(0 1px 1px rgb(0 0 0 / .28)) drop-shadow(0 8px 14px rgb(0 0 0 / .2)); }
  .tag-cord { position: absolute; left: 58px; top: -64px; overflow: visible; fill: none; stroke: #e9e1d4; stroke-width: 1.6; }
  .tag { position: relative; width: 158px; padding: 27px 12px 10px; background: var(--color-paper); clip-path: polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%, 0 16px); }
  .tag-hole { position: absolute; top: 6px; left: 50%; width: 15px; height: 15px; margin-left: -7.5px; border-radius: 9999px; background: var(--color-slate); border: 2.5px solid #fff; outline: 1.5px solid #ddd5c8; }
  .tag-org { font-family: var(--font-serif); font-weight: 700; font-size: 10.5px; }
  .tag-kind { margin-top: 2px; font-size: 16px; font-weight: 800; letter-spacing: -.04em; }
  .tag-rows { margin-top: 5px; border-top: 1.5px solid var(--color-ink); }
  .tag-rows div { display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; border-bottom: 1px solid var(--color-line); }
  .tag-rows div:last-child { border-bottom: 0; }
  .tag-rows dt { color: var(--color-mute); }
  .tag-rows dd { font-weight: 700; font-variant-numeric: tabular-nums; }
  .tag-stamp { position: absolute; right: 6px; top: 22px; width: 40px; height: 40px; font-size: 11px; transform: rotate(-14deg); }
  .head { padding: 18px 16px 20px; }
  .brand-line { font-size: 13px; color: var(--color-ink-2); }
  .title { margin-top: 5px; font-size: 20px; font-weight: 700; line-height: 1.4; letter-spacing: -.035em; }
  .desc { margin-top: 1px; font-size: 14px; color: var(--color-mute); }
  .price { margin-top: 14px; display: flex; align-items: baseline; font-variant-numeric: tabular-nums; }
  .price strong { font-size: 25px; font-weight: 800; letter-spacing: -.03em; }
  .price .won { margin-left: 1px; font-size: 18px; font-weight: 700; }
  .price .unit { margin-left: 8px; font-size: 12.5px; color: var(--color-mute); }
  .band { height: 8px; background: var(--color-band); }
  .info { padding: 10px 16px 6px; }
  .info div { display: grid; grid-template-columns: 64px 1fr; padding: 8px 0; font-size: 14px; }
  .info dt { font-size: 13.5px; color: var(--color-mute); }
  .story { padding: 36px 16px 0; }
  .story h2 { font-family: var(--font-serif); font-weight: 700; font-size: 21px; line-height: 1.42; letter-spacing: -.03em; }
  .story p { margin-top: 12px; font-size: 15px; line-height: 1.75; }
  .story figure { margin: 24px -16px 0; }
  .story img { width: 100%; height: auto; aspect-ratio: 4 / 3; object-fit: cover; }
  .story figcaption { padding: 8px 16px 0; font-size: 12px; color: var(--color-mute); }
  .foot { padding: 28px 16px; font-size: 12px; line-height: 1.7; color: var(--color-mute); }

  /* 하단 바 */
  .bar { position: fixed; bottom: 0; left: 50%; z-index: 20; width: 100%; max-width: 430px; transform: translateX(-50%); padding: 10px 12px calc(10px + env(safe-area-inset-bottom)); background: var(--color-paper); border-top: 1px solid var(--color-line); }
  .bar-row { display: flex; gap: 8px; }
  .bar-note { margin-top: 6px; text-align: center; font-size: 11px; color: var(--color-mute); }
  .btn-primary { flex: 1; height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 8px; background: var(--color-camellia); color: #fff; font-size: 16.5px; font-weight: 700; line-height: 1.25; }
  .btn-primary small { margin-top: 2px; font-size: 11.5px; font-weight: 500; opacity: .88; }
  .btn-primary:disabled { cursor: default; background: #d9d9d9; color: var(--color-ink-2); }
  .btn-ghost { height: 56px; padding: 0 16px; border: 1px solid #cfcfcf; border-radius: 8px; background: var(--color-paper); font-size: 14.5px; font-weight: 600; }

  /* ②④ 검사표 */
  .ask { padding: 16px 16px 0; font-size: 15.5px; font-weight: 600; letter-spacing: -.02em; }
  .doc { margin: 12px 16px 0; border: 1px solid var(--color-ink); background: var(--color-paper); }
  .doc-head { display: flex; justify-content: space-between; align-items: flex-end; padding: 13px 13px 10px; border-bottom: 3px double var(--color-ink); }
  .doc-head h2 { font-family: var(--font-serif); font-weight: 700; font-size: 19px; line-height: 1.2; letter-spacing: -.03em; }
  .doc-head p { font-size: 11px; line-height: 1.5; text-align: right; color: var(--color-mute); font-variant-numeric: tabular-nums; }
  .doc-meta { display: flex; justify-content: space-between; padding: 7px 13px; font-size: 12px; color: var(--color-ink-2); border-bottom: 1px solid var(--color-ink); }
  .sheet { min-width: 0; margin: 0; padding: 0; border: 0; }
  .sheet-row { display: grid; grid-template-columns: 40px 94px 52px 1fr 44px; align-items: center; padding: 9px 0 9px 13px; border-bottom: 1px solid var(--color-line); font-variant-numeric: tabular-nums; }
  .sheet[data-mode="result"] .sheet-row { grid-template-columns: 40px 94px 52px 1fr; }
  .sheet-row:last-child { border-bottom: 0; }
  .sheet-th { padding-top: 7px; padding-bottom: 6px; font-size: 11px; font-weight: 500; color: var(--color-mute); }
  label.sheet-row { cursor: pointer; }
  label.sheet-row:has(input:checked) { background: #f6f6f6; }
  label.sheet-row:has(input:focus-visible) { outline: 2px solid var(--color-ink); outline-offset: -2px; }
  .sheet-id { font-family: var(--font-serif); font-weight: 700; font-size: 20px; }
  .sheet-size { font-size: 15px; font-weight: 700; }
  .sheet-brix { font-size: 13px; color: var(--color-mute); }
  .sheet-row[data-state="done"] .sheet-brix { font-size: 17px; font-weight: 800; color: var(--color-ink); }
  .sheet-row[data-state="done"] .sheet-brix small { margin-left: 2px; font-size: 12px; font-weight: 600; color: var(--color-mute); }
  .sheet-row[data-state="idle"] .gauge { opacity: .45; }
  .sheet-row[data-state="idle"] :is(.sheet-id, .sheet-size) { color: var(--color-mute); }
  .gauge { width: 78px; height: 78px; display: grid; place-items: center; border: 1px dashed var(--color-dash); border-radius: 9999px; }
  .gauge > span { width: var(--d); height: var(--d); overflow: hidden; border-radius: 9999px; }
  .gauge img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.3); }
  .checkbox { width: 22px; height: 22px; display: grid; place-items: center; border: 1.5px solid var(--color-control); }
  .checkbox svg { opacity: 0; }
  label.sheet-row:has(input:checked) .checkbox { background: var(--color-ink); border-color: var(--color-ink); }
  label.sheet-row:has(input:checked) .checkbox svg { opacity: 1; }
  .doc-foot { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 13px; border-top: 1px solid var(--color-ink); }
  .doc-foot p { font-size: 11px; line-height: 1.5; color: var(--color-mute); }
  .inspector { flex: none; display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--color-mute); }
  .inspector i { position: relative; width: 46px; height: 46px; display: grid; place-items: center; border: 1px dashed var(--color-dash); }
  .inspector .stamp { position: absolute; inset: 3px; font-size: 11.5px; transform: rotate(-10deg); }
  .pending { margin: 12px 16px 0; padding: 12px 13px; display: grid; grid-template-columns: auto 1fr; column-gap: 10px; align-items: baseline; border: 1px dashed var(--color-dash); }
  .pending span { font-family: var(--font-serif); font-weight: 700; font-size: 16px; }
  .pending b { justify-self: end; font-size: 13px; font-weight: 700; }
  .pending small { grid-column: 1 / -1; margin-top: 2px; font-size: 12px; color: var(--color-mute); }

  /* ③ 측정 */
  .screen-measure { display: flex; flex-direction: column; height: 100vh; height: 100dvh; }
  .instrument { flex: 1; min-height: 0; display: grid; place-items: center; }
  .dial { position: relative; width: 262px; height: 262px; display: grid; place-items: center; border: 1px dashed var(--color-dash); border-radius: 9999px; }
  .dial-size { position: absolute; top: -8px; left: 50%; transform: translateX(-50%); padding: 0 6px; background: var(--color-paper); font-size: 11px; color: var(--color-mute); }
  .dial-pulse { position: absolute; inset: -14px; border: 2px solid rgb(20 20 20 / .18); border-radius: 9999px; }
  .dial-fruit { width: 228px; height: 228px; overflow: hidden; border-radius: 9999px; transition: transform 160ms var(--ease-out-quart); }
  .dial:active .dial-fruit { transform: scale(.96); transition-duration: 90ms; }
  .dial-fruit img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.3); }
  .readout { padding: 0 20px; }
  .readout-row { display: flex; justify-content: space-between; align-items: flex-end; }
  .readout-row b { font-size: 54px; font-weight: 800; line-height: 1; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
  .readout-row b small { margin-left: 4px; font-size: 17px; font-weight: 600; letter-spacing: 0; color: var(--color-mute); }
  .readout-row > span { padding-bottom: 6px; font-size: 13px; color: var(--color-mute); font-variant-numeric: tabular-nums; }
  .meter { position: relative; height: 30px; margin-top: 14px; }
  .meter-scale { position: absolute; inset: 0 0 auto; height: 9px; border-bottom: 1px solid var(--color-ink); background: repeating-linear-gradient(90deg, #9a9a9a 0 1px, transparent 1px 5%); }
  .meter-label { position: absolute; top: 13px; transform: translateX(-50%); font-size: 11px; color: var(--color-mute); font-variant-numeric: tabular-nums; }
  .meter-pin { position: absolute; top: -7px; left: calc(var(--v) / 20 * 100%); width: 2px; height: 18px; background: var(--color-ink); transition: left 300ms var(--ease-out-quart); }
  .stamp-cells { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; padding: 18px 20px 0; list-style: none; }
  .stamp-cells li { position: relative; aspect-ratio: 1; display: grid; place-items: center; border: 1px solid #d2d2d2; }
  .stamp-cells li::before { content: attr(data-n); position: absolute; top: 2px; left: 4px; font-size: 10.5px; color: var(--color-mute); }
  .stamp-cells li[data-state="next"] { border: 1.5px dashed var(--color-ink); }
  .stamp-cells .stamp { width: 70%; height: 70%; font-size: 14px; transform: rotate(-12deg); animation: stamp-in 140ms var(--ease-in-stamp) both; }
  .tap-note { padding-top: 14px; text-align: center; font-size: 15px; font-weight: 600; }
  .m-note { padding: 6px 0 calc(16px + env(safe-area-inset-bottom)); text-align: center; font-size: 11px; color: var(--color-mute); }

  /* ⑤ 판정 전환 */
  .judging { position: fixed; top: 0; bottom: 0; left: 50%; z-index: 30; width: 100%; max-width: 430px; transform: translateX(-50%); overflow: hidden; background: var(--color-ink); color: #fff; }
  .judging-msg { padding-top: 120px; text-align: center; font-size: 13.5px; font-weight: 400; opacity: .88; animation: fade 400ms both; }
  .paper { position: absolute; top: 200px; right: 20px; bottom: -40px; left: 20px; padding: 22px 20px; background: var(--color-paper); color: var(--color-ink); animation: rise 700ms var(--ease-out-quart) both; }
  .paper-title { font-family: var(--font-serif); font-weight: 700; font-size: 26px; line-height: 1.2; letter-spacing: -.03em; }
  .paper-no { margin-top: 2px; padding-bottom: 10px; border-bottom: 3px double var(--color-ink); font-size: 11px; color: var(--color-mute); }
  .blank div { display: grid; grid-template-columns: 84px 1fr; align-items: end; height: 44px; font-size: 13px; color: var(--color-mute); }
  .blank dd { height: 22px; border-bottom: 1px solid #cfcfcf; }
  .big-stamp { position: absolute; top: 330px; left: 50%; width: 150px; height: 150px; margin-left: -75px; border-width: 4px; font-size: 30px; transform: rotate(-12deg); animation: slam 220ms 780ms var(--ease-in-stamp) both; }

  /* ⑥ 엔딩 */
  .ending { min-height: 100dvh; background: var(--color-camellia); color: #fff; }
  .ending .mainhead { background: var(--color-camellia); }
  .ending :focus-visible { outline-color: #fff; }
  .e-head { padding: 10px 20px 0; }
  .e-no { font-size: 12px; opacity: .88; font-variant-numeric: tabular-nums; }
  .e-head h1 { margin-top: 6px; font-family: var(--font-serif); font-weight: 700; font-size: 40px; line-height: 1.18; letter-spacing: -.045em; }
  .e-head p { margin-top: 10px; font-size: 14.5px; line-height: 1.6; opacity: .94; }
  .cert { position: relative; margin: 20px 16px 0; padding: 16px 16px 6px; background: var(--color-paper); color: var(--color-ink); }
  .cert-head { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 9px; border-bottom: 3px double var(--color-ink); }
  .cert-head h2 { font-family: var(--font-serif); font-weight: 700; font-size: 19px; letter-spacing: -.03em; }
  .cert-head span { font-size: 11px; color: var(--color-mute); }
  .cert dl div { display: grid; grid-template-columns: 76px 1fr; align-items: baseline; padding: 8px 0; border-bottom: 1px solid var(--color-line); font-size: 14px; font-variant-numeric: tabular-nums; }
  .cert dl div:last-child { border-bottom: 0; }
  .cert dt { font-size: 13px; color: var(--color-mute); }
  .cert .grade { font-family: var(--font-serif); font-weight: 700; font-size: 20px; letter-spacing: -.03em; }
  .cert .aside { margin-left: 4px; font-size: 12.5px; color: var(--color-mute); }
  .cert-stamp { position: absolute; top: 62px; right: 16px; width: 94px; height: 94px; border-width: 3px; font-size: 17px; line-height: 1.1; transform: rotate(-13deg); }
  .share { padding: 16px 16px 0; }
  .share-main { width: 100%; height: 56px; display: flex; align-items: center; justify-content: center; gap: 8px; border-radius: 8px; background: #fff; color: var(--color-camellia); font-size: 16.5px; font-weight: 700; }
  .share-two { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
  .share-two button { height: 48px; border: 1px solid rgb(255 255 255 / .75); border-radius: 8px; color: #fff; font-size: 14.5px; font-weight: 600; }
  .share-manual { margin-top: 10px; font-size: 12px; opacity: .94; }
  .share-manual input { width: 100%; height: 44px; margin-top: 6px; padding: 0 12px; border-radius: 8px; background: #fff; color: var(--color-ink); font-size: 14px; }
  .disc { padding: 14px 20px calc(22px + env(safe-area-inset-bottom)); text-align: center; font-size: 11.5px; line-height: 1.6; opacity: .88; }
}

@keyframes fade { from { opacity: 0; } }
@keyframes stamp-in { from { opacity: 0; transform: rotate(-12deg) scale(1.35); } }
@keyframes rise { from { transform: translateY(110%); } }
@keyframes slam { from { opacity: 0; transform: rotate(-12deg) scale(2.3); } to { opacity: .9; transform: rotate(-12deg) scale(1); } }
@keyframes stamp-fade { from { opacity: 0; } to { opacity: .9; } }

@media (prefers-reduced-motion: reduce) {
  .paper, .judging-msg { animation: fade 200ms both; }
  .big-stamp { animation: stamp-fade 120ms 400ms both; }
  .stamp-cells .stamp { animation: fade 120ms both; }
  .meter-pin, .dial-fruit { transition: none; }
  .dial:active .dial-fruit { transform: none; }
}
```

- [ ] **Step 4: 공용 컴포넌트 작성**

```tsx
// components/Stamp.tsx
import type { ReactNode } from 'react';

/** 도장·인장 인주 질감. layout에서 한 번만 렌더한다. */
export function InkFilters() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <filter id="ink" x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={2.4} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves={1} seed={9} result="s" />
        <feColorMatrix in="s" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.6" result="m" />
        <feComposite in="d" in2="m" operator="in" />
      </filter>
      <filter id="ink-soft" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves={1} seed={2} result="s" />
        <feColorMatrix in="s" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.55" result="m" />
        <feComposite in="SourceGraphic" in2="m" operator="in" />
      </filter>
    </svg>
  );
}

type StampProps = { children: ReactNode; shape?: 'round' | 'square'; className?: string; label?: string };

/** 도장은 장식이다. 의미가 있으면 label을 넘겨 화면 낭독용 문구를 둔다. */
export function Stamp({ children, shape = 'round', className = '', label }: StampProps) {
  return (
    <>
      <span aria-hidden="true" className={`stamp ${shape === 'round' ? 'stamp-round' : ''} ${className}`}>{children}</span>
      {label ? <span className="sr-only">{label}</span> : null}
    </>
  );
}
```

```tsx
// components/Wordmark.tsx
export function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <p className={`wordmark ${inverse ? 'wordmark-inverse' : ''}`}>
      귤상회<span className="seal" aria-hidden="true">選</span>
    </p>
  );
}
```

```tsx
// components/icons.tsx
const base = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true" {...base}><path d="M15 5l-7 7 7 7" /></svg>
);
export const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true" {...base}><path d="M12 15V3.5M7.5 8 12 3.5 16.5 8" /><path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5" /></svg>
);
```

- [ ] **Step 5: `app/layout.tsx`와 파비콘**

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Hahmlet } from 'next/font/google';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './globals.css';
import { InkFilters } from '@/components/Stamp';

// 한글 글리프는 unicode-range 조각으로 필요한 것만 받는다(preload 끔).
const hahmlet = Hahmlet({ weight: '700', display: 'swap', preload: false, variable: '--font-hahmlet' });

const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const TITLE = '제주 서귀포 햇귤 10kg · 29,900원 | 귤상회';
const DESC = '노지 온주밀감 2S~M 혼합 · 무료배송 · 당도 검사 10초';

export const metadata: Metadata = {
  metadataBase: new URL(prod ? `https://${prod}` : 'http://localhost:3000'),
  title: '제주 서귀포 햇귤 10kg | 귤상회',
  description: DESC,
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '귤상회',
    title: TITLE,
    description: DESC,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: '선별대 위 노지감귤과 선별 태그' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={hahmlet.variable}>
      <body>
        <InkFilters />
        {children}
      </body>
    </html>
  );
}
```

```svg
<!-- app/icon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#b4152b"/><text x="16" y="23" font-family="serif" font-size="20" font-weight="700" text-anchor="middle" fill="#fff">選</text></svg>
```
`public/og.jpg`가 아직 없으므로 1200×630 임시 파일을 둔다. 아무 jpg를 복사해도 되며, Task 9에서 교체한다.

- [ ] **Step 6: 통과 확인**

Run: `npx playwright test tests/meta.spec.ts --project=m390`
Expected: PASS 2. 폰트 테스트가 실패하면 브라우저 개발자 도구 Network에서 `/_next/static/media/*.woff2`로 받는지 확인한다. Pretendard CSS 경로가 패키지 버전에 따라 다르면 `node_modules/pretendard/dist/web/variable/`에서 실제 파일명을 찾아 import 경로를 고친다.

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "feat: add design tokens, fonts, metadata and Playwright harness" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

**완료 조건:** meta 테스트 통과, 빌드 통과, 파비콘이 選 인장으로 보인다(개발 서버에서 확인).

### Task 4: ① 상품 상세

**Files:**
- Create: `assets/images/hero.jpg`, `assets/images/story.jpg`, `assets/images/fruit-a.jpg`, `fruit-b.jpg`, `fruit-c.jpg`
- Create: `components/SortingTag.tsx`, `components/BottomBar.tsx`, `components/ProductPage.tsx`, `components/fruitImages.ts`, `components/Game.tsx`(이 작업에서는 상품 화면만), `tests/flow.spec.ts`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `Wordmark`, `Stamp`, `InkFilters`, `initialState`, `reduce`, `assignBrix`
- Produces:
  - `ProductPage()`(서버 컴포넌트)
  - `BottomBar({ children, note? })`
  - `FRUIT_IMG: Record<FruitId, StaticImageData>`, `GAUGE_PX: Record<Size, number>`
  - `Game({ product })`

- [ ] **Step 1: 사진 내려받기** (G4 승인 범위. Unsplash 라이선스, 자체 호스팅)

```bash
mkdir -p assets/images
U=https://images.unsplash.com
curl -L -o assets/images/hero.jpg   "$U/photo-1634381542914-46a782e5192d?fm=jpg&q=82&w=1600&h=1600&fit=crop"
curl -L -o assets/images/fruit-a.jpg "$U/photo-1634381542914-46a782e5192d?fm=jpg&q=85&w=600&rect=813,1135,645,645"
curl -L -o assets/images/fruit-b.jpg "$U/photo-1634381542914-46a782e5192d?fm=jpg&q=85&w=600&rect=1337,1062,645,645"
curl -L -o assets/images/fruit-c.jpg "$U/photo-1634381542914-46a782e5192d?fm=jpg&q=85&w=600&rect=2271,1680,645,645"
curl -L -o assets/images/story.jpg  "$U/photo-1763566199190-04a65ea7a107?fm=jpg&q=80&w=1200&h=900&fit=crop"
ls -la assets/images
```
Expected: 5개 파일. hero는 600KB 이하, fruit는 각각 150KB 이하. 열어서 DESIGN.md §7 장면과 같은지 눈으로 확인한다.

- [ ] **Step 2: 실패하는 테스트 작성** (`tests/flow.spec.ts`)

```ts
import { test, expect } from '@playwright/test';
import { open } from './helpers';

test.describe('① 상품 상세', () => {
  test.beforeEach(async ({ page }) => { await open(page); });

  test('핵심 정보와 CTA가 첫 화면에 보인다', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: '제주 서귀포 햇귤 10kg' })).toBeInViewport();
    await expect(page.getByText('29,900', { exact: true })).toBeInViewport();
    await expect(page.getByText('무료배송')).toBeInViewport();
    await expect(page.getByRole('button', { name: /당도 검사 받기/ })).toBeInViewport();
  });

  test('동작하지 않는 UI와 구매 표현, 생산 이력 표기가 없다', async ({ page }) => {
    await expect(page.getByRole('button', { name: /검색|장바구니|찜/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /검색|장바구니/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /구매/ })).toHaveCount(0);
    await expect(page.getByText(/원산지|상품정보제공고시|수확일|생산자/)).toHaveCount(0);
    await expect(page.getByText('1 / 4')).toHaveCount(0);
  });

  test('푸터에 가상 상점 고지가 있다', async ({ page }) => {
    await expect(page.getByText(/실제로 존재하지 않는 가상의 상점/)).toBeAttached();
  });
});
```

- [ ] **Step 3: 실패 확인**

Run: `npx playwright test tests/flow.spec.ts --project=m390`
Expected: FAIL — heading을 찾지 못함

- [ ] **Step 4: 구현**

```ts
// components/fruitImages.ts
import type { StaticImageData } from 'next/image';
import a from '@/assets/images/fruit-a.jpg';
import b from '@/assets/images/fruit-b.jpg';
import c from '@/assets/images/fruit-c.jpg';
import type { FruitId, Size } from '@/lib/game';

// 시료 사진은 위치(A·B·C)에 고정. 당도는 판마다 무작위다(FR-6).
export const FRUIT_IMG: Record<FruitId, StaticImageData> = { A: a, B: b, C: c };
export const GAUGE_PX: Record<Size, number> = { '2S': 50, S: 61, M: 72 };
```

```tsx
// components/SortingTag.tsx
import { Stamp } from './Stamp';

export function SortingTag() {
  return (
    <div className="tag-wrap" role="img" aria-label="선별 태그: 노지 온주밀감, 규격 2S에서 M, 중량 10kg, 선별필">
      <svg className="tag-cord" width="70" height="72" viewBox="0 0 70 72" aria-hidden="true"><path d="M22 72 C 20 46, 34 30, 66 2" /></svg>
      <div className="tag" aria-hidden="true">
        <i className="tag-hole" />
        <p className="tag-org">귤상회 선과장</p>
        <p className="tag-kind">노지 온주밀감</p>
        <dl className="tag-rows">
          <div><dt>규격</dt><dd>2S–M</dd></div>
          <div><dt>중량</dt><dd>10kg</dd></div>
        </dl>
        <Stamp className="tag-stamp">선별<br />필</Stamp>
      </div>
    </div>
  );
}
```

```tsx
// components/BottomBar.tsx
import type { ReactNode } from 'react';

export function BottomBar({ children, note }: { children: ReactNode; note?: string }) {
  return (
    <div className="bar">
      <div className="bar-row">{children}</div>
      {note ? <p className="bar-note">{note}</p> : null}
    </div>
  );
}
```

```tsx
// components/ProductPage.tsx
import Image from 'next/image';
import hero from '@/assets/images/hero.jpg';
import story from '@/assets/images/story.jpg';
import { Wordmark } from './Wordmark';
import { SortingTag } from './SortingTag';

const SIZES = '(max-width: 430px) 100vw, 430px';

export function ProductPage() {
  return (
    <main className="has-bar">
      <header className="mainhead"><Wordmark /></header>
      <div className="gallery">
        <Image src={hero} alt="선별대 위에 놓인 노지감귤. 초록빛이 남은 것과 노랗게 익은 것이 섞여 있다" loading="eager" fetchPriority="high" sizes={SIZES} placeholder="blur" />
        <SortingTag />
      </div>
      <section className="head" aria-label="상품 정보">
        <p className="brand-line">귤상회 선과장</p>
        <h1 className="title">제주 서귀포 햇귤 10kg</h1>
        <p className="desc">노지 온주밀감 · 2S~M 크기 혼합</p>
        <p className="price"><strong>29,900</strong><span className="won">원</span><span className="unit">100g당 299원</span></p>
      </section>
      <div className="band" />
      <dl className="info">
        <div><dt>배송</dt><dd>무료배송</dd></div>
        <div><dt>규격</dt><dd>10kg · 2S·S·M 혼합</dd></div>
        <div><dt>당도 검사</dt><dd>무료 · 10초</dd></div>
      </dl>
      <section className="story">
        <h2>껍질을 까는 순간,<br />달콤한 제주를 만나보세요.</h2>
        <p>귤상회는 크기는 규격으로, 맛은 당도 검사로 따로 확인합니다.</p>
        <figure>
          <Image src={story} alt="수확 자루에 담긴 노지감귤" sizes={SIZES} />
          <figcaption>노지감귤 수확</figcaption>
        </figure>
      </section>
      <footer className="foot">
        <p>귤상회(가칭)는 실제로 존재하지 않는 가상의 상점입니다. 이 페이지에서는 판매·결제·개인정보 수집이 이뤄지지 않습니다.</p>
        <p>사진: Unsplash · insung yoon, Luis Guaman</p>
      </footer>
    </main>
  );
}
```

```tsx
// components/Game.tsx (Task 4 단계: 상품 화면과 시작 버튼만. Task 5에서 확장)
'use client';
import { useReducer, type ReactNode } from 'react';
import { reduce, initialState, assignBrix } from '@/lib/game';
import { BottomBar } from './BottomBar';

export function Game({ product }: { product: ReactNode }) {
  const [s, dispatch] = useReducer(reduce, initialState);
  if (s.screen !== 'product') return null;
  return (
    <>
      {product}
      <BottomBar>
        <button className="btn-primary" onClick={() => dispatch({ type: 'start', brix: assignBrix(Math.random) })}>
          당도 검사 받기<small>무료 · 10초</small>
        </button>
      </BottomBar>
    </>
  );
}
```

```tsx
// app/page.tsx
import { Game } from '@/components/Game';
import { ProductPage } from '@/components/ProductPage';

export default function Page() {
  return <Game product={<ProductPage />} />;
}
```

- [ ] **Step 5: 통과 확인**

Run: `npx playwright test tests/flow.spec.ts --project=m390 --project=m360`
Expected: PASS 6

- [ ] **Step 6: 시각 확인.** 390·360 스크린샷을 찍어 `docs/design/shots2/product-390.png`와 나란히 비교한다. 차이는 DESIGN.md Phase 3 변경표에 있는 것만 허용한다.

```bash
npx playwright screenshot --viewport-size "390,844" http://localhost:3000 test-results/t4-product-390.png
npx playwright screenshot --viewport-size "360,780" http://localhost:3000 test-results/t4-product-360.png
```
CLI 스크린샷은 1배다(`--device-scale-factor` 옵션은 없다). 2배 확인은 Task 10 `visual.spec`(deviceScaleFactor 2)으로 한다. 서버는 `npm run build && npm run start`로 띄운다.

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "feat: build product detail screen with sorting tag" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

**완료 조건:** E2E 통과, 두 폭 스크린샷이 시안과 일치(변경표 외 차이 없음), 상품 첫 화면에 상품명·가격·배송·CTA가 모두 보임.

### Task 5: 게임 루트와 ② 귤 선택

**Files:**
- Create: `components/InspectionSheet.tsx`, `components/screens/SelectScreen.tsx`, `components/screens/types.ts`
- Modify: `components/Game.tsx`, `tests/flow.spec.ts`

**Interfaces:**
- Consumes: `GameState`, `GameEvent`, `FRUITS`, `SIZE_OF`, `DOC_NO`, `formatDocDate`, `FRUIT_IMG`, `GAUGE_PX`, `Stamp`, `BottomBar`, `BackIcon`, `CheckIcon`
- Produces:
  - `type ScreenProps = { s: GameState; dispatch: (e: GameEvent) => void; headingRef: RefObject<HTMLHeadingElement | null>; today: string }`
  - `InspectionSheet({ s, today, mode: 'select'|'result', onPick? })`
  - `SelectScreen(props: ScreenProps)`

- [ ] **Step 1: 실패하는 테스트 추가** (`tests/flow.spec.ts` 끝에)

```ts
import { toSelect, pickRow } from './helpers';

test.describe('② 귤 선택', () => {
  test.beforeEach(async ({ page }) => { await open(page); await toSelect(page); });

  test('고르기 전 시작 버튼은 비활성, 고르면 시료 이름이 붙는다', async ({ page }) => {
    await expect(page.getByRole('button', { name: '검사할 귤을 고르세요' })).toBeDisabled();
    await pickRow(page, 'B').click();
    await expect(page.getByRole('radio', { name: /시료 B/ })).toBeChecked();
    await expect(page.getByRole('button', { name: 'B 시료 검사 시작' })).toBeEnabled();
  });

  test('규격과 당도의 무관함을 밝히고, 날짜는 오늘이다', async ({ page }) => {
    await expect(page.getByText(/크기·색과 관계없이 정해집니다/)).toBeVisible();
    await expect(page.getByText('2026.11.05')).toBeVisible();
    await expect(page.getByText('연출된 체험 · 판매·결제 없음')).toBeVisible();
  });

  test('화면이 바뀌면 제목에 초점이 간다', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '당도 검사', exact: true })).toBeFocused();
  });

  test('뒤로 가면 상품으로 돌아가고 선택이 풀린다', async ({ page }) => {
    await pickRow(page, 'A').click();
    await page.getByRole('button', { name: '상품으로 돌아가기' }).click();
    await expect(page.getByRole('heading', { level: 1, name: '제주 서귀포 햇귤 10kg' })).toBeVisible();
    await toSelect(page);
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(0);
  });
});
```
파일 맨 위 import를 `import { open, toSelect, pickRow } from './helpers';`로 합친다. 이후 Task의 테스트 조각에 있는 `import` 줄도 모두 파일 맨 위의 한 줄로 합친다.

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/flow.spec.ts --project=m390 -g "귤 선택"`
Expected: FAIL — '당도 검사' 제목 없음

- [ ] **Step 3: 구현**

```ts
// components/screens/types.ts
import type { RefObject } from 'react';
import type { GameEvent, GameState } from '@/lib/game';

export type ScreenProps = {
  s: GameState;
  dispatch: (e: GameEvent) => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
  today: string;
};
```

```tsx
// components/InspectionSheet.tsx
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { DOC_NO, FRUITS, SIZE_OF, type FruitId, type GameState } from '@/lib/game';
import { FRUIT_IMG, GAUGE_PX } from './fruitImages';
import { Stamp } from './Stamp';
import { CheckIcon } from './icons';

type Props = { s: GameState; today: string; mode: 'select' | 'result'; onPick?: (f: FruitId) => void };

export function InspectionSheet({ s, today, mode, onPick }: Props) {
  const select = mode === 'select';
  return (
    <section className="doc" aria-labelledby="doc-title">
      <div className="doc-head">
        <h2 id="doc-title">당도 검사표</h2>
        <p>{DOC_NO}<br />{select ? today : '검사 완료'}</p>
      </div>
      <div className="doc-meta"><span>귤상회 선과장</span><span>노지 온주밀감 · 10kg</span></div>
      <fieldset className="sheet" data-mode={mode}>
        <legend className="sr-only">검사할 시료</legend>
        <div className="sheet-row sheet-th" aria-hidden="true">
          <span>시료</span><span /><span>규격</span><span>당도*</span>{select ? <span>선택</span> : null}
        </div>
        {FRUITS.map((f) => {
          const gauge = (
            <span className="gauge" style={{ '--d': `${GAUGE_PX[SIZE_OF[f]]}px` } as CSSProperties}>
              <span><Image src={FRUIT_IMG[f]} alt="" sizes="72px" /></span>
            </span>
          );
          if (select) {
            return (
              <label key={f} className="sheet-row">
                <input type="radio" name="sample" value={f} className="sr-only"
                  aria-label={`시료 ${f}, 규격 ${SIZE_OF[f]}`} checked={s.pick === f} onChange={() => onPick?.(f)} />
                <span className="sheet-id">{f}</span>{gauge}
                <span className="sheet-size">{SIZE_OF[f]}</span>
                <span className="sheet-brix">—</span>
                <span className="checkbox" aria-hidden="true"><CheckIcon /></span>
              </label>
            );
          }
          const done = s.pick === f;
          return (
            <div key={f} className="sheet-row" data-state={done ? 'done' : 'idle'}>
              <span className="sheet-id">{f}</span>{gauge}
              <span className="sheet-size">{SIZE_OF[f]}</span>
              <span className="sheet-brix">{done ? <>{s.brix[f].toFixed(1)}<small>°Bx</small></> : '미검사'}</span>
            </div>
          );
        })}
      </fieldset>
      <div className="doc-foot">
        <p>* 당도는 체험용 연출 수치이며 귤의 크기·색과 관계없이 정해집니다. 규격(2S·S·M)은 크기 등급입니다.</p>
        <span className="inspector">검사원<i>{select ? null : <Stamp shape="square" label="검사 완료">검사<br />필</Stamp>}</i></span>
      </div>
    </section>
  );
}
```

```tsx
// components/screens/SelectScreen.tsx
import { InspectionSheet } from '../InspectionSheet';
import { BottomBar } from '../BottomBar';
import { BackIcon } from '../icons';
import type { ScreenProps } from './types';

export function SelectScreen({ s, dispatch, headingRef, today }: ScreenProps) {
  return (
    <main className="has-bar screen-enter">
      <header className="subhead">
        <button className="icon-btn" onClick={() => dispatch({ type: 'back' })} aria-label="상품으로 돌아가기"><BackIcon /></button>
        <h1 ref={headingRef} tabIndex={-1}>당도 검사</h1>
        <span />
      </header>
      <p className="ask">검사할 귤을 하나 고르세요.</p>
      <InspectionSheet mode="select" s={s} today={today} onPick={(fruit) => dispatch({ type: 'pick', fruit })} />
      <BottomBar note="연출된 체험 · 판매·결제 없음">
        <button className="btn-primary" disabled={!s.pick} onClick={() => dispatch({ type: 'begin' })}>
          {s.pick ? `${s.pick} 시료 검사 시작` : '검사할 귤을 고르세요'}
        </button>
      </BottomBar>
    </main>
  );
}
```

```tsx
// components/Game.tsx (Task 5 이후 최종 형태. 아직 없는 화면은 해당 Task에서 import를 추가한다)
'use client';
import { useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { reduce, initialState, assignBrix, formatDocDate, TAPS_REQUIRED } from '@/lib/game';
import { BottomBar } from './BottomBar';
import { SelectScreen } from './screens/SelectScreen';

export function Game({ product }: { product: ReactNode }) {
  const [s, dispatch] = useReducer(reduce, initialState);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // 렌더 중 new Date()는 react-hooks/purity 위반이라 지연 초기값으로 한 번만 읽는다.
  // ponytail: 자정을 넘겨 계속 플레이해도 날짜는 첫 렌더 기준. 20초 체험이라 갱신하지 않는다
  const [today] = useState(() => formatDocDate(new Date()));

  // 화면이 바뀌면 맨 위로 + 제목에 초점 (DESIGN §10)
  useEffect(() => {
    window.scrollTo(0, 0);
    if (s.screen !== 'product') headingRef.current?.focus();
  }, [s.screen]);

  // 5번째 탭 450ms 뒤 결과로 (DESIGN §6)
  useEffect(() => {
    if (s.screen !== 'measure' || s.taps !== TAPS_REQUIRED) return;
    const id = window.setTimeout(() => dispatch({ type: 'finish' }), 450);
    return () => window.clearTimeout(id);
  }, [s.screen, s.taps]);

  // 판정 전환 1500ms(축소 모션 800ms) 뒤 엔딩으로
  // 축소 모션 여부는 전환이 시작될 때 한 번 읽으면 된다(상태·구독 불필요)
  useEffect(() => {
    if (s.screen !== 'judging') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = window.setTimeout(() => dispatch({ type: 'reveal' }), reduced ? 800 : 1500);
    return () => window.clearTimeout(id);
  }, [s.screen]);

  const props = { s, dispatch, headingRef, today };

  switch (s.screen) {
    case 'product':
      return (
        <>
          {product}
          <BottomBar>
            <button className="btn-primary" onClick={() => dispatch({ type: 'start', brix: assignBrix(Math.random) })}>
              당도 검사 받기<small>무료 · 10초</small>
            </button>
          </BottomBar>
        </>
      );
    case 'select':
      return <SelectScreen {...props} />;
    default:
      return null; // Task 6~8에서 measure·result·judging·ending을 채운다
  }
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx playwright test tests/flow.spec.ts --project=m390 --project=m360`
Expected: PASS 14

- [ ] **Step 5: 시각 확인.** `docs/design/shots2/select-390.png`와 비교한다. 허용하는 차이는 기본 선택 없음과 비활성 버튼 상태뿐이다.

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "feat: add game root and inspection sheet selection screen" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

**완료 조건:** E2E 통과, 키보드로 시료를 고를 수 있음(Tab → 방향키), 스크린샷 비교 통과.

### Task 6: ③ 당도 측정

**Files:**
- Create: `components/screens/MeasureScreen.tsx`
- Modify: `components/Game.tsx`(case 'measure' 추가), `tests/flow.spec.ts`

**Interfaces:**
- Consumes: `ScreenProps`, `readingAt`, `SIZE_OF`, `TAPS_REQUIRED`, `FRUIT_IMG`, `Stamp`
- Produces: `MeasureScreen(props: ScreenProps)`

- [ ] **Step 1: 실패하는 테스트 추가**

```ts
import { toMeasure, tapFruit } from './helpers';

test.describe('③ 당도 측정', () => {
  test.beforeEach(async ({ page }) => { await open(page); await toMeasure(page, 'C'); });

  test('탭마다 횟수·측정값·도장이 오르고 5회 뒤 결과로 간다', async ({ page }) => {
    await expect(page.getByText('0 / 5회')).toBeVisible();
    await tapFruit(page, 3);
    await expect(page.getByText('3 / 5회')).toBeVisible();
    await expect(page.getByText('9.5', { exact: true })).toBeVisible();   // C=15.8 × 3/5
    await expect(page.locator('.stamp-cells li[data-state="on"]')).toHaveCount(3);
    await tapFruit(page, 2);
    const fruit = page.getByRole('button', { name: /귤 누르기/ });
    await expect(fruit).toHaveAttribute('aria-disabled', 'true');
    // aria-disabled 요소는 Playwright가 비활성으로 보고 click()이 시간 초과까지 기다린다. 6번째는 force로 눌러 무시되는지 본다
    await fruit.click({ force: true });
    await expect(page.getByText('5 / 5회')).toBeVisible();
    await expect(page.getByText('측정 완료')).toBeVisible();
    await page.clock.runFor(500);
    await expect(page.getByRole('heading', { name: '검사 결과' })).toBeVisible();
  });

  test('뒤로 가면 선택으로 가고 탭 수가 초기화된다', async ({ page }) => {
    await tapFruit(page, 2);
    await page.getByRole('button', { name: '귤 다시 고르기' }).click();
    await expect(page.getByRole('radio', { name: /시료 C/ })).toBeChecked();
    await page.getByRole('button', { name: 'C 시료 검사 시작' }).click();
    await expect(page.getByText('0 / 5회')).toBeVisible();
  });

  test('키보드 Space로도 측정한다', async ({ page }) => {
    await page.getByRole('button', { name: /귤 누르기/ }).focus();
    await page.keyboard.press('Space');
    await expect(page.getByText('1 / 5회')).toBeVisible();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/flow.spec.ts --project=m390 -g "당도 측정"`
Expected: FAIL

- [ ] **Step 3: 구현**

```tsx
// components/screens/MeasureScreen.tsx
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { readingAt, SIZE_OF, TAPS_REQUIRED } from '@/lib/game';
import { FRUIT_IMG } from '../fruitImages';
import { Stamp } from '../Stamp';
import { BackIcon } from '../icons';
import type { ScreenProps } from './types';

const CELLS = [1, 2, 3, 4, 5];
const LABELS = [0, 5, 10, 15, 20];

export function MeasureScreen({ s, dispatch, headingRef }: ScreenProps) {
  const fruit = s.pick!; // measure 화면은 pick이 있을 때만 열린다(reduce 'begin' 조건)
  const v = readingAt(s.brix[fruit], s.taps);
  const done = s.taps >= TAPS_REQUIRED;
  const tap = () => {
    if (done) return;
    navigator.vibrate?.(8);
    dispatch({ type: 'tap' });
  };
  return (
    <main className="screen-measure screen-enter">
      <header className="subhead">
        <button className="icon-btn" onClick={() => dispatch({ type: 'back' })} aria-label="귤 다시 고르기"><BackIcon /></button>
        <h1 ref={headingRef} tabIndex={-1}>당도 검사 · {fruit} 시료</h1>
        <span />
      </header>
      <div className="instrument">
        <button className="dial" onClick={tap} aria-disabled={done} aria-label={`귤 누르기, 5번 중 ${s.taps}번 누름`}>
          <span className="dial-size">규격 {SIZE_OF[fruit]}</span>
          <span className="dial-pulse" aria-hidden="true" />
          <span className="dial-fruit"><Image src={FRUIT_IMG[fruit]} alt="" sizes="228px" /></span>
        </button>
      </div>
      <div className="readout">
        <p className="readout-row"><b><span>{v.toFixed(1)}</span><small>°Bx</small></b><span>{s.taps} / 5회</span></p>
        <div className="meter" style={{ '--v': v } as CSSProperties} aria-hidden="true">
          <div className="meter-scale" />
          <i className="meter-pin" />
          {LABELS.map((n) => <span key={n} className="meter-label" style={{ left: `${(n / 20) * 100}%` }}>{n}</span>)}
        </div>
      </div>
      <ol className="stamp-cells" aria-hidden="true">
        {CELLS.map((n) => (
          <li key={n} data-n={n} data-state={n <= s.taps ? 'on' : n === s.taps + 1 ? 'next' : 'empty'}>
            {n <= s.taps ? <Stamp>톡</Stamp> : null}
          </li>
        ))}
      </ol>
      <p className="tap-note">{done ? '측정 완료' : '귤을 누르세요'}</p>
      <p className="sr-only" aria-live="polite">{s.taps > 0 ? `${s.taps}번째, ${v.toFixed(1)} 브릭스` : ''}</p>
      <p className="m-note">측정값은 연출된 수치입니다</p>
    </main>
  );
}
```
`Game.tsx`의 switch에 `case 'measure': return <MeasureScreen {...props} />;`와 import를 추가한다.

- [ ] **Step 4: 통과 확인**

Run: `npx playwright test tests/flow.spec.ts --project=m390 --project=m360`
Expected: PASS 20

- [ ] **Step 5: 시각 확인** (`measure-390.png`와 비교, 3/5 상태)
- [ ] **Step 6: 커밋** — `feat: add five-tap measuring screen with stamp feedback`

**완료 조건:** E2E 통과, 360px에서 링·측정값·도장 칸이 한 화면에 들어감(스크롤 없음).

### Task 7: ④ 결과와 ⑤ 판정 전환

**Files:**
- Create: `components/screens/ResultScreen.tsx`, `components/screens/JudgingScreen.tsx`
- Modify: `components/Game.tsx`(case 'result', 'judging'), `tests/flow.spec.ts`

**Interfaces:**
- Consumes: `ScreenProps`, `InspectionSheet`, `assignBrix`, `DOC_NO`, `Stamp`, `BottomBar`
- Produces: `ResultScreen(props)`, `JudgingScreen({ headingRef })`

- [ ] **Step 1: 실패하는 테스트 추가**

```ts
import { toResult, toJudging } from './helpers';

test.describe('④ 결과 · ⑤ 판정 전환', () => {
  test('고른 시료만 당도를 보이고 나머지는 미검사다', async ({ page }) => {
    await open(page);
    await toResult(page, 'C');
    await expect(page.getByText('15.8')).toBeVisible();
    await expect(page.getByText('미검사')).toHaveCount(2);
    await expect(page.getByText('검사 완료', { exact: true })).toBeAttached();
    await expect(page.getByText('발급 대기')).toBeVisible();
  });

  test('당도는 규격과 무관하게 배정된다 (random=0 → C는 12.4)', async ({ page }) => {
    await open(page, { random: 0 });
    await toResult(page, 'C');
    await expect(page.getByText('12.4')).toBeVisible();
  });

  test('다시 검사하면 선택으로 돌아가고 선택이 풀린다', async ({ page }) => {
    await open(page);
    await toResult(page);
    await page.getByRole('button', { name: '다시 검사' }).click();
    await expect(page.getByRole('button', { name: '검사할 귤을 고르세요' })).toBeDisabled();
  });

  test('판정 받기 → 1500ms 뒤 엔딩', async ({ page }) => {
    await open(page);
    await toJudging(page);
    await page.clock.runFor(1400);
    await expect(page.getByRole('heading', { name: '귤은 없습니다.' })).toHaveCount(0);
    await page.clock.runFor(200);
    await expect(page.getByRole('heading', { name: '귤은 없습니다.' })).toBeVisible();
  });

  test('축소 모션이면 800ms 뒤 엔딩', async ({ page }) => {
    await open(page, { reducedMotion: true });
    await toJudging(page);
    await page.clock.runFor(850);
    await expect(page.getByRole('heading', { name: '귤은 없습니다.' })).toBeVisible();
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `npx playwright test tests/flow.spec.ts --project=m390 -g "결과"` → FAIL
- [ ] **Step 3: 구현**

```tsx
// components/screens/ResultScreen.tsx
import { assignBrix } from '@/lib/game';
import { InspectionSheet } from '../InspectionSheet';
import { BottomBar } from '../BottomBar';
import type { ScreenProps } from './types';

export function ResultScreen({ s, dispatch, headingRef, today }: ScreenProps) {
  return (
    <main className="has-bar screen-enter">
      <header className="subhead"><span /><h1 ref={headingRef} tabIndex={-1}>검사 결과</h1><span /></header>
      <InspectionSheet mode="result" s={s} today={today} />
      <div className="pending">
        <span>판정서</span><b>발급 대기</b><small>최종 판정을 받으면 검사가 끝납니다</small>
      </div>
      <BottomBar>
        <button className="btn-ghost" onClick={() => dispatch({ type: 'retry', brix: assignBrix(Math.random) })}>다시 검사</button>
        <button className="btn-primary" onClick={() => dispatch({ type: 'judge' })}>최종 판정 받기</button>
      </BottomBar>
    </main>
  );
}
```

```tsx
// components/screens/JudgingScreen.tsx
import { DOC_NO } from '@/lib/game';
import { Stamp } from '../Stamp';
import type { ScreenProps } from './types';

const FIELDS = ['시료', '측정 당도', '판정', '배송 예정', '결제 금액'];

export function JudgingScreen({ headingRef }: Pick<ScreenProps, 'headingRef'>) {
  return (
    <main className="judging" aria-live="polite">
      <h1 ref={headingRef} tabIndex={-1} className="judging-msg">판정서를 발급하고 있습니다</h1>
      <div className="paper" aria-hidden="true">
        <p className="paper-title">판정서</p>
        <p className="paper-no">{DOC_NO} · 귤상회 선과장</p>
        <dl className="blank">{FIELDS.map((f) => <div key={f}><dt>{f}</dt><dd /></div>)}</dl>
      </div>
      <Stamp className="big-stamp">판정</Stamp>
    </main>
  );
}
```
`Game.tsx`에 `case 'result': return <ResultScreen {...props} />;`, `case 'judging': return <JudgingScreen headingRef={headingRef} />;`를 추가한다.

- [ ] **Step 4: 통과 확인** — Run: `npx playwright test tests/flow.spec.ts --project=m390 --project=m360` → PASS 30
- [ ] **Step 5: 시각 확인** — result·judging을 시안과 비교한다. judging은 `animations: 'disabled'`의 최종 프레임이다.
- [ ] **Step 6: 커밋** — `feat: add result sheet and judging transition`

**완료 조건:** E2E 통과, 축소 모션에서 이동·확대 없이 투명도만 바뀜(개발 도구 Rendering → prefers-reduced-motion으로 눈으로 확인).

### Task 8: ⑥ 엔딩과 공유

**Files:**
- Create: `components/screens/EndingScreen.tsx`
- Modify: `components/Game.tsx`(case 'ending'), `tests/flow.spec.ts`

**Interfaces:**
- Consumes: `ScreenProps`, `gradeOf`, `SIZE_OF`, `DOC_NO`, `assignBrix`, `Wordmark`, `Stamp`, `ShareIcon`
- Produces: `EndingScreen(props)`

- [ ] **Step 1: 실패하는 테스트 추가**

```ts
import { toEnding } from './helpers';

test.describe('⑥ 엔딩 · 공유', () => {
  test('판정서 내용과 고지', async ({ page }) => {
    await open(page);
    await toEnding(page);
    for (const t of ['로얄 낚임과', '귤 0kg', '0원', 'C · 규격 M', '2026.11.05']) await expect(page.getByText(t)).toBeVisible();
    await expect(page.getByText(/가상의 상점입니다/)).toBeVisible();
  });

  test('Web Share: 사이트 루트를 결과 없이 공유한다', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __shared: unknown[] }).__shared = [];
      Object.defineProperty(navigator, 'share', { value: async (d: unknown) => { (window as unknown as { __shared: unknown[] }).__shared.push(d); } });
    });
    await open(page);
    await toEnding(page);
    await page.getByRole('button', { name: '친구도 검사받게 하기' }).click();
    const shared = await page.evaluate(() => (window as unknown as { __shared: { url: string; text: string }[] }).__shared);
    expect(shared).toHaveLength(1);
    expect(shared[0].url).toBe('http://localhost:3000/');
    expect(shared[0].text).not.toMatch(/낚|없습니다|판정/);
  });

  test('Web Share가 없으면 클립보드로 복사한다', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit은 clipboard-write 권한을 지원하지 않는다');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.addInitScript(() => { Object.defineProperty(navigator, 'share', { value: undefined }); });
    await open(page);
    await toEnding(page);
    await page.getByRole('button', { name: '친구도 검사받게 하기' }).click();
    await expect(page.getByRole('button', { name: '복사했어요' })).toBeVisible();
  });

  test('복사도 실패하면 링크를 직접 보여 준다', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', { value: undefined });
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('blocked')) } });
    });
    await open(page);
    await toEnding(page);
    await page.getByRole('button', { name: '링크 복사' }).click();
    await expect(page.getByRole('textbox', { name: '공유 링크' })).toHaveValue('http://localhost:3000/');
  });

  test('다시 검사하기는 선택 화면으로 간다', async ({ page }) => {
    await open(page);
    await toEnding(page);
    await page.getByRole('button', { name: '다시 검사하기' }).click();
    await expect(page.getByRole('heading', { name: '당도 검사', exact: true })).toBeVisible();
  });
});
```
클립보드 권한 부여는 chromium 전용이라 그 테스트만 webkit에서 건너뛴다(코드 안의 `test.skip`).

- [ ] **Step 2: 실패 확인** — `-g "엔딩"` → FAIL
- [ ] **Step 3: 구현**

```tsx
// components/screens/EndingScreen.tsx
import { useState } from 'react';
import { assignBrix, DOC_NO, gradeOf, SIZE_OF } from '@/lib/game';
import { Wordmark } from '../Wordmark';
import { Stamp } from '../Stamp';
import { ShareIcon } from '../icons';
import type { ScreenProps } from './types';

const SHARE_TEXT = '제주 햇귤 당도 검사, 10초면 돼요.'; // 결과를 말하지 않는다(FR-14)

export function EndingScreen({ s, dispatch, headingRef, today }: ScreenProps) {
  const fruit = s.pick!;
  const v = s.brix[fruit];
  const [copy, setCopy] = useState<'idle' | 'done' | 'manual'>('idle');
  const url = () => `${window.location.origin}/`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url());
      setCopy('done');
      window.setTimeout(() => setCopy('idle'), 2000);
    } catch {
      setCopy('manual'); // ponytail: 인앱 브라우저에서 클립보드가 막히면 링크를 그대로 보여 준다
    }
  }

  async function share() {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: '귤상회', text: SHARE_TEXT, url: url() });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return; // 사용자가 닫음
      }
    }
    await copyLink();
  }

  return (
    <main className="ending screen-enter">
      <header className="mainhead"><Wordmark inverse /></header>
      <div className="e-head">
        <p className="e-no">판정서 {DOC_NO} · {today}</p>
        <h1 ref={headingRef} tabIndex={-1}>귤은 없습니다.</h1>
        <p>고객님이 검사하신 건 귤의 당도가 아니라,<br />낚일 준비가 얼마나 되어 있는지였습니다.</p>
      </div>
      <section className="cert" aria-labelledby="cert-title">
        <div className="cert-head"><h2 id="cert-title">판정서</h2><span>귤상회 선과장</span></div>
        <dl>
          <div><dt>시료</dt><dd>{fruit} · 규격 {SIZE_OF[fruit]}</dd></div>
          <div><dt>측정 당도</dt><dd>{v.toFixed(1)} °Bx<span className="aside">(순수함)</span></dd></div>
          <div><dt>판정</dt><dd className="grade">{gradeOf(v)}</dd></div>
          <div><dt>배송 예정</dt><dd>귤 0kg</dd></div>
          <div><dt>결제 금액</dt><dd>0원</dd></div>
        </dl>
        <Stamp className="cert-stamp" label="낚임 확인">낚임<br />확인</Stamp>
      </section>
      <div className="share">
        <button className="share-main" onClick={share}><ShareIcon />친구도 검사받게 하기</button>
        <div className="share-two">
          <button onClick={copyLink}>{copy === 'done' ? '복사했어요' : '링크 복사'}</button>
          <button onClick={() => dispatch({ type: 'retry', brix: assignBrix(Math.random) })}>다시 검사하기</button>
        </div>
        {copy === 'manual' ? (
          <label className="share-manual block">
            링크를 길게 눌러 복사하세요
            <input readOnly value={url()} aria-label="공유 링크" onFocus={(e) => e.currentTarget.select()} />
          </label>
        ) : null}
      </div>
      <p className="disc">귤상회(가칭)는 가상의 상점입니다.<br />판매·결제·배송은 일어나지 않았습니다.</p>
    </main>
  );
}
```
`Game.tsx`에 `case 'ending': return <EndingScreen {...props} />;`를 추가하고 `default` 분기를 지운다. 이제 switch가 모든 Screen을 다룬다.

- [ ] **Step 4: 통과 확인** — `npx playwright test tests/flow.spec.ts` (세 프로젝트 전부) → 모두 PASS
- [ ] **Step 5: 시각 확인** — `ending-390.png`와 비교
- [ ] **Step 6: 커밋** — `feat: add verdict ending with share fallbacks`

**완료 조건:** E2E 전부 통과(webkit 포함), 공유 문구에 결과가 들어가지 않음.

### Task 9: 링크 미리보기(OG)와 외부 요청 0건

**Files:**
- Create: `scripts/og/og.html`, `public/og.jpg`(교체)
- Modify: `tests/meta.spec.ts`

- [ ] **Step 1: 실패하는 테스트 추가** (`tests/meta.spec.ts` 끝에)

```ts
import { toEnding } from './helpers';

test('og.jpg는 1200×630 jpeg다', async ({ request }) => {
  const res = await request.get('/og.jpg');
  expect(res.ok()).toBe(true);
  expect(res.headers()['content-type']).toBe('image/jpeg');
  const buf = await res.body();
  // JPEG SOF0/SOF2에서 크기 읽기
  let i = 2, w = 0, h = 0;
  while (i < buf.length) {
    const marker = buf[i + 1], len = buf.readUInt16BE(i + 2);
    if (marker === 0xc0 || marker === 0xc2) { h = buf.readUInt16BE(i + 5); w = buf.readUInt16BE(i + 7); break; }
    i += 2 + len;
  }
  expect([w, h]).toEqual([1200, 630]);
});

test('전 과정에서 외부 도메인 요청이 없다', async ({ page, baseURL }) => {
  const external: string[] = [];
  page.on('request', (r) => { if (!r.url().startsWith(baseURL!) && !r.url().startsWith('data:')) external.push(r.url()); });
  await open(page);
  await toEnding(page);
  expect(external).toEqual([]);
});

// Next 16부터 `next build`는 First Load JS를 출력하지 않는다. `next start`(gzip)에서 받은 JS 압축 크기를 직접 더한다
test('첫 로드 JS 전송량 ≤ 130KB', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const bytes = await page.evaluate(() =>
    (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
      .filter((e) => new URL(e.name).pathname.startsWith('/_next/static/') && e.name.endsWith('.js'))
      .reduce((n, e) => n + e.encodedBodySize, 0));
  expect(bytes).toBeGreaterThan(0);
  expect(bytes).toBeLessThanOrEqual(130 * 1024);
});
```

- [ ] **Step 2: 실패 확인** — og.jpg 크기 테스트 FAIL(임시 파일)
- [ ] **Step 3: OG 합성 HTML 작성**

```html
<!-- scripts/og/og.html : 1200×630. 태그는 가운데 630px 안. 글자는 태그 안에만 -->
<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="../../node_modules/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hahmlet:wght@700&display=swap">
<style>
  html,body{margin:0;width:1200px;height:630px;overflow:hidden}
  .bg{position:absolute;inset:0;background:url(../../assets/images/hero.jpg) center/cover}
  .wrap{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-3deg) scale(1.9);filter:drop-shadow(0 1px 1px rgba(0,0,0,.28)) drop-shadow(0 8px 14px rgba(0,0,0,.2))}
  .tag{position:relative;width:158px;padding:27px 12px 10px;background:#fff;color:#141414;font-family:'Pretendard Variable',sans-serif;clip-path:polygon(16px 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%,0 16px)}
  .hole{position:absolute;top:6px;left:50%;width:15px;height:15px;margin-left:-7.5px;border-radius:50%;background:#3b4148;border:2.5px solid #fff;outline:1.5px solid #ddd5c8;box-sizing:border-box}
  .org{font:700 10.5px Hahmlet,serif;margin:0}.kind{font-weight:800;font-size:16px;letter-spacing:-.04em;margin:2px 0 0}
  dl{margin:5px 0 0;border-top:1.5px solid #141414}dl div{display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-bottom:1px solid #e7e7e7}dl div:last-child{border:0}dt{color:#6c6c6c}dd{margin:0;font-weight:700}
  .stamp{position:absolute;right:6px;top:22px;width:40px;height:40px;border:2px solid #b4152b;border-radius:50%;display:grid;place-items:center;color:#b4152b;font:700 11px/1.05 Hahmlet,serif;text-align:center;transform:rotate(-14deg);opacity:.96;box-sizing:border-box}
</style></head>
<body><div class="bg"></div><div class="wrap"><div class="tag"><i class="hole"></i><p class="org">귤상회 선과장</p><p class="kind">노지 온주밀감</p><dl><div><dt>규격</dt><dd>2S–M</dd></div><div><dt>중량</dt><dd>10kg</dd></div></dl><span class="stamp">선별<br>필</span></div></div></body></html>
```

- [ ] **Step 4: 생성과 확인**

```bash
# 프로젝트 루트에서. file://로 열면 Chromium이 로컬 웹폰트를 CORS로 막아 대체 글꼴로 찍힐 수 있어 로컬 HTTP로 연다(파이썬 표준 라이브러리, 추가 설치 없음)
python -m http.server 8123 --bind 127.0.0.1 &
SERVER=$!
npx playwright screenshot --viewport-size "1200,630" --wait-for-timeout 1500 http://127.0.0.1:8123/scripts/og/og.html public/og.jpg
kill $SERVER
```
결과를 눈으로 확인한다: 태그가 가운데에 있고, 정사각으로 잘라도 태그가 온전하며, 글자가 Pretendard·Hahmlet으로 찍혀야 한다(대체 글꼴이면 실패).

- [ ] **Step 5: 통과 확인** — `npx playwright test tests/meta.spec.ts` → PASS 10 (테스트 5개 × m390·m360)
- [ ] **Step 6: 커밋** — `feat: add Open Graph image and external request guard`

**완료 조건:** meta 테스트 통과, OG 이미지 사용자 확인, 외부 요청 0건, 첫 로드 JS ≤ 130KB.

### Task 10: 시각 회귀·접근성·레이아웃 검증

**Files:**
- Create: `tests/visual.spec.ts`, `tests/a11y.spec.ts`, `tests/layout.spec.ts`, `tests/__screenshots__/**`

- [ ] **Step 1: 테스트 작성**

```ts
// tests/visual.spec.ts
import { test, expect } from '@playwright/test';
import { open, toSelect, pickRow, toMeasure, tapFruit, toResult, toJudging, toEnding } from './helpers';

test.describe('화면 스크린샷', () => {
  test.beforeEach(async ({ page }) => { await open(page); });
  test('1 상품', async ({ page }) => { await expect(page).toHaveScreenshot('1-product.png'); });
  test('2 선택', async ({ page }) => { await toSelect(page); await pickRow(page, 'C').click(); await expect(page).toHaveScreenshot('2-select.png'); });
  test('3 측정', async ({ page }) => { await toMeasure(page, 'C'); await tapFruit(page, 3); await expect(page).toHaveScreenshot('3-measure.png'); });
  test('4 결과', async ({ page }) => { await toResult(page, 'C'); await expect(page).toHaveScreenshot('4-result.png'); });
  test('5 판정', async ({ page }) => { await toJudging(page); await expect(page).toHaveScreenshot('5-judging.png'); });
  test('6 엔딩', async ({ page }) => { await toEnding(page); await expect(page).toHaveScreenshot('6-ending.png'); });
});
```

```ts
// tests/a11y.spec.ts
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { open, toSelect, toMeasure, toResult, toEnding } from './helpers';

async function noViolations(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
}

test.describe('axe', () => {
  test.beforeEach(async ({ page }) => { await open(page); });
  test('상품', async ({ page }) => { await noViolations(page); });
  test('선택', async ({ page }) => { await toSelect(page); await noViolations(page); });
  test('측정', async ({ page }) => { await toMeasure(page); await noViolations(page); });
  test('결과', async ({ page }) => { await toResult(page); await noViolations(page); });
  test('엔딩', async ({ page }) => { await toEnding(page); await noViolations(page); });
});

test('키보드만으로 엔딩까지 간다', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: /당도 검사 받기/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: '당도 검사', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');              // 제목 다음: 시료 라디오 그룹(뒤로 버튼은 제목 앞)
  await page.keyboard.press('ArrowDown');        // 다음 시료로 이동하며 선택
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(1);
  await page.keyboard.press('Tab');              // 하단 '○ 시료 검사 시작'
  await page.keyboard.press('Enter');
  const fruit = page.getByRole('button', { name: /귤 누르기/ });
  await fruit.focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press('Enter');
  await page.clock.runFor(500);
  await page.getByRole('button', { name: '최종 판정 받기' }).focus();
  await page.keyboard.press('Enter');
  await page.clock.runFor(1600);
  await expect(page.getByRole('heading', { name: '귤은 없습니다.' })).toBeFocused();
});
```

```ts
// tests/layout.spec.ts
import { test, expect } from '@playwright/test';
import { open, toEnding } from './helpers';

for (const width of [320, 430, 768, 1280]) {
  test(`${width}px: 가로 넘침 없음, 바·전환 레이어는 430px 기둥`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const bar = await page.locator('.bar').boundingBox();
    expect(bar!.width).toBeLessThanOrEqual(430);
    await toEnding(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test('상품 마지막 내용이 하단 바에 가리지 않는다', async ({ page }) => {
  await open(page);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const foot = await page.locator('.foot').boundingBox();
  const bar = await page.locator('.bar').boundingBox();
  expect(foot!.y + foot!.height).toBeLessThanOrEqual(bar!.y + 1);
});
```

- [ ] **Step 2: 기준 스크린샷 생성** — `npx playwright test tests/visual.spec.ts --update-snapshots` (m390·m360 각 6장, 총 12장)
- [ ] **Step 3: 기준 이미지 사용자 승인.** 12장을 `docs/design/shots2/`와 나란히 놓은 비교 보드로 보여 주고 승인을 받는다. 승인 전에는 기준으로 커밋하지 않는다.
- [ ] **Step 4: 전체 실행** — Run: `npm test` → 모두 PASS(axe 위반 0)
- [ ] **Step 5: 성능 확인** — Step 4 결과에서 `meta.spec`의 '첫 로드 JS 전송량' 테스트 통과를 확인한다(Next 16은 `next build`에 First Load JS를 출력하지 않는다). 넘으면 기준을 올리지 말고 원인 청크를 찾아 줄인 뒤 `docs/AUDIT.md`에 기록한다.
- [ ] **Step 6: 커밋** — `test: add visual baselines, axe and layout checks`

**완료 조건:** 모든 테스트 통과, 기준 이미지 12장 사용자 승인, 첫 로드 JS 기준 충족.

### Task 11: 디자인 감사와 보정

**Files:**
- Modify: 감사에서 지적된 파일
- Create: `docs/AUDIT.md`(감사 결과 기록)

- [ ] **Step 1: 자동 감사** (impeccable 원본을 원래 위치에서 실행. 복사하지 않는다)

```bash
npm run build
node "C:/Users/1/00.Hub/.claude/skills/impeccable/scripts/detect.mjs" --json .next/server/app/index.html app/globals.css components/*.tsx components/screens/*.tsx > test-results/impeccable.json; echo "exit=$?"
```
Expected: 지적 0건. 또는 모든 지적에 오탐 사유가 있어야 한다(알려진 오탐: 날짜·문서번호를 섹션 번호로 인식).

- [ ] **Step 2: 직접 평가.** Task 10의 스크린샷 12장을 DESIGN.md §9.4 표 8항목으로 평가하고 `docs/AUDIT.md`에 항목별 판정과 근거를 적는다. DESIGN §9.2 정량 규칙(레드 사용 위치 수, 그림자 1곳, 최소 글자 크기)은 화면마다 센 값을 적는다.
- [ ] **Step 3: 실제 쇼핑몰 비교.** 국내 신선식품몰 상세 화면 캡처 1장과 ① 상품 화면을 나란히 놓고 사용자에게 보여 준다.
- [ ] **Step 4: 보정 후 재검사.** 고친 뒤 `npm test`(시각 기준이 바뀌면 Task 10 Step 3 승인 절차를 다시 밟는다)
- [ ] **Step 5: 커밋** — `style: resolve design audit findings`

**완료 조건:** 자동·수동 감사 통과 기록, 사용자 확인.

### Task 12: Public 저장소 (G5-A)

저장소 공개는 사이트 공개가 아니다. 사이트 공개는 Task 13(G6)에서 한다.

- [ ] **Step 1: G5-A 승인과 계정 준비.** 사용자가 직접 실행한다: `! gh auth login`(개인 계정 `wantraiseapomeranian` 추가), `! gh auth switch --user wantraiseapomeranian`
- [ ] **Step 2: 계정 확인.**

```bash
gh auth status            # Active account: wantraiseapomeranian 이어야 함. 아니면 중단
git config user.email     # 189066806+wantraiseapomeranian@users.noreply.github.com (이 저장소 로컬 설정)
```
- [ ] **Step 3: 공개 전 보안 검사.** Git 이력 전체(모든 커밋의 파일·메시지·작성자·커미터)와 추적 파일에서 비밀정보·인증정보·개인정보·공개에 부적절한 파일을 찾는다. 하나라도 나오면 저장소 생성과 push를 멈추고 보고한다. 2026-11-06 검사와 이력 재작성은 AUDIT G5A-1에 있다.
- [ ] **Step 4: 테스트와 빌드.** `npm run lint`, `npm test`. 알려진 실패는 PERF-1 하나뿐이어야 하고, 성능 기준은 완화하지 않는다.
- [ ] **Step 5: 저장소 생성과 push.** push 대상은 `main` 하나다. Windows 자격 증명 관리자의 다른 계정이 쓰이지 않도록 push 명령에만 `gh` 인증을 지정한다.

```bash
git for-each-ref          # refs/heads/main 하나뿐이어야 함
gh repo create wantraiseapomeranian/gyul-market --public --source . --remote origin
git -c credential.helper= -c credential.helper='!gh auth git-credential' push -u origin main
git ls-remote origin      # HEAD와 refs/heads/main만
```
- [ ] **Step 6: 브랜치 운영.** 이후 변경은 `t<번호>-<요약>` 브랜치 → PR → 사용자 확인 → squash merge 순서로 한다. G5-B 이후에는 PR마다 Vercel Preview를 확인한다. `main` 직접 push는 하지 않는다. PR마다 `perf` 워크플로(GitHub 러너 성능 판정)가 돈다. GitHub에서 머지하므로 계정의 이메일 비공개 설정이 켜져 있어야 하고, 머지 뒤 `main` 커밋의 작성자·커미터 이메일이 noreply인지 확인한다(AUDIT G5A-2).

**완료 조건:** public 저장소에 `main`만 있고, 커밋 이메일이 모두 noreply이며, 보안 검사 0건.

### Task 12B: Preview (G5-B)

- [ ] **Step 1: G5-B 승인.** TEST_PLAN §11 G5-B 기준(성능 포함, 완화 없음)을 충족한 뒤 요청한다.
- [ ] **Step 2: Vercel 연결(사용자 작업).** 개인 계정 `wantraiseapomeranian`으로 Vercel 대시보드에 로그인한다. Add New → Project → 위 저장소 Import → Framework: Next.js → Deploy. 환경 변수는 필요 없다(`VERCEL_PROJECT_PRODUCTION_URL`은 Vercel이 자동 제공).
  - 카카오 실기기 테스트를 위해 Settings → Deployment Protection에서 Vercel Authentication을 이 프로젝트만 끄거나, Preview 공유 링크를 쓴다.
  - 처음 Import하면 `main`이 바로 Production(`<프로젝트>.vercel.app`)으로 배포된다. 이 주소는 noindex이며 G6 전까지 어디에도 공유하지 않는다(카카오에 붙여 넣으면 OG가 캐시되므로 금지).
- [ ] **Step 3: Preview에서 TEST_PLAN §6 실기기 테스트를 진행하고 결과를 `docs/AUDIT.md`에 기록한다.**

**완료 조건:** Preview URL에서 전 흐름 동작, 실기기 체크리스트 통과.

### Task 13: 정식 공개 (G6)

- [ ] **Step 1: 공개 전 결정 확인** — 최종 사진(교체 시 같은 파일명으로 바꾸고 Task 10 기준 이미지를 다시 승인받는다), 배포 주소
- [ ] **Step 2: Production 확인** — `main` 최신 배포 URL에서 TEST_PLAN §11 공개 기준을 전부 확인한다
- [ ] **Step 3: OG 캐시** — 사용자가 카카오 공유 디버거(developers.kakao.com → 도구 → 공유 디버거)에 Production URL을 넣고 캐시를 초기화한다. 미리보기 이미지·제목·설명을 확인한다.
- [ ] **Step 4: 게시** — 사용자가 카카오톡 오픈프로필에 링크를 건다
- [ ] **Step 5: 게시 후 확인** — 다른 기기의 카카오톡에서 프로필 링크를 눌러 전 흐름을 한 번 실행한다

**완료 조건:** 사용자 G6 승인, 게시 후 확인 완료.

---

### Task 14: 구매 진입 개편 (t19, 2026-11-06)

사용자 승인 범위: 브랜치 `t19-purchase-flow`와 PR 생성까지. `main` 머지(= Vercel Production 자동 배포)는 따로 승인받는다.

- [ ] **Step 1: 결정 반영.** D1~D5(PROJECT §8 결정 기록), 문구(DESIGN §5·§8), FR-1·3·13·15·16·17
- [ ] **Step 2: 순수 로직.** `lib/game.ts`에 `PRICE`·`MAX_QTY`·`clampQty`·`formatWon`, 단위 테스트 1건. 리듀서는 바꾸지 않는다
- [ ] **Step 3: UI.** `components/PurchaseDialogs.tsx`(수량 시트·안내 모달, `<dialog>`), `Game.tsx`(qty·overlay·history, 위 '상태 전이'의 구매 진입 표), 고지·예고 문구 제거, 엔딩 고지 교체, OG 설명·공유 문구
- [ ] **Step 4: 테스트.** helpers(`toSheet`·`toNotice`), flow ①-1(수량·닫기 4방법·뒤로 순서·history 길이·수량 유지·모달 문구·모바일/데스크톱 배치), a11y(시트·모달 axe, 키보드), layout(시트 430px 기둥), meta(OG), perf·perf-diag(새 경로)
- [ ] **Step 5: 시각.** `--update-snapshots=all`로 전부 다시 만들고 `main`과 픽셀 비교. 바뀐 장과 새 4장(1b-qty, 1c-notice × 390·360)을 PR에서 사용자 승인
- [ ] **Step 6: 검증.** lint, `npm test` 전부, impeccable 0건, GitHub 러너 `perf` 통과
- [ ] **Step 7: PR.** 머지와 배포는 사용자 승인 뒤. 머지 후 `main` 커밋 이메일과 `perf` 결과를 확인하고, 실기기 K4·K12·K14·K18·K19를 다시 본다

**완료 조건:** 사용자 화면 승인, 전체 테스트·러너 성능 통과, 머지 승인.

---

## 의존 관계

```
T0 → T1 → T2 ─┐
              ├→ T3 → T4 → T5 → T6 → T7 → T8 → T9 → T10 → T11 → T12(G5-A) → T12B(G5-B) → T14(구매 진입) → T13(G6)
```
T2(로직)와 T3(기반)은 서로 독립이라 병렬로 진행할 수 있다. T4부터는 앞 작업의 컴포넌트를 쓰므로 순서대로 진행한다.

## 실행 방식

G3 승인 후 다음 중 하나를 고른다.
1. **Subagent-Driven(권장)**: 작업마다 새 서브에이전트가 구현하고, 작업 사이에 검토한다(superpowers:subagent-driven-development).
2. **Inline**: 이 세션에서 체크포인트를 두고 순서대로 실행한다(superpowers:executing-plans).
