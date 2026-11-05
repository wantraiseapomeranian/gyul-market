import { test, expect } from '@playwright/test';
import { open, toEnding } from './helpers';

for (const width of [320, 430, 768, 1280]) {
  test(`${width}px: 가로 넘침 없음, 바·전환 레이어는 430px 기둥`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const bar = await page.locator('.bar').boundingBox();
    expect(bar!.width).toBeLessThanOrEqual(430);
    await toEnding(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test('상품 마지막 내용이 하단 바에 가리지 않는다', async ({ page }) => {
  await open(page);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const foot = await page.locator('.foot').boundingBox();
  const bar = await page.locator('.bar').boundingBox();
  expect(foot!.y + foot!.height).toBeLessThanOrEqual(bar!.y + 1);
});
