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
