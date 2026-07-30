#!/usr/bin/env python3
"""프로젝트의 에이전트 설정을 zip 한 개로 묶는다.

받는 사람은 압축을 풀고 Antigravity로 그 폴더를 열기만 하면 된다.
설치나 명령어 입력이 필요 없다.

동작 방식
    1. 담을 파일을 고른다 (기본: AGENTS.md + .agents/ 만)
    2. 받는 사람용 안내문 '시작하기.md'를 만들어 같이 넣는다
    3. 압축을 풀면 폴더 하나가 나오도록 최상위 폴더로 감싸서 zip을 만든다
    4. 만든 zip을 다시 열어 손상되지 않았는지 확인한다

사용법
    python3 .agents/skills/share-setup/pack.py           # 설정만 (AGENTS.md + .agents/)
    python3 .agents/skills/share-setup/pack.py --full    # 프로젝트 전체
    python3 .agents/skills/share-setup/pack.py -n 이름     # 파일명 지정

윈도우에서는 python3 대신 python 을 쓴다.
"""
from __future__ import annotations

import argparse
import json
import sys
import zipfile
from pathlib import Path

# 설정만 담을 때 챙기는 것. 없는 항목은 조용히 건너뛴다.
SETUP_ITEMS = [".agents"]

# 규칙 파일은 기본적으로 이 프로젝트 것을 넣지 않는다.
# 프로젝트 고유 내용(파일명·기획 내용)이 그대로 따라가면 받는 사람에게는 방해만 되므로,
# 빈 서식을 대신 넣는다. 실제 규칙까지 넘기려면 --with-rules 를 쓴다.
RULES_ITEMS = ["GEMINI.md", "AGENTS.md"]

# 어느 모드에서든 절대 담지 않는 것
SKIP_NAMES = {
    ".git", ".DS_Store", "Thumbs.db", "desktop.ini",
    "node_modules", "__pycache__", ".venv", "venv",
    ".idea", ".vscode", ".pytest_cache", ".mypy_cache", ".playwright-mcp",
}
SKIP_SUFFIXES = {".pyc", ".pyo", ".zip", ".log"}

TEMPLATE = Path(__file__).parent / "시작하기-템플릿.md"
RULES_TEMPLATE = Path(__file__).parent / "GEMINI-템플릿.md"


def human(size: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if size < 1024 or unit == "GB":
            return f"{size:.0f}{unit}" if unit == "B" else f"{size:,.1f}{unit}"
        size /= 1024.0
    return f"{size}B"


def skip(path: Path) -> bool:
    return path.name in SKIP_NAMES or path.suffix.lower() in SKIP_SUFFIXES


def walk(base: Path):
    """base 아래 파일을 전부 훑는다. 걸러야 할 폴더는 통째로 들어가지 않는다."""
    if base.is_file():
        if not skip(base):
            yield base
        return
    for child in sorted(base.iterdir()):
        if skip(child):
            continue
        if child.is_dir():
            yield from walk(child)
        elif child.is_file():
            yield child


def collect(root: Path, full: bool, with_rules: bool) -> list[Path]:
    """zip에 담을 파일 목록을 만든다."""
    if full:
        return list(walk(root))

    items = SETUP_ITEMS + (RULES_ITEMS if with_rules else [])
    files: list[Path] = []
    for name in items:
        target = root / name
        if target.exists():
            files += list(walk(target))
    return files


def build_readme(project: str, full: bool, files: list[Path], for_whom: str) -> str:
    """받는 사람용 안내문을 만든다."""
    text = TEMPLATE.read_text(encoding="utf-8")

    skills = sorted(p.parent.name for p in files if p.name == "SKILL.md")
    skill_lines = "\n".join(f"- **{name}**" for name in skills) or "- (없음)"

    if full:
        contents = (
            "프로젝트 파일 전부와 에이전트 설정(`.agents/`, 규칙 파일)이 들어 있다.\n"
            "받는 사람이 곧바로 이어서 작업할 수 있다."
        )
    else:
        contents = (
            "에이전트 설정(`.agents/`)과 규칙 파일 서식(`GEMINI.md`)이 들어 있다.\n"
            "이 폴더를 그대로 열어서 써도 되고, 두 항목을 이미 쓰던 프로젝트 폴더로 옮겨도 된다."
        )

    intro = f"\n**{for_whom}** 에서 쓰는 폴더다.\n" if for_whom else ""

    return (
        text.replace("{{PROJECT}}", project)
        .replace("{{FOR}}", intro)
        .replace("{{CONTENTS}}", contents)
        .replace("{{SKILLS}}", skill_lines)
        .replace("{{MCP}}", build_mcp_section(files))
    )


def build_mcp_section(files: list[Path]) -> str:
    """MCP 설정이 같이 담길 때만 안내를 덧붙인다.

    MCP는 폴더를 열면 자동으로 켜지지만 Node.js가 있어야 한다. 받는 사람이 이걸 모르면
    '서버가 안 뜬다'는 상태로 방치되므로, 실제로 담긴 서버 이름과 함께 알려준다.
    """
    config = next((p for p in files if p.name == "mcp_config.json"), None)
    if config is None:
        return ""

    try:
        servers = sorted(json.loads(config.read_text(encoding="utf-8")).get("mcpServers", {}))
    except (ValueError, OSError):
        servers = []
    if not servers:
        return ""

    listed = "\n".join(f"- **{name}**" for name in servers)
    return f"""
## 추가 — 딸려오는 도구 (MCP)

이 폴더에는 아래 도구가 **미리 등록되어 있다.** 따로 설치하거나 설정할 필요 없이,
폴더를 열면 에이전트가 바로 쓸 수 있다.

{listed}

다만 이 도구들은 **Node.js**를 필요로 한다. 없으면 도구만 안 뜨고 나머지는 정상 동작하니,
당장 필요하지 않다면 넘어가도 된다. 설치하려면 <https://nodejs.org> 에서 LTS 버전을 받는다.

잘 붙었는지는 `...`(Additional Options) → `MCP Servers`에서 확인할 수 있다.
"""


def main() -> int:
    parser = argparse.ArgumentParser(
        description="에이전트 설정을 공유용 zip으로 묶는다.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--full", action="store_true",
                        help="설정뿐 아니라 프로젝트 파일 전체를 담는다")
    parser.add_argument("-n", "--name", help="zip 파일명 (확장자 제외)")
    parser.add_argument("-o", "--out", default=".", help="zip을 저장할 위치 (기본: 프로젝트 루트)")
    parser.add_argument("--with-rules", action="store_true",
                        help="빈 서식 대신 이 프로젝트의 실제 규칙 파일을 담는다")
    parser.add_argument("--for", dest="for_whom", default="",
                        help="안내문 첫머리에 넣을 이름 (예: 강의명). 생략하면 아무 이름도 안 들어간다")
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[3]  # .agents/skills/share-setup/pack.py → 프로젝트 루트

    # 기본 이름은 영문으로 둔다. 파일명이자 zip 안의 최상위 폴더명이 되는데, 일부 윈도우
    # 압축 프로그램이 한글 폴더명을 깨뜨려서 받는 쪽에서 알아볼 수 없는 이름이 되는 일이 있다.
    # (-n 으로 한글 이름을 직접 넣을 수는 있다)
    project = args.name or (root.name if args.full else "agent-setup")
    out_path = (root / args.out / f"{project}.zip").resolve()

    files = collect(root, args.full, args.with_rules)
    if not files:
        print("담을 파일이 없다.", file=sys.stderr)
        if not args.full:
            print(f"  {root}에 .agents/ 폴더가 있는지 확인할 것.", file=sys.stderr)
        return 1

    if not args.full and not any(p.name == "SKILL.md" for p in files):
        print("경고: 스킬(SKILL.md)이 하나도 없다.\n")

    out_path.parent.mkdir(parents=True, exist_ok=True)

    # 압축을 풀면 파일이 흩어지지 않고 폴더 하나로 나오도록 최상위 폴더로 감싼다.
    # macOS에서 만든 zip이 윈도우에서 __MACOSX 쓰레기 폴더를 남기는 문제도 이 방식이면 없다.
    total = 0
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for path in files:
            if path == out_path:
                continue
            zf.write(path, f"{project}/{path.relative_to(root).as_posix()}")
            total += path.stat().st_size

        # 규칙 파일을 안 담았으면 빈 서식을 대신 넣는다. 받는 사람이 자기 프로젝트에 맞게 채운다.
        if not args.full and not args.with_rules:
            zf.writestr(f"{project}/GEMINI.md", RULES_TEMPLATE.read_text(encoding="utf-8"))

        zf.writestr(f"{project}/시작하기.md",
                    build_readme(project, args.full, files, args.for_whom))

    # 만든 zip이 멀쩡한지 확인한다.
    with zipfile.ZipFile(out_path) as zf:
        if zf.testzip() is not None:
            print(f"zip이 손상되었다: {out_path}", file=sys.stderr)
            return 1
        count = len(zf.namelist())

    print(f"만들었다: {out_path}")
    print(f"  담긴 파일 {count}개 · 원본 {human(total)} → 압축 {human(out_path.stat().st_size)}")
    print(f"  모드: {'프로젝트 전체' if args.full else '설정만'}")
    print("\n이 zip 하나만 전달하면 된다. 압축을 풀면 안에 '시작하기.md'가 들어 있다.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
