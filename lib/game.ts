// 귤상회 게임 상태: React와 무관한 순수 함수. 전이 규칙은 PLAN.md '상태 전이' 표.
export type FruitId = 'A' | 'B' | 'C';
export type Size = '2S' | 'S' | 'M';
export type Screen = 'product' | 'select' | 'measure' | 'result' | 'judging' | 'ending';
export type BrixMap = Record<FruitId, number>;

// round: 이 세션에서 새 당도가 배정된 판 수(start·retry마다 +1, 새로고침하면 0). line: 등급별 한 줄 판정 번호(judge에서 받아 고정)
export type GameState = { screen: Screen; brix: BrixMap; pick: FruitId | null; taps: number; round: number; line: number };

export type GameEvent =
  | { type: 'start'; brix: BrixMap }
  | { type: 'pick'; fruit: FruitId }
  | { type: 'begin' }
  | { type: 'tap' }
  | { type: 'finish' }
  | { type: 'judge'; line: number }
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
  round: 0,
  line: 0,
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

// T21 판정 문구(사용자 승인 2026-11-06). 등급은 gradeOf 그대로, 수량은 두 번째 축, 회차 문구는 2회차부터
const GRADE_LINES: Record<string, readonly string[]> = {
  '새콤 낚임과': [
    '의심은 하셨지만, 검사는 끝까지 받으셨습니다.',
    '새콤한 경계심이 검출되었으나, 낚임을 막기에는 부족했습니다.',
    '신중함은 확인되었습니다. 결과에는 반영되지 않았습니다.',
  ],
  '달콤 낚임과': [
    '구매 의욕과 검사 참여도 모두 양호합니다. 의심만 조금 부족했습니다.',
    '귤을 고르시던 진지함이 당도만큼 달게 측정되었습니다.',
    '평균 이상의 순수함이 안정적으로 검출되었습니다.',
  ],
  '로얄 낚임과': [
    '당도는 최상급, 의심은 최소한으로 측정되었습니다.',
    '선과장 판정 기준, 최상위 등급의 순수함이 확인되었습니다.',
    '귤은 없었지만, 고객님의 믿음은 진품으로 판정합니다.',
  ],
};
export const LINES_PER_GRADE = 3;
/** 판정 확정 시 한 번 고른다(리듀서 밖). rand()가 1에 닿아도 범위를 넘지 않는다 */
export const pickLine = (rand: () => number) => Math.min(LINES_PER_GRADE - 1, Math.floor(rand() * LINES_PER_GRADE));
export const gradeLine = (brix: number, line: number) => GRADE_LINES[gradeOf(brix)][line];

/** 구매 의향(수량 시트의 박스 수)별 검사 소견: 1 / 2~3 / 4~5 */
export function qtyMemo(qty: number): string {
  if (qty <= 1) return '한 박스로 신중하게 시작하셨습니다. 검사까지 받으실 줄은 저희도 몰랐습니다.';
  if (qty <= 3) return '넉넉한 구매 의향은 분명히 확인했습니다. 귤은 확인되지 않았습니다.';
  return '대량 구매 의향이 확인되었습니다. 기대의 크기만큼 순수함도 크게 기록합니다.';
}

/** 회차 문구: 1회차는 null(기존 반전 설명), 2·3회차는 각각, 4회차부터는 공통 */
export function retryLine(round: number): string | null {
  if (round <= 1) return null;
  if (round === 2) return '두 번째 검사입니다. 결과와 관계없이, 귤은 이번에도 없습니다.';
  if (round === 3) return '세 번째 검사입니다. 귤이 없다는 결과만은 매번 정확히 재현되고 있습니다.';
  return '꾸준히 검사해 주셔서 감사합니다. 선과장의 판정은 이번에도 같습니다. 귤은 없습니다.';
}

export function readingAt(final: number, taps: number): number {
  const t = Math.min(taps, TAPS_REQUIRED);
  return Math.round(((final * t) / TAPS_REQUIRED) * 10) / 10;
}

export function formatDocDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

const fresh = (brix: BrixMap, round: number): GameState => ({ screen: 'select', brix, pick: null, taps: 0, round, line: 0 });

export function reduce(s: GameState, e: GameEvent): GameState {
  switch (e.type) {
    case 'start':
      return s.screen === 'product' ? fresh(e.brix, s.round + 1) : s;
    case 'pick':
      return s.screen === 'select' ? { ...s, pick: e.fruit } : s;
    case 'begin':
      return s.screen === 'select' && s.pick ? { ...s, screen: 'measure', taps: 0 } : s;
    case 'tap':
      return s.screen === 'measure' && s.taps < TAPS_REQUIRED ? { ...s, taps: s.taps + 1 } : s;
    case 'finish':
      return s.screen === 'measure' && s.taps === TAPS_REQUIRED ? { ...s, screen: 'result' } : s;
    case 'judge':
      return s.screen === 'result' ? { ...s, screen: 'judging', line: e.line } : s;
    case 'reveal':
      return s.screen === 'judging' ? { ...s, screen: 'ending' } : s;
    case 'retry':
      return s.screen === 'result' || s.screen === 'ending' ? fresh(e.brix, s.round + 1) : s;
    case 'back':
      if (s.screen === 'select') return { ...s, screen: 'product', pick: null };
      if (s.screen === 'measure') return { ...s, screen: 'select', taps: 0 };
      return s;
  }
}
