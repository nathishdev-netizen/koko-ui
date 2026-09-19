# KokoFresh Rebuild — Plan & TODO

**Approach decided:** keep the live site's proven structure and copy; rebuild the
execution on Astryx. Start with chrome (header + footer), then pages.

**Status key:** `[ ]` todo · `[~]` in progress · `[x]` done

---

## Phase 1 — Foundation ✅ DONE

- [x] Next.js 15 + React 19 + Astryx + pnpm scaffold, quality gates ON
- [x] `config/brand.json` + `config/nav.json` (editable, zod-validated)
- [x] `themes/kokofresh/` brand theme, built CSS (present at first paint)
- [x] `lib/api/` typed client, per-resource mock/live switching
- [x] 22 real products + 6 collections as fixtures (slugs from the live 301 map)
- [x] `lib/seo.ts` — metadata + JSON-LD builders; Organization rendered
- [x] ESLint bans `fetch()` outside `lib/api/client.ts`
- [x] Real brand facts recovered from live site (entity, phone, email, address, socials)
- [x] `content/home.json` — all home marketing copy preserved verbatim

---

## Phase 2 — Chrome: header + footer ✅ DONE

The live header/footer, rebuilt properly. Everything else needs these.

### 2.1 Header
- [x] `astryx build "ecommerce header"` first; compose `AppShell` + `TopNav`
- [x] Announcement bar — collapses on scroll (>20px); copy from `content/home.json`
- [x] Logo + wordmark from `config/brand.json` (no hardcoded paths)
- [x] Nav items from `config/nav.json`: Home, Shop, Blog, Contact, About
- [ ] Search entry point (overlay deferred to Phase 4)
- [x] Wishlist icon + count
- [ ] Account: signed-out / signed-in states (mock session)
- [x] Cart icon + count badge
- [x] Mobile menu — Astryx `MobileNav` drawer
- [x] Sticky/scrolled state

**Fixes vs legacy:** cart icon must open the drawer (legacy linked to `/cart`
with `toggleCartSidebar` left unused); drop the dead `isDesktop` listener; drop
the `--cart-width` shrinking hack.

### 2.2 Footer
- [x] 4 columns: Quick Links · Why Choose Us · Contact · Follow Us + Legal
- [x] Contact + socials from `config/brand.json`
- [x] Copyright from brand config

**Fixes vs legacy:**
- [x] **Contrast bug** — footer links use `text-black hover:text-secondary` and
      `--secondary` is the footer's own background, so links vanish on hover.
      Same bug on the trust icons. Use theme tokens.
- [x] **Wrong link** — "Terms & Conditions" points at `/shipping`.
- [x] **False claim** — footer says "Free Shipping" flat; the real rule is free
      **over ₹399**. Reword to "Free shipping over ₹399".

### 2.4 Routing
- [x] Branded 404 (`app/not-found.tsx`) — real 404 status, keeps chrome
- [x] All nav/footer hrefs verified against the planned route structure
- [ ] Stub or build the linked pages — every nav/footer link 404s until its
      phase lands (`/shop` P4, `/blog` P8, `/about` `/contact` + legal pages P3+)

### 2.3 Foundations
- [x] `components/ui/` re-exports for every new Astryx component used
- [x] Skip-to-content link, focus order, aria labels
- [x] Verify header/footer render server-side (no CLS)

---

## Phase 3 — Home page ✅ DONE

Section order mirrors the live site exactly.

- [x] Hero — 4 slides, auto-advance. **Slide 1 must be a real `next/image`
      with `priority`** (it is the LCP element). Respect `prefers-reduced-motion`.
- [x] Trust badges — marquee on mobile, static from `sm:`. Replace the legacy
      inline `dangerouslySetInnerHTML` keyframes with theme CSS.
- [x] Bundles — 3-up grid from `lib/api/bundles.ts`
- [x] Best Sellers — carousel via Astryx `Carousel`, data from `getProducts()`
- [x] Brand quote / story card
- [x] USP — 3 cards ("Not Your Average Masala")
- [x] Collections — 4 cards from `getCollections()`
- [x] Social proof stats band
- [x] `generateMetadata` + Organization/Website JSON-LD

**Fixes vs legacy:** legacy home was 543 lines with 5 sections inlined and
hardcoded arrays — all content now comes from `content/home.json` or the API.
Legacy computed LocalBusiness schema and never rendered it.

---

## Phase 4 — Shop, collections, PDP

Legacy reference: `ShopClient.tsx` 1296 lines, `ProductPageClient.tsx` 1637 lines,
`ProductCard.tsx` 630 lines. One `ShopClient` serves both `/shop` and
`/shop/[category]`.

### 4.1 Listing ✅ (`/shop`, `/shop/[collection]`)
- [x] Search + sort row; category and price filters
- [ ] Desktop sidebar filters; mobile filter bottom-sheet
- [x] Active-filter badges + clear-all
- [x] **Add pagination** — legacy renders the entire filtered list at once
- [x] **Default to All, not "Best Sellers"** — legacy silently defaults the
      category, so `/shop` never shows the full catalogue on first load
- [x] Set `revalidate` on collection pages (legacy had none → stale forever)
- [x] Drop dead state: `viewMode` (no toggle exists), `showBestsellers` /
      `showLimitedEdition` (no UI sets them)
- [ ] Loading skeletons (legacy has spinners only, mostly unreachable)

### 4.2 ProductCard ✅
- [x] Image, title, ribbon, rating, price + strikethrough, unit price (₹/100g),
      spice meter, veg symbol, variant select, quick-add
- [ ] Replace the parent's `window[`interval_${id}`]` hover-carousel hack
- [ ] Wire the wishlist button — legacy's has **no onClick handler**

### 4.3 PDP ✅ (`/shop/[collection]/[product]`)
Start from Astryx `product-detail` (~299 lines, ships `StarRating`,
`ProductInfo`, `ImageGallery`).
- [ ] Gallery: thumbnails, zoom, lightbox, mobile swipe
- [x] Variant selector, quantity, add to cart, out-of-stock → notify
- [x] Price with discount %, "inclusive of all taxes", stock pill
- [x] Ratings — **only when real reviews exist**
- [ ] Info tabs: Story · Ways to Enjoy · Nutrition · Storage · Why Switch ·
      Details · Reviews (accordion on mobile)
- [ ] Trust badges, "Made Fresh for You" box
- [x] Related products — use `ProductCard`, not bespoke inline markup
- [x] Product + Breadcrumb + FAQ JSON-LD

**🔴 Must NOT port — `WEIGHT_TIER_DISCOUNT`** (`ProductPageClient.tsx:567-583`):
the legacy PDP **fabricates the MRP**. It back-computes a fake "original price"
from the sale price using a hardcoded per-weight percentage (100g 21%, 200g 28%,
500g 28%, 1kg 31%, 2kg 33%), forces `isOnSale = true`, and shows that invented
number as the struck-through MRP. That is a fake-discount pattern with real
legal exposure under consumer-protection rules. **Show only real prices from the
backend.** Flagged for your decision.

- [ ] De-duplicate `SPICE_LEVEL_MAP` — currently copy-pasted in 3 files

---

## Phase 5 — Bundle configurator ✅ DONE

Rules recovered from the legacy code and confirmed against the live site:

| Bundle | Pick | Price | Was | Saves |
|---|---|---|---|---|
| Starter Kit | 2 masala + 2 chutney + jaggery | ₹300 | ₹372 | ₹72 |
| Festival Box | 3 masala + 3 chutney | ₹500 | ₹590 | ₹90 |
| Monthly Masala Pack | 4 masala + 4 chutney + jaggery | ₹650 | ₹784 | ₹134 |

Auto-included items (not picked): Starter Kit +jaggery · Festival Box +millet ·
Monthly Pack +jaggery +millet.

Legacy reference: `BundleProductDetails.tsx` 962 lines + 3 copy-paste page files.

- [x] **One data-driven configurator**, not three hand-built pages
- [x] **Selections as an array, not fixed keys.** Legacy uses
      `masala1..masala4`, `chutney1..chutney4` with hardcoded `> 2`/`> 3`
      checks — it physically cannot express a 5-pick bundle without code edits.
- [x] Selection pools keyed off **collection IDs**, not name substrings.
      Legacy: `name.includes('rasam')` etc., so "Rasam Chutney Powder" matches
      both masala and chutney buckets.
- [ ] Decide: allow duplicate picks? Legacy allows them and the FAQ advertises it.
- [x] Disable the submit button until selection is complete (legacy only
      toasts an error on click, with a wrong item count in the message)
- [ ] Price from `getQuote()` — legacy pricing is **fully static** and never
      reflects what was actually picked
- [x] Drop the hardcoded "flax seed" chutney exclusion
- [ ] Comparison table + FAQ from config, not hardcoded. Legacy FAQ references
      a "Taster's Pack" that no longer exists and ₹50 gift wrapping.
- [x] **Never** smuggle selections through the shipping-address `company` field
      or a newline-joined text blob in a custom field
- [x] **Never** attach a "most recent guess" bundle when nothing matches
- [ ] Reconcile the duplicate bundle definitions — `types/bundle.ts` and
      `components/bundles.ts` hold two separate hardcoded copies

---

## Phase 6 — Cart, pricing, checkout ✅ DONE

Legacy `/cart` is 1518 lines. **`/checkout` is only a 39-line redirect shim** —
the real checkout is Wix-hosted, so there is **no first-party checkout to port.
We build it from scratch.** Scope this with the backend team.

### 6.1 Cart
- [x] Cart drawer + `/cart` page, line items, quantity, remove, save-for-later
- [x] Free-shipping progress bar + "add ₹X more" nudge
- [x] Bundle line items render their contents readably
- [ ] Pagination for large carts (legacy: 5/page)
- [ ] Delivery ETA estimate
- [x] **Real stock status** — legacy hardcodes an "In Stock" pill on every line
- [x] **Coupon discounts must show for guests too** — legacy renders the
      discount row only when `profile` is truthy, so guests never see it

### 6.2 Pricing
- [x] **Every total from `getQuote()`** — no local maths anywhere
- [x] Free ≥ ₹399; else ₹50 Karnataka / ₹70 rest of India
- [x] Replace the manual shipping-zone toggle with PIN-derived zone
- [ ] GST 5% inclusive, shown as a breakdown line

### 6.3 Checkout (new build)
- [x] From Astryx `payment-form` / `checkout-wizard`
- [x] Contact → address → delivery → payment, with a live summary
- [ ] Coupon entry, server-validated only
- [x] Order confirmation page

---

## Phase 7 — Account ✅ DONE

- [x] Login (Astryx `login-card`), httpOnly session — **never JS-readable tokens**
- [x] Orders list + detail (Astryx `detail-page`)
- [x] Addresses
- [x] **Wishlist server-persisted** (legacy was localStorage-only)
- [ ] Subscriptions, reviews, referral

---

## Phase 8 — Blog ✅ DONE

- [x] `/blog` + `/blog/[slug]`
- [x] **Per-post SEO overrides** — title, description, robots, custom JSON-LD
- [x] BlogPosting schema
- [x] Proper ISR (legacy shipped `revalidate = 0` + `force-dynamic`)

---

## Phase 9 — SEO & performance ← **NEXT**

- [ ] `app/sitemap.ts` from live API data — **one system only**
- [ ] `robots.ts`, `llms.txt`
- [ ] **Port all ~40 legacy 301s verbatim** — redirects, never rewrites
- [ ] All JSON-LD types verified *rendered*, not just computed
- [ ] Lighthouse / CWV pass; LCP image audit
- [ ] **CSS `@scope` risk** — Astryx wraps brand tokens in `@scope` (Baseline
      only since Dec 2025). Check real traffic; add `:root` fallback if needed.
- [ ] `/site.webmanifest` (404s today)

---

## Phase 10 — Real Frappe backend

- [ ] Swap resources one at a time via `NEXT_PUBLIC_API_LIVE_RESOURCES`
- [ ] Order: products → collections → blog → cart → pricing → checkout → account
- [ ] Webhook-driven tag revalidation
- [ ] If a page needs changing, the abstraction leaked — fix `lib/api/`

---

## Deferred (agreed, not forgotten)

- [ ] Admin UI for brand config — revisit after core phases
- [ ] Domain/tenant resolver — excluded by brief
- [ ] Runtime-editable theme colours — needs a token override layer

---

## Cross-cutting rules

1. Astryx imports only via `components/ui/`
2. No `fetch()` outside `lib/api/client.ts` (ESLint-enforced)
3. No client-side price maths — always `getQuote()`
4. No hardcoded brand facts — `config/brand.json` or theme tokens
5. Server Components by default
6. Legacy URLs → 301, never rewrite
7. Money in integer paise
8. Never synthesise ratings into JSON-LD
9. Run `astryx build "<idea>"` before writing any new screen

---

## Decisions needed from you

1. **Fake MRP (`WEIGHT_TIER_DISCOUNT`)** — the legacy PDP invents struck-through
   "original" prices. Confirm we drop it and show only real backend prices.
2. **"Free Shipping"** claimed unconditionally in the footer; real rule is
   ≥ ₹399. Confirm the reworded copy.
3. **Social proof stats** (100K+ customers, 4.9★, 50M+ views) are hardcoded
   marketing claims. Keep as-is, or drive from real data?
4. **Checkout ownership** — currently Wix-hosted. Confirm Frappe + a payment
   gateway will own this, since it is a from-scratch build.
5. **Duplicate bundle picks** — keep allowing the same item twice?

## Verification per phase

Every phase ships only when: `pnpm typecheck` · `pnpm lint` · `pnpm build` all
pass, the page renders server-side (view-source shows content), JSON-LD is
present in the HTML, and it works at 375px / 768px / 1440px.
