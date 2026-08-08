# AntigleForge — tools platform (static site)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Free browser-based tools for Minecraft creators, web developers, students, and
businesses — built and maintained by **The Antigle**. Deployed as a fully
static site from this repository to Cloudflare Pages. **No backend. No build
step.** The repo is the deploy.

- Author: [The Antigle](https://github.com/mukund-buddy)
- Project: [github.com/mukund-buddy/AntigleForge](https://github.com/mukund-buddy/AntigleForge)
- License: [MIT](LICENSE)

## Product rules (from the brief — enforced here)

- **No AI required.** The site must work completely without AI services. AI
  features are future and strictly optional (BYOK, designed separately).
- **Tool acceptance rule.** Every tool must pass all six questions before it
  is approved: solves a real problem / works fully in the browser / generates
  SEO traffic / can be documented / easy to maintain / results within 30
  seconds. Backlog items stay in `tools.json` with `"status": "backlog"`.
- **Ads never hurt UX.** No popups, popunders, redirects, fake buttons.
  Reserved CLS-safe slots only.
- **Quality over quantity.** The catalog is the approved plan, not a wishlist.

## Quick start

Test locally with any static server (ES modules require http, not `file://`):

```bash
python -m http.server 8080
# or: npx serve .
# then open http://localhost:8080
```

## Before going live — replace the domain placeholder

Search the repo for `YOUR-DOMAIN.example` and replace with the production
domain (canonical URLs, Open Graph, sitemap, robots, JSON-LD). There must be
**zero** occurrences before production.

## Deploy to Cloudflare Pages

1. Push this folder to a private GitHub repository.
2. Cloudflare Pages → Create project → connect the repo.
3. Build settings: **Build command:** (leave empty) · **Output directory:** `.`
4. Deploy. Add the custom domain in the Pages dashboard.

`_headers` and `_redirects` are picked up automatically from the output root.

## Layout

```
index.html                  Home hub (hero demo + live tool families)
about/index.html            Brand + roadmap
privacy/index.html          Privacy policy + disclaimer (noindex)
tools/index.html            Tool catalog: live tools static, approved plan
                            rendered from assets/data/tools.json
tools/manifest-generator/   Live — Minecraft Bedrock: Manifest Generator,
tools/manifest-validator/   Manifest Validator, Identifier Validator, Pack
tools/identifier-validator/ Structure Checker, Pack Version Generator
tools/pack-structure-checker/
tools/pack-version-generator/
tools/thumbnail-fetcher/    Live — YouTube: Thumbnail Fetcher, Thumbnail
tools/thumbnail-downloader/ Downloader, Timestamp Generator, Chapter
tools/timestamp-generator/  Formatter, Description Generator, Title Length
tools/chapter-formatter/    Checker, Hashtag Formatter
tools/description-generator/
tools/title-length-checker/
tools/hashtag-formatter/
tools/meta-tag-generator/   Live — Web Development: Meta Tag, robots.txt,
tools/robots-generator/     sitemap.xml, Open Graph, JSON Formatter/Validator,
tools/sitemap-generator/    Base64, URL Encode/Decode, Slug, Regex Tester,
tools/open-graph-generator/ UUID, CSS Gradient/Shadow/Flexbox/Grid
tools/json-formatter/       Generators (34 live total)
tools/json-validator/
tools/base64-encode-decode/
tools/url-encoder/
tools/url-decoder/
tools/slug-generator/
tools/regex-tester/
tools/uuid-generator/
tools/css-gradient-generator/
tools/css-shadow-generator/
tools/flexbox-generator/
tools/grid-generator/
tools/percentage-calculator/ Live — Student: Percentage, Attendance, CGPA,
tools/attendance-calculator/ Reading Time, Word Counter, Character
tools/cgpa-calculator/      Counter (6 live total)
tools/reading-time-calculator/
tools/word-counter/
tools/character-counter/
assets/css/app.css          Design system (Antigle tokens + glass layer)
assets/js/main.js           Chrome behavior (progressive enhancement)
assets/js/tools-index.js    Tools page: renders the approved build plan
assets/js/components/       Web Components (toast, copy, json-view, tool-card)
assets/js/tools/            Per-tool logic
assets/js/validate/         Pure logic modules (manifest/identifier/version
                            rules, ZIP parser, youtube/chapters/hashtags,
                            student-tools) — Node-testable
assets/data/                tools.json catalog · manifest-presets.json presets
templates/                  Canonical nav/footer (copy into pages, keep in sync)
docs/                       Architecture, data contracts, SEO, security, roadmap
```

## Documentation

| File | Covers |
|---|---|
| `docs/ARCHITECTURE.md` | Decisions, trade-offs, verified facts, unknowns |
| `docs/DATA.md` | JSON data contracts |
| `docs/SEO.md` | SEO plan + release checklist |
| `docs/SECURITY.md` | Headers, CSP, code rules, secrets policy |
| `docs/ROADMAP.md` | Approved plan in build order + "add a new tool" runbook |
| `docs/tools/*.md` | Per-feature docs: why/how/limitations/browser compat/maintenance/trade-offs/future (one per live tool) |

## Verified sources (as of 2026-08-06)

- Minecraft Bedrock manifest schema: learn.microsoft.com/minecraft/creator
  (packmanifest reference) — format_version 2, header/modules/dependencies
  rules implemented in `assets/js/tools/manifest-generator.js`.
- Gemini API browser BYOK: legacy `generateContent` REST endpoint supports
  browser CORS with `x-goog-api-key`; Interactions API currently does not
  (googleapis/js-genai issue #1723) — see ARCHITECTURE.md §2.4.
- SEO 2026: Core Web Vitals (LCP/INP/CLS) confirmed ranking signals;
  content must exist in initial HTML (two-wave indexing) — see SEO.md.
