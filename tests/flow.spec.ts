import { test, expect } from '@playwright/test';
import { open } from './helpers';

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
