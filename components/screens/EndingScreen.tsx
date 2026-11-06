import { useState } from 'react';
import { assignBrix, DOC_NO, gradeOf, gradeLine, qtyMemo, retryLine, formatWon, PRICE, SIZE_OF } from '@/lib/game';
import { Wordmark } from '../Wordmark';
import { Stamp } from '../Stamp';
import { ShareIcon } from '../icons';
import type { ScreenProps } from './types';

const SHARE_TEXT = '제주 서귀포 햇귤 10kg, 29,900원'; // 결과도, 당도 검사도 미리 말하지 않는다(FR-14)

export function EndingScreen({ s, dispatch, headingRef, today, qty }: ScreenProps & { qty: number }) {
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
        {/* 결과 설명 영역: 1회차는 반전 설명, 2회차부터는 회차 문구(T21) */}
        <p>{retryLine(s.round) ?? <>고객님이 검사하신 건 귤의 당도가 아니라,<br />낚일 준비가 얼마나 되어 있는지였습니다.</>}</p>
      </div>
      <section className="cert" aria-labelledby="cert-title">
        <div className="cert-head"><h2 id="cert-title">판정서</h2><span>귤상회 선과장</span></div>
        <dl>
          <div><dt>시료</dt><dd>{fruit} · 규격 {SIZE_OF[fruit]}</dd></div>
          <div><dt>측정 당도</dt><dd>{v.toFixed(1)} °Bx<span className="aside">(순수함)</span></dd></div>
          <div><dt>판정</dt><dd><span className="grade">{gradeOf(v)}</span><span className="note">{gradeLine(v, s.line)}</span></dd></div>
          <div><dt>구매 의향</dt><dd>{qty}박스 ({formatWon(PRICE * qty)}원)<span className="note">{qtyMemo(qty)}</span></dd></div>
          {/* 360px에서 고지를 첫 화면에 두기 위해 두 행을 합침(사용자 조건부 승인 2026-11-06). 내용은 그대로 */}
          <div><dt>배송·결제</dt><dd>귤 0kg · 0원</dd></div>
        </dl>
        <Stamp className="cert-stamp" label="낚임 확인">낚임<br />확인</Stamp>
      </section>
      <div className="share">
        <button className="share-main" onClick={share}><ShareIcon />친구도 검사받게 하기</button>
        <div className="share-two">
          <button onClick={copyLink}>{copy === 'done' ? '복사했어요' : '링크 복사'}</button>
          <button onClick={() => dispatch({ type: 'retry', brix: assignBrix(Math.random) })}>다시 검사하기</button>
        </div>
        <p className="sr-only" role="status">{copy === 'done' ? '링크를 복사했어요' : ''}</p>
        {copy === 'manual' ? (
          <label className="share-manual block">
            링크를 길게 눌러 복사하세요
            <input readOnly value={url()} aria-label="공유 링크" onFocus={(e) => e.currentTarget.select()} />
          </label>
        ) : null}
      </div>
      <p className="disc">사실 귤상회는 가상의 쇼핑몰입니다.<br />구매 과정은 게임을 위한 연출이며,<br />실제 주문이나 결제는 이루어지지 않았습니다.</p>
    </main>
  );
}
