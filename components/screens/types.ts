import type { RefObject } from 'react';
import type { GameEvent, GameState } from '@/lib/game';

export type ScreenProps = {
  s: GameState;
  dispatch: (e: GameEvent) => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
  today: string;
};
