# 슬라이드 부품 사전과 함정

`template.html`에 이미 정의되어 있는 것들. 새로 만들지 말고 이걸 조합한다.

## 부품 사전

| 부품 | 쓰는 법 | 용도 |
|---|---|---|
| 슬라이드 | `<section class="slide">` | 한 장 |
| 표지 / 마무리 | `<section class="slide cover">` / `.closing` | 가운데 정렬 |
| 머리말 | `<header>` 안에 `.num`, `h2`, `.sub`, `<hr>` | 번호 + 제목 + 부제 |
| 제목 영문 병기 | `<h2>해결책 <span class="en">Solution</span></h2>` | 한글 제목 옆 회색 영문 |
| 발표자 노트 | `<aside class="notes">` | PPTX 노트로 변환 |
| 본문 영역 | `<div class="body">` | 머리말 아래 세로 가운데 정렬 |
| 카드 격자 | `<div class="grid cols-2\|cols-3\|cols-4">` | 2·3·4열 배치 |
| 카드 | `<div class="card accent-1">` | `accent-1`~`accent-5`로 상단 색 라인 |
| 강조 패널 | `<div class="panel">` / `.panel.ok` / `.panel.info` | 문제 정의, 핵심 아이디어 |
| 패널 헤드라인 | `<div class="headline">` (`<em>`로 색 강조) | 큰 한 문장 |
| 패널 항목 | `<ul class="lines">` | 패널 안 불릿 |
| 배지 | `<span class="pill">` / `.pill.warn` / `.pill.ok` | Pain Point, Key Idea 라벨 |
| 단계 목록 | `<ol class="steps">` + `<span class="n">1</span>` | 사용자 흐름 |
| 로드맵 | `<div class="timeline">` + `.phase` (`.when`, `h3`, `ul`) | 3단계 타임라인 |
| 좌우 분할 | `<div class="split">` / `.split.wide-right` | 설명 \| 스크린샷 |
| 그림 한 장 | `<div class="figure">` + `.caption` | 아키텍처·다이어그램 |
| 체크 항목 | `<li class="check">` | ✓ 불릿 |
| 자리표시자 | `<div class="placeholder">` | 이미지 넣기 전 점선 박스 |

## 색 바꾸기

파일 맨 위 `:root`의 값만 고치면 전체에 반영된다.

```css
--bg: #0d1020;    /* 배경 */
--a1: #6c7cff;    /* 파랑-보라 */
--a2: #22d3ee;    /* 청록 */
--a3: #f472b6;    /* 핑크 */
--a4: #4ade80;    /* 초록 */
--a5: #fbbf24;    /* 노랑 */
```

## 함정

### ① 내용이 슬라이드 밖으로 잘린다 — 가장 흔함

슬라이드는 1280×720 고정이라 넘치면 **에러도 경고도 없이 조용히 사라진다.**
→ 브라우저에서 눈으로 확인하거나 PNG를 뽑아 확인한다. 줄이기보다 슬라이드를 한 장 더 만든다.

### ② `<div style="display:flex">`로 직접 2단을 만들지 말 것

이미 있는 `.split` / `.grid`를 쓴다. 직접 만든 flex 레이아웃은 브라우저에서는 멀쩡해 보여도 캡처 단계에서 어긋날 수 있다.

### ③ 이미지가 안 나온다

경로는 **슬라이드 HTML 기준**이다. 같은 폴더의 `images/foo.png`가 맞고, 프로젝트 루트 기준 경로는 틀리다.

### ④ `export.py`에 `--virtual-time-budget` 플래그를 추가하지 말 것

이 플래그를 넣으면 브라우저가 캡처 후 종료되지 않고 **무한정 멈춘다.** 실제로 겪은 문제이며 스크립트 안에 경고 주석으로 남겨두었다.

### ⑤ 슬라이드 수가 안 맞다고 나온다

`<section class="slide">`와 `</section>`의 짝이 맞는지 확인한다.
주석(`<!-- -->`) 안에 예시로 적어둔 태그는 무시되도록 처리되어 있으니 그건 문제가 아니다.

## 문제 해결

| 증상 | 해결 |
|---|---|
| `Chrome/Edge/Chromium을 찾지 못했습니다` | Chrome 설치, 또는 `CHROME_PATH` 환경변수로 경로 지정 |
| `No module named 'pptx'` | `python3 -m pip install python-pptx Pillow` |
| 캡처가 90초를 넘겨 중단됨 | 다른 브라우저 창을 모두 닫고 다시 실행 |
| PPTX에서 글자 수정이 안 됨 | 정상이다 (이미지 방식) → HTML을 고쳐 다시 내보낸다 |
| 브라우저에서 슬라이드가 작게 보임 | 정상이다. 창 크기에 맞춰 자동 축소되며 내보내기는 항상 원본 해상도로 나간다 |
| 발표자 노트가 하나만 이상하게 길다 | 해당 슬라이드의 `<aside class="notes">` 닫는 태그가 빠졌는지 확인 |

## 발표 전 최종 점검

- [ ] 브라우저로 처음부터 끝까지 넘겨보며 잘린 글자가 없는지 확인
- [ ] 스크린샷이 전부 실제 이미지로 교체되었는지 (점선 박스가 남아있지 않은지)
- [ ] 표지의 팀명·발표자 이름을 실제 값으로 수정했는지
- [ ] 기획안에 있는 수치·용어와 발표자료가 어긋나지 않는지
- [ ] PPTX를 열어 발표자 노트가 들어갔는지 확인
- [ ] PDF를 별도로 뽑아 백업 (발표장 PC에서 PPTX가 안 열릴 때 대비)
- [ ] 예상 질문 3개 준비 — 기존 지도앱과의 차이 / 오디오 콘텐츠 제작 주체 / 수익 발생 시점
