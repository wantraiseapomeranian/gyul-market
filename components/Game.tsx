'use client';
import { useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { reduce, initialState, assignBrix, formatDocDate, TAPS_REQUIRED } from '@/lib/game';
import { BottomBar } from './BottomBar';
import { SelectScreen } from './screens/SelectScreen';
import { MeasureScreen } from './screens/MeasureScreen';
import { ResultScreen } from './screens/ResultScreen';
import { JudgingScreen } from './screens/JudgingScreen';
import { EndingScreen } from './screens/EndingScreen';

export function Game({ product }: { product: ReactNode }) {
  const [s, dispatch] = useReducer(reduce, initialState);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // 렌더 중 new Date()는 react-hooks/purity 위반이라 지연 초기값으로 한 번만 읽는다.
  // ponytail: 자정을 넘겨 계속 플레이해도 날짜는 첫 렌더 기준. 20초 체험이라 갱신하지 않는다
  const [today] = useState(() => formatDocDate(new Date()));

  // 화면이 바뀌면 맨 위로 + 제목에 초점 (DESIGN §10). 첫 진입(및 StrictMode 재실행)에서는 아무것도 하지 않는다
  const prevScreen = useRef(s.screen);
  useEffect(() => {
    if (prevScreen.current === s.screen) return;
    prevScreen.current = s.screen;
    window.scrollTo(0, 0);
    if (s.screen === 'product') document.getElementById('product-title')?.focus();
    else headingRef.current?.focus();
  }, [s.screen]);

  // 5번째 탭 450ms 뒤 결과로 (DESIGN §6)
  useEffect(() => {
    if (s.screen !== 'measure' || s.taps !== TAPS_REQUIRED) return;
    const id = window.setTimeout(() => dispatch({ type: 'finish' }), 450);
    return () => window.clearTimeout(id);
  }, [s.screen, s.taps]);

  // 판정 전환 1500ms(축소 모션 800ms) 뒤 엔딩으로
  // 축소 모션 여부는 전환이 시작될 때 한 번 읽으면 된다(상태·구독 불필요)
  useEffect(() => {
    if (s.screen !== 'judging') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = window.setTimeout(() => dispatch({ type: 'reveal' }), reduced ? 800 : 1500);
    return () => window.clearTimeout(id);
  }, [s.screen]);

  const props = { s, dispatch, headingRef, today };

  switch (s.screen) {
    case 'product':
      return (
        <>
          {product}
          <BottomBar>
            <button className="btn-primary" onClick={() => dispatch({ type: 'start', brix: assignBrix(Math.random) })}>
              당도 검사 받기<small>무료 · 10초</small>
            </button>
          </BottomBar>
        </>
      );
    case 'select':
      return <SelectScreen {...props} />;
    case 'measure':
      return <MeasureScreen {...props} />;
    case 'result':
      return <ResultScreen {...props} />;
    case 'judging':
      return <JudgingScreen headingRef={headingRef} />;
    case 'ending':
      return <EndingScreen {...props} />;
  }
}
