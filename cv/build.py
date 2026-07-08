#!/usr/bin/env python3
"""Render cv/data/cv.yml into styled CV PDFs via Jinja2 + Playwright (Chromium).

Outputs:
  docs/assets/doc/cv-professor.pdf   (comprehensive academic CV)
  docs/assets/doc/cv-developer.pdf   (concise senior-developer résumé)

Fonts and the photo are embedded as base64 data URIs so Chromium embeds real
TrueType faces (Type0). Every weight/style used is a real @font-face, avoiding
synthesized bold/italic glyphs — those export as Type3 and render blank in many
PDF viewers, which was the root cause of earlier "blank PDF" reports.
"""
from __future__ import annotations

import asyncio
import base64
import mimetypes
import os
import sys
import tempfile
from pathlib import Path

import yaml
from jinja2 import Environment, FileSystemLoader, select_autoescape
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
CVDIR = ROOT / "cv"
FONTS = CVDIR / "assets" / "fonts"
IMGDIR = ROOT / "docs" / "assets" / "img"
OUTDIR = ROOT / "docs" / "assets" / "doc"

TARGETS = [
    ("professor.html.j2", "cv-professor.pdf"),
    ("developer.html.j2", "cv-developer.pdf"),
]


def _data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


def font_uri(name: str) -> str:
    """Return a base64 data: URI for a bundled font (cv/assets/fonts)."""
    return _data_uri(FONTS / name)


def img_uri(name: str) -> str:
    """Return a base64 data: URI for a site image (docs/assets/img)."""
    return _data_uri(IMGDIR / name)


async def render_pdf(html: str, out: Path) -> None:
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as t:
        t.write(html)
        tmp = t.name
    try:
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(args=["--no-sandbox", "--disable-gpu"])
            page = await browser.new_page()
            await page.goto(f"file://{tmp}", wait_until="networkidle", timeout=60000)
            # Guarantee every embedded @font-face is parsed before capture.
            await page.evaluate("() => document.fonts.ready")
            # No margin here on purpose: each template sets its own page margins
            # via CSS `@page` (academic CV = text margins; résumé = full-bleed).
            await page.pdf(
                path=str(out),
                format="Letter",
                print_background=True,
                prefer_css_page_size=True,
            )
            await browser.close()
    finally:
        os.unlink(tmp)


def main() -> int:
    data = yaml.safe_load((CVDIR / "data" / "cv.yml").read_text(encoding="utf-8"))
    env = Environment(
        loader=FileSystemLoader(str(CVDIR / "templates")),
        autoescape=select_autoescape(["html", "xml"]),
        trim_blocks=True,
        lstrip_blocks=True,
    )
    env.globals["font"] = font_uri
    env.globals["img"] = img_uri

    OUTDIR.mkdir(parents=True, exist_ok=True)
    for template_name, out_name in TARGETS:
        html = env.get_template(template_name).render(**data)
        out = OUTDIR / out_name
        asyncio.run(render_pdf(html, out))
        print(f"generated {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
