import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { MAX_QTY, PRICE, clampQty, formatWon } from '@/lib/game';
import { CloseIcon } from './icons';

export type Overlay = 'qty' | 'notice';

// 브라우저 <dialog>: 바깥 비활성, ESC를 기본으로 준다. 닫힘은 모두 onClose 하나로 모은다(history와 맞추기 위해).
// 초점 복귀는 직접 한다: WebKit(iOS 카카오톡)은 버튼을 눌러도 초점을 주지 않아 기본 복귀가 body로 간다
function Dialog({ open, onClose, returnFocus, className, labelledBy, children }: {
  open: boolean; onClose: () => void; returnFocus: RefObject<HTMLButtonElement | null>;
  className: string; labelledBy: string; children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current!;
    if (open && !d.open) d.showModal();
    if (!open && d.open) { d.close(); returnFocus.current?.focus(); }
  }, [open, returnFocus]);
  return (
    <dialog
      ref={ref}
      className={`dlg ${className}`}
      aria-labelledby={labelledBy}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => {
        // 바깥(배경) 누름. 여는 애니메이션 중에는 무시: 앞 버튼을 연타한 두 번째 탭이 새 창을 바로 닫지 않게
        const d = e.currentTarget;
        if (e.target === d && !d.getAnimations().some((a) => a.playState === 'running')) onClose();
      }}
    >
      {children}
    </dialog>
  );
}

function Head({ id, title, onClose }: { id: string; title: string; onClose: () => void }) {
  return (
    <div className="dlg-head">
      <h2 id={id}>{title}</h2>
      <button className="icon-btn" onClick={onClose} aria-label="닫기"><CloseIcon /></button>
    </div>
  );
}

export function PurchaseDialogs({ overlay, qty, setQty, onBuy, onStart, onClose, opener }: {
  overlay: Overlay | null; qty: number; setQty: (n: number) => void;
  onBuy: () => void; onStart: () => void; onClose: () => void; opener: RefObject<HTMLButtonElement | null>;
}) {
  const buyRef = useRef<HTMLButtonElement>(null);
  const step = (d: number) => setQty(clampQty(qty + d));
  return (
    <>
      <Dialog open={overlay !== null} onClose={onClose} returnFocus={opener} className="buy-sheet" labelledBy="qty-title">
        <Head id="qty-title" title="수량 선택" onClose={onClose} />
        <div className="buy-item">
          <p className="buy-name">제주 서귀포 햇귤 10kg</p>
          <p className="buy-opt">노지 온주밀감 · 2S~M 크기 혼합</p>
          <div className="buy-row">
            <span className="buy-unit">{formatWon(PRICE)}원 / 1박스<small>1회 최대 {MAX_QTY}박스</small></span>
            {/* 비활성은 aria-disabled: 끝값에 닿아도 초점이 버튼에 남는다 */}
            <div className="stepper" role="group" aria-label="수량">
              <button aria-label="한 박스 빼기" aria-disabled={qty <= 1} onClick={() => step(-1)}>−</button>
              <output>{qty}박스</output>
              <button aria-label="한 박스 더하기" aria-disabled={qty >= MAX_QTY} onClick={() => step(1)}>+</button>
            </div>
          </div>
        </div>
        <p className="buy-total"><span>총 상품 금액</span><strong>{formatWon(PRICE * qty)}<small>원</small></strong></p>
        <p className="sr-only" role="status">{`${qty}박스, 총 ${formatWon(PRICE * qty)}원`}</p>
        <div className="buy-cta"><button ref={buyRef} className="btn-primary" onClick={onBuy}>구매하기</button></div>
      </Dialog>
      <Dialog open={overlay === 'notice'} onClose={onClose} returnFocus={buyRef} className="buy-notice" labelledBy="notice-title">
        <Head id="notice-title" title="잠깐! 구매 전 확인해 주세요" onClose={onClose} />
        <div className="notice-body">
          <p>저희 귤상회는 고객님께 달콤한 귤을 보내드리기 위해 구매 전 당도 검사를 진행하고 있습니다.</p>
          <p>검사는 약 10초 정도 소요됩니다.</p>
        </div>
        <div className="buy-cta"><button className="btn-primary" onClick={onStart}>당도 검사 시작하기</button></div>
      </Dialog>
    </>
  );
}
