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

export const sheet = (page: Page) => page.getByRole('dialog', { name: '수량 선택' });
export const notice = (page: Page) => page.getByRole('dialog', { name: '잠깐! 구매 전 확인해 주세요' });
export const productCta = (page: Page) => page.locator('.bar').getByRole('button', { name: '구매하기' });

// 여는 애니메이션(실제 시간)이 끝날 때까지 기다린다. 그동안은 바깥 누름이 무시된다(연타 보호)
const opened = (d: ReturnType<typeof sheet>) =>
  expect.poll(() => d.evaluate((el) => el.getAnimations().filter((a) => a.playState === 'running').length)).toBe(0);

/** 상품 → 구매하기 → 수량 시트 */
export async function toSheet(page: Page) {
  await productCta(page).click();
  await expect(sheet(page)).toBeVisible();
  await opened(sheet(page));
}

/** 수량 시트 → 구매하기 → 당도 검사 안내 모달 */
export async function toNotice(page: Page) {
  await toSheet(page);
  await sheet(page).getByRole('button', { name: '구매하기' }).click();
  await expect(notice(page)).toBeVisible();
  await opened(notice(page));
}

export async function toSelect(page: Page) {
  await toNotice(page);
  await notice(page).getByRole('button', { name: '당도 검사 시작하기' }).click();
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
