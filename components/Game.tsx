'use client';
import { useReducer, type ReactNode } from 'react';
import { reduce, initialState, assignBrix } from '@/lib/game';
import { BottomBar } from './BottomBar';

export function Game({ product }: { product: ReactNode }) {
  const [s, dispatch] = useReducer(reduce, initialState);
  if (s.screen !== 'product') return null;
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
}
