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

## Policy pages — legacy layout and copy

**Sections may declare a `layout`, and the privacy and shipping pages use it.**
The legacy did not run one flat column — it alternated grid shapes so a long
policy stays scannable: a 4-up icon grid for data types and shipping features,
2-up accent bars (gold left rule, no card) for usage and responsibilities, 3-up
cards for rights and delivery issues, `pair` for security/retention, and
`levels` for the escalation matrix (dark header strip over a contact list).
A section with no `layout` keeps the plain prose card, which is what the refund
page still uses throughout.

Items carry `icon` as a STRING key, resolved through the `ICONS` map in
PolicyPage, so content JSON stays free of components. An unknown key falls back
to the document mark rather than rendering nothing.

**`layout` is typed as `string`, not a union.** A JSON import widens string
literals, so a union cannot be satisfied from the content file; the renderer
narrows at the point of use and falls back to a grid.

**`.kf-policy-level-title` must state its colour.** A later heading rule sets
the ink brown — which is the level header's own background — so the title
rendered invisible against it. The three headers also take a `min-height`,
since one title wraps to two lines and left the others short.

**Two measures, not one.** The legacy alternated `max-w-4xl` (896px) for
prose and `max-w-7xl` (1280px) for the grid sections. Locking everything to the
narrow measure left the card grids cramped with dead space either side —
`.kf-policy-narrow` and `.kf-policy-wide` now carry the two, and both need
`width: 100%` because the sections sit in a `VStack` whose flex children
shrink-to-fit rather than stretching (the wide containers were rendering at
422-979px, their grids' natural width).

**Built from Astryx, not hand-rolled markup.** `Card` supplies the card
chrome, `Grid` the columns and gaps, `VStack`/`Text`/`Heading` the rest — an
earlier pass hand-rolled 47 raw elements with bespoke CSS for all of it, which
is exactly what the project rule forbids. The remaining CSS is visual
treatment only (accent bar, level header strip, icon sizing).

**Layout follows the legacy's three-part shape:** a dark hero band, each
clause in its OWN bordered card on a narrow measure, then a dark closing band
with a route back into the shop. Ours was flat prose on one background.
`PolicyPage` stays the single shared shell — the legacy had three separate
294-466 line files that had drifted (only two carried a closing CTA, and each
hero used a slightly different gradient).

The hero uses the brand ink rather than the legacy's pure black, so it matches
every other dark band on the site, and the closing CTA takes
`.kf-pill-btn--on-ink` (cream on brown) because the usual brown primary would
vanish against it. The closing block is content, in each JSON's `closing` key.

**Two rules need compound selectors to win.** `.kf-container.kf-policy-inner`
for the 56rem measure and `.kf-section.kf-policy-body` for the reduced top
padding — `.kf-container` and `.kf-section` are both declared later in the
file, so a single class loses and the change silently does nothing (the
measure stayed 1280px and the hero gap stayed 96px until this was fixed).

## Policy pages — legacy copy

`/privacy-policy`, `/shipping` and `/refund-policy` carry the legacy pages'
full text, not summaries. They were ~5-section précis; the legacy pages were
294-466 lines of real policy, and short paraphrases of legal copy are a
liability. Now ~2,100-2,700 rendered words each.

- **Privacy cites the DPDP Act 2023** and names CKG Flavorz Foodtech Pvt Ltd,
  with the three-level escalation matrix (support → operations head →
  executive team) and its real addresses. Legal copy: do not paraphrase.
- **Refund keeps the legacy's 10 numbered sections** verbatim, including the
  24-hour reporting window and 7-10 day refund timeline.
- **Shipping keeps its FAQ block.** It feeds FAQPage JSON-LD on that route —
  dropping it loses the rich result. Rewriting the JSON without it broke the
  build (the page reads `content.faq`), which is how it was caught.

**`.kf-prose` restores list markers.** The Astryx reset strips
`list-style-type` site-wide, which is right for nav and card lists but left
policy clauses reading as loose indented paragraphs. Discs and decimals are
restored inside `.kf-prose` only — verified the footer/nav lists still
compute `none`.

## Footer — legacy parity

Four columns, as the legacy footer had: **Quick Links** (Home · Shop · Blog ·
About Us · Contact) · **Why Choose Us** (the four promise claims) ·
**Contact Info** · **Follow Us**. Policy links sit as small print in the
bottom row beside the copyright, in the legacy order: Privacy Policy ·
Shipping Policy · Refund Policy.

**There is no Terms link, because the legacy site had no terms page.** It
shipped exactly three policy pages (`/privacypolicy`, `/refund`, `/shipping`).
Our `/terms` route still exists and renders — it is unlinked rather than
deleted, since removing a live URL that may be indexed is a separate,
redirect-shaped decision. Do not add it back to the footer without being asked.

`footerLegal` in `config/nav.json` holds those links, validated by
`config/nav.ts` and exposed through `getSiteConfig()` like `footerNav`, so the
white-label seam covers them too.

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

**The bundle detail page uses `.kf-container--wide` (86rem).** At 80rem it left
~80px dead on each side of a 1440 viewport while squeezing the slots.

**The sticky rail holds ONLY while picking.** The lower content (trust, About,
compare, FAQ) is rendered OUTSIDE `BundleConfigurator`, so the rail scrolls away
once there are no picks left to make. Rendering it inside made the rail follow
the reader down a long article, which is not what a summary rail is for.

**The right column is a STACK OF CARDS**, matching legacy: price card (with the
save pill) · "Build Your Bundle" card holding the steps AND the
"Add Customized Bundle to Cart" CTA · three trust cards · About / Why / Quick
Prep panels. Loose content on the page ground was the wrong read — the cards
give the column rhythm and make each block feel like a step.

The trust badges and content panels render INSIDE the configurator's scrolling
column (passed as `children`). That is also what gives the sticky rail enough
height to hold against: with them outside, the grid ended early and the rail
released mid-read.

**Heading icons match the legacy set** (Lucide, in `components/icons`): Package
on "Build Your Bundle", Info on "About This Bundle", Sparkles on the benefits
list, ChefHat on "Quick Prep Ideas", TrendingDown on "Smart Shopping Math",
Gift on "What's Included", HelpCircle on the FAQ. `.kf-panel-icon` sizes them
to the heading (`1.1em`) so they scale with the type.

**The flash-sale badge animates with a slow glow**, not the legacy
`animate-pulse` strobe — 2.4s ring on the accent plus a gentle sparkle scale.
Guarded by `prefers-reduced-motion`; static otherwise.

**Do not use Astryx `DialogHeader` for a long label.** It renders the title at
display scale and it overflowed the dialog's rounded corners for
"Choose Signature Masala Blend 1". `.kf-picker-head` is a plain sticky header
with a small-caps UI label and a close button.

**Never write `position: relative` on `.kf-bundle-summary`.** The flash-sale
badge was anchored with exactly that, later in the file than the sticky rule —
and it silently overwrote `position: sticky`. The rail stopped pinning and
nothing errored. Sticky IS a positioning context, so an absolutely-positioned
badge anchors to it with no extra rule. If a child needs a positioning context
on the rail, it already has one.

**Heading icons are `0.8em`**, not `1.1em` — on a 20-28px heading the larger
size read as a second glyph competing with the type. `.kf-build-title` also
needs `.kf-bundle-picker` specificity, because the 28px step-heading rule
otherwise reaches it (it is an h2 inside the picker) and inflates its icon.

**Sticky elements must not animate.** Current guidance is to keep a sticky
element's motion minimal — a sidebar that moves while it is meant to be the
fixed reference reads as a glitch. The scroll reveal belongs to the cards
passing it, never to the rail.

**The rail is the page's anchor card** — 4:3 bundle photograph, 26px heading,
2px border and a soft gradient. It was briefly shrunk to help it stay pinned;
that is no longer necessary now the right column carries the trust cards and
content panels, and the bigger card is the better design.

**About / Why / Quick Prep stack one after another**, full width of the column.
Side by side halved the measure and made the reading order ambiguous.

**A sticky rail taller than the viewport scrolls away regardless.** The rail hit
873px against a 913px viewport and released mid-pick. Fixed by trimming its
contents (image capped at 160px, tighter gaps, 22px heading) to ~718px rather
than giving it `overflow-y: auto` — a rail you must scroll to read the price
defeats the point of pinning it. Sticky also cannot outlive its container, so
the rail correctly releases when `.kf-bundle-grid` ends.

**Step headings are 28px, not the theme default 40px.** Prata is a
high-contrast display face; at 40px "1. Pick 4 Signature Masala Blends" was
nearly the size of the 64px page title and crowded the slots. The face stays —
only the scale changes, so the page keeps one voice.

**Slots use four fixed tracks**, not `auto-fit`. With `auto-fit` a 2-pick step
stretched its tiles to ~500px; with a fixed max they sat at 260px and left a
dead column. Three tracks keep every slot ~276px across all bundles, and a
2-pick step simply leaves one track empty.

**The bundle FAQ is open cards in two columns**, matching legacy — not an
accordion. Six short answers have nothing worth collapsing, and hiding them
behind clicks means most readers never see them.

**The framed preview updates live.** CSS variables do not cross a document
boundary, so the parent writes them into the iframe directly (same-origin).
Fonts are next/font classes on `<html>`, so the class list is swapped — every
set's classes are removed first or they stack. The brand name is markup rather
than style, but the frame is same-origin so its text is updated too. Without
all three, the preview only ever showed the SAVED theme, which is useless while
you are choosing.

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

## Header — search and sign-in

- **The search icon had NO handler at all.** It was an `IconButton` with
  neither `onClick` nor `href` — decorative. (`/shop` has its own working
  search box; only the header icon was dead.) It now opens `SearchOverlay`.
- **`SearchOverlay` reproduces the legacy `ProductSearch`**: popular searches
  and the shop categories in the empty state, live results debounced 250ms,
  arrow-key navigation and Enter to open the highlighted product. Categories
  come from `config/nav.json` via the layout, so they cannot drift from the
  menu. An in-flight response is discarded if a newer query started, or a slow
  request for "ra" would overwrite results for "rasam".
- **Search state is deliberately NOT in the URL here.** This is a
  jump-to-product affordance, not a filtered view; Enter with nothing
  highlighted falls through to `/shop?q=`, which IS linkable and
  server-rendered.
- **Sign-in was invisible** — a bare user icon labelled only "Account". The
  header now shows `.kf-account-link`: "Sign in" → `/login` when signed out,
  the customer's FIRST name → `/account` when signed in. The label is
  visually hidden below 720px, where it would crowd the icon row.
- `app/layout.tsx` calls `getSession()` for this. Verified it does NOT force
  the home page dynamic — it stays `○`.

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

**The header cart counter is NOT Astryx `Badge`.** It rendered a
~20%-opacity tint, so the number was a pale blob washing into the cart icon —
the same trap as product ribbons over photography. `.kf-count-badge` is now an
opaque brown disc with white text and a 2px ring in the header colour, so it
reads as a separate object wherever it overlaps the icon. Counts above 9 show
"9+" rather than widening the disc.

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
space to their right.

**`.kf-product-grid` caps the CARD, not the track.** A hard `max` in `minmax`
left ~420px of dead space at the right of a 1200px row while the filter bar
and divider above spanned it fully — the grid read as misaligned against
everything else on the page. It is now
`repeat(auto-fill, minmax(240px, 1fr))` with `max-width: 320px` on the card
itself: tracks share the row (four 291px cards reach the container edge
exactly), and the one-result guard still holds — verified a single search
result renders at 291px, not 1200px.

The regression suite asserts the INVARIANT (one width, between 200 and 400px)
rather than a specific pixel value, so a deliberate sizing change does not
read as a regression.

**The home collections grid is a fixed 2x2 of FOUR categories**
(`.kf-card-grid--quad`), matching the legacy home page: Signature Blends,
Heritage Chutney Powders, Everyday Superfoods, Single Origin Spices, then
"Shop All". Best Sellers is excluded — it has its own section directly above —
and the list is `.slice(0, 4)` so a backend that adds a sixth collection
cannot reintroduce a ragged last row.

The card itself is **SPLIT on desktop — image left, copy right**, as the
legacy `flex-col md:flex-row` card was. Stacked (image above text) a
full-width card makes the photograph enormous: the cards measured ~520px tall
and the section ran several screens. Split, they are 592x204 and all four fit
one view. Below 720px it stacks, as legacy did.

**`.kf-card-grid--centred` remains for variable-length grids.** Five
collections in three columns rendered as 3 + 2, left-aligned, with a
card-sized hole on the right.

`justify-content: center` on the grid does NOT fix this: with explicit tracks
the two leftover cards still occupy tracks 1 and 2, so the row sits
left-of-centre (measured 138/450 either side). The centred variant switches to
flex, which centres the ITEMS rather than the track set — 294/294 after the
fix. `flex: 0 1 300px` (360px for `--wide`) reproduces the grid's sizing, so
the equal-card-size rule still holds for any count the backend returns.

Applied to the home page's collection and bundle grids, both centred-heading
marketing sections. `justify-content: start` stays the default everywhere
else — the shop grid sits beside left-aligned content and must not centre.

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

## View transitions on tabs and filters

**`lib/motion/viewTransition.ts`** wraps `document.startViewTransition`, with
the reduced-motion and support checks in one place. The API is baseline across
all browsers now, so this replaces what used to need a library.

- **Product tabs cross-fade.** `flushSync` is REQUIRED around the state change:
  the transition needs the DOM already updated when its callback returns, and
  React would otherwise batch it and let the browser capture the old state
  twice. The panel carries `view-transition-name: kf-tab-panel`, and the root
  cross-fade is disabled so it does not double up.
- **Do NOT wrap `router.push` in it.** A Next navigation resolves after the
  callback returns, so the browser captures the old page as both frames and
  animates nothing. The shop grid instead carries a `key` built from the
  active filters, so React remounts it and the cards replay their entry
  animation when results arrive.
- Verified: a tab click starts exactly one transition and switches the panel;
  under reduced motion it starts ZERO and the panel still switches —
  functionality kept, motion dropped.

## Scroll reveal — coverage

The reveal list was 23 hand-maintained selectors and still missed pages. It
now also covers, structurally:

```
.kf-section > .kf-container > *:not(:has(.kf-split)):not(.kf-split)
.kf-section > .kf-container > .astryx-v-stack > *:not(:has(.kf-split))…
.kf-product-grid > *, .kf-card-grid > *
.kf-reveal            /* opt-in for anything else */
```

Headings are excluded by the `:has(.kf-split)` guard — they have their own
split-text reveal and would otherwise animate twice.

**`/shop` needed the grid selectors named explicitly**: its markup is a bare
`.kf-container` with no `.kf-section` wrapper, so the structural rules missed
it entirely (0 animated elements before, 22 after).

Verified across 12 routes that nothing is left invisible after scrolling. One
reported "stuck" element is a false positive: `.kf-rule` is `opacity: 0.55` by
design, below the probe's 0.85 threshold.

## Split-text headings

`SplitText` (in `components/ui/SplitText.tsx`) splits a heading into words that
rise and un-blur one after another as it scrolls in — the reactbits split-text
reveal. It is plain markup with no hooks, so it works in Server and Client
components alike, and the motion is native scroll-driven CSS: no JS ships.

- **Words, not characters.** Per-character staggering on a display serif reads
  as a ransom note at these sizes and explodes the DOM.
- **Accessibility:** the whole string is rendered once in a `.kf-sr-only` span
  and the split copy is `aria-hidden`. Verified through the AX tree — each
  heading appears exactly once with its full text. `textContent` shows it
  twice, which is a probe artefact, not a bug.
- **Dual-tone headings** pass `startIndex={wordCount(lead)}` to the second
  half so the stagger continues across the `.kf-h-alt` span rather than
  restarting.

**Three ways of staggering that do NOT work**, all tried:
1. `animation-range: entry calc(6% + var(--i) * 2.5%) …` — a `calc()` is not
   valid in a scroll-range offset, so the range is dropped and every word
   snaps in together.
2. `animation-delay: calc(var(--i) * 90ms)` — a time delay does not apply to a
   view timeline.
3. `entry` as the range — it spans only the element's own height, so a
   one-line heading reveals across ~40px of scroll and the whole effect
   flashes past.

What works: literal per-position percentages on the **`cover`** timeline
(`.kf-split-word:nth-child(n)`), which spans the element's full pass through
the viewport. Measured: words progress 0 → 1 over ~250px of scroll, each
trailing the last.

**`.kf-rule--draw` animates on load, not on scroll.** Every `.kf-rule` in the
codebase sits within ~300px of its page top, so it is already on screen when
the page paints and a scroll-driven draw could never be seen. A 620ms
time-based draw is the honest version.

## Motion — hover and reveal (added after the animation pass)

**Never repeat a `:hover` selector with `transform: none` inside the
reduced-motion block.** Lightning CSS folds the two rules together and drops
the `:hover` half from the bundle entirely, so the effect never applies for
ANYONE — it looks like the CSS was ignored. Disable the `transition` instead,
and if a transform must be cancelled use a plain (non-`:hover`) selector with
`!important`. Cost me a long debug; the source looked correct throughout.

**Testing hover in headless needs a real mouse event.**
`CSS.forcePseudoState` did nothing here, and reading the rule back through the
CSSOM returns NOT FOUND because the stylesheet is cross-origin to the probe.
`Input.dispatchMouseEvent({type:'mouseMoved'})` over the element works —
`scratchpad/hover5.mjs` does this for both motion modes. Headless also
defaults to `prefers-reduced-motion: reduce`, so always emulate
`no-preference` explicitly or every effect reads as dead.

What was added:
- Section headings and the process/values heads rise with their content
  (`kf-rise-soft`), one beat ahead of the cards, so a section arrives whole.
- Cards stagger by position via `animation-range` on `:nth-child(2..4)` — no
  JS, so it stays free.
- Photographs settle out of a 1.04 scale as they enter (`kf-settle`).
- Product and bundle images zoom on card hover (collection and blog cards
  already did). The collection zoom was keyed on `.kf-collection`, the inner
  article, which is never the hover target — it had silently never fired.
- Icons in trust/value/info rows scale and warm; pill-button icons travel.
- The collection card's "Explore →" arrow is its own element so it can move;
  as a bare character in the label it could not.

Verified: nothing is left invisible on any page after scrolling
(`scratchpad/reveal-safety.mjs`), and every effect is inert under reduced
motion.

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

## Blog — parity with the legacy journal

Rebuilt against `../KokoFresh_website-main/components/blog/*` (8 components,
841 lines) and its `.blog-*` CSS. Listing: masthead band → tag pills →
featured lead card (spans the grid, image beside text) → 3-col grid →
"Load More Posts". Post: breadcrumb → boxed 480px photo hero under a scrim →
article beside a **sticky 340px sidebar** (product slider · brand story ·
follow) → share row top AND bottom → discussion → related strip.
Copy lives in `content/blog.json` (white-label).

**Tag filtering is a static route, `/blog/tag/[tag]`, NOT `?tag=`.** The
first cut read `searchParams`, and the build showed `/blog` flip from `○`
(static) to `ƒ` (dynamic): reading searchParams opts a route out of
prerendering, so the listing would be server-rendered on every hit instead of
served from the CDN — a CWV regression. Per-tag pages use
`generateStaticParams`, stay `●`, and give every tag a canonical URL for
search. An unknown tag is a 404, not an empty listing. This is still a
deliberate divergence from legacy, whose client-state filter made filtered
views unshareable and invisible to search. "Load more" stays client-side over
the already-fetched list (9, then +6) exactly as legacy did: revealing more
posts costs no request. `getPosts` takes `pageSize: 60` so the whole list is
there.

**Check the route symbols in the build output after touching a page.** `○`/`●`
is prerendered; `ƒ` means it went dynamic. A page silently going dynamic is
easy to miss and costs the CDN.

**Comments follow the reviews discipline.** `lib/api/comments.ts` returns only
`approved`; a submission lands `pending` and is NOT appended to the visible
list — the reader is told it awaits moderation, which is the truth. `cmt-004`
in the fixtures is a rejected spam entry and must never render (verified: the
storage post shows 1, not 2). The form carries an off-screen honeypot field;
a filled one resolves silently so a bot cannot tell it was caught.
`'comments'` had to be added to `ApiResource` in `lib/api/client.ts`.

**The sidebar must clear a laptop viewport.** It measured 878px against 863px
and its last widget sat below the fold while pinned. Trimmed to ~819px (slide
media capped at 170px, widget padding 16px). It pins while the article scrolls
and releases when the grid ends — correct; a short post pins briefly.

**The related strip is a brown, grained band** (`kf-section kf-section--brown`),
not cream — it plays the same role as the shop's "Save More with Bundles" and
takes the same treatment, so the post page does not run cream → cream → cream
into the footer. The section's token overrides flip the cards to the dark
surface by themselves; no per-card colour rules. Title is dual-tone via
`.kf-h-alt` on the trailing word, split in the component so `content/blog.json`
stays the single source. The grid is `auto-fit, minmax(260px, 360px)` with
`justify-content: center`: two posts sit centred rather than left-aligned
beside an empty third column.

**Share buttons use the destinations' brand colours** (WhatsApp green, X blue)
— a deliberate exception to the no-literal-hex rule. A WhatsApp button reads as
WhatsApp because it is green; theming it would defeat the affordance.

**Article prose is full column width**, overriding `.kf-prose`'s 66ch. Legacy
parity, and the share row / comments / form span the column, so a narrower
text measure left an uneven right edge. Judgment call; revisit if long posts
read poorly.

**Posts need cover images.** None of the three mock posts had one and the whole
design is image-led. Covers are assigned from `content/hero-media.json`
thematically. A post without a cover renders an empty media box — give it one.

**Verifying images in screenshots:** await `img.decode()` on every card image
before capturing. next/image's first-time optimisation of a new width made the
featured card look blank in a capture while the DOM showed it complete and
correctly sized — a timing artefact, not a bug.

## PDP — gaps closed against the legacy product page

- **Quantity is a −/+ stepper (`.kf-qty`), not Astryx `NumberInput`.** That
  component renders NO visible step buttons, so the customer had a bare text
  field and nothing to press. The stepper is 44px (`--kf-control-h`), disables
  at 1 and 20, and the running total recalculates beside it.
- **Each trust badge carries its OWN icon** — Truck / ShieldCheck / ChefHat,
  the legacy set. Two of the three were `LeafIcon`, so "Free Delivery" and
  "Authentic Recipe" showed the same mark.
- **Product sections are TABS (`ProductTabs.tsx`), matching legacy** — story /
  ways to enjoy / nutrition / storage / why switch, **and Reviews as the last
  tab**, in one bordered card. Reviews is NOT also rendered as a section below;
  that would repeat the whole block.
  Tabs are right for this content specifically because the sections are wildly
  uneven: "Our story" runs several screens while "Storage" is two lines. Two
  other layouts were tried and rejected — a collapsed `CollapsibleGroup` (five
  clicks to learn what the blend is) and a multi-column card grid (short
  sections left enormous empty tails beside the long one). Stacked full-width
  cards worked but buried the reviews and made the page 4600px.
  Built on Astryx `TabList`/`Tab` (both from `@astryxdesign/core/TabList` —
  there is no separate `/Tab` module). `role="tablist"` + `panelId` gives the
  WAI-ARIA tabs pattern and arrow-key navigation for free, and the strip
  scrolls with an arrow affordance on mobile rather than wrapping. Icons key
  off the section key (story→Award, ways→ChefHat, nutrition→Sparkles,
  storage→ShieldCheck, why-switch→TrendingDown, reviews→Star) with an Info
  fallback, so a section the backend invents later still renders. Panel copy
  is capped at 68ch. A product with only two sections renders three tabs
  cleanly — verified on mysore-sambar-powder.
- **Gallery lightbox.** Clicking the main image (or its expand button) opens a
  full-screen `Dialog`, as legacy did. Unlike legacy — whose lightbox froze on
  one image, so you had to close it, pick another thumbnail and reopen — ours
  carries prev/next buttons, a thumbnail strip and arrow-key paging.
  `.kf-lightbox-stage` is capped at `min(62dvh, 620px)`: a full-height square
  stage pushed the strip past the dialog's bottom edge and it rendered outside
  the rounded container.
- **`InfoPopover` is the legacy ⓘ affordance** — a small icon button beside a
  claim that opens a modal explaining it. Currently on "Made fresh for you"
  (the grandmother quote, verbatim). A real Dialog, not a CSS tooltip: the
  content is a sentence or two, it must be keyboard- and screen-reader
  reachable, and hover tooltips are unusable on touch. Reuse it wherever a
  short promise needs the longer story.
- **Products need MORE THAN ONE image for any of this to show.** Every mock
  product shipped with exactly one, so the thumbnail strip and counter were
  dead code. The real four-shot gallery for Mysore Rasam Powder came from the
  legacy `product_dump.json` (pack front, label/ingredients, detail, in use);
  other products still have one image each and correctly show no strip.
- `ReviewList` takes `hasHeading` — off inside the tabs, where the tab label
  already says "Reviews".
- The "Handcrafted by women artisans…" note and the three trust badges already
  existed in `ProductTrust`; only the icons were wrong.

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

## Account & sign-in — legacy profile look

The legacy `/profile` was ONE 881-line page; our routes (`/account`,
`/account/orders`, `/wishlist`, `/addresses`) are kept and only the styling
moves across, so deep links and the layout auth guard survive.

- **The identity card lives in `app/(account)/account/layout.tsx`**, so every
  account screen opens with it: avatar tile + presence dot, name, "Welcome
  back! Manage your account and orders", and the "✓ Verified Customer" badge.
- **`.kf-profile-panel` + `.kf-panel-mark`** reproduce the legacy panels —
  the small vertical gradient bar beside each heading is the legacy detail.
- **The presence dot uses `--color-success`**, not a brand token. It is a
  status signal, so it must not follow a tenant palette — same reasoning as
  the FSSAI veg mark.
- **The active nav pill is brown, not the accent.** It shipped as
  `--color-accent` and was the only filled ORANGE control on the site; one
  filled colour per page (see the button-colour note).
- **No invented data.** The overview shows the address from the most recent
  order, labelled "Shipping Address" — NOT a "default address", which we have
  no endpoint for. Legacy read `contact.info.addresses.items[0]`.
- **`/login` has no legacy design to match** — the old site bounced to a
  Wix-hosted page, so the screen follows the marketing pages: dual-tone
  heading, reasons list, warm card, brown pill button. It stays `ƒ` because
  it reads `?next=`, and the open-redirect guard is unchanged.

**Never run two `pnpm dev` servers against this repo at once.** They share
`.next`, and starting a second one (to review the signed-out state on another
port) made the first serve 404s for every route. `NEXT_DIST_DIR` is not a real
Next variable and does not separate them. To review signed-out screens, restart
the single server with `NEXT_PUBLIC_MOCK_SIGNED_IN=0` instead.

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

## The colour scheme is PINNED to light — do not remove it

`globals.css` carries, **unlayered**, immediately after the theme import:

```css
html,
[data-astryx-theme] { color-scheme: light; }
```

Without it the stats band was invisible under a dark-mode OS: it paints with
`--color-background-inverted`, one of **22 `light-dark()` pairs in the
generated theme whose halves still differ**, so a dark-mode viewer got a
near-white ground under the band's cream text — contrast **1.19**. Pinned, it
is **13.97** in both schemes.

Three things make this easy to break again:

1. **It must stay unlayered.** Inside `@layer astryx-theme` the generated
   theme's own `:root { color-scheme: light dark }` wins on source order; an
   unlayered rule outranks every layered one regardless of order.
2. **Both selectors are required.** The colour tokens are declared on
   `:scope` inside `@scope ([data-astryx-theme="kokofresh"])`, and
   `light-dark()` there resolves against THAT element's `color-scheme` — an
   `html` rule alone does not reach it.
3. **It is invisible in light mode.** Nothing looks wrong unless you emulate
   `prefers-color-scheme: dark`. `scratchpad/darkguard.mjs` checks it; run it
   after touching theme or token CSS. (It is a separate script because
   `Emulation.setEmulatedMedia` mid-run hangs the main regression suite.)

Fixing this properly means regenerating the theme with both halves of every
`light-dark()` equal; the pin is the safety net either way.

**The stats band joins its neighbours directly.** `.kf-section:has(+ .kf-stats)`
trims the preceding section's bottom padding (96px read as a void above the
band), and `.kf-stats + .kf-footer` zeroes the footer's top margin, which was
showing a cream strip between the dark band and the footer.

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

**A `--light` section after a pinned one keeps its white.**
`.kf-pinned + .kf-section` exists to make the next box opaque; it was setting
`background-body` unconditionally, which flattened the contact page's office
section from white to warm. `.kf-pinned + .kf-section--light` restores it.
The rule only needs opacity — a section that declares its own ground keeps it.

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

## About page — legacy parity

Sections in the legacy order: hero → story → ingredients → values → process →
CTA. Copy is verbatim in `content/pages/about.json` (Team/Awards were
commented out on the legacy site — not ported). Photos are the legacy Wix
URLs (`static.wixstatic.com`, allowed in `next.config.mjs`).

- **Story = the page's one dark moment.** `kf-section--brown kf-pinned` with
  the legacy photograph as `.kf-pinned-media`; copy scrolls over a stationary
  image, brown scrim + grain on top. Mobile hides the fixed media and falls
  back to flat brown (the `:has()` rule in globals.css).
- **`components/about/ProcessSection.tsx`** is the legacy "KoKoFresh Way"
  rebuilt without framer-motion. Desktop: sticky `.kf-process-figure` holds all
  six photos stacked; an IntersectionObserver with `rootMargin: 0 0 -50% 0`
  marks a step active as it crosses mid-viewport and the matching photo fades
  in (`data-active`). Mobile (<1024px): inline photo per step + a sticky 1–6
  stepper with a progress bar. All six images stay mounted — a swap is an
  opacity transition, never a remount.
- `.kf-about-pill` carries `align-self: flex-start` — inside a flex column a
  pill stretches to full width otherwise (seen on Ingredients).
- Stat cards: `.kf-stat-card` (ink), `--on-ink` (cream, for the brown story),
  `--badge` (absolute, overlapping a photo's corner). `.kf-about-media` keeps
  `overflow: visible` and a 14px margin so the badge can hang past the edge.
- Headless probes: `img.decode()` never settles for a lazy image that has not
  entered the viewport — race it against a timeout or the script hangs.

## Contact page — legacy parity

Six sections in the legacy order: hero ("Let's Talk Spices") → "Choose Your
Vibe" (WhatsApp / Social / Email / Call cards) → "Drop Us a Line" form →
"Quick Answers" FAQ (six open cards + FAQPage JSON-LD) → "Come Say Hi" office
info with the Google Maps embed → "Still Have Questions?" CTA. Copy is in
`content/pages/contact.json`; **every number, address, handle, hour and the map
URL comes from `config/brand.json`** (`contact.businessEmail`, `pressEmail`,
`hours[]`, `mapEmbedUrl`, `socials.twitter` were added for it). Social handles
are derived from the profile URLs (`handleFromUrl`), never typed twice.

- **The form is the legacy one field for field** (first/last name, email,
  phone, topic, message, newsletter, "Send Message →"), but validated with zod
  per field and posted through `lib/api/contact.ts` — the Wix field-key
  mapping (`first_name_7a97`…) is gone. Phone is a plain `tel` input rather
  than the legacy 40 KB country-picker dependency. Honeypot as on comments.
- **Native `<select>` chevron rule must outrank `.kf-text-input`.** That
  class sets the `background` SHORTHAND later in the file, which resets
  `background-image` on any equal-specificity rule before it — the chevron
  silently vanished. Hence `.kf-contact-form .kf-select`.
- `.kf-pill-btn` (`--primary` / `--outline` / `--sm`, `-icon`) is the shared
  rounded CTA used by About and Contact — it was `.kf-about-btn` and was
  renamed the moment a second page needed it.
- **`.kf-stack-under` / `.kf-stack-over` — the section-overlap effect.** The
  first section STICKS at `top: 0` while the next scrolls up and covers it
  (Choose Your Vibe → Drop Us a Line). Distinct from `.kf-pinned`, which fixes
  a photograph behind a scrolling scrim — this one has no image at all.
  Three requirements, each hit in practice:
  the pair MUST be wrapped in `.kf-stack`, because a sticky element is pinned
  for the height of its containing block — unwrapped, that is the page and the
  vibe cards stayed pinned behind Quick Answers and every later section;
  the over-section needs an OPAQUE background or the section beneath shows
  through; and the under-section is capped at `100dvh` with centred content,
  or a section taller than the viewport scrolls away before the cover arrives
  and the effect never lands. Degrades to two ordinary sections below 900px
  and under `prefers-reduced-motion`.
- **Quick Answers is the page's one dark moment** — `kf-section--brown`
  PLUS `kf-pinned`, so a spice photograph sits fixed behind the brown scrim
  and the cards scroll over a stationary image (the backdrop is content, in
  `content/pages/contact.json` under `faq.backdrop`). It is
  the tallest middle section and sits between two light ones, so the change of
  light reads as deliberate; the CTA is too short to carry a band, the office
  section's white map card would fight a dark ground, and the form must stay
  light to be legible. Its six cards are **warm cream
  (`--kf-light-surface`), not white and not the raised ink** — paper over the
  photograph. Letting them follow the section's ground made them ~4% off the
  brown and they read as faint rectangles; pure white read as a hole punched
  in the band. The `--brown` overrides have to be undone PER PROPERTY (fill,
  border, question colour, answer colour) because they cascade into anything
  inside the section. Contrast on the cream: 12.48 question / 5.80 answer.
  An earlier pass put three `--light` sections in a row (form → FAQ → office)
  and they flattened into one slab — hence one of them going dark.
- The map is a plain lazy `<iframe>`; `X-Frame-Options` in vercel.json only
  governs who may frame US, so embedding Google is unaffected.
