// tests/meta.spec.ts
import { test, expect } from '@playwright/test';
import { open } from './helpers';

test('noindex, color-scheme, viewport-fit, OG', async ({ page }) => {
  await open(page);
  const meta = (sel: string) => page.locator(sel).getAttribute('content');
  expect(await meta('meta[name="robots"]')).toContain('noindex');
  expect(await meta('meta[name="color-scheme"]')).toBe('light');
  expect(await meta('meta[name="viewport"]')).toContain('viewport-fit=cover');
  expect(await meta('meta[property="og:title"]')).toBe('제주 서귀포 햇귤 10kg · 29,900원 | 귤상회');
  expect(await meta('meta[property="og:description"]')).toBe('노지 온주밀감 2S~M 혼합 · 무료배송 · 당도 검사 10초');
  expect(await meta('meta[property="og:image"]')).toMatch(/\/og\.jpg$/);
  expect(await meta('meta[property="og:image:width"]')).toBe('1200');
  await expect(page).toHaveTitle('제주 서귀포 햇귤 10kg | 귤상회');
});

test('웹폰트가 자체 호스팅으로 로드된다', async ({ page }) => {
  await open(page);
  await page.evaluate(() => document.fonts.ready);
  // next/font가 만드는 'Hahmlet Fallback'(로컬 대체 글꼴)은 제외한다. document.fonts.check()는 글꼴이 없어도 true를 낼 수 있어 쓰지 않는다
  expect(await page.evaluate(() => [...document.fonts].some((f) => /hahmlet/i.test(f.family) && !/fallback/i.test(f.family) && f.status === 'loaded'))).toBe(true);
  expect(await page.evaluate(() => [...document.fonts].some((f) => /Pretendard/.test(f.family) && f.status === 'loaded'))).toBe(true);
});
