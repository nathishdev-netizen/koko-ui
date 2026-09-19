/**
 * Navigation — loader and contract.
 *
 * Values live in config/nav.json (editable without TypeScript); this file owns
 * the shape and validates it. Same progression as config/brand.ts: JSON today,
 * the site-config endpoint later.
 *
 * CAUTION: collection slugs under /shop/* are live indexed URLs carrying 301
 * history from four previous URL generations. Renaming one without adding a
 * redirect in next.config.mjs loses its search ranking.
 */
import { z } from 'zod';

import navJson from './nav.json';

const navItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().startsWith('/', 'Nav hrefs must be site-relative paths.'),
  children: z.array(z.object({ label: z.string().min(1), href: z.string().startsWith('/') })).optional(),
});

const navSchema = z.object({
  primary: z.array(navItemSchema).min(1),
  footer: z
    .array(z.object({ title: z.string().min(1), items: z.array(navItemSchema).min(1) }))
    .min(1),
});

export type NavItem = z.infer<typeof navItemSchema>;
export type FooterGroup = { title: string; items: readonly NavItem[] };

const parsed = navSchema.safeParse(navJson);

if (!parsed.success) {
  throw new Error(`config/nav.json is invalid:\n${z.prettifyError(parsed.error)}`);
}

export const primaryNav: readonly NavItem[] = parsed.data.primary;
export const footerNav: readonly FooterGroup[] = parsed.data.footer;
