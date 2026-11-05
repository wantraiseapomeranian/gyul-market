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
