#!/usr/bin/env python3
"""Render cv/data/cv.yml into the two CV PDFs with Jinja2 + XeLaTeX (US Letter).

Outputs:
  docs/assets/doc/sandmann-academic.pdf   (comprehensive academic CV)
  docs/assets/doc/sandmann-resume.pdf     (one-page senior résumé)

Each template in cv/templates/*.tex.j2 is rendered to a .tex file in a temporary
directory and compiled twice with XeLaTeX (the second run resolves "page x of y").
Fonts are the TrueType files bundled in cv/assets/fonts (loaded by path through
fontspec, so nothing has to be installed system-wide). The build is reproducible:
the PDF dates come from the last git commit that touched the CV sources, so an
unchanged CV yields a byte-identical PDF and CI does not commit it again.

Environment:
  CV_XELATEX         path to the xelatex binary (default: the one on PATH)
  CV_ALLOW_OVERFLOW  set to 1 to write the PDF even if a layout check fails (to inspect it)
"""
from __future__ import annotations

import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path

import yaml
from jinja2 import Environment, FileSystemLoader

ROOT = Path(__file__).resolve().parent.parent
CVDIR = ROOT / "cv"
FONTS = CVDIR / "assets" / "fonts"
IMGDIR = ROOT / "docs" / "assets" / "img"
OUTDIR = ROOT / "docs" / "assets" / "doc"

TARGETS = [
    # template, output, maximum number of pages (None = no limit)
    ("academic.tex.j2", "sandmann-academic.pdf", None),
    ("resume.tex.j2", "sandmann-resume.pdf", 1),
]

# --------------------------------------------------------------------------- #
# LaTeX escaping. Every string that reaches the template is escaped by
# `finalize`, except values already marked as LaTeX (the TeX class below).
# --------------------------------------------------------------------------- #


class TeX(str):
    """A string that is already valid LaTeX and must not be escaped again."""


_SPECIAL = {
    "\\": r"\textbackslash{}",
    "&": r"\&",
    "%": r"\%",
    "$": r"\$",
    "#": r"\#",
    "_": r"\_",
    "{": r"\{",
    "}": r"\}",
    "~": r"\textasciitilde{}",
    "^": r"\textasciicircum{}",
}
_SPECIAL_RE = re.compile("|".join(re.escape(k) for k in _SPECIAL))


def tex(value) -> TeX:
    """Escape plain text for LaTeX."""
    if isinstance(value, TeX):
        return value
    return TeX(_SPECIAL_RE.sub(lambda m: _SPECIAL[m.group()], str(value)))


def texurl(value) -> TeX:
    """Escape a URL for the first argument of \\href."""
    return TeX(re.sub(r"([%#&~_])", r"\\\1", str(value)))


def me(value) -> TeX:
    """Escape an author list and set the CV owner's name in bold."""
    return TeX(str(tex(value)).replace("H. Sandmann", r"\textbf{H.~Sandmann}"))


def period(start, end=None) -> TeX:
    """'2018–2020', '2018–present' or '2011' (en dash, LaTeX-escaped)."""
    if end is None or str(end) == str(start):
        return tex(start)
    return TeX(f"{tex(start)}--{tex(end)}")


def _finalize(value):
    if value is None:
        return ""
    if isinstance(value, (int, float)):
        return value
    return tex(value)


# --------------------------------------------------------------------------- #
# Build helpers
# --------------------------------------------------------------------------- #


def source_epoch() -> int:
    """Time of the last commit that touched the CV sources (reproducible PDFs)."""
    if "SOURCE_DATE_EPOCH" in os.environ:
        return int(os.environ["SOURCE_DATE_EPOCH"])
    try:
        out = subprocess.run(
            ["git", "log", "-1", "--format=%ct", "--", "cv", str(IMGDIR / "hsandmann.jpg")],
            cwd=ROOT, capture_output=True, text=True, check=True,
        ).stdout.strip()
        if out:
            return int(out)
    except (OSError, subprocess.CalledProcessError):
        pass
    return int(time.time())


def strip_jpeg_metadata(src: Path, dst: Path) -> None:
    """Copy a JPEG without its APPn/COM segments (EXIF, GPS, XMP, comments).

    XeTeX embeds JPEG files as-is, so the photo's camera metadata would otherwise
    end up inside the PDF.
    """
    data = src.read_bytes()
    if data[:2] != b"\xff\xd8":
        raise ValueError(f"{src} is not a JPEG")
    out = bytearray(b"\xff\xd8")
    i = 2
    while i < len(data):
        if data[i] != 0xFF:
            raise ValueError(f"{src}: malformed JPEG segment at byte {i}")
        marker = data[i + 1]
        if marker == 0xDA:  # start of scan: the rest is image data
            out += data[i:]
            break
        length = int.from_bytes(data[i + 2:i + 4], "big")
        segment = data[i:i + 2 + length]
        # APP1..APP15 and COM carry metadata; APP0 (JFIF) and all codec segments stay.
        if not (0xE1 <= marker <= 0xEF or marker == 0xFE):
            out += segment
        i += 2 + length
    dst.write_bytes(bytes(out))


def xelatex() -> str:
    exe = os.environ.get("CV_XELATEX") or shutil.which("xelatex")
    if not exe:
        sys.exit("xelatex not found: install TeX Live (XeTeX) or set CV_XELATEX")
    return exe


def compile_pdf(tex_source: str, workdir: Path, epoch: int, max_pages: int | None) -> Path:
    (workdir / "cv.tex").write_text(tex_source, encoding="utf-8")
    env = dict(os.environ, SOURCE_DATE_EPOCH=str(epoch), FORCE_SOURCE_DATE="1")
    cmd = [xelatex(), "-interaction=nonstopmode", "-halt-on-error", "cv.tex"]
    for _ in range(2):  # second pass resolves the total page count
        run = subprocess.run(cmd, cwd=workdir, env=env, capture_output=True, text=True,
                             encoding="utf-8", errors="replace")
        if run.returncode != 0:
            log = (workdir / "cv.log").read_text(encoding="utf-8", errors="replace")
            sys.stderr.write("\n".join(log.splitlines()[-40:]) + "\n")
            sys.exit("xelatex failed (log tail above)")
    log = (workdir / "cv.log").read_text(encoding="utf-8", errors="replace")
    problems = [line.strip() for line in log.splitlines() if "CV-OVERFLOW" in line]
    pages = int(re.search(r"Output written on .*?\((\d+) pages?", log, re.S).group(1))
    if max_pages and pages > max_pages:
        problems.append(f"expected at most {max_pages} page(s), got {pages}")
    if problems:
        message = "layout check failed: " + "; ".join(problems)
        if os.environ.get("CV_ALLOW_OVERFLOW") != "1":
            sys.exit(message)
        print(f"warning: {message}", file=sys.stderr)
    return workdir / "cv.pdf"


def main() -> int:
    data = yaml.safe_load((CVDIR / "data" / "cv.yml").read_text(encoding="utf-8"))
    env = Environment(
        loader=FileSystemLoader(str(CVDIR / "templates")),
        # LaTeX-friendly delimiters: ((( var ))), ((* block *)), ((# comment #))
        variable_start_string="(((", variable_end_string=")))",
        block_start_string="((*", block_end_string="*))",
        comment_start_string="((#", comment_end_string="#))",
        trim_blocks=True, lstrip_blocks=True, keep_trailing_newline=True,
        autoescape=False, finalize=_finalize,
    )
    env.filters.update(tex=tex, url=texurl, me=me, period=period)

    epoch = source_epoch()
    updated = datetime.fromtimestamp(epoch, timezone.utc).strftime("%B %Y")

    OUTDIR.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="cv-") as tmp:
        tmpdir = Path(tmp)
        photo = tmpdir / "photo.jpg"
        strip_jpeg_metadata(IMGDIR / data["personal"]["photo"], photo)
        context = dict(
            data,
            fontdir=TeX(FONTS.as_posix() + "/"),
            photo=TeX(photo.as_posix()),
            updated=updated,
        )
        for template_name, out_name, max_pages in TARGETS:
            workdir = tmpdir / Path(template_name).stem
            workdir.mkdir()
            source = env.get_template(template_name).render(**context)
            pdf = compile_pdf(source, workdir, epoch, max_pages)
            out = OUTDIR / out_name
            shutil.copyfile(pdf, out)
            print(f"generated {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
