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
