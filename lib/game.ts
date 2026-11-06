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

// 구매 진입(수량 시트). 게임 상태와 분리된 표시용 값이다(D5: 거래·결제 없음)
export const PRICE = 29_900;
export const MAX_QTY = 5;
export const clampQty = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.round(n)));
export const formatWon = (n: number) => n.toLocaleString('ko-KR');

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
