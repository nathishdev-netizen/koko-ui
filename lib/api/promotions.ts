import { isLive, request } from './client';
import type { BogoOffer, Cart, Coupon, FirstOrderOffer, SpinPrize } from './types';

const RESOURCE = 'promotions' as const;

/**
 * Promotions.
 *
 * One module rather than the five uncoordinated mechanisms the legacy site had.
 * Every discount VALUE is decided by the backend — this layer only asks what
 * applies and renders the answer. Nothing here computes money.
 */

/** Threshold above which the higher first-order rate applies. */
const HIGHER_RATE_MIN = 39900;

export async function getFirstOrderOffer(
  subtotalPaise: number,
): Promise<FirstOrderOffer> {
  if (isLive(RESOURCE)) {
    return request<FirstOrderOffer>('/promotions/first-order', {
      searchParams: { subtotal: subtotalPaise },
      revalidate: 0,
    });
  }
  return {
    // Mock assumes a new customer; the real endpoint checks order history
    // against the SESSION, never a caller-supplied id.
    isEligible: true,
    percentOff: subtotalPaise >= HIGHER_RATE_MIN ? 25 : 20,
    minSubtotalForHigher: { amount: HIGHER_RATE_MIN, currency: 'INR' },
  };
}

export async function claimFirstOrderCoupon(email: string): Promise<Coupon> {
  if (isLive(RESOURCE)) {
    return request<Coupon>('/promotions/first-order', {
      method: 'POST',
      body: { email },
      revalidate: 0,
    });
  }
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  return {
    code: `KOKO-NEW20-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    percentOff: 20,
    expiresAt: expires.toISOString(),
    minSubtotal: null,
  };
}

/**
 * Products with an active BOGO offer.
 *
 * Deliberately EMPTY by default — which matches the legacy system's real state
 * (`BOGO_PRODUCT_IDS` was an empty array). The legacy fallback matched product
 * NAMES against ['Powder','Mix','Menasu','Masala'], which covers nearly the
 * whole catalogue and would discount almost everything. That fallback is not
 * ported. Add slugs here (or serve them from the backend) to switch BOGO on.
 */
const BOGO_PRODUCT_SLUGS: readonly string[] = [];

export async function getBogoOffers(cart: Cart): Promise<readonly BogoOffer[]> {
  if (isLive(RESOURCE)) {
    return request<readonly BogoOffer[]>('/promotions/bogo', { revalidate: 0 });
  }

  const eligible = new Set(BOGO_PRODUCT_SLUGS);
  const byProduct = new Map<string, { name: string; qty: number }>();

  for (const line of cart.lines) {
    const slug = line.productSlug.split('/').pop() ?? line.productSlug;
    if (!eligible.has(slug)) continue;
    const current = byProduct.get(slug);
    byProduct.set(slug, {
      name: line.name,
      qty: (current?.qty ?? 0) + line.quantity,
    });
  }

  return [...byProduct.entries()].map(([slug, entry]) => ({
    productSlug: slug,
    productName: entry.name,
    qtyInCart: entry.qty,
    freeQty: Math.floor(entry.qty / 2),
    oneMoreEarnsFree: entry.qty % 2 === 1,
  }));
}

/**
 * Spin-to-win prizes.
 *
 * Prizes and weights match the legacy wheel. The winning CODE comes from
 * `claimSpinPrize()` rather than being a constant in the bundle — the legacy
 * codes (KOKO10, KOKO15, FREESHIP) were static strings anyone could read in the
 * JavaScript and reuse indefinitely.
 */
export async function getSpinPrizes(): Promise<readonly SpinPrize[]> {
  if (isLive(RESOURCE)) {
    return request<readonly SpinPrize[]>('/promotions/spin', { revalidate: 300 });
  }
  return [
    { id: 'off10', label: '10% OFF', code: null, weight: 0.3 },
    { id: 'none', label: 'Better luck next time', code: null, weight: 0.2 },
    { id: 'freeship', label: 'Free Shipping', code: null, weight: 0.2 },
    { id: 'off5', label: '5% OFF', code: null, weight: 0.2 },
    { id: 'off15', label: '15% OFF', code: null, weight: 0.1 },
  ];
}

export async function claimSpinPrize(prizeId: string): Promise<Coupon | null> {
  if (isLive(RESOURCE)) {
    return request<Coupon | null>('/promotions/spin', {
      method: 'POST',
      body: { prizeId },
      revalidate: 0,
    });
  }
  if (prizeId === 'none') return null;
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  const percent = prizeId === 'off15' ? 15 : prizeId === 'off10' ? 10 : 5;
  return {
    code: `KOKO-SPIN-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    percentOff: prizeId === 'freeship' ? 0 : percent,
    expiresAt: expires.toISOString(),
    minSubtotal: null,
  };
}
