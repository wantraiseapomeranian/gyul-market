import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { open, toSelect, toMeasure, toResult, toEnding } from './helpers';

async function noViolations(page: Page) {
  await page.clock.resume(); // axe는 setTimeout을 쓴다: open()이 멈춘 시계를 풀어야 분석이 끝난다
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
}

test.describe('axe', () => {
  test.beforeEach(async ({ page }) => { await open(page); });
  test('상품', async ({ page }) => { await noViolations(page); });
  test('선택', async ({ page }) => { await toSelect(page); await noViolations(page); });
  test('측정', async ({ page }) => { await toMeasure(page); await noViolations(page); });
  test('결과', async ({ page }) => { await toResult(page); await noViolations(page); });
  test('엔딩', async ({ page }) => { await toEnding(page); await noViolations(page); });
});

test('키보드만으로 엔딩까지 간다', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: /당도 검사 받기/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: '당도 검사', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');              // 제목 다음: 시료 라디오 그룹(뒤로 버튼은 제목 앞)
  await page.keyboard.press('ArrowDown');        // 다음 시료로 이동하며 선택
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(1);
  await page.keyboard.press('Tab');              // 하단 '○ 시료 검사 시작'
  await page.keyboard.press('Enter');
  const fruit = page.getByRole('button', { name: /귤 누르기/ });
  await fruit.focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press('Enter');
  await page.clock.runFor(500);
  await page.getByRole('button', { name: '최종 판정 받기' }).focus();
  await page.keyboard.press('Enter');
  await page.clock.runFor(1600);
  await expect(page.getByRole('heading', { name: '귤은 없습니다.' })).toBeFocused();
});
