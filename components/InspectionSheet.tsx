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
          <span>시료</span><span /><span>규격</span><span>당도</span>{select ? <span>선택</span> : null}
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
        <p>규격(2S·S·M)은 크기 등급입니다.</p>
        <span className="inspector">검사원<i>{select ? null : <Stamp shape="square" label="검사 완료">검사<br />필</Stamp>}</i></span>
      </div>
    </section>
  );
}
