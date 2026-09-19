import { z } from 'zod';

import commerceJson from './commerce.json';

/**
 * Commerce policy that affects the UI only — which payment methods to offer,
 * and what to say about shipping.
 *
 * Thresholds here are DISPLAY HINTS for progress nudges. Actual money is always
 * computed by `getQuote()`; duplicating the rule in the UI is exactly how the
 * legacy site ended up showing four different shipping figures for one cart.
 */
const schema = z.object({
  payment: z.object({
    codEnabled: z.boolean(),
    codNote: z.string(),
  }),
  shipping: z.object({
    freeThresholdPaise: z.number().int().nonnegative(),
    note: z.string(),
  }),
});

const parsed = schema.safeParse(commerceJson);
if (!parsed.success) {
  throw new Error(`config/commerce.json is invalid:\n${z.prettifyError(parsed.error)}`);
}

export const commerce = parsed.data;
