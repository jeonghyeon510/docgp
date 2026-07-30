---
name: antigravity-setup
description: >-
  Use this skill when the user asks how to configure Antigravity IDE itself —
  writing project rules in GEMINI.md, terminal execution permissions and
  allow/deny lists, file access outside the project folder, installing
  extensions from Open VSX, registering MCP servers, or lifecycle hooks.
  Trigger on requests like "안티그래비티 설정", "규칙 파일 만들어줘",
  "GEMINI.md 만들어줘", "확장 설치가 안 돼", "MCP 붙이고 싶어",
  "MCP 어떻게 설치해", "명령 실행할 때마다 물어봐".
---

# Antigravity 설정

에이전트가 어떻게 동작할지 정하는 설정들. 실제로 쓰게 되는 것만 정리했다.

**자주 쓰는 단축키**

| 단축키 | 기능 |
|---|---|
| `Cmd/Ctrl + L` | 에이전트 채팅 |
| `Cmd/Ctrl + E` | 에디터 ↔ 에이전트 매니저 전환 |
| `Cmd/Ctrl + ,` | 설정 |
| `Cmd/Ctrl + Shift + X` | 확장 |
| ``Ctrl + ` `` | 터미널 |

## 1. 설정이 저장되는 곳

전역 설정은 홈 폴더의 **`~/.gemini/config/`** 에 모인다. (Windows는 `C:\Users\<이름>\.gemini\config\`)

```
~/.gemini/config/
  config.json          앱이 관리하는 설정 — 직접 고치지 말고 설정 화면에서 바꿀 것
  mcp_config.json      MCP 서버 등록
  hooks.json           훅 (고급)
  skills/<이름>/SKILL.md
  plugins/<이름>/plugin.json
```

프로젝트 단위로 두려면 프로젝트 루트에 **`.agents/`** 폴더를 만들어 같은 파일들을 넣는다.

```
.agents/
  mcp_config.json      MCP 서버 등록 — 이 프로젝트에서만
  skills/<이름>/SKILL.md
  hooks.json
```

**이쪽을 권한다.** 폴더를 통째로 넘기면 설정이 같이 따라가서, 받는 사람이 아무것도 등록하지 않아도 된다.
git으로 팀원과 공유할 수도 있다. (이 프로젝트가 그렇게 되어 있다)

**우선순위** — 같은 이름이 겹치면 위쪽이 이긴다.

```
1. 프로젝트의 .agents/     ← 가장 강함
2. 전역 ~/.gemini/config/
3. Antigravity 내장 설정
```

## 2. 프로젝트 규칙 — `GEMINI.md` 만들기

에이전트가 **항상 지켜야 할 규칙**을 적어두는 파일. 프로젝트 루트에 만든다.
같은 지시를 대화마다 반복해서 쓰고 있다면 이 파일에 넣을 때다.

**새로 만들 때는 `GEMINI.md`로 만든다.**

`AGENTS.md`라는 이름도 똑같이 인식되지만, **두 개를 같이 두지 않는다.**
둘 다 읽혀서 규칙이 양쪽으로 갈라지고, 나중에 어느 파일을 고쳐야 할지 알 수 없게 된다.
이미 `AGENTS.md` 하나만 쓰고 있다면 그대로 두면 된다. 굳이 바꿀 필요 없다.

### 만드는 법

에이전트에게 부탁하는 게 가장 쉽다. 프로젝트를 읽고 알아서 채워준다.

```
이 프로젝트 규칙을 GEMINI.md로 만들어줘
```

직접 만든다면 이 뼈대에서 시작한다. 별도 형식이나 머리말은 필요 없다.

```markdown
# 프로젝트 규칙

## 응답 언어
항상 한글로 답한다.

## 코드 스타일
- 들여쓰기는 스페이스 2칸
- 새 라이브러리를 추가하기 전에 먼저 물어본다

## 작업 방식
- 파일을 덮어쓰기 전에 반드시 먼저 읽는다
- 커밋은 요청받았을 때만 한다
```

### 적용 범위

- 그 폴더와 **하위 폴더 전체**에 자동 적용된다
- 하위 폴더에 또 만들면 둘 다 적용된다 (덮어쓰지 않고 합쳐진다)
- 같은 규칙이 여러 경로로 발견되어도 한 번만 적용된다

## 3. 터미널 실행 권한

에이전트가 터미널 명령을 실행할 때 확인을 받을지 정한다.

**위치**: `설정(Cmd/Ctrl + ,)` → **Agent** → **Terminal Execution Policy**

| 옵션 | 동작 | 언제 |
|---|---|---|
| `Request Review` | 명령마다 확인받음 (**Allow List**만 예외) | **처음엔 이걸 권장** |
| `Always Proceed` (Turbo) | 확인 없이 자동 실행 (**Deny List**만 차단) | 익숙해진 뒤 |

같은 화면에서 **Add** 버튼으로 명령어를 하나씩 등록한다.

- **Allow List** — 물어보지 말고 실행해도 되는 것: `ls`, `pwd`, `git status`, `git diff`, `npm test` 등
- **Deny List** — 절대 자동 실행하면 안 되는 것

### ⚠️ `Always Proceed`를 켤 거라면 Deny List부터 채울 것

이 모드에서는 **Deny List가 유일한 안전장치**다. 비어 있으면 무엇이든 확인 없이 실행된다.

```
rm
rm -rf
sudo
git push --force
git push -f
git reset --hard
shutdown
dd
mkfs
```

Windows를 쓴다면 `del`, `Remove-Item`, `format`도 추가한다.

## 4. 프로젝트 밖 파일 접근

Antigravity는 기본적으로 **현재 프로젝트 폴더 밖의 파일을 읽지 못하게 막는다.**
파일이 분명히 있는데 "찾을 수 없다"고 하면 대부분 이 설정 때문이다.

**위치**: `설정` → **Agent** → **Agent Non-Workspace File Access**

가장 간단한 해결은 **필요한 파일을 프로젝트 폴더 안으로 옮기는 것**이다.
꼭 밖에 있어야 한다면 설정을 풀되, 에이전트가 홈 폴더 전체를 보게 되니 주의한다.

## 5. 확장 설치

Antigravity는 **Open VSX**를 확장 저장소로 쓴다. VS Code 마켓플레이스와 목록이 조금 다르다.

1. `Cmd/Ctrl + Shift + X` → 검색 → **Install**
2. 검색해도 안 나오면:
   - <https://open-vsx.org> 에서 **`.vsix` 파일 다운로드**
   - 확장 패널 우측 상단 **⋯ → Install from VSIX...**

## 6. MCP 서버 등록

MCP는 에이전트에게 **바깥 도구를 붙여주는 방법**이다.

확장처럼 검색해서 설치하는 **마켓플레이스는 없다.** Antigravity가 스스로 찾아 설치하지도 않는다.
쓸 서버를 정해서 `mcp_config.json`에 적어주는 방식뿐이다. 대신 대부분 별도 설치가 필요 없다 —
`npx`가 실행 시점에 알아서 받아온다. Node.js만 있으면 된다.

### 어디에 적느냐가 중요하다

| 위치 | 적용 범위 | 남에게 넘길 때 |
|---|---|---|
| `.agents/mcp_config.json` (프로젝트) | 이 프로젝트를 열었을 때만 | **폴더째 주면 같이 간다** |
| `~/.gemini/config/mcp_config.json` (전역) | 내 모든 프로젝트 | 안 간다. 각자 등록해야 한다 |

팀원이나 학생에게 나눠줄 거라면 **프로젝트 쪽에 둔다.** 받는 사람이 설정 파일을 건드릴 필요가 없어진다.
이 프로젝트가 그렇게 되어 있다.

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

- `playwright` — 브라우저를 열고 클릭·입력·스크린샷

### 두 가지 연결 방식

| 방식 | 쓰는 곳 | 필드 |
|---|---|---|
| **stdio** | 내 컴퓨터에서 프로그램을 띄워 씀 | `command` (필수) · `args` · `env` |
| **SSE** | 이미 떠 있는 원격 서버에 붙음 | `serverUrl` (필수) |

```json
"내-원격서버": { "serverUrl": "https://mcp.example.com/sse" }
```

API 키가 필요하면 `"env": { "API_KEY": "값" }`을 넣는다.

### 등록한 뒤

**Antigravity를 재시작**해야 적용된다.
제대로 붙었는지는 `...`(Additional Options) → **MCP Servers**에서 확인한다.
여기에 서버와 그 도구 목록이 보이면 성공이다.

## 7. 훅 (고급, 선택)

특정 시점에 스크립트를 자동 실행한다. 예: 파일 수정 때마다 린터 실행.
`~/.gemini/config/hooks.json` 또는 프로젝트의 `.agents/hooks.json`.

```json
{
  "lint-checker": {
    "PostToolUse": [
      {
        "matcher": "run_command",
        "hooks": [
          { "type": "command", "command": "./scripts/lint.sh", "timeout": 10 }
        ]
      }
    ]
  }
}
```

`PreToolUse`(도구 실행 전) / `PostToolUse`(후) / `PreInvocation`(대화 시작 전)를 쓸 수 있고,
`"enabled": false`로 잠시 꺼둘 수 있다. 처음엔 안 써도 된다.

## 8. 잘 안 될 때

| 증상 | 확인할 것 |
|---|---|
| 에이전트가 파일을 못 찾음 | 그 파일이 프로젝트 폴더 안에 있는지 (4번) |
| 규칙 파일을 무시하는 것 같음 | `GEMINI.md`(또는 `AGENTS.md`)가 프로젝트 루트에 있는지, 철자가 맞는지 |
| 규칙이 서로 어긋나게 동작함 | `GEMINI.md`와 `AGENTS.md`를 같이 두지 않았는지 (2번) |
| 스킬이 활성화되지 않음 | `SKILL.md`의 `description`이 언제 쓰는지를 구체적으로 설명하는지 |
| MCP 서버가 안 붙음 | JSON 문법(쉼표 누락)과 Node.js 설치 확인 후 재시작 → `...` → MCP Servers에서 확인 |
| 확장이 검색되지 않음 | Open VSX에 없는 확장 → VSIX로 설치 (5번) |
| 명령마다 계속 확인을 요구함 | Terminal Execution Policy 확인 (3번) |

### 알려진 이슈

`Always Proceed`로 설정해도 계속 확인을 요구하거나, Allow List에 넣은 명령인데 승인을 요구하는 경우가
보고되어 있다. 설정을 잘못한 게 아닐 수 있으니 몇 번 확인해보고 안 되면 넘어간다.

## 9. 더 알아보기

Antigravity 안에 커스터마이징 공식 문서가 내장되어 있다.

```
~/.gemini/antigravity/builtin/skills/agy-customizations/docs/
  rules.md · skills.md · hooks.md · mcp_servers.md · plugins.md · json_configs.md
```

- [Antigravity 시작하기](https://antigravity.google/docs/getting-started)
- [Antigravity 설정 문서](https://antigravity.google/docs/ide/settings)
