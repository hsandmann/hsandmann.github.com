<div align="center">

# 👋 Humberto Sandmann — Curriculum Vitae

*The source behind my online CV: a single, fast, print-ready page.*

[![Live site](https://img.shields.io/badge/live-hsandmann.github.io-3949ab?style=for-the-badge&logo=githubpages&logoColor=white)](https://hsandmann.github.io/)
[![Download CV](https://img.shields.io/badge/download-CV%20(PDF)-b91c1c?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)](https://hsandmann.github.io/assets/doc/humberto-sandmann-cv.pdf)
[![Deploy](https://github.com/hsandmann/hsandmann.github.com/actions/workflows/main.yaml/badge.svg)](https://github.com/hsandmann/hsandmann.github.com/actions/workflows/main.yaml)
[![Built with Material for MkDocs](https://img.shields.io/badge/built%20with-Material%20for%20MkDocs-526CFE?logo=materialformkdocs&logoColor=white)](https://squidfunk.github.io/mkdocs-material/)

</div>

---

> Computer scientist and educator — D.Sc. (University of São Paulo) with a research stay at the
> Max Planck Institute for Dynamics and Self-Organization. Research at the intersection of
> **bio-inspired neural computing**, **nonlinear network dynamics**, and **pattern recognition**.

This repository builds my CV as a static site and publishes it to GitHub Pages. Every push to
`main` rebuilds the page **and regenerates the downloadable PDF** from the exact same source — so
the web and PDF versions can never drift apart.

## 🔗 Quick links

| | |
|---|---|
| 🌐 **Online CV** | <https://hsandmann.github.io/> |
| 📄 **CV (PDF)** | <https://hsandmann.github.io/assets/doc/humberto-sandmann-cv.pdf> |
| 💼 **LinkedIn** | <https://www.linkedin.com/in/hsandmann/> |
| 🆔 **ORCID** | [0000-0001-7758-695X](https://orcid.org/0000-0001-7758-695X) |

## 🧰 Tech stack

- **[MkDocs](https://www.mkdocs.org/)** + **[Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)** — theming and rendering
- **[mkdocs-page-pdf](https://pypi.org/project/mkdocs-page-pdf/)** — renders the page to PDF via headless Chromium during the build
- **[glightbox](https://github.com/blueswen/mkdocs-glightbox)** — lightbox for diplomas & images
- **[minify](https://github.com/byrnereese/mkdocs-minify-plugin)** — smaller HTML
- **GitHub Actions → GitHub Pages** — continuous deploy on every push to `main`

## 🚀 Run it locally

```bash
source env/bin/activate          # repo-local virtualenv
pip install -r requirements.txt

mkdocs serve                     # live preview → http://127.0.0.1:8000
mkdocs build --strict            # production build + validation gate
```

> 💡 The PDF export needs a headless browser. Once, run `playwright install chromium`
> so `mkdocs build` can render `site/index.pdf` locally.

## 🗂️ What's where

```
.
├── docs/
│   ├── index.md                 # the entire CV (single page)
│   ├── assets/
│   │   ├── doc/                  # diplomas, certificates, generated CV PDF
│   │   └── img/                  # photo, logos, favicon
│   └── stylesheets/extra.css     # CV layout & print styling
├── overrides/partials/header.html# top-bar "Download CV" button (theme override)
├── mkdocs.yml                    # theme, plugins, markdown extensions
├── requirements.txt              # Python deps (keep in sync with mkdocs.yml)
└── .github/workflows/main.yaml   # build → verify PDF → commit PDF → deploy
```

## ⚙️ How deployment works

On every push to `main`, the [workflow](.github/workflows/main.yaml):

1. installs dependencies and a headless **Chromium**;
2. runs `mkdocs build --strict` (the `page-to-pdf` plugin renders `site/index.pdf`);
3. **verifies** the PDF exists — the deploy fails loudly if it doesn't, so the download link is never dead;
4. commits the fresh PDF back as `humberto-sandmann-cv.pdf` (tagged `[skip ci]` to avoid a loop);
5. publishes the site with `mkdocs gh-deploy`.

## 📝 Editing notes

- All content is **one file**: [`docs/index.md`](docs/index.md). The timeline layout uses HTML tables for fine control and clean printing.
- Adding or removing a plugin means editing **both** `mkdocs.yml` *and* `requirements.txt`.
- The header override is pinned to a specific Material version — re-sync it after a theme upgrade.

<div align="center"><sub>Made with Markdown, math, and a fondness for spiking neurons. ⚡🧠</sub></div>
