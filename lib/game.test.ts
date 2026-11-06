import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  reduce, initialState, assignBrix, gradeOf, readingAt, formatDocDate,
  BRIX_VALUES, TAPS_REQUIRED, PRICE, MAX_QTY, clampQty, formatWon, pickLine, gradeLine, qtyMemo, retryLine, LINES_PER_GRADE,
  type GameState, type GameEvent, type BrixMap,
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
  s = run(s, { type: 'judge', line: 2 });
  assert.equal(s.screen, 'judging');
  assert.equal(s.line, 2);
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
  for (const e of [{ type: 'judge', line: 1 }, { type: 'reveal' }, { type: 'tap' }, { type: 'finish' }, { type: 'start', brix: FIXED }] as GameEvent[]) {
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
  for (const s of [result, run(result, { type: 'judge', line: 2 }, { type: 'reveal' })]) {
    assert.deepEqual(reduce(s, { type: 'retry', brix: NEW }), { screen: 'select', brix: NEW, pick: null, taps: 0, round: 2, line: 0 });
  }
});

test('수량은 1~5박스로 고정되고 총액은 박스당 29,900원이다', () => {
  assert.deepEqual([0, 1, 3, 5, 6, -2].map(clampQty), [1, 1, 3, 5, 5, 1]);
  assert.equal(MAX_QTY, 5);
  assert.equal(formatWon(PRICE), '29,900');
  assert.equal(formatWon(PRICE * MAX_QTY), '149,500');
});

test('회차: 새 당도가 배정되는 판(start·retry)에서만 늘고, 화면 복귀로는 늘지 않는다', () => {
  const NEW: BrixMap = { A: 15.8, B: 12.4, C: 14.2 };
  let s = reduce(initialState, { type: 'start', brix: FIXED });
  assert.equal(s.round, 1);
  s = run(s, { type: 'pick', fruit: 'C' }, { type: 'begin' }, { type: 'tap' }, { type: 'back' }, { type: 'begin' });
  assert.equal(s.round, 1);                                   // 측정 → 검사표 → 다시 측정: 같은 판
  s = run(s, ...Array<GameEvent>(5).fill({ type: 'tap' }), { type: 'finish' }, { type: 'judge', line: 0 }, { type: 'reveal' });
  assert.equal(s.round, 1);
  s = reduce(s, { type: 'retry', brix: NEW });
  assert.equal(s.round, 2);
  s = run(s, { type: 'back' }, { type: 'start', brix: FIXED }); // 상품까지 돌아가 새로 시작: 새 판
  assert.equal(s.round, 3);
});

test('한 줄 판정: judge에서 받은 번호로 고정하고, 다음 판에서 다시 고른다', () => {
  const s = run(initialState, { type: 'start', brix: FIXED }, { type: 'pick', fruit: 'A' }, { type: 'begin' },
    ...Array<GameEvent>(5).fill({ type: 'tap' }), { type: 'finish' }, { type: 'judge', line: 1 }, { type: 'reveal' });
  assert.equal(s.line, 1);
  assert.deepEqual(reduce(s, { type: 'judge', line: 2 }), s);  // 엔딩에서는 바뀌지 않는다
  assert.equal(reduce(s, { type: 'retry', brix: FIXED }).line, 0);
  assert.deepEqual([0, 0.34, 0.67, 0.999, 1].map((r) => pickLine(() => r)), [0, 1, 2, 2, 2]);
});

test('문구: 등급별 3개, 수량 구간 1 / 2~3 / 4~5, 회차 2·3·4회차 이상', () => {
  assert.equal(LINES_PER_GRADE, 3);
  for (const v of BRIX_VALUES) assert.equal(new Set([0, 1, 2].map((i) => gradeLine(v, i))).size, 3);
  assert.equal(gradeLine(14.2, 0), '구매 의욕과 검사 참여도 모두 양호합니다. 의심만 조금 부족했습니다.');
  assert.equal(gradeLine(15.8, 1), '선과장 판정 기준, 최상위 등급의 순수함이 확인되었습니다.');
  const [q1, q2, q3] = [1, 2, 4].map(qtyMemo);
  assert.deepEqual([1, 2, 3, 4, 5].map(qtyMemo), [q1, q2, q2, q3, q3]);
  assert.equal(new Set([q1, q2, q3]).size, 3);
  assert.equal(retryLine(0), null);
  assert.equal(retryLine(1), null);
  assert.notEqual(retryLine(2), retryLine(3));
  assert.equal(retryLine(4), retryLine(9));
  const all = [...BRIX_VALUES.flatMap((v) => [0, 1, 2].map((i) => gradeLine(v, i))), q1, q2, q3, retryLine(2), retryLine(3), retryLine(4)];
  assert.equal(all.length, 15);
  for (const t of all) assert.doesNotMatch(t!, /주문|결제|배송|\p{Extended_Pictographic}/u); // D2·D5
});
