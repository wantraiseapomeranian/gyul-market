import type { StaticImageData } from 'next/image';
import a from '@/assets/images/fruit-a.jpg';
import b from '@/assets/images/fruit-b.jpg';
import c from '@/assets/images/fruit-c.jpg';
import type { FruitId, Size } from '@/lib/game';

// 시료 사진은 위치(A·B·C)에 고정. 당도는 판마다 무작위다(FR-6).
export const FRUIT_IMG: Record<FruitId, StaticImageData> = { A: a, B: b, C: c };
export const GAUGE_PX: Record<Size, number> = { '2S': 50, S: 61, M: 72 };
