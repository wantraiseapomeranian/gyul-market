import type { ReactNode } from 'react';

export function BottomBar({ children, note }: { children: ReactNode; note?: string }) {
  return (
    <div className="bar">
      <div className="bar-row">{children}</div>
      {note ? <p className="bar-note">{note}</p> : null}
    </div>
  );
}
