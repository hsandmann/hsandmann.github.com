<div align="center">

# Humberto Sandmann

*The source behind my online CV and two tailored, print-ready PDFs.*

[![Live site](https://img.shields.io/badge/live-hsandmann.github.io-3949ab?style=for-the-badge&logo=githubpages&logoColor=white)](https://hsandmann.github.io/)
[![Academic](https://img.shields.io/badge/academic-CV-0f4c4f?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)](https://hsandmann.github.io/assets/doc/sandmann-academic.pdf)
[![Résumé](https://img.shields.io/badge/industry-r%C3%A9sum%C3%A9-0f766e?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)](https://hsandmann.github.io/assets/doc/sandmann-resume.pdf)

</div>

---

> Computer scientist and professor — D.Sc. (University of São Paulo) with a research stay at the
> Max Planck Institute for Dynamics and Self-Organization. Research at the intersection of
> **bio-inspired neural computing**, **nonlinear network dynamics**, and **pattern recognition**.

This repository hosts my **online CV** (a MkDocs Material site published to GitHub Pages) plus two
purpose-built PDFs — a comprehensive **academic CV** and a concise **résumé** — generated
from a single structured data source and rebuilt automatically on every push to `main`.

## 🔗 Quick links

| | |
|---|---|
| 🌐 **Online** | <https://hsandmann.github.io/> |
| 🎓 **Academic (PDF)** | <https://hsandmann.github.io/assets/doc/sandmann-academic.pdf> |
| 💻 **Résumé (PDF)** | <https://hsandmann.github.io/assets/doc/sandmann-resume.pdf> |
| 💼 **LinkedIn** | <https://www.linkedin.com/in/hsandmann/> |

## 🧰 Tech stack

[![Deploy](https://github.com/hsandmann/hsandmann.github.com/actions/workflows/main.yaml/badge.svg)](https://github.com/hsandmann/hsandmann.github.com/actions/workflows/main.yaml)

- **[MkDocs](https://www.mkdocs.org/)** + **[Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)** — the online CV
- **CV PDFs** — generated from `cv/data/cv.yml` by `cv/build.py`: Jinja2 templates (`cv/templates/`) rendered to PDF via headless Chromium (Playwright), with fonts bundled for reliable, universal rendering
- **[glightbox](https://github.com/blueswen/mkdocs-glightbox)** — lightbox for diplomas & images
- **[minify](https://github.com/byrnereese/mkdocs-minify-plugin)** — smaller HTML
- **GitHub Actions → GitHub Pages** — continuous deploy on every push to `main`
