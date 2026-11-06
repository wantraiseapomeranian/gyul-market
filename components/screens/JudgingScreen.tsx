import { DOC_NO } from '@/lib/game';
import { Stamp } from '../Stamp';
import type { ScreenProps } from './types';

const FIELDS = ['시료', '측정 당도', '판정', '구매 의향', '배송·결제'];

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
