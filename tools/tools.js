/* Shared helpers for the tools: theme toggle, canvas sizing, axes, URL-hash state, export. */
"use strict";

const Tools = (() => {
    const root = document.documentElement;
    const themeListeners = [];

    function storedTheme() {
        try { return localStorage.getItem("tools-theme") || "auto"; } catch (e) { return "auto"; }
    }

    function applyTheme(t) {
        if (t === "auto") root.removeAttribute("data-theme");
        else root.setAttribute("data-theme", t);
    }

    applyTheme(storedTheme());

    function initThemeButton(btn) {
        let t = storedTheme();
        const names = { auto: "Theme: auto", light: "Theme: light", dark: "Theme: dark" };
        const label = () => { btn.textContent = names[t]; };
        label();
        btn.addEventListener("click", () => {
            t = t === "auto" ? "light" : t === "light" ? "dark" : "auto";
            try { localStorage.setItem("tools-theme", t); } catch (e) { /* private mode */ }
            applyTheme(t);
            label();
            themeListeners.forEach((f) => f());
        });
        try {
            matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => themeListeners.forEach((f) => f()));
        } catch (e) { /* old browsers */ }
        // keep embedded pages (and other tabs) in step when the theme changes elsewhere
        window.addEventListener("storage", (e) => {
            if (e.key !== "tools-theme") return;
            t = e.newValue || "auto";
            applyTheme(t);
            label();
            themeListeners.forEach((f) => f());
        });
    }

    function onTheme(fn) { themeListeners.push(fn); }

    function css(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }

    function dpr() { return Math.min(window.devicePixelRatio || 1, 2); }

    /* Size the canvas backing store to its CSS box (height given in CSS px). Returns true if it changed. */
    function fit(canvas, cssHeight) {
        if (cssHeight != null) canvas.style.height = cssHeight + "px";
        const d = dpr();
        const W = Math.max(1, Math.round(canvas.clientWidth * d));
        const H = Math.max(1, Math.round((cssHeight != null ? cssHeight : canvas.clientHeight) * d));
        if (canvas.width !== W || canvas.height !== H) {
            canvas.width = W;
            canvas.height = H;
            return true;
        }
        return false;
    }

    function ticks(a, b, n) {
        const span = b - a;
        if (!(span > 0) || !isFinite(span)) return { values: [], step: 1 };
        const raw = span / Math.max(1, n);
        const mag = Math.pow(10, Math.floor(Math.log10(raw)));
        const e = raw / mag;
        const step = (e >= 7.5 ? 10 : e >= 3.5 ? 5 : e >= 1.5 ? 2 : 1) * mag;
        const values = [];
        for (let v = Math.ceil(a / step) * step; v <= b + step * 1e-9; v += step) {
            values.push(Math.abs(v) < step * 1e-9 ? 0 : v);
        }
        return { values, step };
    }

    function fmtTick(v, step) {
        const d = Math.max(0, Math.ceil(-Math.log10(step) - 1e-9));
        return v.toFixed(Math.min(d, 10));
    }

    /* Number for read-outs: significant digits, no exponent for ordinary values. */
    function fmt(v, digits = 5) {
        if (v == null || Number.isNaN(v)) return "—";
        if (!isFinite(v)) return v > 0 ? "∞" : "−∞";
        const a = Math.abs(v);
        let s;
        if (a !== 0 && (a < 1e-4 || a >= 1e6)) s = v.toExponential(digits - 2);
        else s = Number(v.toPrecision(digits)).toString();
        return s.replace("-", "−");
    }

    /* Grid lines (phase "grid") or tick labels (phase "labels") for a plot spanning the whole canvas. */
    function axes(ctx, xr, yr, phase, opt = {}) {
        const W = ctx.canvas.width, H = ctx.canvas.height, d = dpr();
        const nx = Math.max(2, Math.round(W / (d * 95)));
        const ny = Math.max(2, Math.round(H / (d * 48)));
        const tx = opt.noX ? { values: [] } : ticks(xr[0], xr[1], nx);
        const ty = opt.noY ? { values: [] } : ticks(yr[0], yr[1], ny);
        const X = (v) => (v - xr[0]) / (xr[1] - xr[0]) * W;
        const Y = (v) => H - (v - yr[0]) / (yr[1] - yr[0]) * H;
        ctx.save();
        if (phase === "grid") {
            ctx.strokeStyle = css("--line");
            ctx.lineWidth = 1;
            ctx.beginPath();
            tx.values.forEach((v) => { const x = Math.round(X(v)) + 0.5; ctx.moveTo(x, 0); ctx.lineTo(x, H); });
            ty.values.forEach((v) => { const y = Math.round(Y(v)) + 0.5; ctx.moveTo(0, y); ctx.lineTo(W, y); });
            ctx.stroke();
        } else {
            ctx.fillStyle = css("--muted");
            ctx.font = `${10.5 * d}px ui-monospace, SFMono-Regular, Menlo, monospace`;
            ctx.textBaseline = "alphabetic";
            if (!opt.noXLabels) {
                tx.values.forEach((v) => {
                    const x = X(v);
                    if (x < 4 * d || x > W - 30 * d) return;
                    ctx.fillText(fmtTick(v, tx.step).replace("-", "−"), x + 3 * d, H - 4 * d);
                });
            }
            ty.values.forEach((v) => {
                const y = Y(v);
                if (y < 12 * d || y > H - 14 * d) return;
                ctx.fillText(fmtTick(v, ty.step).replace("-", "−"), 4 * d, y - 3 * d);
            });
        }
        ctx.restore();
    }

    function readHash() {
        const o = {};
        location.hash.replace(/^#/, "").split("&").forEach((kv) => {
            if (!kv) return;
            const i = kv.indexOf("=");
            if (i < 0) return;
            try { o[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1)); } catch (e) { /* ignore */ }
        });
        return o;
    }

    let hashTimer = null;
    function writeHash(o) {
        clearTimeout(hashTimer);
        hashTimer = setTimeout(() => {
            const s = Object.entries(o).map(([k, v]) => k + "=" + encodeURIComponent(v)).join("&");
            try { history.replaceState(null, "", "#" + s); } catch (e) { /* file:// or sandbox */ }
        }, 250);
    }

    function num(v, fallback, lo = -Infinity, hi = Infinity) {
        const x = parseFloat(v);
        return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : fallback;
    }

    function download(canvas, name) {
        canvas.toBlob((blob) => {
            if (!blob) return;
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = name;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
        }, "image/png");
    }

    function copyLink(btn) {
        const done = (ok) => {
            const t = btn.textContent;
            btn.textContent = ok ? "Link copied" : "Copy failed";
            setTimeout(() => { btn.textContent = t; }, 1400);
        };
        const url = location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => done(true), () => done(false));
        } else {
            const ta = document.createElement("textarea");
            ta.value = url;
            document.body.appendChild(ta);
            ta.select();
            let ok = false;
            try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
            ta.remove();
            done(ok);
        }
    }

    /* Bind a range slider and a number box to the same value. */
    function pair(range, box, onInput) {
        range.addEventListener("input", () => { box.value = range.value; onInput(parseFloat(range.value)); });
        box.addEventListener("change", () => {
            const v = parseFloat(box.value);
            if (!Number.isFinite(v)) return;
            range.value = v;
            onInput(v);
        });
    }

    function setPair(range, box, v, min, max, step) {
        if (min != null) { range.min = min; range.max = max; range.step = step; }
        range.value = v;
        box.value = Number(Number(v).toPrecision(8));
    }

    function rgba(rgbTriplet, a) { return `rgba(${rgbTriplet}, ${a})`; }

    /* Reference list: items are [citation HTML, DOI or null]. DOIs are linked through doi.org. */
    function refs(list, heading = "References") {
        if (!list || !list.length) return "";
        const items = list.map(([text, doi]) => {
            if (!doi) return `<li>${text}</li>`;
            const href = "https://doi.org/" + doi.replace(/</g, "%3C").replace(/>/g, "%3E");
            return `<li>${text} <a href="${href}" target="_blank" rel="noopener">doi:${doi.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</a></li>`;
        });
        return `<div class="refs-h">${heading}</div><ul class="refs">${items.join("")}</ul>`;
    }

    return { initThemeButton, onTheme, css, dpr, fit, ticks, fmtTick, fmt, axes, readHash, writeHash, num, download, copyLink, pair, setPair, rgba, refs };
})();
