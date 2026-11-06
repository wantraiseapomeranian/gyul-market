import type { ReactNode } from 'react';

export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="bar">
      <div className="bar-row">{children}</div>
    </div>
  );
}
