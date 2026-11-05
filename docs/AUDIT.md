# 결함 기록 (AUDIT)

기준 이미지(Task 10) 전 보정과 알려진 차단 항목을 기록한다. Task 11이 이어서 추가한다.
스크린샷은 `docs/audit/`에 있다. 비교 이미지는 왼쪽부터 보정 전, 보정 후, v2 시안.

| ID | 화면 | 내용 | 원인 | 조치 | 근거(스크린샷) | 상태 |
|----|------|------|------|------|----------------|------|
| C1 | ② 선택, ④ 결과 | 검사표 A/B/C 이후 열이 v2보다 13px 오른쪽 (게이지 중심 x 109 → v2 96, 규격 x 164 → v2 151, 두 폭 모두 동일) | v2는 `box-sizing:border-box`로 글자 열 40px 안에 13px 패딩이 포함됨. 구현은 grid 전체에 13px 패딩을 주고 첫 트랙도 40px | `app/globals.css`의 `.sheet-row` 두 규칙에서 첫 트랙 40px → 27px. 보정 후 게이지 중심 96, 규격 151로 v2와 일치 | [select 390](audit/c1-select-390-compare.png) · [select 360](audit/c1-select-360-compare.png) · [result 390](audit/c1-result-390-compare.png) · [result 360](audit/c1-result-360-compare.png) | 해결 |
| C2 | ② 선택 → ① 상품 | 뒤로 가면 초점이 `<body>`에 남음 (DESIGN §10 위반) | 상품 `<h1>`이 서버 컴포넌트라 ref가 없고, 초점 효과가 상품 화면을 건너뜀 | `<h1 id="product-title" tabIndex={-1}>`, `Game.tsx`에서 이전 화면 ref와 비교해 첫 진입과 StrictMode 재실행에서는 아무것도 하지 않고, 상품 복귀 시 제목에 초점(StrictMode 안전). 테스트 추가(flow ②) | 화면 변화 없음 (테스트로 확인) | 해결 |
| C3 | ⑥ 엔딩 | 링크 복사 성공이 화면 낭독기에 전달되지 않음 | 버튼 글자만 바뀌고 live region 없음 | 버튼 줄 뒤에 `<p className="sr-only" role="status">` 추가 | 화면 변화 없음 | 해결 |
| B1 | ① 첫 로드 | 첫 로드 JS 146,283B(gzip) > NFR-1 130KB(133,120B) | 프레임워크 하한 약 124KB(react-dom 71.5 + next 48.2 + turbopack 3.9) + 앱 약 22KB. 39KB core-js 폴리필은 nomodule이라 최신 브라우저는 받지 않음 | 테스트 유지(실패). 기준 조정 여부는 사용자 결정 | — | 차단(G5) |
| W1 | 전체 | WebKit 프로젝트 실행 불가 (호스트 DLL icuuc77) | 환경 | 로컬은 chromium m390/m360만, 실기기 iOS로 대체 검증 예정 | — | 차단 아님(보류) |
