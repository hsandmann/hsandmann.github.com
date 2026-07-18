# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

A companion [AGENTS.md](AGENTS.md) exists with overlapping guidance; keep the two in sync when changing workflow conventions.

## What this is

A personal MkDocs Material documentation site for Humberto Sandmann, published to https://hsandmann.github.io/. Despite the legacy `_config.yaml` (Jekyll) at the root, the site is built with **MkDocs**, not Jekyll — `_config.yaml` is vestigial and unused by the build.

## Commands

Always use the repo-local virtualenv:

```bash
source env/bin/activate
pip install -r requirements.txt

mkdocs serve            # local preview at http://127.0.0.1:8000
mkdocs build --strict   # production build validation — run before finishing
mkdocs gh-deploy --force  # deploy (CI does this; only run when explicitly asked)
```

There are no tests or linters — `mkdocs build --strict` is the validation gate.

## Architecture

- **Content** lives in `docs/`. Authored content is essentially one large file, `docs/index.md` (~1100 lines); assets are in `docs/assets/` (`img/`, `doc/`) and custom CSS in `docs/stylesheets/extra.css`.
- **All site behavior is driven by `mkdocs.yml`** — theme, palette, markdown extensions, and plugins. Read it before changing docs, theme, or rendering behavior.
- **Plugins must stay in sync with `requirements.txt`.** The site enables only `glightbox`, `git-revision-date-localized` (page-bottom "Last update" date; needs full git history, hence `fetch-depth: 0` in CI), and `minify`; each maps to a pip package. Adding/removing a plugin requires editing both files.
- Enabled markdown extensions are intentionally minimal (`admonition`, `attr_list`, `md_in_html`, `pymdownx.details`, `pymdownx.superfences`, `footnotes`, `tables`, `pymdownx.emoji`, `toc`).

## CV PDFs

The two downloadable CVs are **not** built by MkDocs. They are generated from a single data
source by a standalone script:

- `cv/data/cv.yml` — the single source of truth for CV content. **Edit this**, never the PDFs.
- `cv/templates/professor.html.j2` (academic CV, Spectral serif) and `developer.html.j2`
  (senior résumé, IBM Plex) — self-contained HTML/CSS, each with **all** font weights
  bundled via `@font-face` (in `cv/assets/fonts/`). Bundling every weight is essential: synthesized
  bold/italic exports as Type3 and renders blank in many PDF viewers; real faces export as Type0.
- `cv/build.py` — renders each template with Jinja2 and prints to PDF via Playwright/Chromium,
  writing `docs/assets/doc/sandmann-academic.pdf` and `sandmann-resume.pdf`.

Rebuild locally with `python cv/build.py`. CI runs it on every push and commits the fresh PDFs.
The site links to both (header button → academic CV; contact block → both).

## Deployment

CI is `.github/workflows/main.yaml`: on every push to `main` it installs `requirements.txt`,
installs Chromium, runs `python cv/build.py`, commits the regenerated PDFs (`[skip ci]`), and runs
`mkdocs gh-deploy --force` (Python 3.12). There is no PR build/check job — pushing to `main`
deploys directly to GitHub Pages.

## Conventions

- Do not edit anything under `env/` (local virtualenv, gitignored along with `site/` and `.cache/`).
- Keep styling in `docs/stylesheets/extra.css` rather than inline HTML/CSS where practical.
