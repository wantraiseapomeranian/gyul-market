// tests/perf.spec.ts
// 실험실(lab) 측정이다. 실기기도, 현장(field) 데이터도 아니다. CDP로 네트워크·CPU를 느리게 만든 Chromium에서 잰다.
// DevTools 방식 스로틀링은 Lighthouse의 시뮬레이션 스로틀링보다 가혹하다. INP는 event timing으로 근사한 값이다.
// 판정은 GitHub 호스트 러너(.github/workflows/perf.yml)에서 한다(사용자 결정 2026-11-06, AUDIT 'PERF-1 측정 신뢰성').
// 로컬 PC는 실효 감속 배율과 속도가 크게 흔들려 건너뛴다. 참고 측정: PERF=1 npx playwright test tests/perf.spec.ts --project=m390
import { test, expect } from '@playwright/test';
import { appendFileSync } from 'node:fs';

test('모바일 LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 (실험실)', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'm390', 'm390에서만 측정');
  test.skip(!process.env.CI && !process.env.PERF, '판정은 GitHub 러너에서(perf 워크플로). 로컬 참고 측정은 PERF=1');
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    Math.random = () => 0.999;
    const w = window as unknown as { __m: { lcp: number; lcpEl: string; cls: number; inp: number } };
    w.__m = { lcp: 0, lcpEl: '', cls: 0, inp: 0 };
    type E = PerformanceEntry & { element?: Element; url?: string; hadRecentInput?: boolean; value?: number; interactionId?: number };
    const obs = (type: string, cb: (e: E) => void, extra: object = {}) => {
      try { new PerformanceObserver((l) => l.getEntries().forEach((e) => cb(e as E))).observe({ type, buffered: true, ...extra } as PerformanceObserverInit); } catch {}
    };
    obs('largest-contentful-paint', (e) => { w.__m.lcp = e.startTime; w.__m.lcpEl = `${e.element?.tagName ?? '?'} ${e.url || ''}`; });
    obs('layout-shift', (e) => { if (!e.hadRecentInput) w.__m.cls += e.value ?? 0; });
    obs('event', (e) => { if ((e.interactionId ?? 0) > 0) w.__m.inp = Math.max(w.__m.inp, e.duration); }, { durationThreshold: 16 });
  });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.goto('/');
  await page.waitForLoadState('load');
  await page.waitForLoadState('networkidle');
  const read = () => page.evaluate(() => (window as unknown as { __m: { lcp: number; lcpEl: string; cls: number; inp: number } }).__m);
  const { lcp, lcpEl } = await read(); // LCP는 첫 입력 뒤 갱신이 멈추므로 상호작용 전에 읽는다

  await page.locator('.bar').getByRole('button', { name: '구매하기' }).click();
  await page.getByRole('dialog', { name: '수량 선택' }).getByRole('button', { name: '구매하기' }).click();
  await page.getByRole('button', { name: '당도 검사 시작하기' }).click();
  await page.locator('label', { has: page.getByRole('radio', { name: /시료 C/ }) }).click();
  await page.getByRole('button', { name: 'C 시료 검사 시작' }).click();
  const fruit = page.getByRole('button', { name: /귤 누르기/ });
  for (let i = 0; i < 5; i++) await fruit.click();
  await expect(page.getByRole('heading', { name: '검사 결과' })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: '최종 판정 받기' }).click();
  await expect(page.getByRole('heading', { name: '귤은 없습니다.' })).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(500);
  const { cls, inp } = await read();

  const summary = `LCP ${Math.round(lcp)}ms, INP ${Math.round(inp)}ms, CLS ${cls.toFixed(4)}`;
  testInfo.annotations.push({ type: 'perf', description: summary });
  console.log(`PERF ${summary} | LCP element: ${lcpEl}`);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `PERF ${summary} (기준 LCP ≤ 2500ms, INP ≤ 200ms, CLS ≤ 0.1)\n`);
  expect(lcp, 'LCP').toBeGreaterThan(0);
  expect(inp, 'INP 측정값(이벤트 타이밍 기록 없음이면 0)').toBeGreaterThan(0);
  expect(lcp, 'LCP ms').toBeLessThanOrEqual(2500);
  expect(cls, 'CLS').toBeLessThanOrEqual(0.1);
  expect(inp, 'INP ms').toBeLessThanOrEqual(200);
});
