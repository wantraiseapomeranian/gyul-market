import { test, expect, type Page } from '@playwright/test';
import { open, toSelect, pickRow, toMeasure, tapFruit, toResult, toJudging, toEnding } from './helpers';

// CSS 애니메이션은 page.clock과 무관하게 실제 시간으로 돈다. 노드 쪽에서 실제 시간으로 끝나기를 기다린 뒤 찍는다.
async function settle(page: Page) {
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length)).toBe(0);
}
async function shot(page: Page, name: string) {
  await settle(page);
  await expect(page).toHaveScreenshot(name);
}

test.describe('화면 스크린샷', () => {
  test.beforeEach(async ({ page }) => { await open(page); });
  test('1 상품', async ({ page }) => { await expect(page.locator('.tag-stamp')).toBeVisible(); await shot(page, '1-product.png'); });
  test('2 선택', async ({ page }) => { await toSelect(page); await pickRow(page, 'C').click(); await shot(page, '2-select.png'); });
  test('3 측정', async ({ page }) => { await toMeasure(page, 'C'); await tapFruit(page, 3); await expect(page.locator('.stamp-cells li[data-state="on"]')).toHaveCount(3); await expect(page.locator('.stamp-cells li[data-state="on"] .stamp').nth(2)).toHaveCSS('opacity', '0.96'); await shot(page, '3-measure.png'); });
  test('4 결과', async ({ page }) => { await toResult(page, 'C'); await expect(page.locator('.inspector .stamp')).toBeVisible(); await shot(page, '4-result.png'); });
  test('5 판정', async ({ page }) => { await toJudging(page); await settle(page); await expect(page.locator('.big-stamp')).toBeVisible(); await expect(page.locator('.big-stamp')).toHaveCSS('opacity', '0.9'); await shot(page, '5-judging.png'); });
  test('6 엔딩', async ({ page }) => { await toEnding(page); await settle(page); await expect(page.locator('.cert-stamp')).toBeVisible(); await expect(page.locator('.cert-stamp')).toHaveCSS('opacity', '0.96'); await shot(page, '6-ending.png'); });
});
