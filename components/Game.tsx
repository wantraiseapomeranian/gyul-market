'use client';
import { useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { reduce, initialState, assignBrix, formatDocDate, TAPS_REQUIRED } from '@/lib/game';
import { BottomBar } from './BottomBar';
import { SelectScreen } from './screens/SelectScreen';
import { MeasureScreen } from './screens/MeasureScreen';
import { ResultScreen } from './screens/ResultScreen';
import { JudgingScreen } from './screens/JudgingScreen';
import { EndingScreen } from './screens/EndingScreen';
import { PurchaseDialogs, type Overlay } from './PurchaseDialogs';

const ovOf = (state: unknown) => (state as { ov?: Overlay } | null)?.ov ?? null;

export function Game({ product }: { product: ReactNode }) {
  const [s, dispatch] = useReducer(reduce, initialState);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // 렌더 중 new Date()는 react-hooks/purity 위반이라 지연 초기값으로 한 번만 읽는다.
  // ponytail: 자정을 넘겨 계속 플레이해도 날짜는 첫 렌더 기준. 20초 체험이라 갱신하지 않는다
  const [today] = useState(() => formatDocDate(new Date()));

  // 구매 진입(수량 시트 → 안내 모달). 게임 리듀서와 분리된 화면 상태다. Game은 계속 마운트되어 있어 수량이 유지된다
  const [qty, setQty] = useState(1);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const leaving = useRef(false);
  const ctaRef = useRef<HTMLButtonElement>(null);

  // D4: 열린 창마다 history 항목 하나({ov}). 닫기·ESC·바깥·뒤로는 모두 popstate 하나로 상태를 맞춘다
  useEffect(() => {
    // ponytail: 창이 열린 채 새로고침하면 현재 항목만 비운다(그 뒤 남는 항목은 뒤로 한 번 더 누르면 사라짐, 드문 경우)
    if (ovOf(history.state)) history.replaceState(null, '');
    const onPop = (e: PopStateEvent) => { leaving.current = false; setOverlay(ovOf(e.state)); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const openOverlay = (ov: Overlay) => {
    if (ovOf(history.state) === ov) return; // 연타로 같은 항목을 두 번 쌓지 않는다
    leaving.current = false;
    history.pushState({ ov }, '');
    setOverlay(ov);
  };
  const closeOverlay = () => history.back();
  const startGame = () => {
    if (leaving.current) return; // 연타로 go(-2)가 두 번 나가면 페이지를 떠난다
    leaving.current = true;
    history.go(-2); // 시트·모달 항목을 걷어 낸다: 게임 화면에서 뒤로는 기존처럼 페이지 이탈(FR-13)
    setOverlay(null);
    dispatch({ type: 'start', brix: assignBrix(Math.random) });
  };

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
            <button ref={ctaRef} className="btn-primary" onClick={() => openOverlay('qty')}>구매하기</button>
          </BottomBar>
          <PurchaseDialogs overlay={overlay} qty={qty} setQty={setQty}
            onBuy={() => openOverlay('notice')} onStart={startGame} onClose={closeOverlay} opener={ctaRef} />
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
      return <EndingScreen {...props} qty={qty} />;
  }
}
