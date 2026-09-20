# CLAUDE

Project-specific guidance for AI coding agents.

<!-- ASTRYX:START -->
Astryx v0.6.1 · 164 components
CLI: run every command as `pnpm exec astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in your app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — discover, don't guess. Before writing UI:
1. `astryx build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.
2. `astryx template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.
3. `astryx component <Name>` — props + examples for every component you use.

RULES:
- No <div> — components do all layout/spacing, page frame included.
- Frame first: read `astryx docs layout` before writing any page or screen — page frame, region widths, breakpoint behavior.
- Dense data = rows (Table, List/Item), never Card-wrapped list items; Card is for standalone widgets. Status = StatusDot/Token; Badge = counts only.
- Custom styling: component props first; else style/className with tokens — var(--color-*|--spacing-*|--radius-*). No raw hex/px. (No StyleX/Tailwind compiler here — don't use xstyle/utility classes.)
- Tokens for every value (`astryx docs tokens`). Brand/accent belongs in the theme (`astryx theme list` / `theme add <slug>`, or `astryx theme template` for a custom one) — never override --color-* in :root.
- SELF-CHECK before you finish: re-read the file and replace any raw <div>/<span> layout, imported .css/@apply, or hardcoded value (#hex, 16px) with the component or a token (var(--color-*|--spacing-*|…)). If unsure a component/prop exists, run `astryx component <Name>` / `astryx search "<thing>"`; don't hand-roll CSS.

MORE CLI:
  search "<query>"   find any component / hook / doc / template / block
  component --list   164 components by category
  template --list    page + block recipes
  docs <topic>       browser-support, cli-integrations, color, elevation, getting-started, icons, illustrations, internationalization, layout, migration, motion, principles, shape, spacing, styling-libraries, styling, theme, tokens, typography, working-with-ai
  swizzle <Name>     eject component source for deep customization
  upgrade --apply    run after any Astryx or integration dependency bump
<!-- ASTRYX:END -->

## KokoFresh project conventions

Rebuild of kokofresh.in on Next.js 15 + Astryx, against a Frappe backend built
by a separate team. Legacy site (reference only, never port code) is at
`../KokoFresh_website-main`; its `REBUILD_ANALYSIS.md` is the behaviour spec.

**Hard rules — these are enforced, not suggestions:**

1. **Astryx imports go through `components/ui/`.** Never import
   `@astryxdesign/core/*` in feature code. Add re-exports to
   `components/ui/index.ts` as components are needed.
2. **No `fetch()` outside `lib/api/client.ts`.** ESLint fails the build on it.
   All data access goes through the typed `lib/api/*` resource modules.
3. **No client-side price/shipping/discount maths.** Every surface calls
   `getQuote()` in `lib/api/pricing.ts`. The legacy site priced one cart four
   different ways; this is the fix.
4. **No hardcoded brand facts.** Name, colours, logo, phone, GSTIN, socials all
   come from `config/brand.ts` / theme tokens / `getSiteConfig()`.
5. **Server Components by default.** `"use client"` only for genuine
   interactivity (cart, bundle configurator, forms).
6. **Legacy URLs get 301 redirects, never rewrites.** A rewrite serves 200 at the
   old path and Google re-indexes it. Hard-won lesson, documented in
   REBUILD_ANALYSIS.md §3.2.
7. **Money is integer paise**, not float rupees. See `Money` in `lib/api/types.ts`.
8. **Never synthesise review/rating data** into JSON-LD. Emit only when real.

**Theme:** edit `themes/kokofresh/kokofreshTheme.ts`, then run `pnpm theme:build`.
`app/providers.tsx` imports the BUILT theme (`themes/kokofresh/kokofresh.js`) so
the theme is present at first paint under SSR. Never point it at the source
theme — that reintroduces runtime injection and a flash of unthemed content.

**Mock/real swap:** per-resource via `NEXT_PUBLIC_API_LIVE_RESOURCES`. The
backend team ships endpoints one at a time; opt each in without touching pages.
If a page has to change because the real contract differs, the abstraction
leaked — fix `lib/api/`, and flag it.

## Brand config — how it is edited

Values live in **`config/brand.json`** and **`config/nav.json`** (plain JSON, no
TypeScript needed). `config/brand.ts` / `config/nav.ts` are zod-validated
loaders that own the shape — invalid JSON fails the build naming the bad field.

Progression: JSON today → `GET /api/v1/site-config` from Frappe in Phase 10 →
an admin UI later (user deferred this: revisit once the core phases are done).
`getSiteConfig()` is already the seam, so none of those steps touches a page or
component.

Theme **colours** are still build-time: edit `themes/kokofresh/kokofreshTheme.ts`
then `pnpm theme:build`. Astryx derives palettes from seeds at build time, so
live colour editing would need a runtime token-override layer.

## Astryx — use the tooling, don't hand-roll

**MCP server** (configured in `.mcp.json`): `https://astryx.atmeta.com/mcp`,
tools `search(query)` and `get(name)`. Verified reachable. Prefer it over
shelling out to the CLI when available; the CLI is the fallback.

**Before writing ANY page or component, run the discovery workflow:**

```bash
pnpm exec astryx build "<what you're building>"   # composition kit: page + blocks + components
pnpm exec astryx template <id> --skeleton          # study layout
pnpm exec astryx template <id>                     # emit full source
pnpm exec astryx component <Name>                  # props + examples
pnpm exec astryx search <query>                    # ranked lookup across everything
pnpm exec astryx doctor                            # project health
```

**699 templates exist.** Page templates that map onto our phases — use the ID,
not the display name:

| Phase | Template ID | Covers |
|---|---|---|
| 3 home | `centered-hero` / `gallery-hero` | hero sections |
| 4 shop | `product-gallery` | product grid w/ media, title, price |
| 4 PDP | `product-detail` | gallery + variant swatches + qty stepper + spec sections |
| 6 checkout | `payment-form`, `checkout-wizard` | sectioned form + live summary; multi-step |
| 7 orders | `detail-page` (Order Detail) | line items, totals, activity timeline |
| 7 auth | `login-card`, `login-split`, `login-sso` | sign-in |
| marketing | `contact-form` | contact |

**Templates emit ownable source, not imports.** `product-detail` is ~299 lines
and DEFINES `StarRating`, `ProductInfo`, `ImageGallery` locally — these are NOT
core exports. So a rating widget is a template pull, not a from-scratch build.
Adapt the emitted source into `components/commerce/`, routing Astryx imports
through `components/ui/` per the boundary rule.

**Known gaps** (genuinely not in Astryx — build custom): bundle configurator,
spice-heat selector. Ratings are covered by the `product-detail` template.

`astryx doctor` warns "No @astryxdesign/theme-* packages installed" — expected
and correct; we use a custom white-label theme, not a shipped theme package.

## PWA

Installable, offline-capable. Three pieces:

- **`app/manifest.ts`** — a route, not a static file, so it reads from
  `config/brand.json`. A white-label brand gets its own name, icons and colours
  with no extra step.
- **`public/sw.js`** — the service worker. **Never serves a cached price.**
  Build assets (`/_next/static/*`) are cache-first (immutable, content-hashed);
  images are cache-first capped at 60; pages are network-first with cache only
  as an offline fallback; `/api/*`, `/account/*`, non-GET and `?_rsc=` requests
  are never touched. Caching a price or a mutation would be a correctness bug.
- **`ServiceWorker.tsx`** — registers on `load` (never competing with first
  paint) and only in production, since a cached bundle in dev makes edits look
  like they did not apply.

iOS ignores the manifest for both the home-screen icon and standalone chrome, so
`appleWebApp` + `icons.apple` + `viewport.themeColor` are declared explicitly in
`app/layout.tsx`. Without them an installed iPhone app gets a screenshot as its
icon and a Safari title bar.

**Testing offline is harder than it looks.** Two methods gave false passes:
Chrome's own HTTP cache answers before the service worker (disable it with
`Network.setCacheDisabled`), and CDP's `emulateNetworkConditions` does not fully
apply to navigations. The honest test is to **kill the server** and reload.
Also note a `fetch(url, {mode:'navigate'})` cannot be constructed from a page,
so a navigation cannot be synthesised in a test.

## CI / deployment

Repo: **github.com/nathishdev-netizen/koko-ui** (private).
Live: **https://koko-ui.vercel.app** (Vercel, Hobby tier — SSO-protected).
CI is `.github/workflows/ci.yml` — typecheck, lint, build on every push and PR.

**Vercel blocks deploys on Next.js CVEs.** A build can complete successfully and
the *deployment* still fail with "Vulnerable version of Next.js detected". The
fix is to upgrade Next, not to change any config — check `pnpm audit` first
rather than guessing at vercel.json. 15.5.4 shipped three criticals (including
unauthenticated RCE); 15.5.25 is clean. Remaining audit findings are transitive
inside Next (next>sharp, next>postcss) and are not ours to pin.

**`pnpm theme:build` must run BEFORE typecheck, not just before build.**
`app/providers.tsx` imports the generated theme, which is gitignored. A
developer's machine has it lying around from an earlier build, so the omission
is invisible locally and fails only in CI — and would have failed the first
Vercel deploy too. Reproduce by deleting `themes/*/kokofresh.{js,d.ts}` and
`theme.css`, then running `pnpm typecheck`.

**Do not set `version:` on `pnpm/action-setup`.** `packageManager` in
package.json is the single source of truth; specifying both makes the action
error out. Node is pinned via `engines` + `.nvmrc`.

`vercel.json`: security headers, and **`sw.js` served with
`max-age=0, must-revalidate`** — a cached service worker strands users on an old
one indefinitely.

**No `regions` key.** Multi-region routing is plan-gated and fails the deploy on
Hobby. Add `"regions": ["bom1"]` (Mumbai — customers are in India) only once the
project is on Pro.

## White-label — runtime theming

**The seam:** `config/theme.json` -> `config/theme.ts` -> `getSiteConfig()` ->
a `<style>` block in `app/layout.tsx`'s `<head>`.

Colours are **server-rendered into the first HTML response**, so a tenant's
palette is correct at first paint — no flash of the wrong brand, no CLS, and no
rebuild to change a colour. Editing `config/theme.json` rebrands the site with
no code change. When Frappe returns a `theme` object on `/site-config`, it
overrides the local file with no further work.

**Every `--kf-*` value is re-validated as strict 6-digit hex before injection.**
That is the security control: it blocks `#000;} body{display:none}`,
`</style><script>`, and `url(javascript:…)`. A malformed tenant theme falls back
to the local default rather than failing the page. Never relax that regex —
these values go straight into a stylesheet.

**Rule: NO literal hex outside the `:root` brand block in globals.css.** All 75
that had accumulated are now tokens (`--kf-brand-ink`, `--kf-on-ink`, …). A
hardcoded colour is a colour that will not follow a brand change.

**The Astryx theme must reference the CSS variables, not literals.**
`components.button` in `kokofreshTheme.ts` is compiled at BUILD time, so a
literal there does not follow a runtime override — the buttons stayed brown
while the rest of the page went blue. It now uses
`var(--kf-brand-ink, #33240F)`; the fallback keeps the build self-contained.

**`--kf-veg-green` is exempt.** The FSSAI vegetarian mark is a legal standard in
India; its green is specified, not chosen, and must never follow a tenant
palette. Same reasoning would apply to any future certification mark.

Verified end to end: setting `brandInk` to `#12408A` turned every button, chip,
ribbon and the bundle strip blue, while the veg marks stayed green.

**Saving is real.** The studio's Save writes `.data/theme.json` (gitignored)
via a Server Action and calls `revalidatePath('/', 'layout')` — every page
renders the theme from the root layout, so the whole site must be revalidated,
not just the studio route. Resolution order is: backend `/site-config` theme ->
`.data/theme.json` -> `config/theme.json`.

**Save is local-only by design.** Serverless filesystems are read-only, so
`canPersist()` returns false on Vercel and the UI says so plainly rather than
silently dropping the write. In production the durable store is the backend,
not a file — which is the correct multi-tenant answer anyway.

The Server Action re-checks the env flag itself: an action is a public
endpoint, so guarding only the page would leave the mutation reachable in
production while the UI was hidden.

**The studio controls five things**, not just colour: brand colours, the accent
pair (`--color-accent` / `--color-text-accent` — links, focus rings, discount
chip, spice chillies), corner shape, the font pairing (any of the 20 sets in
`fontSets.ts`), and identity (name, tagline, logo path).

**Pill radii (999px) are deliberately NOT themeable.** A button or chip should
stay pill-shaped whatever the brand; flattening those reads as broken rather
than sharp. Only `--kf-radius-card` and `--kf-radius-control` are exposed.

**Astryx's Card paints its own radius**, so `components.card.base.borderRadius`
must point at `var(--kf-radius-card, 30px)` or a runtime shape change is
ignored — the same trap as the button colour.

**KokoFresh's card radius is 30px.** Tokenising it initially defaulted to 20px
and silently restyled the whole site; the regression suite caught it. When
tokenising a value, the default must reproduce the existing design exactly.

**Build the save payload in ONE place.** An earlier version listed only the
colour swatches, so shape, font and identity were silently dropped on save
while still appearing in the previewed JSON.

**`/brand` is the brand studio** — a live demo of the seam with colour pickers,
four presets, a contrast readout and copyable JSON. It writes the same `--kf-*`
properties the server injects, and previews the REAL components rather than
mock-ups. It persists nothing; `config/theme.json` stays the source of truth.
Always on in development; in production only when
`NEXT_PUBLIC_ENABLE_BRAND_STUDIO=1`, so it can be shown to a client on a real
deployment without leaving a config surface public by default.

## Dev server port

`pnpm dev` and `pnpm start` are pinned to **port 3001** (`next dev -p 3001`).
Port 3000 is occupied on this machine by an unrelated long-running Python
`run.py` service — do not kill it, and do not assume localhost:3000 is this app.

## CSS gotcha: next/image `fill` inside Astryx cards

Astryx `Card`/`ClickableCard` do NOT establish a positioning context. A
`next/image` with `fill` inside one escapes to the viewport and covers the page
(seen as a full-screen image and a ~29,000px body). Any wrapper holding a
`fill` image needs `position: relative` AND an explicit `width: 100%` —
see `.kf-product`, `.kf-bundle`, `.kf-collection` in globals.css.

Also: never run `pnpm build` while `pnpm dev` is running on the same `.next` —
it corrupts the cache and the dev server 500s with MODULE_NOT_FOUND.

## Type system — swappable sets, three roles

**Candidate sets live in `themes/kokofresh/fontSets.ts`.** One constant,
`FONT_SET`, picks the live one; change that single line to switch the whole
site. Compare them at **`/type`** in development (dev-only, 404s in production).

**20 sets.** Google Fonts (via next/font): `cormorant` · `instrument` ·
`bricolage` · `source` · `young` · `gloock` · `newsreader` · `bricolageOnest`.
Luxury / Didone: **`prata` (live)** · `libreBodoni` · `bodoniModa` · `italiana` ·
`marcellus` · `anticDidone`.
Fontshare (Indian Type Foundry, free for commercial use, **self-hosted** in
`public/fonts`): `zodiak` · `gambetta` · `erode` · `bespoke` · `clash` · `cabinet`.

Adding a Google set = load with next/font in `fontSets.ts` + one `FONT_SETS`
entry. Adding a Fontshare set = add it to the WANTED list in
`scripts/fetch-fontshare.mjs`, run `node scripts/fetch-fontshare.mjs`, add a
`.kf-fs-*` class in globals.css, then the `FONT_SETS` entry. /type picks any of
them up automatically.

**Luxury typography = contrast AND space.** The Didone sets need room: headings
run at weight 400 with `letter-spacing: 0` and `line-height: 1.18`, and eyebrows
take `0.2em` tracking. Negative tracking or a heavy grade is what makes a
display serif look cheap — do not tighten these when adding pages.

Fontshare faces are self-hosted rather than CDN-linked so there is no runtime
third-party request. Not every family publishes every weight — the fetch script
warns when a requested weight is missing instead of falling back silently.

For the font tokens to scope per subtree, `globals.css` binds
`--font-family-*` on `*, ::before, ::after` rather than `:root` — a :root-only
binding freezes one set document-wide and the /type page renders identically.

### Three roles, two families

Load once in `themes/kokofresh/fonts.ts`; use the helpers in `globals.css`.
Do NOT set `font-family` ad hoc in a component.

| Role | Where |
|---|---|
| Body / UI | copy, buttons, labels, nav, form fields |
| Display | `h1`–`h4`, hero, section titles, prices |
| Accent — `.kf-accent` | pull quotes, signatures, taglines, short human lines |

The accent is the display face's italic, so it costs no extra request.

Helpers: `.kf-accent` (italic serif) · `.kf-eyebrow` (DM Sans caps kicker above a
heading) · `.kf-numeric` (tabular figures) · `.kf-pullquote` (large italic serif).

**Restraint is the rule.** Three faces is the practical ceiling and an accent
only works when rationed — use it for short human moments, never body copy or
UI. Currently: footer tagline, brand-story signature, bundle taglines.

Why italic rather than a script: it comes from the family already loaded (no
extra request) and italic Garamond is the classic editorial signature. A script
face (Great Vibes, Dancing Script — the legacy site used the latter) reads
wedding-invitation and is flagged as dated.

Cormorant renders optically small and light — headings need the size bump and
weight 500–600 set in globals.css. Heavier grades muddy its high-contrast strokes.

## Rich / luxury surface treatment

Depth comes from **hairlines and space**, never resting shadows. Astryx puts a
card-in-a-grid at elevation `none`; a resting shadow reads as Material and
cheapens the surface.

- **Cards**: Astryx `ClickableCard` already draws the border, 30px radius and
  clipping. The inner `<article>` must stay `border: 0; background: transparent`
  — a square 1px border inside a rounded card paints visible horizontal lines
  across the corners. Hover styling targets `.kf-card-link:hover .astryx-card`
  (lift 2px + border darken + `--shadow-low`), never the inner element.
- **Sections**: `padding-block: clamp(3.5rem, 8vw, 6rem)`. Space is the main
  luxury signal; do not tighten it.
- **Texture**: cream sections carry a 4px radial-dot pattern at 0.45 opacity so
  the fill does not read as a default background-color.
- **Gold** (`.kf-rule`): rationed to hairline rules and small marks only. Never
  gold text or gold fills — that tips into gaudy immediately.
- **Measure**: body columns capped at `62ch`.
- **Layout**: prefer asymmetric splits over centred stacks. Everything-centred
  is a generic-design tell (see `.kf-story-grid`, a 1:2 rail/body split).
- **Drop cap**: `.kf-story-lead::first-letter` — an editorial signal that costs
  nothing.

**Header**: the real brand mark is self-hosted at
`public/brand/kokofresh-logo.webp` (1080x1080) and referenced from
`config/brand.json`. It renders as a plain `next/image`, NOT inside `NavIcon` —
that component's circular chip crops a logo that already carries its own shape.
The wordmark takes the display serif via `.kf-header [class*='astryx-top-nav-heading']`
because `TopNavHeading` only accepts a string, so it cannot be wrapped.

Every one of these respects `prefers-reduced-motion`.

## Phase 4 notes — shop + PDP

- **Filter state lives in the URL**, not React state, so every filtered view is
  linkable and server-rendered. `/shop` has **no default category** — the legacy
  shop silently defaulted to "Best Sellers" and hid most of the catalogue.
- **One canonical product URL.** Reaching a product under the wrong collection
  `redirect()`s to `/shop/<primaryCollectionSlug>/<slug>` — a 308, never a 200.
- Astryx API gotchas found here: `BreadcrumbItem` takes its label as
  **children** (not `label`), and `Collapsible` uses **`trigger`** (not `title`)
  plus a `value` when inside a `CollapsibleGroup`.
- `sortProducts()` in `lib/api/products.ts` mirrors the backend's sort so pages
  behave identically before and after the live swap. Out-of-stock always sinks.

## Shop page — parity with the legacy filter bar

The legacy `ShopClient.tsx` (1296 lines) carried four things the rebuild had
dropped. All four are back, matching the old behaviour:

| Feature | Where |
|---|---|
| Search box | `.kf-search` in `ShopFilters`, debounced 300ms into `?q=` |
| Sort select | already existed — `?sort=` |
| Price bands | `lib/shop/priceBands.ts`, `?price=` |
| "Shop Bundles" button | beside the `<h1>`, `.kf-shop-bundles` |
| "Save More with Bundles" strip | foot of the grid, `.kf-bundle-strip` |
| "View All Products" | `.kf-view-all` — **only when a filter is active** |

"View All Products" clears the filters (`href="/shop"`) rather than navigating
somewhere new, and is hidden on an unfiltered `/shop` where it would do nothing
— same as legacy.

**Price bands live in `lib/shop/priceBands.ts`, NOT in ShopFilters.** That is a
`'use client'` module: a server component importing a constant from it gets the
client reference, not the value, and `PRICE_BANDS.find` throws
"is not a function" at render. Plain data shared across the boundary needs a
plain module. The four bands (under ₹100 / ₹100–200 / ₹200–500 / ₹500+) match
the legacy ones so a returning customer finds the filter they know.

Bounds are in **paise** and compare against `priceFrom` — the figure the card
shows — so a product lands in the band the customer actually sees.

Search state still lives in the URL like every other filter; the input keeps
local state only so typing is not a route push per keystroke.

## Badges over photography

**Astryx's `Badge` is a ~20%-opacity tint.** That is legible on a flat panel and
unreadable over a product photo — "Bestseller" / "Single Estate" were washing
out into the image. `.kf-product-ribbon [class*='astryx-badge']` repaints it as
an opaque brown pill (white on `#33240F`, 15.0:1) with a small shadow, so it
holds over any photograph. Never rely on a translucent badge above an image.

`.kf-soon` is the out-of-stock marker: a dashed chip sized to the buy row's
height so an out-of-stock card keeps the same silhouette as its neighbours
rather than ending in a stray grey sentence.

## Native select arrows

Every `<select>` needs `appearance: none` plus an inline-SVG chevron — the
native arrow cannot be positioned and sits visibly off-centre. Applies to
`.kf-weight-select` and `.kf-sort-select`; both use the same 12px chevron.

## Shop filter bar layout

Four stacked rows: search, TYPE chips, PRICE chips, then count + sort.

- **Search is capped** (`min(420px, 100%)`). Full width read as a page-level
  control and swamped the bar.
- **Both chip rows carry a label** (`TYPE` / `PRICE`, `.kf-filter-label`). The
  category row had none, so its chips started at x=0 while the price chips
  started after the word "PRICE" — the two rows were visibly out of line.
- **The sort row groups its controls right.** `space-between` spread count /
  sort / Clear across 1200px, leaving wide gaps either side of the sort control;
  `margin-inline-start: auto` on `.kf-sort` pushes it and everything after it
  into one group, count alone on the left.
- **`.kf-sort-select` must NOT be in the `--kf-control-h` group.** That is the
  44px buy-row height; beside 36px chips it made the sort the tallest thing in
  the bar.
- **A `<select>` sizes to its LONGEST option**, not the selected one, so verbose
  labels widen the closed control and leave a gap before the chevron. Fix it by
  shortening the option labels ("Price: low first"), NOT with `max-width` —
  a cap ellipsises the selected label ("Price: low t…"). Note `scrollWidth`
  does NOT report a select's internal ellipsis, so verify by screenshot.

## Product card — parity with the legacy card

Checked field-by-field against `../KokoFresh_website-main/components/ProductCard.tsx`
(630 lines). The card carries: ribbon · veg mark · title · rating · spice
chillies · price + strikethrough + % OFF · unit price · weight select ·
Add to cart (with cart icon). Unavailable products get **Notify me**.

**Unavailable cards are inert.** Legacy swapped `CardWrapper` from `Link` to
`div` when coming-soon/out-of-stock so a click could not land on a product page
that cannot sell. Here the inert branch renders **`Card`** (the non-clickable
sibling of `ClickableCard`), NOT a plain `<div>` — border, radius and clipping
come from the card component, so a bare div renders edge-less next to its
neighbours. Only the Notify Me button stays live. `CardBody` is shared by both
branches so they cannot drift apart.

**The buy row must never overflow the card.** Flex children default to
`min-width: auto` and will not shrink below their content, so a `nowrap` label
pushes straight past the card edge. The row sets `min-width: 0` on itself and
its children. The weight select is a fixed **68px** — wide enough for "1000g",
and no wider, because every extra pixel there truncates "Add to cart" to
"Add to…" in a ~194px grid column.

**Astryx Button has no stable label class.** Its label sits in a StyleX-hashed
span (`class="xjp7ctv"`), so a `[class*='astryx-button-label']` selector matches
nothing. Give the button room rather than trying to hide its label.

Coming-soon cards show **only the Notify me button** — no "Coming soon" chip or
status line. The ribbon at the top of the card already says it, and a bordered
pill at button height read as a second, disabled control. Status is not a
button; never restore that chip.

## Full-bleed bands

A band that spans the viewport must be a **sibling of `.kf-container`**, not a
child. Breaking out from inside it fights both the container's `max-width: 80rem`
and the Astryx `VStack`'s flex sizing — a `margin-inline: calc(50% - 50vw)` child
still measured 1200px of 1440px. Rendered as a top-level band it is simply
`width: 100%`, with `padding-inline: max(gutter, (100% - 80rem)/2 + gutter)` to
keep its text on the container's grid. Avoid `100vw`: it counts the scrollbar and
introduces a horizontal scroll.

Container gutters are `clamp(16px, 4vw, 40px)` — a flat 16px left content pinned
to the edges of a wide screen.

## Card grids — a card is the same size at any result count

**Never use Astryx `Grid` with `repeat: 'fit'` for a variable-length card list.**
`auto-fit` COLLAPSES empty tracks and stretches the surviving cards across the
full row. Measured on /shop before the fix:

| results | card width | card height |
|---|---|---|
| 22 | 230px | 480px |
| 10 | 230px | 480px |
| 2 | **594px** | 819px |
| 1 | **1200px** | **1405px** |

A one-result filter rendered a single card filling the entire page.

Use `.kf-product-grid` / `.kf-card-grid` instead — plain CSS grid with
`repeat(auto-fill, minmax(<min>, <max>))` and `justify-content: start`.
`auto-fill` keeps the empty tracks, so two results are two normal cards with
space to their right. The `max` in `minmax` is what caps the card; without it
`auto-fill` still stretches.

Applies to: the shop/collection/PDP product grid, and the home page's bundle and
collection grids. Fixed-count content (footer columns, trust badges, value
props) can keep `repeat: 'fit'` — there is no variable count to guard against.

Below 560px every card grid drops to `1fr`: a fixed-width card on a phone leaves
dead space, and with one column per row there is no inconsistency to prevent.

## Bundles — parity with the legacy pages

Checked against `../KokoFresh_website-main/app/shop/bundles/page.tsx` (320 lines)
and `components/BundleProductDetails.tsx` (962 lines).

**Listing (`/shop/bundles`)** carries, in legacy order: H1 "Mix & Match Bundles"
+ its sub-copy · 4-step "how it works" · bundle cards · "Compare Our Bundles"
table · "Why Choose Our Bundles?". All copy is the legacy text verbatim.

**Detail (`/shop/bundles/[slug]`)** adds the trust row (Freshly Ground · No
Preservatives · Best Value) and the six-question FAQ below the configurator,
with **FAQPage JSON-LD** built from the same `BUNDLE_FAQS` array the UI renders,
so the two can never disagree.

`BundleSteps` draws the four steps as **beads on a dotted line**, not four
cards — they describe one journey. The line is hidden once the steps wrap.

The comparison table is **data-driven** off `bestFor` / `lasts` / `giftReady` on
the Bundle type; legacy hardcoded three columns. It scrolls inside
`.kf-compare-scroll` (never the page) with a sticky first column.

**Pick tiles use `object-fit: contain`**, not cover — these are packet shots and
cropping cut the tops off the pouches. Products with no image show initials on
the brand ground (5 in the catalogue today), matching ProductCard; an empty box
read as broken.

**The configurator uses NUMBERED SLOTS, not a grid of togglable products.**
This is the legacy interaction and it reads far better: each slot is a labelled
card ("Signature Masala Blend 1") that starts empty with a + / "Tap to choose",
opens a picker dialog on click, then shows the chosen product's photo, name and
a check badge. The customer watches their box fill. A flat grid of every product
reads as a catalogue, not a bundle.

Slots are **positional** — assigning to slot 2 replaces what sat there. `picks`
stays a flat array so `lib/validations/bundle` is untouched; the slot index is
just the position among that rule's picks.

**Layout is the legacy one: card LEFT (340px, sticky), picker RIGHT.** The rail
carries the bundle photo, name, tagline, a "Premium Collection" rule and the
What's Included checklist. It holds still while the picker, About, compare table
and FAQ scroll past — verified pinned at top=24 from y=600 to y=3000.

For the rail to stick, the page's lower content is passed to
`BundleConfigurator` as `children` so it renders INSIDE the scrolling column.
`align-self: start` is required — a stretched grid item is full-height and
cannot stick.

**The detail page's lower content** (`BundleAbout`) carries the legacy copy from
`types/bundle.ts`: About This Bundle · benefits (heading varies per bundle:
"Why You'll Love It" / "Perfect For" / "Why Choose This") · Smart Shopping Math ·
testimonials · Quick Prep Ideas — all optional fields on Bundle, so a bundle
without them renders nothing. The compare table repeats here with
`currentSlug` highlighting the bundle being viewed.

CTA reads **"Add Customized Bundle to Cart"** when complete, as legacy did.

## Motion

Reveals use **native CSS scroll-driven animation** (`animation-timeline: view()`)
— off the main thread, no JS, no CWV cost. Guarded by
`@supports (animation-timeline: view())` AND
`prefers-reduced-motion: no-preference`, so an unsupported browser never runs it
and content is never left invisible. Verified: every panel ends `opacity: 1`
after scrolling past.

Durations stay in the **200-500ms** band (current research consensus); slower
reads as lag, not polish. Slot selection settles with a 260ms scale confirm.

**Always size list SVGs explicitly.** `.kf-list-icon` was lost in a CSS edit and
the unsized icons expanded to fill their column — the page went from 3.4k to
9008px tall with giant tick marks.

## Size & icon consistency rules

- **Heat = chillies, not dots.** `ChilliIcon` in `components/icons`, rendered
  `level` times (not 5 with greyed-out ones — that implies something missing
  rather than "mild"). 14px, red pod with a green stem.
- **One card silhouette.** Media is a fixed square/ratio, the body flexes, and
  the price row carries `.kf-product-foot` / `.kf-bundle-foot` with
  `margin-block-start: auto` so prices line up across a row regardless of how
  many lines the title takes. Titles clamp with `maxLines={2}`.
- **Card body padding is always `padding={4}`** (16px). Section-level padding
  (5, 8) is separate and fine.
- **Controls in a buy row are 44px tall** via `--kf-control-h`, applied through
  `.kf-buy-row` so the size selector, quantity stepper and button share one
  baseline. Chips are 36px.

## Phase 5 notes — bundle configurator

`components/commerce/BundleConfigurator.tsx` + `lib/validations/bundle.ts`.
One component renders ANY bundle the backend describes — the legacy site had
three copy-pasted 962-line pages.

- **Picks are an array**, not fixed slot keys. Legacy used
  `masala1..masala4` / `chutney1..chutney4` with hardcoded `> 2`/`> 3` checks
  and physically could not express a 5-pick rule. Verified: a 5-pick rule works
  with zero code changes.
- **Rules resolve by collection slug**, never by matching words in a product
  name. `validateSelection()` rejects a pick whose product does not actually
  belong to that collection.
- **Submit is disabled until valid**, and the label says what is missing
  ("Pick 4 more"). Legacy let you click and then toasted a wrong item count.
- At a rule's limit the newest pick **replaces the oldest** in that group, so a
  click always registers rather than silently doing nothing.
- Pricing is `bundle.price` from the API. When `/pricing/quote` lands it must
  price the actual picks — do NOT compute bundle totals client-side.

## Phase 6 notes — cart, pricing, checkout

**No Wix anywhere.** Dependencies are Astryx, Next, React, React-DOM, Zod only.
Checkout posts to `/api/v1/checkout` (Frappe) which returns a hosted gateway URL.

- **`OrderSummary` is the only place totals are displayed**, and every figure
  comes from `getQuote()`. Never add up a cart in a component — that is exactly
  how the legacy site showed three different shipping figures for one order.
- `config/commerce.json` holds display hints (free-shipping note) and the
  **COD on/off switch**. Thresholds there are for nudge copy only, never maths.
- **Payment is a hosted redirect.** `createCheckout()` returns `paymentUrl`;
  COD returns `null` and a confirmed order. No card data touches this frontend.
- Checkout validates with `lib/validations/checkout.ts` — 6-digit PIN, Indian
  mobile (tolerates `+91` and spaces). Errors are per-field via `TextInput`'s
  `status` prop; `Field` is only for custom controls.
- Cart state is `lib/cart/CartProvider.tsx`; every mutation round-trips through
  `lib/api/cart`, so the cart stays server-owned.
- `NEXT_PUBLIC_SEED_CART=1` seeds a dev cart for reviewing these screens.

## Phase 7 notes — account

Security fixes carried over from the legacy audit, all verified:

- **No tokens in JS.** Session comes from Frappe's httpOnly cookie via
  `getSession()`. Legacy stored access AND refresh tokens in js-cookie, so any
  XSS handed over a long-lived refresh token.
- **Auth guard lives in `app/(account)/account/layout.tsx`**, so no page under
  /account can forget it. Verified: signed out, `/account` → 307 `/login?next=`.
- **Open redirect blocked.** `?next=` only honours same-site paths
  (`startsWith('/')` and not `//`). Verified `?next=https://evil.com` does not
  redirect off-site. Legacy `/auth/callback` redirected to an unvalidated
  absolute URL read from localStorage.
- **Orders are session-scoped** — the endpoint takes no customer id. Legacy
  `/api/first-order-coupon` skipped auth entirely when a `contactId` was passed.
- **Wishlist is server-persisted** (`lib/api/wishlist.ts`). Legacy was
  localStorage-only: `useApiStorage` was initialised false and never set true,
  so a wishlist never survived a device change despite requiring login. The
  heart on `ProductCard` also had no onClick at all — it was decorative.

Dev switches: `NEXT_PUBLIC_MOCK_SIGNED_IN=0` to review signed-out screens.

## Phase 8 notes — blog

- **Per-post SEO overrides work and are verified.** `post.seo` feeds
  `withSeoOverrides()`, so the content team controls title, description,
  robots, canonical, keywords and arbitrary JSON-LD per post. A post without an
  override falls back to its own title/excerpt. Frappe MUST expose equivalents
  to the old Wix SEO panel or rankings regress.
- **Real ISR (900s) + `generateStaticParams`.** The legacy blog shipped
  `revalidate = 0` AND `dynamic = "force-dynamic"` — dev config in production,
  which defeated static generation and hit the backend on every request.
- Schema verified rendering: Organization + BlogPosting + BreadcrumbList.
- `.kf-prose` carries article typography: 66ch measure, 1.75 leading, display
  serif headings. Post HTML comes from the CMS already sanitised.

## Palette — lightened 2026-09-16

User found the original palette too dark. Changes, all AA-verified:

| token | was | now |
|---|---|---|
| background-body | #FFF8E1 (94%) | **#FFFCF5** (97%) |
| background-card | #F6E6CB (80%) | **#FDF4E3** (91%) |
| text-primary | #3B2B13 | **#4A3826** (warm brown, not near-black) |
| text-secondary | #6B5D52 | **#7D6C5C** |
| border | #E7D4B5 | **#EFE2CC** |

Body/card separation dropped 13% -> **6%**, which is what makes alternating
sections read as a soft change of light rather than a heavy band.

**Accent is overridden explicitly.** Astryx derives a very dark `#9A4600` for
maximum contrast; we set `--color-accent: #C25510` and
`--color-text-accent: #B34E0C` so it reads as orange, not brown. Contrast:
text-accent 5.11 on body / 4.79 on card — both past AA. `--color-accent` at 4.45
is for button FILLS (white text sits on it), which is why the link colour is a
separate, darker token.

Re-check contrast with the node snippet pattern used in this file's history
before changing any colour.

## Cart mechanics

`FreeShippingNudge` ranks suggestions by whether they actually close the gap —
cheapest product that crosses the threshold first, falling back to the ones that
get closest. **The legacy version shuffled a pool and took one at random with no
price check**, so it frequently suggested something that left the customer short.

The threshold in `config/commerce.json` is a DISPLAY HINT for the nudge only.
Every real figure still comes from `getQuote()`.

`CartDrawer` opens from the header cart icon so adding to cart never costs the
customer their place on the page. `/cart` still exists for direct visits.

## Reviews

- **Only APPROVED reviews are ever returned or averaged.** A pending review is
  invisible to everyone until moderated. Verified in the fixtures: `rev-006` is
  pending and does not render.
- **Product JSON-LD takes its rating from the approved reviews**, not from a
  fixture field — so what Google sees matches the page. A product with no
  reviews emits **no `aggregateRating`** at all rather than a fabricated one.
  Verified on jaggery-powder.
- `/leave-review` accepts `?product=&name=` so the WhatsApp review request can
  deep-link into a prefilled form.
- Submissions land as `pending`.

## Light/white surfaces

White (`--color-background-surface`) now does real work rather than being
defined and unused:

- **Cards sit on white**, not cream. White is ~9% lighter than the page ground,
  so a card reads as a distinct object and product photography gets a neutral
  surround. Contrast improves too: ink 11.14 on white vs 10.20 on cream.
- **Sections alternate cream / white** (`.kf-section--cream` /
  `.kf-section--white`) so the page breathes instead of being uniformly warm.
- Media wells inside cards stay cream — a tinted panel above a white body.

**Selector gotcha:** `.kf-card-link` IS the `.astryx-card` element, not a
wrapper around one. `ClickableCard` puts className on the card itself, so
`.kf-card-link .astryx-card` matches nothing. Target `.kf-card-link` directly.

All six text/ground pairs pass AA on both white and cream.

## Palette & texture — current state

**Light, warm, single scheme.** Both halves of every `light-dark()` pair hold
the same value, so the design never changes with the viewer's OS.

| token | value | note |
|---|---|---|
| background-body | `#FBF3E4` | ~90% lightness — deliberately NOT near-white |
| background-card | `#F4E7CE` | |
| background-surface | `#FFFDF8` | warm off-white, not pure white |
| text-primary | `#33240F` | deep warm brown |
| accent | `#C25510` / text `#9A4600` | |

**The warmth is the brand.** An earlier pass took the body to `#FFFCF5` (97%)
and it washed out — the site stopped reading as a spice brand. Keep the grounds
in the 80-90% range.

**Texture everywhere.** `body::before` carries a fixed two-layer dot grain
(3px + 7px, offset) at ~5.5% alpha; `.kf-section--light::after` and
`.kf-footer::after` carry a slightly stronger version. Below ~2% effective
alpha it is invisible — an early attempt used 1.7% and did nothing.

Contrast verified: 5.3-14.8 across all text/ground pairs.

## Home page — live-site parity conventions

- **`.kf-section--brown`** paints a section on the brand's dark ground and
  re-points the text/border tokens, so anything inside flips to light-on-brown
  automatically. It carries its own grain. Used for the brand story — one dark
  moment on the page, never the whole background.
- **`.kf-h-alt`** wraps the trailing words of a heading so they drop to a
  lighter tan — the live site's dual-tone treatment ("Explore Our *Collections*",
  "Not Your *Average Masala*").
- **Cards use a 2px border**, matching the live site's heavier edge. This is set
  in the THEME (`components.card.base.borderWidth` in `kokofreshTheme.ts`), not
  in CSS — StyleX guards its rules with repeated `:not(#\#)` for artificial
  specificity and drives the border off a `--border-width` variable declared on
  the card element itself, so no plain class selector can win. Run
  `pnpm exec astryx theme targets card` to see what a component accepts.
- **`.kf-card-link` carries `overflow: hidden`.** The product media is a square
  that fills the card's full width at the very top, so without clipping it
  paints over the 30px rounded corners and the top border disappears — seen as
  the border "hiding at the top" on hover, when the colour change draws the eye.
- **Save badges are dark brown** (`#33240F`), not green.
- **Product cards carry the full commerce row**: weight `<select>`, add-to-cart,
  discount chip, and unit price (`₹140.00/100 g`). `ProductSummary` now includes
  `variantOptions` so the card can offer sizes without fetching the product.
- Contrast on brown verified: 6.7-13.0 across all pairs.

## Parallax — pinned, not drifting

The brand-story section (`components/sections/BrandStory.tsx`) uses a **pinned**
backdrop: a `position: fixed` image revealed through the section like a window,
so the copy scrolls over a stationary photograph. `clip-path: inset(0)` on the
section turns the fixed layer into a local pin.

**This is the effect the user asked for.** An earlier pass used transform drift
(elements moving at a different speed via `--kf-parallax`); the user rejected it
twice — "it is not parallax", "it is jumping". Drift was removed from the hero
and the grids. Do not reintroduce it.

Deliberately NOT `background-attachment: fixed` — iOS Safari ignores it.

**Two gotchas, both hit in practice:**

1. `.kf-section--brown` paints an opaque `#33240F`, which would cover the fixed
   image. `.kf-pinned:has(.kf-pinned-media)` makes it transparent and the
   `::before` scrim becomes the ground. The mobile fallback hides the media but
   the element stays in the DOM, so `:has()` still matches — the brown fill has
   to be restored inside that media query or the section renders with no
   background at all.
2. **The section AFTER a pinned one needs its own background.** Sections are
   transparent and inherit the page ground, but a fixed layer paints relative to
   the viewport, so it shows through any transparent box overlapping it — seen
   as a strip of photo bleeding past the bottom edge. Hence
   `.kf-pinned + .kf-section { background: var(--color-background-body); }`.

Disabled below 767px (compositing cost, and the effect needs viewport height).

**Header stacking:** AppShell's sticky header ships with **`z-index: 1`**, so
page content painted over it while scrolling. Fixed by raising
`[class*='astryx-app-shell-header']` to 30. A rule on `.kf-header` inside it
cannot fix this — the stacking context belongs to the ancestor.

## Button colour — brown fill, orange accent

**Primary buttons are the ink brown `#33240F` with white text** (15.0:1), not
the orange accent. **Secondary is an outlined brown button** — 2px solid
`#33240F`, transparent fill, brown label.

Both are set in the THEME under `components.button`
(`variant:primary` / `variant:secondary`), NOT in CSS — see the card-border note
for why StyleX specificity makes CSS the wrong lever. Run
`pnpm exec astryx theme targets button` to see what the component accepts.

**Do not change `--color-accent` to brown.** It also drives links, icons, focus
rings and the spice-heat chillies, which stay orange; scoping to the button is
the reason these live under `components`.

Two gotchas hit here:
- Astryx's `secondary` ships a translucent dark fill that reads as **grey** on
  cream, and has **no border at all** — so setting `borderColor` alone leaves
  bare text. It needs explicit `borderWidth` + `borderStyle`.
- The active filter chip (`.kf-chip[data-active]`) is plain CSS, so the theme
  does not reach it. It is set to the same `#33240F` by hand — keep the two in
  sync or the page grows a second filled-control colour.

**One filled colour per page.** Every filled control is brown; the orange accent
now does lighter work (links, the "18% OFF" chip at 12% tint with `text-accent`
text, 5.44:1). The discount chip used to use `--color-error`, which rendered
pink — a discount is not an error, and red is foreign to this palette.

## Brand story copy

The live site's story section has **no heading and no eyebrow** — just the two
paragraphs and the signature. Do not add one; an earlier pass invented "From our
home to yours" and it was wrong.
