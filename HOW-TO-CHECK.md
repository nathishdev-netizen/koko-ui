# How to check Phases 5–8 yourself

Start the site:

```bash
pnpm dev          # → http://localhost:3001
```

Everything below is something you can click, see, or break on purpose.

---

## Phase 5 — Bundle configurator

**What it is:** a page where the customer builds their own box by picking N items
from each category, instead of buying a fixed pack.

**Open:** http://localhost:3001/shop/bundles

### The three bundles

| Bundle | You pick | Free extras | Price | Was |
|---|---|---|---|---|
| Starter Kit | 2 masala + 2 chutney | jaggery | ₹300 | ₹372 |
| Festival Box | 3 masala + 3 chutney | millet mix | ₹500 | ₹590 |
| Monthly Masala Pack | 4 masala + 4 chutney | jaggery + millet | ₹650 | ₹784 |

### Try this

1. Open **KokoFresh Starter Kit**.
2. Under each step you will see **"0 of 2 chosen"** with an empty progress bar.
   In the right-hand summary panel: `Signature Masala Blends 0/2`,
   `Chutney Powders 0/2`, `Jaggery Powder — Included`. The button is greyed out
   reading **"Pick 4 more"**.
3. Click a masala. The progress bar moves, it reads **"1 of 2 chosen"**, and the
   button changes to **"Pick 3 more"**.
4. Pick 2 masalas and 2 chutneys. The button turns active:
   **"Add bundle to cart"**.

### Prove the picking rules

- **Click a 3rd masala when only 2 are allowed.** Your newest pick replaces the
  oldest — the count stays `2/2`. It never silently ignores your click.
- **Click a selected item again** to deselect it.
- The section headings are generated from the bundle's rules, not typed by hand.
  Open `lib/api/mocks/bundles.json`, change `"count": 2` to `"count": 3` on the
  Starter Kit, save, and the page will say *"Pick 3 Signature Masala Blends"*
  with no code change. **The old site could not do this** — it was hardcoded to
  a maximum of 4 and would have needed a developer.

### Why this matters

The old site had **three separate copy-pasted pages** (962 lines each) and
sorted products into groups by looking for words in their names — so a product
called "Rasam Chutney Powder" would have shown up in *both* the masala and the
chutney list. This version uses real category IDs, so that cannot happen.

---

## Phase 6 — Cart, pricing, checkout

**Open:** add something to the cart from any product page, then
http://localhost:3001/cart

### Try this

1. Go to any product, e.g.
   http://localhost:3001/shop/signature-blends/mysore-rasam-powder
2. Pick a size, set quantity, click **Add to cart**.
3. The cart icon in the header updates with a count.
4. Go to **/cart** — change quantity, remove a line, watch the total update.
5. Click **Checkout**.

### The important bit: one source for money

The old site calculated the cart total in **four different places** and they
disagreed. A ₹450 order to Maharashtra showed ₹0 shipping in the sidebar, ₹70 on
the cart page, and ₹70 again from the API.

Now every figure comes from one pricing call. To see it:

- Add items totalling **under ₹399** → shipping is charged, and it says
  *"Add ₹X more for free shipping."*
- Cross **₹399** → shipping goes to **Free** and the note changes.
- The same numbers appear on the cart, at checkout, and on the confirmation.
  They cannot disagree, because only one component displays totals.

### Checkout

- Try submitting the form empty → each field shows its own error.
- Type `12345` in PIN code → *"Enter a 6-digit PIN code."*
- Type `1234567890` as mobile → rejected (Indian mobiles start 6–9).
- Enter a valid 6-digit PIN → the shipping figure updates for that destination.
- **Cash on delivery** is a config switch. Open `config/commerce.json`, set
  `"codEnabled": false`, save → the COD option disappears. No code change.

There is **no Wix anywhere**. Checkout posts to our own API, which will hand back
a payment link from the gateway.

---

## Phase 7 — Account

**Open:** http://localhost:3001/account

You are "signed in" as a mock customer so the screens are reviewable.

### Try this

- **/account** — order and wishlist counts
- **/account/orders** — two orders with status badges (shipped / delivered)
- Click **View order** — line items, totals, delivery address, tracking link
- **/account/wishlist** — saved items
- **/account/addresses** — saved address

### The wishlist actually works now

On any product card there is a **heart in the top-right corner**. Click it →
it fills red. Go to **/account/wishlist** → the item is there.

On the old site that heart had **no click handler at all**. It was decorative.
And the wishlist was stored only in the browser, so it vanished if you changed
device — despite requiring you to log in.

### Prove the security fixes

Run this to simulate being signed out:

```bash
NEXT_PUBLIC_MOCK_SIGNED_IN=0 pnpm dev
```

- Visit **/account** → you are redirected to `/login?next=/account`.
  No account page can be reached without a session.
- Now try an attacker's link:
  `http://localhost:3001/login?next=https://evil.com`
  → it will **not** send you to evil.com. Only paths on this site are allowed.
  The old site's `/auth/callback` would happily redirect anywhere.

---

## Phase 8 — Blog

**Open:** http://localhost:3001/blog

Three real articles, not placeholder text.

### The critical bit: per-post SEO

The content team must be able to set a different headline for Google than the
one shown on the page. Check it:

1. Open http://localhost:3001/blog/what-makes-mysore-rasam-powder-different
2. The page heading says **"What makes Mysore rasam powder different"**
3. Look at the **browser tab** — it says
   **"Mysore Rasam Powder: why pepper matters more than chilli"**

Those are deliberately different. The second is the SEO title, set per post in
`lib/api/mocks/blog.json` under `seo.title`.

Now open http://localhost:3001/blog/how-to-store-spice-powders — that post has
no SEO title override, so the tab correctly falls back to the post's own title.

**This is a hard requirement on the backend.** If Frappe cannot store per-post
SEO fields, blog rankings will drop.

### Also fixed

The old blog was set to rebuild on *every single request* (`revalidate = 0` plus
`force-dynamic` — development settings left in production). It hammered the
backend and threw away all the speed benefits. Ours pre-builds every post.

---

## Checking it all at once

```bash
pnpm typecheck    # no type errors
pnpm lint         # no lint errors
pnpm build        # builds and pre-renders every page
```

The build output lists each page. Anything with a dot (`●`) was pre-built at
build time, which is what makes it fast and crawlable.

---

## Things that are deliberately not finished

Being straight about these:

- **Add to cart on a bundle** does not place the order yet — the cart accepts
  bundles, but wiring the configured selection through needs the real endpoint.
- **Login sends no email.** The form validates and shows a confirmation; the
  actual request lands when Frappe's auth endpoint exists.
- **Addresses cannot be added or edited** — it shows your most recent delivery
  address rather than inventing a form against an endpoint that isn't built.
- **Subscriptions, reviews and referrals** are not built. They need real data to
  be worth anything.
- **Product photos:** 17 of 22 products have real images. The rest show the
  product's initials rather than a broken or wrong image.

All of these land in Phase 10, when the backend endpoints exist.
