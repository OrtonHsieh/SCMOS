"""Export the local weekly reader to GitHub Pages without original sources."""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "output/week01/practice.html"
DESTINATION = ROOT / "docs"


def prepare() -> None:
    page = SOURCE.read_text(encoding="utf-8")
    page = page.replace(
        "本機教材預覽。作答僅保留於本頁開啟期間；重新整理會清除，尚未連接 Supabase。",
        "公開複習版 · 作答僅保留於本頁開啟期間；重新整理會清除，尚未連接 Supabase。",
    )
    # This local reader contains links to private derived text and page images.
    # Keep source identifiers for traceability, but never publish those files.
    page, count = re.subn(
        r'<p><a href="\.\./\.\./materials/.*?</p>',
        '<p class="source">原始逐字稿與 PDF 未公開。文中的來源代碼供持有教材者對照。</p>',
        page,
        flags=re.DOTALL,
    )
    if count != 1:
        raise ValueError("Expected exactly one private source-link block")
    for private_marker in ("/Users/", "file://", "../../materials/", "transcript-numbered.txt"):
        if private_marker in page:
            raise ValueError(f"Private path in public output: {private_marker}")
    DESTINATION.mkdir(exist_ok=True)
    (DESTINATION / "index.html").write_text(page, encoding="utf-8")
    (DESTINATION / ".nojekyll").touch()
    print("Prepared docs/index.html for GitHub Pages")


if __name__ == "__main__":
    prepare()
