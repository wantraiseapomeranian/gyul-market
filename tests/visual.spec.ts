import { test, expect, type Page } from '@playwright/test';
import { open, toSelect, pickRow, toMeasure, tapFruit, toResult, toJudging, toEnding, toSheet, toNotice, sheet } from './helpers';

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
  test('1b 수량 시트', async ({ page }) => { await toSheet(page); await sheet(page).getByRole('button', { name: '한 박스 더하기' }).click(); await shot(page, '1b-qty.png'); });
  test('1c 안내 모달', async ({ page }) => { await toNotice(page); await shot(page, '1c-notice.png'); });
  test('2 선택', async ({ page }) => { await toSelect(page); await pickRow(page, 'C').click(); await shot(page, '2-select.png'); });
  test('3 측정', async ({ page }) => { await toMeasure(page, 'C'); await tapFruit(page, 3); await expect(page.locator('.stamp-cells li[data-state="on"]')).toHaveCount(3); await expect(page.locator('.stamp-cells li[data-state="on"] .stamp').nth(2)).toHaveCSS('opacity', '0.96'); await shot(page, '3-measure.png'); });
  test('4 결과', async ({ page }) => { await toResult(page, 'C'); await expect(page.locator('.inspector .stamp')).toBeVisible(); await shot(page, '4-result.png'); });
  test('5 판정', async ({ page }) => { await toJudging(page); await settle(page); await expect(page.locator('.big-stamp')).toBeVisible(); await expect(page.locator('.big-stamp')).toHaveCSS('opacity', '0.9'); await shot(page, '5-judging.png'); });
  // 가장 긴 조합: 4회차 문구 + G2-1(달콤, 1번째 줄) + 1박스 소견. random 0 → A=14.2, 줄 번호 0
  test('6b 엔딩 긴 조합', async ({ page }) => {
    await open(page, { random: 0 });
    for (let r = 0; r < 4; r++) {
      if (r === 0) await toSelect(page); else await page.getByRole('button', { name: '다시 검사하기' }).click();
      await pickRow(page, 'A').click();
      await page.getByRole('button', { name: 'A 시료 검사 시작' }).click();
      await tapFruit(page, 5);
      await page.clock.runFor(500);
      await page.getByRole('button', { name: '최종 판정 받기' }).click();
      await page.clock.runFor(1600);
    }
    await expect(page.locator('.e-head p:not(.e-no)')).toContainText('꾸준히 검사해 주셔서 감사합니다.');
    await expect(page.locator('.cert .note').first()).toHaveText('구매 의욕과 검사 참여도 모두 양호합니다. 의심만 조금 부족했습니다.');
    await settle(page);
    await shot(page, '6b-ending-long.png');
  });
  test('6 엔딩', async ({ page }) => { await toEnding(page); await settle(page); await expect(page.locator('.cert-stamp')).toBeVisible(); await expect(page.locator('.cert-stamp')).toHaveCSS('opacity', '0.96'); await shot(page, '6-ending.png'); });
});
