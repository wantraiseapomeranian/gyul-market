// playwright.config.ts
import { defineConfig } from '@playwright/test';

// UA는 실기기와 비슷한 조건을 만들기 위한 것. 앱 코드는 UA로 분기하지 않는다.
const KAKAO_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.9.0';
const KAKAO_AOS = 'Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 KAKAOTALK 10.9.0';

export default defineConfig({
  testDir: 'tests',
  testIgnore: process.env.PERF_DIAG ? [] : [/perf-diag\.spec\.ts$/], // 진단은 요청할 때만(npm test에서 제외)
  workers: 2,
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },
  use: { baseURL: 'http://localhost:3000', locale: 'ko-KR', timezoneId: 'Asia/Seoul', colorScheme: 'light' },
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
  projects: [
    { name: 'm390', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: KAKAO_IOS } },
    { name: 'm360', use: { browserName: 'chromium', viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: KAKAO_AOS } },
    { name: 'webkit', use: { browserName: 'webkit', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, testMatch: /flow\.spec\.ts/ },
  ],
});
