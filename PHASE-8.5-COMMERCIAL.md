# Phase 8.5 — Parity with the old site

**Rule for this phase:** rebuild **exactly what the old site has**. Nothing new,
nothing missed. Same features, better execution.

**Data:** everything runs on mock data shaped like the API contract, in
`lib/api/*`. No page ever calls a backend directly, so when the real endpoints
land we flip one env var per resource and no screen changes.

---

## Page parity — 13 of 24 built

### ✅ Built

| Old | Ours |
|---|---|
| `/` | `/` |
| `/shop` | `/shop` |
| `/shop/[category]` | `/shop/[collection]` |
| `/shop/[category]/[product]` | `/shop/[collection]/[product]` |
| `/shop/bundles` | `/shop/bundles` |
| `/shop/bundles/*` (3 hardcoded pages) | `/shop/bundles/[slug]` (1 data-driven page) |
| `/cart` | `/cart` |
| `/checkout` | `/checkout` |
| `/order-confirmation` | `/checkout/confirmed` |
| `/blog`, `/blog/[slug]` | same |
| `/profile` | `/account` |
| `/wishlist` | `/account/wishlist` |

### ❌ Still to build — 11 pages

| Page | What it is |
|---|---|
| ~~`/about`~~ | ✅ Built |
| ~~`/contact`~~ | ✅ Built |
| ~~`/shipping`~~ | ✅ Built — FAQPage schema verified |
| ~~`/refund`~~ | ✅ Built as `/refund-policy` |
| ~~`/privacypolicy`~~ | ✅ Built as `/privacy-policy` (+ `/terms`) |
| ~~`/leave-review`~~ | ✅ Built |
| `/referral/[code]` | Friend landing page for a referral link |
| `/fresh-masala-offer` | Campaign landing page |
| ~~`/spin-to-win`~~ | ✅ Built (server-issued codes) |
| `/recipes` | Recipe listing |
| `/community` | Customer posts |

`/auth/callback` is OAuth plumbing — it lands with the real auth in Phase 10.
Test routes (`/test-*`, `/testreels`, `/api-docs`, `/checkout-verify`) are dead
and stay dropped.

---

## Feature parity — what exists on the old site

Everything below exists today. Ticked items are done.

### Promotions
- [x] First-order discount — **25% at ≥ ₹399, else 20%**. Cart banner with
      email capture. Rate decided by the server, not by a threshold repeated
      in the UI.
- [x] Coupon entry in cart AND checkout — server-validated via the quote
- [x] BOGO engine — `free = floor(qty/2)`, cart nudge. **Product list starts
      EMPTY**, matching legacy's real state; the name-matching fallback is NOT
      ported. Add slugs in `lib/api/promotions.ts` to switch it on.
- [ ] WhatsApp coupon — 15% at ≥ ₹399 else 10%, 7-day expiry
      *(the cart entry point is commented out in legacy — confirm if wanted)*
- [ ] Referral — advocate share card on profile, sitewide `?ref=` banner,
      friend landing page
- [x] Spin-to-win — same 5 segments and weights. **Codes now issued per spin**
      instead of being static strings in the JS bundle.
- [ ] Seasonal promo popup with countdown

### Cart & conversion
- [x] Free-shipping progress bar
- [x] **Gap-closing product grid** — suggests products that genuinely cross the
      threshold, cheapest first. Legacy picked ONE at random without checking
      the price, so it often left the customer still short.
- [x] Free-shipping unlocked celebration
- [ ] Savings summary card
- [ ] Cart trust badges
- [x] Mobile sticky checkout bar
- [x] Slide-out cart drawer (header icon opens it)
- [ ] Desktop mini-cart rail

### Product page
- [x] Variant selector, quantity, add to cart
- [x] Related products
- [x] Image gallery — thumbnails (click, not hover)
      *(zoom/lightbox deferred — products have one image each today)*
- [x] Info sections — Story · Ways to Enjoy · Nutrition · Storage · Why Switch
      *(Reviews tab lands with the reviews work)*
- [x] Mobile sticky add-to-cart bar
- [x] Notify-me when out of stock (email or phone)
- [ ] WhatsApp product enquiry button
- [x] Trust badges + "Made Fresh for You" box
- [x] Spice level indicator (chillies, cards + PDP)

### Reviews
- [x] Display rating on cards and PDP
- [x] Review list on the PDP — average, distribution, verified badges
- [x] `/leave-review` page — accepts `?product=&name=` prefill
- [ ] Post-delivery review popup *(needs order state; lands with WhatsApp)*
- [x] Moderated: pending reviews hidden, average over **approved only** — verified

### Subscriptions
- [ ] 1 / 2 / 3-month cadence, **15% off**, one active per customer
- [ ] States: `active | paused | cancelled`
- [ ] Manage from the account area
- [ ] *(Legacy is a reminder-plus-coupon loop, not recurring billing)*

### WhatsApp
- [ ] Floating button (appears after 3s, desktop tooltip)
- [ ] Product enquiry, order support, bulk order, stock check buttons
- [ ] Order notifications: confirmation, shipping, delivered
- [ ] Abandoned cart, 60-day reorder, review request, refund, subscription
- [ ] `/go/[id]` branded short links for recovery URLs

### Account
- [x] Orders list + detail
- [x] Wishlist (server-persisted)
- [x] Addresses (read-only)
- [ ] Referral card with WhatsApp + Facebook share
- [ ] Subscription management

### Site-wide
- [x] Announcement bar
- [x] Trust badge marquee
- [ ] Referral `?ref=` banner
- [ ] Promo popup
- [ ] Review request popup
- [ ] Floating WhatsApp button

---

## Suggested order

1. ~~**Policy pages**~~ ✅ **DONE** — all six built, every footer link resolves.
2. ~~**PDP completion**~~ ✅ **DONE**
3. ~~**Cart completion**~~ ✅ **DONE** *(savings card lands with promotions,
   since it totals discount savings)*
4. ~~**Promotions**~~ ✅ **DONE**
5. ~~**Reviews**~~ ✅ **DONE** *(post-delivery popup with WhatsApp)*
6. **Subscriptions** — modal + account management
7. **WhatsApp** — floating button, enquiry buttons, `/go/[id]`
8. **Remaining pages** — `/referral/[code]`, `/fresh-masala-offer`,
   `/spin-to-win`, `/recipes`, `/community`

Then Phase 9 (SEO, redirects, CWV), then Phase 10 (real APIs).

---

## Two things to confirm

Both are cases where porting the old behaviour exactly would carry a real
problem across. Your call:

1. **BOGO** — `BOGO_PRODUCT_IDS` is an **empty array** in the old code, so BOGO
   is effectively off. The fallback matches product names against
   `['Powder','Mix','Menasu','Masala']`, which is nearly the whole catalogue.
   Port as-is and it may discount everything.

2. **Spin-to-win** — the old codes (`KOKO10`, `KOKO15`, `FREESHIP`) are static
   strings visible in the JavaScript bundle, so anyone can read and reuse them
   indefinitely. Rebuild the same wheel, but issue codes from the backend?

Everything else ports exactly as-is.
