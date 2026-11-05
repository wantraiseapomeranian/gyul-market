import { test, expect } from '@playwright/test';
import { open, toSelect, pickRow } from './helpers';

test.describe('① 상품 상세', () => {
  test.beforeEach(async ({ page }) => { await open(page); });

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

  test('뒤로 가면 상품으로 돌아가고 선택이 풀린다', async ({ page }) => {
    await pickRow(page, 'A').click();
    await page.getByRole('button', { name: '상품으로 돌아가기' }).click();
    await expect(page.getByRole('heading', { level: 1, name: '제주 서귀포 햇귤 10kg' })).toBeVisible();
    await toSelect(page);
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(0);
  });
});
