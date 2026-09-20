/**
 * Brand identity — loader and contract.
 *
 * The VALUES live in config/brand.json so they can be edited by anyone without
 * touching TypeScript. This file owns the *shape* and validates the JSON at
 * import time, so a typo or missing field fails the build with a readable
 * error instead of shipping a half-branded site.
 *
 * Progression (see MEMORY in .claude/CLAUDE.md):
 *   today   — config/brand.json, edited by hand
 *   later   — GET /api/v1/site-config from Frappe, per tenant
 *   after   — an admin UI writing to that endpoint
 *
 * Because every consumer reads `brand.*` (or getSiteConfig()), none of those
 * steps changes component or page code.
 */
import { z } from 'zod';

import brandJson from './brand.json';

const imageSchema = z.object({
  src: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const brandSchema = z.object({
  /** Stable tenant key. Also selects themes/<themeName>/. */
  id: z.string().min(1),
  name: z.string().min(1),
  legalName: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  url: z.url(),
  logo: imageSchema,
  favicon: z.string().min(1),
  ogImage: z.string().min(1),
  themeName: z.string().min(1),
  locale: z.string().min(2),
  currency: z.literal('INR'),
  contact: z.object({
    email: z.email(),
    phone: z.string().min(1),
    /** E.164, for WhatsApp deep links. */
    whatsapp: z.string().min(1),
    businessEmail: z.email().optional(),
    pressEmail: z.email().optional(),
    /** Office hours, one line each, shown verbatim on /contact. */
    hours: z.array(z.string().min(1)).optional(),
    /** Google Maps embed URL for the HQ. Absent = no map on /contact. */
    mapEmbedUrl: z.url().optional(),
  }),
  legal: z.object({
    entityName: z.string().min(1),
    gstin: z.string().min(1),
    /** GST is inclusive in displayed prices; rate is informational for invoices. */
    gstRatePercent: z.number().nonnegative(),
    address: z.object({
      street: z.string(),
      locality: z.string(),
      region: z.string(),
      postalCode: z.string(),
      country: z.string().min(2),
    }),
  }),
  socials: z.object({
    instagram: z.url().optional(),
    facebook: z.url().optional(),
    youtube: z.url().optional(),
    twitter: z.url().optional(),
  }),
});

export type Brand = z.infer<typeof brandSchema>;

const parsed = brandSchema.safeParse(brandJson);

if (!parsed.success) {
  throw new Error(
    `config/brand.json is invalid:\n${z.prettifyError(parsed.error)}\n\n` +
      'Fix the JSON file — every field above is required for the site to render correctly.',
  );
}

export const brand: Brand = parsed.data;
