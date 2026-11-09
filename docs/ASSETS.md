# 이미지 출처와 사용처

확인일 2026-11-06. 사진은 모두 Unsplash 무료 사진이고, **게임용 상품 연출 이미지**로 쓴다. 특정 농가·산지에서 수확한 실제 판매 상품의 사진이 아니며 그렇게 주장하지 않는다. 사진 결정은 2026-11-06 사용자 결정(PROJECT 결정 기록, AUDIT P1·T20)으로 확정했다.

| 파일 | Unsplash 페이지 | 촬영자 | 라이선스 | 처리 | 앱 내 사용처 | 상태 |
|---|---|---|---|---|---|---|
| `assets/images/hero.jpg` | https://unsplash.com/photos/uiPaZkzjv64 (`photo-1482012792084`) | Jonathan Pielmayer (@jonathanpielmayer) | Unsplash License (무료, Unsplash+ 아님. 사진 페이지에서 '무료 다운로드' 확인) | 3000×2000 원본을 **좌우 반전** → 반전 프레임의 x 400·y 0에서 2000×2000 크롭 → 1600px → 밝기 +15%·채도 +3%(선명도 보정 없음) → JPEG 품질 82(mozjpeg) | ① 상품 대표 사진 | 확정 (T20) |
| `assets/images/fruit-a.jpg` | https://unsplash.com/photos/fM5acvI_yNE | insung yoon (@insungpandora) | Unsplash License (무료, Unsplash+ 아님) | `rect=813,1135,645,645` 크롭, 600px | ② 시료 A (초록빛) | 확정 (이전 대표 사진에서 자른 시료를 그대로 유지) |
| `assets/images/fruit-b.jpg` | 위와 같은 사진 | insung yoon | 위와 같음 | `rect=1337,1062,645,645` 크롭, 600px | ② 시료 B (노랑) | 확정 (유지) |
| `assets/images/fruit-c.jpg` | 위와 같은 사진 | insung yoon | 위와 같음 | `rect=2271,1680,645,645` 크롭, 600px | ② 시료 C (주황) | 확정 (유지) |
| `assets/images/story.jpg` | https://unsplash.com/photos/0ImoqAuQL_U | Luis Guaman (@luisgc1028) | Unsplash License (무료, Unsplash+ 아님) | 1200x900 크롭, 품질 80 | ① 브랜드 스토리 사진 | 확정 (유지) |
| `assets/images/orchard.jpg` | https://unsplash.com/photos/QJII95HD_Lk | Hoyoung Choi (@colly) | Unsplash License (무료, Unsplash+ 아님. 2026-11-09 사진 페이지에서 확인) | Unsplash CDN 1200×900 크롭 → JPEG 품질 82 | ① 상품 설명 아래 | 확정 (T22) |
| `assets/images/pile.jpg` | https://unsplash.com/photos/O-wmENtU8fc | Jason Leung | 위와 같음 | Unsplash CDN 1200×900 크롭, 품질 80 | ① 크기 안내 아래 | 확정 (T22) |
| `assets/images/peeled.jpg` | https://unsplash.com/photos/JTUL22JUi9o | Mila | 위와 같음 | Unsplash CDN 1600×1200 아래 기준 크롭 → x 200·y 233에서 1289×967 크롭(위쪽 사과·접시 제외) → 1200×900 → JPEG 품질 80 | ① 보관 안내 아래 | 확정 (T22) |
| `scripts/og/og-bg.jpg` | hero와 같은 사진 | Jonathan Pielmayer | 위와 같음 | 좌우 반전 프레임 전체 폭, y 425부터 3000×1575 크롭 → 1200×630 → hero와 같은 보정 → JPEG 품질 85 | OG 합성 배경(빌드에 포함되지 않음) | 확정 (T20) |
| `public/og.jpg` | `scripts/og/og.html`로 합성: `og-bg.jpg` 배경 + HTML/CSS 선별 태그(가운데 630px 안, 깐 귤과 겹치지 않게 왼쪽) | Jonathan Pielmayer | 위와 같음. 글꼴 Pretendard(npm `pretendard` 1.3.9)·Hahmlet(Google Fonts) 모두 SIL OFL 1.1 | 1200×630 JPEG, 약 102KB | 링크 미리보기 이미지(`og:image`) | 확정 (T20) |

- 앱 웹폰트: Pretendard(OFL 1.1, npm에서 자체 호스팅), Hahmlet(OFL 1.1 (Google Fonts 표기), next/font로 자체 호스팅).
- 촬영지: 대표 사진은 촬영지 정보가 없다. 시료 A·B·C 사진(이전 대표 사진)은 군산시에서 찍은 것이다. 상품명의 "제주 서귀포"는 콘셉트 문구일 뿐이다 (PROJECT §5).
- 편집 범위: 크롭·좌우 반전·노출(밝기)·약한 채도·압축만 한다. 합성(OG 태그 제외)·부분 리터칭·AI 생성은 하지 않는다(DESIGN §7).
- 허용: 상업·비상업 모두 무료로 내려받아 복사·수정·사용 가능, 허락과 출처 표기 불필요(표기는 권장하며 상품 푸터에 적는다: Jonathan Pielmayer, insung yoon, Luis Guaman, Hoyoung Choi, Jason Leung, Mila).
- 금지: 의미 있는 수정 없이 사진 자체를 파는 것, Unsplash 사진을 모아 비슷한 경쟁 서비스를 만드는 것.
- 원본 재현: `assets/images/hero.jpg`와 `scripts/og/og-bg.jpg`는 위 '처리' 순서대로 sharp(Next.js 의존성)로 만들었다. sharp는 한 파이프라인 안에서 extract를 flop보다 먼저 하므로, 반전을 먼저 무손실(raw)로 끝낸 뒤 자른다(AUDIT T20).
- 검토했지만 쓰지 않은 후보(T20): Pexels 2986(Breakingpic, 무료, 밝은 나무·따뜻한 조명이라 톤이 다름), Pexels 20650065(Yuan Cao, 무료, 흰 접시·크림 천이라 DESIGN §7·§9.1과 충돌).
