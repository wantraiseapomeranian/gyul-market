// tests/meta.spec.ts
import { test, expect } from '@playwright/test';
import { open, toEnding } from './helpers';

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

test('og.jpg는 1200×630 jpeg다', async ({ request }) => {
  const res = await request.get('/og.jpg');
  expect(res.ok()).toBe(true);
  expect(res.headers()['content-type']).toBe('image/jpeg');
  const buf = await res.body();
  // JPEG SOF0/SOF2에서 크기 읽기
  let i = 2, w = 0, h = 0;
  while (i < buf.length) {
    const marker = buf[i + 1], len = buf.readUInt16BE(i + 2);
    if (marker === 0xc0 || marker === 0xc2) { h = buf.readUInt16BE(i + 5); w = buf.readUInt16BE(i + 7); break; }
    i += 2 + len;
  }
  expect([w, h]).toEqual([1200, 630]);
});

test('전 과정에서 외부 도메인 요청이 없다', async ({ page, baseURL }) => {
  const external: string[] = [];
  page.on('request', (r) => { if (!r.url().startsWith(baseURL!) && !r.url().startsWith('data:')) external.push(r.url()); });
  await open(page);
  await toEnding(page);
  expect(external).toEqual([]);
});

// Next 16부터 `next build`는 First Load JS를 출력하지 않는다. `next start`(gzip)에서 받은 JS 압축 크기를 직접 더한다
test('첫 로드 JS 전송량 ≤ 130KB', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const bytes = await page.evaluate(() =>
    (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
      .filter((e) => new URL(e.name).pathname.startsWith('/_next/static/') && e.name.endsWith('.js'))
      .reduce((n, e) => n + e.encodedBodySize, 0));
  expect(bytes).toBeGreaterThan(0);
  expect(bytes).toBeLessThanOrEqual(130 * 1024);
});
