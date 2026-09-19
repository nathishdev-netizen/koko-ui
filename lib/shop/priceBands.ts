/**
 * Price bands for the shop filter, in PAISE.
 *
 * These live outside ShopFilters because that is a `'use client'` module: a
 * server component importing a constant from it gets the client reference, not
 * the value, and the array reads as undefined at render time. Plain data
 * belongs in a plain module both sides can import.
 *
 * Same four bands the legacy shop offered, so a returning customer finds the
 * filter they already know.
 */
export type PriceBand = {
  readonly key: string;
  readonly label: string;
  readonly min?: number;
  readonly max?: number;
};

export const PRICE_BANDS: readonly PriceBand[] = [
  { key: '0-100', label: 'Under ₹100', max: 9999 },
  { key: '100-200', label: '₹100 – ₹200', min: 10000, max: 20000 },
  { key: '200-500', label: '₹200 – ₹500', min: 20000, max: 50000 },
  { key: '500+', label: '₹500+', min: 50000 },
];
