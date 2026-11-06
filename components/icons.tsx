const base = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true" {...base}><path d="M15 5l-7 7 7 7" /></svg>
);
export const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true" {...base}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true" {...base}><path d="M12 15V3.5M7.5 8 12 3.5 16.5 8" /><path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5" /></svg>
);
