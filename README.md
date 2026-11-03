# AntigleForge

Free, **100% client-side** Minecraft toolkit for Bedrock (and Java) players and creators. Every tool runs in the browser — no backend, no API keys, no accounts, no database, no tracking. Your worlds, addon code and coordinates never leave your device.

Live site: **https://antigleforge.pages.dev**

---

## Highlights

- **25 tools** covering calculators, command/JSON generators and converters.
- **No backend** — vanilla HTML, CSS and JavaScript only. Nothing is uploaded anywhere.
- **Sticky header + multi-column footer** injected from a single file (`assets/js/components.js`), so every page stays in sync.
- **Per-tool FAQ** at the bottom of each tool page (accessible accordion with `aria-expanded` / `aria-controls`).
- **Mobile-first layout** — no horizontal scroll, flex/grid throughout, tools go full width on small screens.
- **Copy buttons everywhere** with a clipboard fallback for older browsers.
- **Security headers** shipped in `_headers` (CSP, `X-Frame-Options: DENY`, `nosniff`, HSTS, Permissions-Policy).

---

## Tools

**Calculators**
Nether Portal · Coordinate Converter · XP · Enchantment · Villager Trade · TNT Blast · Redstone Delay · Farm Efficiency · Building Material · Beacon Color · Crop Growth

**Generators**
Command · Manifest.json · Loot Table · Recipe · Spawn Rule · Shape / `.mcstructure` · UUID v4 · Tellraw · MOTD · Item Lore · Effect Command

**Converters & utilities**
Color (hex/RGB/§) · Potion Brewing Guide · JSON Formatter & Validator

Every tool page includes: a clean input card, a live result panel, a copy button, and its own FAQ section.

---

## Project structure

```
AntigleForge/
├── index.html                  # Landing page (hero + tool grid)
├── tools.html                  # All tools, search + category filters
├── mode.html                   # Edition picker (no header/footer)
├── about.html                  # About
├── privacy.html                # Privacy policy
├── terms.html                  # Terms of use
├── tools/                      # One folder-level page per tool (25)
│   ├── shape-generator.html
│   ├── coordinate-converter.html
│   └── ...
├── assets/
│   ├── css/theme.css           # Single "paper on dark" theme
│   ├── images/                 # Logo, block textures
│   └── js/
│       ├── components.js       # Header, footer, FAQ (shared by every page)
│       ├── main.js             # AntigleForge helpers: copy, toast, UUID, debounce
│       ├── performance.js      # Low-end device / performance mode
│       └── tools/              # Tool-specific scripts (heavy ones only)
├── _headers                    # Cloudflare Pages security + cache headers
├── robots.txt, sitemap.xml
└── minify.js                   # Optional build helper
```

---

## Run locally

No build step and no dependencies are required.

```bash
# any static server works
python -m http.server 8080
# or
npx serve .
```

Then open `http://localhost:8080`. Opening `index.html` directly with `file://` also works, but a server is recommended so relative paths and headers behave like production.

---

## Adding a new tool

1. Copy an existing page from `tools/` (e.g. `coordinate-converter.html`) and rename it.
2. Update `<title>`, `meta description`, `link rel="canonical"`, the Open Graph tags, the hero title/subtitle and the tool logic.
3. Call `AntigleComponents.init([...])` with the tool's FAQ entries — that injects the shared header, footer and FAQ accordion.
4. Add a card to `tools.html` (`data-tool`, `data-tags`, `data-category`, `data-edition` power the search and filters).
5. Add the URL to `sitemap.xml` and the tool count in `index.html`.

Header, footer and FAQ live **only** in `assets/js/components.js` — edit them there, not per page.

---

## Security & privacy notes

- All parsing and generation happens with `JSON.parse`, `crypto.randomUUID` and plain DOM APIs; there is no `eval`, no `new Function` and no remote code loading.
- User input is never written into the page as HTML. Text is inserted with `textContent`; the only HTML-producing helper (FAQ answers) escapes everything first and then restores a small allowlist (`strong`, `b`, `em`, `i`, `code`, `br`).
- Clipboard writes use the async Clipboard API with a `textarea` + `execCommand` fallback.
- External links use `rel="noopener noreferrer"`.
- `_headers` restricts scripts to same-origin, blocks framing and object embedding, and disables camera/microphone/geolocation.
- Nothing is stored server-side; the site has no cookies and no analytics.

---

## Deployment

The site is a static export designed for Cloudflare Pages:

- **Build command:** none
- **Output directory:** `/` (repository root)
- `_headers`, `robots.txt` and `sitemap.xml` are served as-is.

---

## License

See [LICENSE](LICENSE).

Created by [Mukund](https://github.com/mukund-buddy) · YouTube: [@notgamingplayz](https://youtube.com/@notgamingplayz)
