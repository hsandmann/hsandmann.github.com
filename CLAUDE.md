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
- **Plugins must stay in sync with `requirements.txt`.** Each plugin enabled in `mkdocs.yml` (e.g. `badges`, `markdown-exec`, `render_swagger`, `termynal`, `git-committers`, `page-to-pdf`, `minify`, `glightbox`) has a corresponding pip package. Adding/removing a plugin requires editing both files.
- The build relies on rich pymdownx extensions (arithmatex/MathJax, superfences with mermaid, tabbed, critic, snippets with URL download) — content can assume these are available.

## Deployment

CI is `.github/workflows/main.yaml`: on every push to `main`, it installs `requirements.txt` and runs `mkdocs gh-deploy --force` (Python 3.12). There is no PR build/check job — pushing to `main` deploys directly to GitHub Pages.

## Conventions

- Do not edit anything under `env/` (local virtualenv, gitignored along with `site/` and `.cache/`).
- Keep styling in `docs/stylesheets/extra.css` rather than inline HTML/CSS where practical.
