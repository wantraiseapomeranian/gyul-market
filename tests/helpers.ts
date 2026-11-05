// tests/helpers.ts
import { expect, type Page } from '@playwright/test';

export const NOW = new Date('2026-11-05T10:00:00+09:00');
type Fruit = 'A' | 'B' | 'C';

/** random=0.999 → 당도 배정 A 12.4 · B 14.2 · C 15.8 (assignBrix 항등). 시계는 NOW에 멈춘다. */
export async function open(page: Page, opts: { random?: number; reducedMotion?: boolean } = {}) {
  await page.addInitScript((v) => { Math.random = () => v; }, opts.random ?? 0.999);
  if (opts.reducedMotion) await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install({ time: new Date(NOW.getTime() - 60_000) });
  await page.goto('/');
  await page.clock.pauseAt(NOW);
}

export const pickRow = (page: Page, f: Fruit) =>
  page.locator('label', { has: page.getByRole('radio', { name: new RegExp(`시료 ${f}`) }) });

export async function toSelect(page: Page) {
  await page.getByRole('button', { name: /당도 검사 받기/ }).click();
  await expect(page.getByRole('heading', { name: '당도 검사', exact: true })).toBeVisible();
}

export async function toMeasure(page: Page, f: Fruit = 'C') {
  await toSelect(page);
  await pickRow(page, f).click();
  await page.getByRole('button', { name: `${f} 시료 검사 시작` }).click();
}

export async function tapFruit(page: Page, n: number) {
  const fruit = page.getByRole('button', { name: /귤 누르기/ });
  for (let i = 0; i < n; i++) await fruit.click();
}

export async function toResult(page: Page, f: Fruit = 'C') {
  await toMeasure(page, f);
  await tapFruit(page, 5);
  await page.clock.runFor(500);
  await expect(page.getByRole('heading', { name: '검사 결과' })).toBeVisible();
}

export async function toJudging(page: Page) {
  await toResult(page);
  await page.getByRole('button', { name: '최종 판정 받기' }).click();
  await expect(page.getByRole('heading', { name: '판정서를 발급하고 있습니다' })).toBeVisible();
}

export async function toEnding(page: Page) {
  await toJudging(page);
  await page.clock.runFor(1600);
  await expect(page.getByRole('heading', { name: '귤은 없습니다.' })).toBeVisible();
}
