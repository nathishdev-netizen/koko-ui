/**
 * Pricing. THE single source of truth for money.
 *
 * No surface may compute subtotal, shipping, discount or total locally. The
 * legacy storefront priced the same cart four different ways (cart-context,
 * cart page, create-order, order-quote) and showed customers three different
 * shipping figures for one order. Every surface calls quote() instead.
 *
 * The mock below encodes the confirmed-correct legacy rule so the flow is
 * demoable, but it is a stand-in: once Frappe ships /pricing/quote the rule
 * lives server-side only and this branch goes away.
 */
import { isLive, request } from './client';
import type { Money } from './types';

const RESOURCE = 'pricing' as const;

export type QuoteItem = {
  readonly variantId: string;
  readonly quantity: number;
};

export type QuoteDestination = {
  readonly postalCode?: string;
  readonly state?: string;
  readonly country: string;
};

export type QuoteRequest = {
  readonly items: readonly QuoteItem[];
  readonly destination?: QuoteDestination;
  readonly couponCode?: string;
};

export type Quote = {
  readonly subtotal: Money;
  readonly shippingFee: Money;
  readonly discount: Money;
  readonly total: Money;
  /** Server-authored, display-ready explanations (e.g. "Free shipping over ₹399"). */
  readonly notes: readonly string[];
  readonly couponApplied: string | null;
};

export async function getQuote(input: QuoteRequest): Promise<Quote> {
  if (isLive(RESOURCE)) {
    // Never cached: pricing is per-session and per-destination.
    return request<Quote>('/pricing/quote', {
      method: 'POST',
      body: input,
      revalidate: 0,
    });
  }
  return mockQuote(input);
}

// ---------------------------------------------------------------------------
// Mock only. Mirrors the legacy rule confirmed correct in REBUILD_ANALYSIS.md
// 2.1: free shipping at >= ₹399, otherwise ₹50 Karnataka / ₹70 rest of India.
// (The ₹499 threshold in the legacy create-order route was a bug.)
// ---------------------------------------------------------------------------

const FREE_SHIPPING_THRESHOLD_PAISE = 399_00;
const SHIPPING_KARNATAKA_PAISE = 50_00;
const SHIPPING_REST_OF_INDIA_PAISE = 70_00;

/** Karnataka = state name match or PIN prefix 56|57|58|59. */
function isKarnataka(destination: QuoteDestination | undefined): boolean {
  if (!destination) return false;
  if (destination.state?.trim().toLowerCase() === 'karnataka') return true;
  const prefix = destination.postalCode?.trim().slice(0, 2);
  return prefix ? ['56', '57', '58', '59'].includes(prefix) : false;
}

async function mockQuote(input: QuoteRequest): Promise<Quote> {
  const { mockProducts, mockDelay } = await import('./mocks');
  await mockDelay();

  const variantPrices = new Map<string, number>();
  for (const product of mockProducts) {
    for (const variant of product.variants) {
      variantPrices.set(variant.id, variant.price.amount);
    }
  }

  const subtotal = input.items.reduce((sum, item) => {
    const price = variantPrices.get(item.variantId);
    return price === undefined ? sum : sum + price * item.quantity;
  }, 0);

  const notes: string[] = [];
  let shippingFee = 0;
  if (subtotal === 0) {
    shippingFee = 0;
  } else if (subtotal >= FREE_SHIPPING_THRESHOLD_PAISE) {
    notes.push('Free shipping applied on orders over ₹399.');
  } else {
    shippingFee = isKarnataka(input.destination)
      ? SHIPPING_KARNATAKA_PAISE
      : SHIPPING_REST_OF_INDIA_PAISE;
    const shortfall = FREE_SHIPPING_THRESHOLD_PAISE - subtotal;
    notes.push(`Add ₹${(shortfall / 100).toFixed(0)} more for free shipping.`);
  }

  // Coupons are server-issued and server-validated; the mock never invents one.
  const discount = 0;

  return {
    subtotal: { amount: subtotal, currency: 'INR' },
    shippingFee: { amount: shippingFee, currency: 'INR' },
    discount: { amount: discount, currency: 'INR' },
    total: { amount: subtotal + shippingFee - discount, currency: 'INR' },
    notes,
    couponApplied: null,
  };
}
