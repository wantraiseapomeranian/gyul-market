import { test, expect } from '@playwright/test';
import { open, toSelect, pickRow, toMeasure, tapFruit, toResult, toJudging, toEnding } from './helpers';

test.describe('화면 스크린샷', () => {
  test.beforeEach(async ({ page }) => { await open(page); });
  test('1 상품', async ({ page }) => { await expect(page).toHaveScreenshot('1-product.png'); });
  test('2 선택', async ({ page }) => { await toSelect(page); await pickRow(page, 'C').click(); await expect(page).toHaveScreenshot('2-select.png'); });
  test('3 측정', async ({ page }) => { await toMeasure(page, 'C'); await tapFruit(page, 3); await expect(page).toHaveScreenshot('3-measure.png'); });
  test('4 결과', async ({ page }) => { await toResult(page, 'C'); await expect(page).toHaveScreenshot('4-result.png'); });
  test('5 판정', async ({ page }) => { await toJudging(page); await expect(page).toHaveScreenshot('5-judging.png'); });
  test('6 엔딩', async ({ page }) => { await toEnding(page); await expect(page).toHaveScreenshot('6-ending.png'); });
});
