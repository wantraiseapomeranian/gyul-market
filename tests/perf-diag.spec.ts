// tests/perf-diag.spec.ts
// PERF-1 측정 신뢰성 진단. 합격 판정은 하지 않고 기록만 한다(기준 판정은 tests/perf.spec.ts).
// PERF_DIAG=1일 때만 실행된다(playwright.config.ts testIgnore). PERF_RUNS: 방식별 반복 수(기본 10).
//   PERF_DIAG=1 npx playwright test tests/perf-diag.spec.ts --project=m390 --workers=1
// 결과: test-results/perf-diag-runs.json(회차별), test-results/perf-diag-summary.json(요약)
import { test, type Page, type CDPSession } from '@playwright/test';
import { freemem } from 'node:os';
import { mkdirSync, writeFileSync } from 'node:fs';

const RUNS = Number(process.env.PERF_RUNS ?? 10);
const MODES = ['immediate', 'think'] as const; // think: 로드 후 3초, 동작 사이 1초 쉼
type Mode = (typeof MODES)[number];
type Run = {
  mode: Mode; run: number; freeMemMB: number;
  jsMs1x: number; jsFactor: number; layoutMs1x: number; layoutFactor: number;
  fcp: number; lcp: number; lcpKind: string; cls: number; inp: number;
  interactions: { name: string; ms: number }[];
};
const runs: Run[] = [];
const STEPS = ['구매하기(상품)', '구매하기(시트)', 'CTA 당도 검사 시작하기', '행 선택 C', 'C 시료 검사 시작', '탭 1', '탭 2', '탭 3', '탭 4', '탭 5', '최종 판정 받기'];

test.describe.configure({ mode: 'serial' });

async function calibrate(page: Page, cdp: CDPSession) {
  // 같은 일을 1배와 4배에서 재서 이 호스트의 실효 감속 배율을 구한다
  const js = () => page.evaluate(() => { const t = performance.now(); let x = 0; for (let i = 0; i < 5e7; i++) x += i % 7; return performance.now() - t + (x < 0 ? 1 : 0); });
  const layout = () => page.evaluate(() => {
    document.body.innerHTML = `<div id="b" style="width:300px">${'당도 검사 받기 노지 온주밀감 '.repeat(150)}</div>`;
    const el = document.getElementById('b')!; const t = performance.now();
    for (let i = 0; i < 100; i++) { el.style.width = `${300 + (i % 2)}px`; void el.offsetHeight; }
    return performance.now() - t;
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const js1 = await js(); const l1 = await layout();
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const js4 = await js(); const l4 = await layout();
  return { jsMs1x: js1, jsFactor: js4 / js1, layoutMs1x: l1, layoutFactor: l4 / l1 };
}

for (let i = 1; i <= RUNS; i++) {
  for (const mode of MODES) {
    test(`${mode} #${i}`, async ({ page, context }, testInfo) => {
      test.skip(testInfo.project.name !== 'm390', 'm390에서만 측정');
      test.setTimeout(180_000);
      const pause = (ms: number) => (mode === 'think' ? page.waitForTimeout(ms) : Promise.resolve());
      await page.addInitScript(() => {
        Math.random = () => 0.999;
        type E = PerformanceEntry & { url?: string; hadRecentInput?: boolean; value?: number; interactionId?: number };
        const m = { fcp: 0, lcp: 0, lcpUrl: '', lcpTag: '', cls: 0, ix: {} as Record<number, { start: number; ms: number }> };
        (window as unknown as { __m: typeof m }).__m = m;
        const obs = (type: string, cb: (e: E) => void, extra: object = {}) => {
          try { new PerformanceObserver((l) => l.getEntries().forEach((e) => cb(e as E))).observe({ type, buffered: true, ...extra } as PerformanceObserverInit); } catch {}
        };
        obs('paint', (e) => { if (e.name === 'first-contentful-paint') m.fcp = e.startTime; });
        obs('largest-contentful-paint', (e) => { m.lcp = e.startTime; m.lcpUrl = e.url ?? ''; m.lcpTag = (e as unknown as { element?: Element }).element?.tagName ?? '?'; });
        obs('layout-shift', (e) => { if (!e.hadRecentInput) m.cls += e.value ?? 0; });
        obs('event', (e) => {
          const id = e.interactionId ?? 0; if (!id) return;
          const cur = m.ix[id] ?? { start: e.startTime, ms: 0 };
          m.ix[id] = { start: Math.min(cur.start, e.startTime), ms: Math.max(cur.ms, e.duration) };
        }, { durationThreshold: 16 });
      });
      const cdp = await context.newCDPSession(page);
      const cal = await calibrate(page, cdp); // 끝나면 4배 상태
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
      const freeMemMB = Math.round(freemem() / 2 ** 20);

      await page.goto('/');
      await page.waitForLoadState('load');
      await page.waitForLoadState('networkidle');
      await pause(3000);
      type M = { fcp: number; lcp: number; lcpUrl: string; lcpTag: string; cls: number; ix: Record<number, { start: number; ms: number }> };
      const read = () => page.evaluate(() => (window as unknown as { __m: M }).__m);
      const before = await read(); // LCP는 첫 입력 뒤 갱신이 멈추므로 상호작용 전에 읽는다

      await page.locator('.bar').getByRole('button', { name: '구매하기' }).click();
      await pause(1000);
      await page.getByRole('dialog', { name: '수량 선택' }).getByRole('button', { name: '구매하기' }).click();
      await pause(1000);
      await page.getByRole('button', { name: '당도 검사 시작하기' }).click();
      await pause(1000);
      await page.locator('label', { has: page.getByRole('radio', { name: /시료 C/ }) }).click();
      await pause(1000);
      await page.getByRole('button', { name: 'C 시료 검사 시작' }).click();
      const fruit = page.getByRole('button', { name: /귤 누르기/ });
      for (let k = 0; k < 5; k++) { await pause(1000); await fruit.click(); }
      await page.getByRole('heading', { name: '검사 결과' }).waitFor({ timeout: 15_000 });
      await pause(1000);
      await page.getByRole('button', { name: '최종 판정 받기' }).click();
      await page.getByRole('heading', { name: '귤은 없습니다.' }).waitFor({ timeout: 15_000 });
      await page.waitForTimeout(500);
      const after = await read();

      const ix = Object.values(after.ix).sort((a, b) => a.start - b.start);
      const r: Run = {
        mode, run: i, freeMemMB, ...cal,
        fcp: before.fcp, lcp: before.lcp, cls: after.cls,
        lcpKind: before.lcpUrl.startsWith('data:') ? 'placeholder' : before.lcpUrl ? 'hero' : before.lcpTag,
        inp: Math.max(0, ...ix.map((x) => x.ms)),
        interactions: ix.map((x, k) => ({ name: ix.length === STEPS.length ? STEPS[k] : `#${k + 1}`, ms: x.ms })),
      };
      runs.push(r);
      console.log(`DIAG ${mode} #${i} LCP ${Math.round(r.lcp)}(${r.lcpKind}) INP ${Math.round(r.inp)} CLS ${r.cls.toFixed(4)} | js×${r.jsFactor.toFixed(1)} layout×${r.layoutFactor.toFixed(1)} js1x ${Math.round(r.jsMs1x)}ms | free ${freeMemMB}MB`);
    });
  }
}

test.afterAll(() => {
  if (!runs.length) return;
  const q = (xs: number[], p: number) => { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)]; };
  const stat = (xs: number[]) => ({ n: xs.length, min: Math.min(...xs), median: q(xs, 0.5), p75: q(xs, 0.75), max: Math.max(...xs) });
  const rank = (xs: number[]) => xs.map((x) => xs.filter((y) => y < x).length + (xs.filter((y) => y === x).length - 1) / 2);
  const spearman = (a: number[], b: number[]) => {
    const ra = rank(a), rb = rank(b), n = a.length, ma = ra.reduce((s, x) => s + x, 0) / n, mb = rb.reduce((s, x) => s + x, 0) / n;
    const cov = ra.reduce((s, x, k) => s + (x - ma) * (rb[k] - mb), 0);
    const den = Math.sqrt(ra.reduce((s, x) => s + (x - ma) ** 2, 0) * rb.reduce((s, x) => s + (x - mb) ** 2, 0));
    return den ? cov / den : 0;
  };
  const summary = Object.fromEntries(MODES.map((mode) => {
    const rs = runs.filter((r) => r.mode === mode);
    const col = (f: (r: Run) => number) => rs.map(f);
    const cta = col((r) => r.interactions.find((x) => x.name.startsWith('CTA'))?.ms ?? NaN).filter((x) => !Number.isNaN(x));
    return [mode, {
      lcp: stat(col((r) => r.lcp)), inp: stat(col((r) => r.inp)), cta: cta.length ? stat(cta) : null,
      cls: stat(col((r) => r.cls)), fcp: stat(col((r) => r.fcp)),
      jsFactor: stat(col((r) => r.jsFactor)), layoutFactor: stat(col((r) => r.layoutFactor)), jsMs1x: stat(col((r) => r.jsMs1x)),
      lcpPlaceholderRuns: rs.filter((r) => r.lcpKind === 'placeholder').length,
      passLcp: rs.filter((r) => r.lcp <= 2500).length, passInp: rs.filter((r) => r.inp <= 200).length,
      passAll: rs.filter((r) => r.lcp <= 2500 && r.inp <= 200 && r.cls <= 0.1).length,
      spearman: { jsFactor_inp: spearman(col((r) => r.jsFactor), col((r) => r.inp)), layoutFactor_inp: spearman(col((r) => r.layoutFactor), col((r) => r.inp)), jsFactor_lcp: spearman(col((r) => r.jsFactor), col((r) => r.lcp)) },
    }];
  }));
  mkdirSync('test-results', { recursive: true });
  writeFileSync('test-results/perf-diag-runs.json', JSON.stringify(runs, null, 1));
  writeFileSync('test-results/perf-diag-summary.json', JSON.stringify(summary, null, 1));
  console.log('DIAG SUMMARY', JSON.stringify(summary));
});
