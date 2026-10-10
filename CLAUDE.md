# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

A companion [AGENTS.md](AGENTS.md) exists with overlapping guidance; keep the two in sync when changing workflow conventions.

## What this is

A personal documentation site for Humberto Sandmann, published to https://hsandmann.github.io/, built with
**[Zensical](https://zensical.org/)** (the successor to MkDocs Material, from the same team). Zensical reads
the MkDocs-style `mkdocs.yml`, so the config file keeps that name. Despite the legacy `_config.yaml` (Jekyll)
at the root, the site is not Jekyll — `_config.yaml` is vestigial and unused by the build.

## Commands

Always use the repo-local virtualenv:

```bash
source env/bin/activate
pip install -r requirements.txt

zensical serve            # local preview at http://127.0.0.1:8000
zensical build --strict   # production build validation — run before finishing
```

There are no tests or linters — `zensical build --strict` is the validation gate. Deployment is done by CI
only (see below). Local builds show no "Last update" date unless `SITE_LAST_UPDATE` is exported.

## Architecture

- **Content** lives in `docs/`. Authored content is essentially one large file, `docs/index.md` (~800 lines); assets are in `docs/assets/` (`img/`, `doc/` for the CVs) and `docs/archive/` and custom CSS in `docs/stylesheets/extra.css`.
- **All site behavior is driven by `mkdocs.yml`** — theme, palette, markdown extensions, and plugins. Read it before changing docs, theme, or rendering behavior.
- **Theme:** `variant: modern` (Zensical's default look: Inter / JetBrains Mono, light header). The logo is the
  inline `material/school` icon (`theme.icon.logo`), not an image, so it follows the header text color. Template
  overrides live in `overrides/partials/` (`header.html` adds the two CV buttons; it is a copy of Zensical's
  header — keep it in sync on Zensical upgrades).
- **Plugins:** only `minify` (native to Zensical). Search is explicitly disabled (single page). `glightbox`
  and `git-revision-date-localized` were dropped in the Zensical migration. `requirements.txt` holds just
  `zensical` plus the CV pipeline deps; if a plugin ever needs a pip package, add it there too.
- **"Last update" date — WORKAROUND (gambiarra), to be removed when a viable alternative exists:** Zensical
  does not support `git-revision-date-localized` yet ("Planned" at https://zensical.org/compatibility/plugins/).
  CI exports `SITE_LAST_UPDATE` (the pushed commit's date) → `mkdocs.yml` `extra.last_update` (`!ENV`) →
  rendered by `overrides/partials/source-file.html`. When Zensical supports the plugin, enable it and delete
  the override, the `extra.last_update` entry, and the env export in CI.
- Enabled markdown extensions are intentionally minimal (`admonition`, `attr_list`, `md_in_html`, `pymdownx.details`, `pymdownx.superfences`, `footnotes`, `tables`, `pymdownx.emoji`, `toc`).

## CV PDFs

The two downloadable CVs are **not** built by Zensical. They are generated from a single data
source by a standalone script:

- `cv/data/cv.yml` — the single source of truth for CV content. **Edit this**, never the PDFs.
- `cv/templates/professor.html.j2` (academic CV, Spectral serif) and `developer.html.j2`
  (senior résumé, IBM Plex) — self-contained HTML/CSS, each with **all** font weights
  bundled via `@font-face` (in `cv/assets/fonts/`). Bundling every weight is essential: synthesized
  bold/italic exports as Type3 and renders blank in many PDF viewers; real faces export as Type0.
- `cv/build.py` — renders each template with Jinja2 and prints to PDF via Playwright/Chromium,
  writing `docs/assets/doc/sandmann-academic.pdf` and `sandmann-resume.pdf`.

Rebuild locally with `python cv/build.py`. CI runs it on every push and commits the fresh PDFs.
These two keep fixed, undated names because they are regenerated on every push and linked externally.
The site links to both (header button → academic CV; contact block → both).

## Deployment

CI is `.github/workflows/main.yaml`: on every push to `main` it installs `requirements.txt`,
installs Chromium, runs `python cv/build.py`, commits the regenerated PDFs (`[skip ci]`), runs
`zensical build --strict` with `SITE_LAST_UPDATE` set, and force-pushes `site/` to the `gh-pages`
branch with `ghp-import` (Python 3.12). GitHub Pages serves from `gh-pages`. There is no PR
build/check job — pushing to `main` deploys directly to GitHub Pages.

## Conventions

- Do not edit anything under `env/` (local virtualenv, gitignored along with `site/` and `.cache/`).
- Keep styling in `docs/stylesheets/extra.css` rather than inline HTML/CSS where practical.
- **Archive — `docs/archive/`** holds every supporting file, by category: `documents/` (diplomas,
  transcripts, letters, certificates), `academic/` (thesis, dissertation, defense slides),
  `publications/`, `ijcnn/` (conference programs), `media/` (press copies, videos, audio).
  - Files are named `YYYYMMDD-<issuer/outlet>-<subject>[-<type>].<ext>`, all lowercase,
    hyphen-separated; the date is the issue/publication/broadcast date.
  - **Public vs private:** only files tracked in git are published. `.gitignore` ignores all of
    `docs/archive/**`, so new files stay private (local + Cloudflare R2 bucket `hsandmann-github-com`)
    unless explicitly published with `git add -f`. Never publish files over 100 MB (GitHub limit) or
    copies of paywalled/third-party content without the owner's say-so.
  - A local `zensical build` copies the private files into `site/` too (~2.3 GB); CI checks out only
    tracked files, so the deployed site never contains them. Never deploy from a local build.
  - The generated CVs stay in `docs/assets/doc/` with fixed, undated names (linked externally).
