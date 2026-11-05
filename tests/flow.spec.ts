import { test, expect } from '@playwright/test';
import { open, toSelect, pickRow, toMeasure, tapFruit, toResult, toJudging, toEnding } from './helpers';

test.describe('① 상품 상세', () => {
  test.beforeEach(async ({ page }) => { await open(page); });

  test('첫 진입에서는 초점을 옮기지 않는다', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: '제주 서귀포 햇귤 10kg' })).not.toBeFocused();
  });

  test('핵심 정보와 CTA가 첫 화면에 보인다', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: '제주 서귀포 햇귤 10kg' })).toBeInViewport();
    await expect(page.getByText('29,900', { exact: true })).toBeInViewport();
    await expect(page.getByText('무료배송')).toBeInViewport();
    await expect(page.getByRole('button', { name: /당도 검사 받기/ })).toBeInViewport();
  });

  test('동작하지 않는 UI와 구매 표현, 생산 이력 표기가 없다', async ({ page }) => {
    await expect(page.getByRole('button', { name: /검색|장바구니|찜/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /검색|장바구니/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /구매/ })).toHaveCount(0);
    await expect(page.getByText(/원산지|상품정보제공고시|수확일|생산자/)).toHaveCount(0);
    await expect(page.getByText('1 / 4')).toHaveCount(0);
  });

  test('푸터에 가상 상점 고지가 있다', async ({ page }) => {
    await expect(page.getByText(/실제로 존재하지 않는 가상의 상점/)).toBeAttached();
  });
});

test.describe('② 귤 선택', () => {
  test.beforeEach(async ({ page }) => { await open(page); await toSelect(page); });

  test('고르기 전 시작 버튼은 비활성, 고르면 시료 이름이 붙는다', async ({ page }) => {
    await expect(page.getByRole('button', { name: '검사할 귤을 고르세요' })).toBeDisabled();
    await pickRow(page, 'B').click();
    await expect(page.getByRole('radio', { name: /시료 B/ })).toBeChecked();
    await expect(page.getByRole('button', { name: 'B 시료 검사 시작' })).toBeEnabled();
  });

  test('규격과 당도의 무관함을 밝히고, 날짜는 오늘이다', async ({ page }) => {
    await expect(page.getByText(/크기·색과 관계없이 정해집니다/)).toBeVisible();
    await expect(page.getByText('2026.11.05')).toBeVisible();
    await expect(page.getByText('연출된 체험 · 판매·결제 없음')).toBeVisible();
  });

  test('화면이 바뀌면 제목에 초점이 간다', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '당도 검사', exact: true })).toBeFocused();
  });

  test('뒤로 가면 상품 제목에 초점이 간다', async ({ page }) => {
    await page.getByRole('button', { name: '상품으로 돌아가기' }).click();
    await expect(page.getByRole('heading', { level: 1, name: '제주 서귀포 햇귤 10kg' })).toBeFocused();
  });

  test('뒤로 가면 상품으로 돌아가고 선택이 풀린다', async ({ page }) => {
    await pickRow(page, 'A').click();
    await page.getByRole('button', { name: '상품으로 돌아가기' }).click();
    await expect(page.getByRole('heading', { level: 1, name: '제주 서귀포 햇귤 10kg' })).toBeVisible();
    await toSelect(page);
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(0);
  });
});

test.describe('③ 당도 측정', () => {
  test.beforeEach(async ({ page }) => { await open(page); await toMeasure(page, 'C'); });

  test('탭마다 횟수·측정값·도장이 오르고 5회 뒤 결과로 간다', async ({ page }) => {
    await expect(page.getByText('0 / 5회')).toBeVisible();
    await tapFruit(page, 3);
    await expect(page.getByText('3 / 5회')).toBeVisible();
    await expect(page.getByText('9.5', { exact: true })).toBeVisible();   // C=15.8 × 3/5
    await expect(page.locator('.stamp-cells li[data-state="on"]')).toHaveCount(3);
    await tapFruit(page, 2);
    const fruit = page.getByRole('button', { name: /귤 누르기/ });
    await expect(fruit).toHaveAttribute('aria-disabled', 'true');
    // aria-disabled 요소는 Playwright가 비활성으로 보고 click()이 시간 초과까지 기다린다. 6번째는 force로 눌러 무시되는지 본다
    await fruit.click({ force: true });
    await expect(page.getByText('5 / 5회')).toBeVisible();
    await expect(page.getByText('측정 완료')).toBeVisible();
    await page.clock.runFor(500);
    await expect(page.getByRole('heading', { name: '검사 결과' })).toBeVisible();
  });

  test('뒤로 가면 선택으로 가고 탭 수가 초기화된다', async ({ page }) => {
    await tapFruit(page, 2);
    await page.getByRole('button', { name: '귤 다시 고르기' }).click();
    await expect(page.getByRole('radio', { name: /시료 C/ })).toBeChecked();
    await page.getByRole('button', { name: 'C 시료 검사 시작' }).click();
    await expect(page.getByText('0 / 5회')).toBeVisible();
  });

  test('키보드 Space로도 측정한다', async ({ page }) => {
    await page.getByRole('button', { name: /귤 누르기/ }).focus();
    await page.keyboard.press('Space');
    await expect(page.getByText('1 / 5회')).toBeVisible();
  });
});

test.describe('④ 결과 · ⑤ 판정 전환', () => {
  test('고른 시료만 당도를 보이고 나머지는 미검사다', async ({ page }) => {
    await open(page);
    await toResult(page, 'C');
    await expect(page.getByText('15.8')).toBeVisible();
    await expect(page.getByText('미검사')).toHaveCount(2);
    await expect(page.getByText('검사 완료', { exact: true })).toBeAttached();
    await expect(page.getByText('발급 대기')).toBeVisible();
  });

  test('당도는 규격과 무관하게 배정된다 (random=0 → C는 12.4)', async ({ page }) => {
    await open(page, { random: 0 });
    await toResult(page, 'C');
    await expect(page.getByText('12.4')).toBeVisible();
  });

  test('다시 검사하면 선택으로 돌아가고 선택이 풀린다', async ({ page }) => {
    await open(page);
    await toResult(page);
    await page.getByRole('button', { name: '다시 검사' }).click();
    await expect(page.getByRole('button', { name: '검사할 귤을 고르세요' })).toBeDisabled();
  });

  test('판정 받기 → 1500ms 뒤 엔딩', async ({ page }) => {
    await open(page);
    await toJudging(page);
    await page.clock.runFor(1400);
    await expect(page.getByRole('heading', { name: '귤은 없습니다.' })).toHaveCount(0);
    await page.clock.runFor(200);
    await expect(page.getByRole('heading', { name: '귤은 없습니다.' })).toBeVisible();
  });

  test('축소 모션이면 800ms 뒤 엔딩', async ({ page }) => {
    await open(page, { reducedMotion: true });
    await toJudging(page);
    await page.clock.runFor(850);
    await expect(page.getByRole('heading', { name: '귤은 없습니다.' })).toBeVisible();
  });
});

test.describe('⑥ 엔딩 · 공유', () => {
  test('판정서 내용과 고지', async ({ page }) => {
    await open(page);
    await toEnding(page);
    for (const t of ['로얄 낚임과', '귤 0kg', '0원', 'C · 규격 M', '2026.11.05']) await expect(page.getByText(t)).toBeVisible();
    await expect(page.getByText(/가상의 상점입니다/)).toBeVisible();
  });

  test('Web Share: 사이트 루트를 결과 없이 공유한다', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __shared: unknown[] }).__shared = [];
      Object.defineProperty(navigator, 'share', { value: async (d: unknown) => { (window as unknown as { __shared: unknown[] }).__shared.push(d); } });
    });
    await open(page);
    await toEnding(page);
    await page.getByRole('button', { name: '친구도 검사받게 하기' }).click();
    const shared = await page.evaluate(() => (window as unknown as { __shared: { url: string; text: string }[] }).__shared);
    expect(shared).toHaveLength(1);
    expect(shared[0].url).toBe('http://localhost:3000/');
    expect(shared[0].text).not.toMatch(/낚|없습니다|판정/);
  });

  test('Web Share가 없으면 클립보드로 복사한다', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit은 clipboard-write 권한을 지원하지 않는다');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.addInitScript(() => { Object.defineProperty(navigator, 'share', { value: undefined }); });
    await open(page);
    await toEnding(page);
    await page.getByRole('button', { name: '친구도 검사받게 하기' }).click();
    await expect(page.getByRole('button', { name: '복사했어요' })).toBeVisible();
  });

  test('복사도 실패하면 링크를 직접 보여 준다', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', { value: undefined });
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('blocked')) } });
    });
    await open(page);
    await toEnding(page);
    await page.getByRole('button', { name: '링크 복사' }).click();
    await expect(page.getByRole('textbox', { name: '공유 링크' })).toHaveValue('http://localhost:3000/');
  });

  test('다시 검사하기는 선택 화면으로 간다', async ({ page }) => {
    await open(page);
    await toEnding(page);
    await page.getByRole('button', { name: '다시 검사하기' }).click();
    await expect(page.getByRole('heading', { name: '당도 검사', exact: true })).toBeVisible();
  });
});
