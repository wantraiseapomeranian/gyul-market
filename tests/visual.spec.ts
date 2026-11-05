import { test, expect, type Page } from '@playwright/test';
import { open, toSelect, pickRow, toMeasure, tapFruit, toResult, toJudging, toEnding } from './helpers';

// CSS 애니메이션은 page.clock과 무관하게 실제 시간으로 돈다. animations:'disabled'만으로는 막 시작한 스탬프가 중간 상태로 찍힌다.
async function shot(page: Page, name: string) {
  await page.evaluate(() => document.getAnimations().forEach((a) => { try { a.finish(); } catch { /* 무한 반복은 건너뜀 */ } }));
  await expect(page).toHaveScreenshot(name);
}

test.describe('화면 스크린샷', () => {
  test.beforeEach(async ({ page }) => { await open(page); });
  test('1 상품', async ({ page }) => { await shot(page, '1-product.png'); });
  test('2 선택', async ({ page }) => { await toSelect(page); await pickRow(page, 'C').click(); await shot(page, '2-select.png'); });
  test('3 측정', async ({ page }) => { await toMeasure(page, 'C'); await tapFruit(page, 3); await expect(page.locator('.stamp-cells li[data-state="on"]')).toHaveCount(3); await shot(page, '3-measure.png'); });
  test('4 결과', async ({ page }) => { await toResult(page, 'C'); await shot(page, '4-result.png'); });
  test('5 판정', async ({ page }) => { await toJudging(page); await shot(page, '5-judging.png'); });
  test('6 엔딩', async ({ page }) => { await toEnding(page); await shot(page, '6-ending.png'); });
});
