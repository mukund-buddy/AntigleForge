# Feature doc — Thumbnail Downloader

Page: `tools/thumbnail-downloader/index.html`
Logic: `assets/js/tools/thumbnail-downloader.js` + `assets/js/validate/youtube.js`
Data: none · Catalog id: `thumbnail-downloader` · Status: **live**

---

## 1. Why it exists

Creators routinely need the thumbnail of their own or referenced videos —
for editors, thumbnails grids, or community posts. The Fetcher gives URLs;
the Downloader gives a per-size preview with **verified real resolution**
and a reliable save path.

## 2. How it works

1. Same `parseVideoId()` entry as the Fetcher (shared module).
2. A size tab strip (maxres / sd / hq / mq / default) shows a preview; the
   preview image is probed first and its actual `naturalWidth`/`naturalHeight`
   are reported ("Actual file size: 1280×720 px — this is what gets saved").
   A non-default size with `naturalWidth <= 120` is flagged as a grey
   placeholder (size does not exist for that video).
3. **Why no direct download button** (verified): `i.ytimg.com` does not send
   `Access-Control-Allow-Origin`, so canvas `toDataURL`/`toBlob` reads are
   tainted and scripted downloads fail. The reliable, quality-preserving path
   is "Open in new tab → Save image as", which is exactly what the CTA does.
4. A secondary quick-size grid lists every URL for copy/paste workflows.

## 3. Limitations

- No programmatic single-click save (CORS, see above). This is a platform
  constraint, not a missing feature.
- Existence checks share the `naturalWidth` heuristic with the Fetcher.
- No watermark/overlay features — by design, the file is saved untouched.

## 4. Browser compatibility

- Same baseline as the Fetcher: ES modules + `Image` probing.
  No clipboard dependency on this page.

## 5. Maintenance requirements

- Sizes/URLs shared via `validate/youtube.js`; keep both thumbnail tools in
  lockstep (they intentionally share `THUMB_SIZES`).
- If YouTube ever adds CORS headers to `i.ytimg.com`, the page can gain a
  real download button; note the change in this doc and the FAQ.

## 6. Trade-offs

- **Tab previews** (chosen) over a full grid: one large image at a time
  keeps the page light and focuses the save action.
- **Open-in-tab saving** (chosen) over canvas workarounds: canvas saves fail
  on this origin anyway and would silently produce broken files.

## 7. Future improvements

- "Copy URL" on each tab for quick sharing.
- Persist the last video ID in `sessionStorage` for tab-refresh continuity.

## 8. Verified references

- CORS behaviour of `i.ytimg.com` (no `Access-Control-Allow-Origin` on
  thumbnails) verified live 2026-08-06; see also community write-ups on
  canvas-download failures for YouTube thumbnails.
- Size map: paulirish/lite-youtube-embed `youtube-thumbnail-urls.md`.
