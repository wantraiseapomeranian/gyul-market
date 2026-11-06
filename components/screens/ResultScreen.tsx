import { assignBrix, pickLine } from '@/lib/game';
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
        <button className="btn-primary" onClick={() => dispatch({ type: 'judge', line: pickLine(Math.random) })}>최종 판정 받기</button>
      </BottomBar>
    </main>
  );
}
