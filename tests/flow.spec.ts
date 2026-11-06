import { test, expect, type Page } from '@playwright/test';
import { open, toSelect, pickRow, toMeasure, tapFruit, toResult, toJudging, toEnding, sheet, notice, productCta, toSheet, toNotice } from './helpers';

const PRODUCT_H1 = { level: 1, name: '제주 서귀포 햇귤 10kg' } as const;
const ov = (page: Page) => page.evaluate(() => (history.state as { ov?: string } | null)?.ov ?? null);

test.describe('① 상품 상세', () => {
  test.beforeEach(async ({ page }) => { await open(page); });

  test('첫 진입에서는 초점을 옮기지 않는다', async ({ page }) => {
    await expect(page.getByRole('heading', PRODUCT_H1)).not.toBeFocused();
  });

  test('핵심 정보와 CTA가 첫 화면에 보인다', async ({ page }) => {
    await expect(page.getByRole('heading', PRODUCT_H1)).toBeInViewport();
    await expect(page.getByText('29,900', { exact: true })).toBeInViewport();
    await expect(page.getByText('무료배송')).toBeInViewport();
    await expect(productCta(page)).toBeInViewport();
  });

  test('동작하지 않는 UI와 생산 이력 표기가 없다', async ({ page }) => {
    await expect(page.getByRole('button', { name: /검색|장바구니|찜/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /검색|장바구니/ })).toHaveCount(0);
    await expect(page.getByText(/원산지|상품정보제공고시|수확일|생산자/)).toHaveCount(0);
    await expect(page.getByText('1 / 4')).toHaveCount(0);
  });

  test('게임을 예고하거나 가상 상점이라고 밝히는 문구가 없다(고지는 엔딩에만)', async ({ page }) => {
    await expect(page.locator('main')).not.toContainText(/당도 검사|가상|연출|판매·결제/);
  });
});

test.describe('①-1 구매 진입: 수량 시트 · 안내 모달', () => {
  test.beforeEach(async ({ page }) => { await open(page); });

  test('수량은 1박스에서 시작해 5박스까지, 총액이 함께 바뀐다', async ({ page }) => {
    await toSheet(page);
    const s = sheet(page);
    const minus = s.getByRole('button', { name: '한 박스 빼기' });
    const plus = s.getByRole('button', { name: '한 박스 더하기' });
    await expect(s.locator('output')).toHaveText('1박스');
    await expect(s.locator('.buy-total strong')).toHaveText('29,900원');
    await expect(minus).toHaveAttribute('aria-disabled', 'true');
    await expect(s.getByRole('textbox')).toHaveCount(0); // 입력 필드 없음(NFR-4)
    for (let i = 0; i < 4; i++) await plus.click();
    await expect(s.locator('output')).toHaveText('5박스');
    await expect(s.locator('.buy-total strong')).toHaveText('149,500원');
    await expect(plus).toHaveAttribute('aria-disabled', 'true');
    await plus.click({ force: true }); // 6번째는 무시
    await expect(s.locator('output')).toHaveText('5박스');
    await plus.focus();                        // 키보드: 끝값에서 눌러도 초점이 남는다(aria-disabled)
    await page.keyboard.press('Enter');
    await expect(plus).toBeFocused();
    await expect(s.locator('output')).toHaveText('5박스');
    await minus.click();
    await expect(s.locator('.buy-total strong')).toHaveText('119,600원');
  });

  const closers: [string, (page: Page) => Promise<unknown>][] = [
    ['닫기 버튼', (page) => sheet(page).getByRole('button', { name: '닫기' }).click()],
    ['ESC', (page) => page.keyboard.press('Escape')],
    ['바깥 누름', (page) => page.mouse.click(195, 40)],
    ['뒤로가기', (page) => page.goBack()],
  ];
  for (const [how, close] of closers) {
    test(`${how}로 시트를 닫으면 상품으로 돌아오고 CTA에 초점이 간다`, async ({ page }) => {
      await toSheet(page);
      expect(await ov(page)).toBe('qty');
      await close(page);
      await expect(sheet(page)).toBeHidden();
      await expect(productCta(page)).toBeFocused();
      expect(await ov(page)).toBeNull();
    });
  }

  test('모달을 닫으면 수량 시트로 돌아가고, 뒤로가기는 모달 → 시트 → 상품 순서다', async ({ page }) => {
    await toNotice(page);
    await notice(page).getByRole('button', { name: '닫기' }).click();
    await expect(notice(page)).toBeHidden();
    await expect(sheet(page)).toBeVisible();
    await expect(sheet(page).getByRole('button', { name: '구매하기' })).toBeFocused();
    expect(await ov(page)).toBe('qty');

    await sheet(page).getByRole('button', { name: '구매하기' }).click();
    await expect(notice(page)).toBeVisible();
    await page.goBack();
    await expect(notice(page)).toBeHidden();
    await expect(sheet(page)).toBeVisible();
    await page.goBack();
    await expect(sheet(page)).toBeHidden();
    await expect(page.getByRole('heading', PRODUCT_H1)).toBeVisible();
    expect(await ov(page)).toBeNull();
  });

  test('history는 열린 창 수만큼만 쌓이고, 검사를 시작하면 남지 않는다', async ({ page }) => {
    const len = () => page.evaluate(() => history.length);
    const base = await len();
    await toSheet(page);
    await page.keyboard.press('Escape');
    await toSheet(page);                     // 닫고 다시 열어도 항목은 하나
    expect(await len()).toBe(base + 1);
    await sheet(page).getByRole('button', { name: '구매하기' }).dblclick(); // 연타해도 모달 항목은 하나
    await expect(notice(page)).toBeVisible();
    await page.waitForTimeout(400);          // 두 번째 탭이 새 모달의 바깥에 떨어져도 닫히지 않는다
    await expect(notice(page)).toBeVisible();
    expect(await ov(page)).toBe('notice');
    expect(await len()).toBe(base + 2);
    await notice(page).getByRole('button', { name: '당도 검사 시작하기' }).dblclick(); // 연타해도 go(-2)는 한 번
    await expect(page.getByRole('heading', { name: '당도 검사', exact: true })).toBeVisible();
    await expect.poll(() => ov(page)).toBeNull();
    expect(page.url()).toBe('http://localhost:3000/');
    await page.goBack();                     // 게임 화면의 뒤로가기는 기존처럼 페이지 이탈(FR-13)
    expect(page.url()).not.toContain('localhost:3000');
  });

  test('수량은 검사표에서 상품으로 돌아와도 유지된다', async ({ page }) => {
    await toSheet(page);
    for (let i = 0; i < 2; i++) await sheet(page).getByRole('button', { name: '한 박스 더하기' }).click();
    await sheet(page).getByRole('button', { name: '구매하기' }).click();
    await notice(page).getByRole('button', { name: '당도 검사 시작하기' }).click();
    await page.getByRole('button', { name: '상품으로 돌아가기' }).click();
    await toSheet(page);
    await expect(sheet(page).locator('output')).toHaveText('3박스');
    await expect(sheet(page).locator('.buy-total strong')).toHaveText('89,700원');
  });

  test('안내 모달은 문구만 있고 고지·이모지가 없다', async ({ page }) => {
    await toNotice(page);
    await expect(notice(page)).toContainText('구매 전 당도 검사를 진행하고 있습니다.');
    await expect(notice(page)).toContainText('검사는 약 10초 정도 소요됩니다.');
    await expect(notice(page)).not.toContainText(/가상|연출|판매·결제/);
    expect(await notice(page).textContent()).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  test('모바일은 아래에 붙은 시트, 431px 이상은 가운데 모달', async ({ page }) => {
    await toSheet(page);
    const vp = page.viewportSize()!;
    let box = (await sheet(page).boundingBox())!;
    expect(Math.round(box.y + box.height)).toBe(vp.height);
    expect(box.width).toBe(vp.width);
    await page.keyboard.press('Escape');
    await page.setViewportSize({ width: 1024, height: 800 });
    await toSheet(page);
    box = (await sheet(page).boundingBox())!;
    expect(box.width).toBe(400);
    expect(Math.abs(box.x + box.width / 2 - 512)).toBeLessThan(2);
    expect(Math.abs(box.y + box.height / 2 - 400)).toBeLessThan(2);
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

  test('규격 설명과 오늘 날짜가 있고, 고지 문구는 없다', async ({ page }) => {
    await expect(page.getByText('규격(2S·S·M)은 크기 등급입니다.')).toBeVisible();
    await expect(page.getByText('2026.11.05')).toBeVisible();
    await expect(page.locator('main')).not.toContainText(/가상|연출|판매·결제/);
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
    await expect(page.locator('main')).not.toContainText(/가상|연출/);
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

  test('다시 검사하면 당도를 새로 배정한다', async ({ page }) => {
    await open(page);
    await toResult(page, 'C'); // C = 15.8
    await page.evaluate(() => { Math.random = () => 0; }); // assignBrix(()=>0) → C 12.4
    await page.getByRole('button', { name: '다시 검사' }).click();
    await pickRow(page, 'C').click();
    await page.getByRole('button', { name: 'C 시료 검사 시작' }).click();
    await tapFruit(page, 5);
    await page.clock.runFor(500);
    await expect(page.getByRole('heading', { name: '검사 결과' })).toBeVisible();
    await expect(page.getByText('12.4')).toBeVisible();
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
    const cert = page.locator('.cert');
    for (const t of ['C · 규격 M', '15.8 °Bx', '로얄 낚임과', '1박스 (29,900원)', '귤 0kg · 0원']) await expect(cert).toContainText(t);
    await expect(page.getByText('2026.11.05')).toBeVisible();
    await expect(cert.getByText('귤은 없었지만, 고객님의 믿음은 진품으로 판정합니다.')).toBeVisible(); // random 0.999 → 로얄, 3번째 줄
    await expect(cert.getByText(/한 박스로 신중하게 시작하셨습니다/)).toBeVisible();                   // 기본 1박스
    await expect(page.locator('.e-head p:not(.e-no)')).toContainText('낚일 준비가 얼마나 되어 있는지였습니다.');     // 1회차: 반전 설명
    await expect(page.locator('.disc')).toHaveText('사실 귤상회는 가상의 쇼핑몰입니다.구매 과정은 게임을 위한 연출이며,실제 주문이나 결제는 이루어지지 않았습니다.');
  });

  test('주문 접수·결제 완료 연출이 어디에도 없다(D5)', async ({ page }) => {
    await open(page);
    await toEnding(page);
    await expect(page.locator('body')).not.toContainText(/주문 완료|주문이 접수|주문 접수|결제 완료|결제가 완료|배송지/);
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
    expect(shared[0].text).not.toMatch(/낚|없습니다|판정|당도|검사/);
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

  test('엔딩에서 다시 검사하면 당도를 새로 배정한다', async ({ page }) => {
    await open(page);
    await toEnding(page);
    await page.evaluate(() => { Math.random = () => 0; });
    await page.getByRole('button', { name: '다시 검사하기' }).click();
    await pickRow(page, 'C').click();
    await page.getByRole('button', { name: 'C 시료 검사 시작' }).click();
    await tapFruit(page, 5);
    await page.clock.runFor(500);
    await expect(page.getByRole('heading', { name: '검사 결과' })).toBeVisible();
    await expect(page.getByText('12.4')).toBeVisible();
  });
});

test.describe('⑥-1 판정 다양화(T21)', () => {
  const finishRound = async (page: Page, fruit = 'C') => {
    await pickRow(page, fruit as 'A' | 'B' | 'C').click();
    await page.getByRole('button', { name: `${fruit} 시료 검사 시작` }).click();
    await tapFruit(page, 5);
    await page.clock.runFor(500);
    await page.getByRole('button', { name: '최종 판정 받기' }).click();
    await page.clock.runFor(1600);
    await expect(page.getByRole('heading', { name: '귤은 없습니다.' })).toBeVisible();
  };
  const explain = (page: Page) => page.locator('.e-head p:not(.e-no)');

  test('한 줄 판정은 판정 확정 때 한 번 정하고, 다시 그려져도 바뀌지 않는다', async ({ page }) => {
    await open(page);
    await toEnding(page);
    const line = page.locator('.cert .note').first();
    await expect(line).toHaveText('귤은 없었지만, 고객님의 믿음은 진품으로 판정합니다.');
    await page.evaluate(() => { Math.random = () => 0; });          // 이후 난수가 바뀌어도
    await page.getByRole('button', { name: '링크 복사' }).click();  // 상태가 바뀌어 다시 그려진다
    await expect(line).toHaveText('귤은 없었지만, 고객님의 믿음은 진품으로 판정합니다.');
  });

  test('수량은 두 번째 축: 5박스면 금액과 대량 구매 소견, 등급은 당도 그대로', async ({ page }) => {
    await open(page);
    await toSheet(page);
    for (let i = 0; i < 4; i++) await sheet(page).getByRole('button', { name: '한 박스 더하기' }).click();
    await sheet(page).getByRole('button', { name: '구매하기' }).click();
    await notice(page).getByRole('button', { name: '당도 검사 시작하기' }).click();
    await finishRound(page);
    const cert = page.locator('.cert');
    await expect(cert).toContainText('5박스 (149,500원)');
    await expect(cert.getByText(/대량 구매 의향이 확인되었습니다/)).toBeVisible();
    await expect(cert).toContainText('로얄 낚임과');
  });

  test('재검사 회차: 1회차 반전 설명 → 2회차 → 3회차 → 4회차 이상 공통 문구', async ({ page }) => {
    await open(page);
    await toEnding(page);
    await expect(explain(page)).toContainText('낚일 준비가 얼마나 되어 있는지였습니다.');
    const expected = ['두 번째 검사입니다.', '세 번째 검사입니다.', '꾸준히 검사해 주셔서 감사합니다.', '꾸준히 검사해 주셔서 감사합니다.'];
    for (const t of expected) {
      await page.getByRole('button', { name: '다시 검사하기' }).click();
      await finishRound(page);
      await expect(explain(page)).toContainText(t);
    }
  });

  test('같은 판 안에서 화면을 오가도 회차는 늘지 않는다', async ({ page }) => {
    await open(page);
    await toMeasure(page, 'C');
    await page.getByRole('button', { name: '귤 다시 고르기' }).click();
    await finishRound(page);
    await expect(explain(page)).toContainText('낚일 준비가 얼마나 되어 있는지였습니다.');
  });

  test('상품까지 돌아가 새로 시작하면 새 판(2회차)이다', async ({ page }) => {
    await open(page);
    await toSelect(page);
    await page.getByRole('button', { name: '상품으로 돌아가기' }).click();
    await toSelect(page);
    await finishRound(page);
    await expect(explain(page)).toContainText('두 번째 검사입니다.');
  });

  test('새로고침하면 회차가 처음으로 돌아간다(저장하지 않음)', async ({ page }) => {
    await open(page);
    await toEnding(page);
    await page.getByRole('button', { name: '다시 검사하기' }).click();
    await finishRound(page);
    await expect(explain(page)).toContainText('두 번째 검사입니다.');
    await page.reload();
    await toEnding(page);
    await expect(explain(page)).toContainText('낚일 준비가 얼마나 되어 있는지였습니다.');
    expect(await page.evaluate(() => [document.cookie, localStorage.length, sessionStorage.length])).toEqual(['', 0, 0]);
  });
});
