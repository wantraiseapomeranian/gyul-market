import type { ReactNode } from 'react';

/** 도장·인장 인주 질감. layout에서 한 번만 렌더한다. */
export function InkFilters() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <filter id="ink" x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={2.4} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves={1} seed={9} result="s" />
        <feColorMatrix in="s" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.6" result="m" />
        <feComposite in="d" in2="m" operator="in" />
      </filter>
      <filter id="ink-soft" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves={1} seed={2} result="s" />
        <feColorMatrix in="s" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.55" result="m" />
        <feComposite in="SourceGraphic" in2="m" operator="in" />
      </filter>
    </svg>
  );
}

type StampProps = { children: ReactNode; shape?: 'round' | 'square'; className?: string; label?: string };

/** 도장은 장식이다. 의미가 있으면 label을 넘겨 화면 낭독용 문구를 둔다. */
export function Stamp({ children, shape = 'round', className = '', label }: StampProps) {
  return (
    <>
      <span aria-hidden="true" className={`stamp ${shape === 'round' ? 'stamp-round' : ''} ${className}`}>{children}</span>
      {label ? <span className="sr-only">{label}</span> : null}
    </>
  );
}
