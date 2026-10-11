#!/usr/bin/env python3
"""Render the social-sharing card (Open Graph / Twitter) for the website.

Output: docs/assets/img/og-card.png (1200x630), referenced by overrides/main.html.
Not run in CI: regenerate by hand (python cv/og_card.py) when the name, headline or
photo change, and commit the PNG.
"""
from __future__ import annotations

import asyncio

from playwright.async_api import async_playwright

from build import font_uri, img_uri, IMGDIR

OUT = IMGDIR / "og-card.png"

HTML = f"""<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face {{ font-family: Plex; font-weight: 400; src: url({font_uri("IBMPlexSans-Regular.ttf")}); }}
@font-face {{ font-family: Plex; font-weight: 500; src: url({font_uri("IBMPlexSans-Medium.ttf")}); }}
@font-face {{ font-family: Plex; font-weight: 600; src: url({font_uri("IBMPlexSans-SemiBold.ttf")}); }}
@font-face {{ font-family: Plex; font-weight: 700; src: url({font_uri("IBMPlexSans-Bold.ttf")}); }}
* {{ margin: 0; box-sizing: border-box; }}
body {{ width: 1200px; height: 630px; font-family: Plex, sans-serif; color: #10152b;
       background: radial-gradient(circle at 88% 12%, #e4eaff 0, #ffffff 46%); }}
.card {{ position: absolute; inset: 0; padding: 84px 92px; display: flex; flex-direction: column; }}
.top {{ display: flex; align-items: center; gap: 52px; }}
img {{ width: 220px; height: 220px; border-radius: 50%; object-fit: cover; object-position: 50% 22%;
      box-shadow: 0 0 0 8px #fff, 0 0 0 9px #d9def0; }}
h1 {{ font-size: 76px; font-weight: 700; letter-spacing: -2px; line-height: 1; }}
.role {{ margin-top: 18px; font-size: 31px; font-weight: 600; color: #2f54d1; }}
.facts {{ margin-top: 14px; font-size: 25px; color: #4b5270; }}
.bottom {{ margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end;
          font-size: 25px; color: #4b5270; }}
.chips span {{ display: inline-block; margin-right: 12px; padding: 8px 20px; border-radius: 999px;
              background: #eef1fb; color: #2b3150; font-weight: 500; }}
.url {{ font-weight: 600; color: #10152b; }}
</style></head><body><div class="card">
  <div class="top">
    <img src="{img_uri("hsandmann.jpg")}" alt="">
    <div>
      <h1>Humberto Sandmann</h1>
      <div class="role">Computer Scientist · Professor · Software Architect</div>
      <div class="facts">D.Sc. University of São Paulo · Max Planck Institute</div>
    </div>
  </div>
  <div class="bottom">
    <div class="chips"><span>AI &amp; Machine Learning</span><span>Distributed Systems</span><span>25+ yrs</span></div>
    <div class="url">hsandmann.github.io</div>
  </div>
</div></body></html>"""


async def main() -> None:
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(args=["--no-sandbox", "--disable-gpu"])
        page = await browser.new_page(viewport={"width": 1200, "height": 630})
        await page.set_content(HTML, wait_until="load")
        await page.screenshot(path=str(OUT), type="png")
        await browser.close()
    print(f"wrote {OUT.relative_to(IMGDIR.parent.parent.parent)}")


if __name__ == "__main__":
    asyncio.run(main())
