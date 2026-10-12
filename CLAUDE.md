# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

A companion [AGENTS.md](AGENTS.md) exists with overlapping guidance; keep the two in sync when changing workflow conventions.

## What this is

A personal documentation site for Humberto Sandmann, published to https://hsandmann.github.io/, built with
**[Zensical](https://zensical.org/)** (the successor to MkDocs Material, from the same team). It is configured with
Zensical's native `zensical.toml` (migrated from `mkdocs.yml`; the generated HTML was byte-identical).

## Commands

Always use the repo-local virtualenv:

```bash
source env/bin/activate
pip install -r requirements.txt

zensical serve            # local preview at http://127.0.0.1:8000
zensical build --strict   # production build validation — run before finishing
```

There are no tests or linters — `zensical build --strict` is the validation gate. Deployment is done by CI
only (see below). Local builds show no "Last update" date (CI injects it; see below).

## Architecture

- **Content** lives in `docs/`. Authored content is essentially one large file, `docs/index.md` (~650 lines); assets are in `docs/assets/` (`img/`, `doc/` for the CVs) and `docs/archive/` and custom CSS in `docs/stylesheets/extra.css`.
- **All site behavior is driven by `zensical.toml`** — theme, palette, markdown extensions, and plugins. Read it before changing docs, theme, or rendering behavior.
- **Theme:** `variant: modern` (Zensical's default look: Inter / JetBrains Mono, light header). The logo is the
  inline `material/school` icon (`theme.icon.logo`), not an image, so it follows the header text color. Template
  overrides live in `overrides/partials/` (`header.html` adds the two CV buttons; it is a copy of Zensical's
  header — keep it in sync on Zensical upgrades).
- **Plugins:** only `minify` (native to Zensical). Search is explicitly disabled (single page). `glightbox`
  and `git-revision-date-localized` were dropped in the Zensical migration. `requirements.txt` holds just
  `zensical` plus the CV pipeline deps; if a plugin ever needs a pip package, add it there too.
- **"Last update" date — WORKAROUND (gambiarra), to be removed when a viable alternative exists:** Zensical
  does not support `git-revision-date-localized` yet ("Planned" at https://zensical.org/compatibility/plugins/).
  TOML has no env-var substitution, so CI rewrites `last_update = ""` in `zensical.toml` (`[project.extra]`)
  with the pushed commit's date right before the build (the edit is not committed) → rendered by
  `overrides/partials/source-file.html`. When Zensical supports the plugin, enable it and delete the
  override, the `last_update` entry, and the `sed` step in CI.
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
`zensical build --strict` with the commit date written into `zensical.toml`, and force-pushes `site/` to the `gh-pages`
branch with `ghp-import` (Python 3.12). GitHub Pages serves from `gh-pages`. There is no PR
build/check job — pushing to `main` deploys directly to GitHub Pages.

## Conventions

- **Rule — a CV change updates every derived copy.** Whenever any CV content changes (a role, date,
  title, degree, publication, contact…), update all of them in the same change: `cv/data/cv.yml` (→ both
  PDFs), `docs/index.md`, `overrides/partials/structured-data.html` (JSON-LD), `docs/llms.txt`, the
  `description`/`site_description` and `cv/og_card.py` (headline, photo) when affected — and list the
  matching edits for the external profiles (ORCID 0000-0001-7758-695X, LinkedIn), which are only changed
  with the user's go-ahead.
- Do not edit anything under `env/` (local virtualenv, gitignored along with `site/` and `.cache/`).
- Keep styling in `docs/stylesheets/extra.css` rather than inline HTML/CSS where practical.
- `docs/index.md` is built from a few HTML components styled in `extra.css` (see the comment at its top):
  `cv-hero`, `cv-stats`, `cv-entry` (one role/degree: h3 + period, org line, summary, tags, optional
  `<details class="cv-more">` for long lists), `cv-rows` (one-line records) and `cv-pubs`. Copy an
  existing entry when adding one, keep roles reverse-chronological, and check new content at phone
  width in both light and dark schemes. Colors come only from the `--cv-*` tokens at the top of `extra.css`.
- **SEO / sharing / analytics** (all invisible on the page): `overrides/main.html` sets the `<title>`,
  Open Graph/Twitter tags and optional verification + GoatCounter tags (enabled by filling
  `google_site_verification`, `bing_site_verification`, `goatcounter` in `zensical.toml` `[project.extra]`);
  `overrides/partials/structured-data.html` is the schema.org JSON-LD CV; `docs/llms.txt` is the
  plain-text summary for LLM tools; `docs/robots.txt` keeps `archive/documents/` out of search.
  Keep JSON-LD and `llms.txt` factual and in sync with `index.md` — never add hidden instructions or
  text aimed at manipulating crawlers or AI screeners (it is penalized as spam and backfires).
  `data-goatcounter-click` attributes on links name the conversion events (CV downloads, email, profiles).
  The share image `docs/assets/img/og-card.png` is made by `python cv/og_card.py` (run from `cv/`).
- **Archive — `docs/archive/`** holds every supporting file, by category: `documents/` (diplomas,
  transcripts, letters, certificates), `academic/` (thesis, dissertation, defense slides),
  `publications/`, `ijcnn/` (conference programs), `media/` (press copies, videos, audio),
  `web/` (mirrors of old websites).
  - Files are named `YYYYMMDD-<issuer/outlet>-<subject>[-<type>].<ext>`, all lowercase,
    hyphen-separated; the date is the issue/publication/broadcast date.
  - **Public vs private:** only files tracked in git are published. `.gitignore` ignores all of
    `docs/archive/**`, so new files stay private (local + Cloudflare R2 bucket `hsandmann-github-com`)
    unless explicitly published with `git add -f`. Never publish files over 100 MB (GitHub limit) or
    copies of paywalled/third-party content without the owner's say-so.
  - A local `zensical build` copies the private files into `site/` too (~2.3 GB); CI checks out only
    tracked files, so the deployed site never contains them. Never deploy from a local build.
  - The generated CVs stay in `docs/assets/doc/` with fixed, undated names (linked externally).
- **Previous versions — `docs/previous/`** holds frozen static copies of earlier sites, marked `noindex`
  with a canonical pointing at the current CV. The CV footer (`cv-previous`) links each version where it is
  live: `2026` -> `previous/2026/` (only published here), `2017` -> the original http://sandmann.sdf.org/
  (its copy here is an unlinked backup, reachable only by URL):
  `2026/` is the pre-redesign Zensical build (its document links point at the live `../../archive/`),
  `2017/` is a full copy of the old sandmann.sdf.org (converted to UTF-8, dot-folders renamed); only the
  two commercial books and the scanned student group lists (names + e-mails) are left out and linked to
  the original site instead. Zensical copies these
  `.html` files verbatim but skips dot-files, so never use names starting with `.` there. Do not edit
  them except to fix broken links. The complete sdf.org mirror is private in `docs/archive/web/`.
