import { z } from 'zod';

import type { Bundle, ProductSummary } from '@/lib/api/types';

/**
 * Bundle selection rules.
 *
 * Selections are an ARRAY of picks, not fixed slot keys. The legacy
 * configurator used `masala1..masala4` / `chutney1..chutney4` with hardcoded
 * `> 2` / `> 3` checks, so it physically could not express a bundle that asked
 * for five of something without editing code. An array scales to any rule set
 * the backend sends.
 */

export const pickSchema = z.object({
  /** Which rule this pick satisfies — the collection slug, never a name match. */
  collectionSlug: z.string().min(1),
  productSlug: z.string().min(1),
});

export type Pick = z.infer<typeof pickSchema>;

export type RuleProgress = {
  readonly collectionSlug: string;
  readonly label: string;
  readonly required: number;
  readonly chosen: number;
  readonly isComplete: boolean;
};

/** Per-rule progress, used for the UI and to gate submission. */
export function ruleProgress(bundle: Bundle, picks: readonly Pick[]): RuleProgress[] {
  return bundle.rules.map((rule) => {
    const chosen = picks.filter((p) => p.collectionSlug === rule.collectionSlug).length;
    return {
      collectionSlug: rule.collectionSlug,
      label: rule.label,
      required: rule.count,
      chosen,
      isComplete: chosen === rule.count,
    };
  });
}

export function totalRequired(bundle: Bundle): number {
  return bundle.rules.reduce((sum, rule) => sum + rule.count, 0);
}

export function isComplete(bundle: Bundle, picks: readonly Pick[]): boolean {
  return ruleProgress(bundle, picks).every((rule) => rule.isComplete);
}

/**
 * Validates a completed selection. Used before submitting so the server is
 * never sent a malformed bundle, and so the button can explain *what* is
 * missing rather than a generic error.
 */
export function validateSelection(
  bundle: Bundle,
  picks: readonly Pick[],
  catalogue: readonly ProductSummary[],
): { ok: true } | { ok: false; message: string } {
  const parsed = z.array(pickSchema).safeParse(picks);
  if (!parsed.success) return { ok: false, message: 'Selection is malformed.' };

  const bySlug = new Map(catalogue.map((p) => [p.slug, p]));

  for (const pick of picks) {
    const product = bySlug.get(pick.productSlug);
    if (!product) {
      return { ok: false, message: 'One of your picks is no longer available.' };
    }
    if (!product.inStock) {
      return { ok: false, message: `${product.name} is out of stock.` };
    }
    // A pick must genuinely belong to the collection its rule names.
    if (!product.collectionSlugs.includes(pick.collectionSlug)) {
      return { ok: false, message: `${product.name} does not belong in that group.` };
    }
  }

  const incomplete = ruleProgress(bundle, picks).filter((r) => !r.isComplete);
  if (incomplete.length > 0) {
    const first = incomplete[0]!;
    const remaining = first.required - first.chosen;
    return {
      ok: false,
      message: `Choose ${remaining} more ${first.label.toLowerCase()}.`,
    };
  }

  return { ok: true };
}
