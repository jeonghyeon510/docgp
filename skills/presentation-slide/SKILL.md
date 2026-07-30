---
name: presentation-slide
description: >-
  Use this skill when the user wants to create, edit, review, or export a
  presentation deck. Covers starting from the bundled template.html, writing
  HTML slides with the built-in component set, inserting screenshots, and
  exporting to PPTX and PDF with the bundled export.py. Trigger on requests
  like "발표자료 만들어줘", "슬라이드 추가해줘", "PPT로 내보내줘",
  "PDF로 뽑아줘", "발표자료 검토해줘".
---

# 발표자료 제작

HTML 파일 하나를 원본으로 삼아 슬라이드를 만들고, `PPTX`와 `PDF`로 내보낸다.

```
        슬라이드.html   ← 고치는 곳은 언제나 여기 하나뿐
              │  export.py
        ┌─────┴─────┐
        ▼           ▼
      .pptx       .pdf
```

**필요한 것은 이 스킬 폴더가 전부 들고 있다.** 프로젝트에 별도 준비가 없어도 동작한다.

| 파일 | 역할 |
|---|---|
| `template.html` | 빈 발표자료 서식 — 여기서 복사해 시작한다 |
| `export.py` | HTML → PPTX + PDF 변환 |
| `references/slide-parts.md` | 쓸 수 있는 부품 사전과 함정 |

**PPTX를 직접 수정하지 않는다.** 내보낸 PPTX는 슬라이드마다 이미지 한 장이라 글자 수정이 불가능하고,
수정해봐야 다음 내보내기에서 사라진다. 고칠 것은 항상 HTML에서 고친다.

## 시작하기

작업 중인 발표자료가 이미 있으면 그걸 계속 쓴다. 없으면 서식을 복사한다.

```bash
mkdir -p slide
cp .agents/skills/presentation-slide/template.html slide/slide.html
```

두는 위치는 자유지만, 폴더 하나에 슬라이드와 이미지를 같이 두면 정리된다.
서식에는 표지 한 장과 내용 슬라이드 한 장이 예시로 들어 있다.

## 절차

### 1. 내용 점검 — 고치기 전에 목록부터

근거가 되는 문서(기획안·보고서·요구사항)나 실제 결과물이 있으면 **같이 읽고,
어긋난 지점을 먼저 보고한다.** 바로 파일을 고치지 않는다.

보고할 것 두 가지:
- 근거 문서에 있는데 발표자료에 빠진 내용
- 발표자료에 있는데 실제와 다른 내용

발표 중 질문을 받고 막히는 것을 막기 위한 단계이므로 생략하지 않는다.
근거 문서가 없으면 이 단계는 건너뛰고 사용자에게 무엇을 담을지 묻는다.

### 2. 슬라이드 수정

사용자가 반영할 항목을 고른 뒤에 HTML을 수정한다. 작성 규칙:

- 슬라이드 한 장 = `<section class="slide">` 하나. **기존 슬라이드를 복사해서 고치는 방식**으로 만든다
- 발표자 노트는 슬라이드 안 `<aside class="notes">...</aside>` — PPTX 노트로 자동 변환된다
- **새 CSS 클래스를 만들지 않는다.** 이미 있는 부품만 조합한다 → [부품 사전과 함정](./references/slide-parts.md)
- 한 슬라이드에 카드 4개 이하, 카드 안 설명은 두 줄 이내
- 슬라이드 크기는 **1280×720 고정**이다. 내용이 넘치면 경고 없이 잘리므로,
  줄이기보다 **슬라이드를 한 장 더 만든다**

### 3. 이미지 넣기

이미지는 **슬라이드 HTML과 같은 폴더 안**에 두고 상대경로로 건다.

```html
<img src="images/화면.png" alt="설명">
```

웹 화면을 캡처해야 한다면 `file://`은 브라우저가 막는 경우가 있으니 로컬 서버로 띄운 뒤 찍는다.

```bash
python3 -m http.server 8777    # 다른 터미널에서 실행해 두고
                               # http://127.0.0.1:8777/... 접속
```

지켜야 할 것 두 가지. 어기면 **내 컴퓨터에서는 멀쩡한데 다른 컴퓨터에서만 그림이 사라진다.**

- **파일명은 소문자와 하이픈만.** macOS·윈도우는 대소문자를 가리지 않아 `Foo.PNG`라고 적어도
  여기서는 보이지만, 다른 환경에서는 깨진다
- **상대경로만.** `images/foo.png`가 맞고, 절대경로(`C:\...`, `/Users/...`)나
  역슬래시(`images\foo.png`)는 전부 틀리다

`export.py`가 내보내기 전에 이 항목들을 검사해서 문제가 있으면 멈춘다.

### 4. 내보내기

```bash
python3 .agents/skills/presentation-slide/export.py slide/slide.html
```

`.pptx`와 `.pdf`가 **HTML과 같은 폴더에** 생긴다. 9장 기준 10~30초.

| 옵션 | 결과 |
|---|---|
| (없음) | PPTX + PDF 둘 다 |
| `--only pdf` | PDF만 |
| `--only png --keep-png` | 슬라이드별 PNG |
| `-o 이름` | 출력 파일명 지정 (확장자 제외) |
| `--scale 1` | 저해상도·빠르게 (초안 확인용) |
| `--skip-image-check` | 이미지 점검 건너뛰기 (문제를 알면서 진행할 때만) |

윈도우에서는 `python3` 대신 `python`을 쓴다. 그 외에는 두 OS가 같다.
추가 설치는 필요 없다. 브라우저와 `python-pptx`·`Pillow`만 있으면 동작한다.

## 검증

내보낸 뒤 반드시 확인한다.

- 실행 로그의 슬라이드 수가 실제 `<section class="slide">` 개수와 같은가
- 발표자 노트 개수가 슬라이드 수와 맞는가
- `--only png --keep-png`로 PNG를 뽑아 **글자가 잘리거나 이미지가 빈 슬라이드가 없는지 눈으로 확인**한다
  (둘 다 에러 없이 조용히 넘어간다)
- 점선 박스(`.placeholder`)가 남아 있지 않은가 — 남아 있으면 내보낼 때 경고가 뜬다

문제가 생기면 [부품 사전과 함정](./references/slide-parts.md)의 문제 해결 표를 참고한다.
