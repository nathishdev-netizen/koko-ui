import { z } from 'zod';

import themeJson from './theme.json';

/**
 * Brand surface colours — the runtime white-label seam.
 *
 * These map 1:1 onto the `--kf-*` custom properties in globals.css. The server
 * renders them into a <style> block, so a tenant's palette is present in the
 * FIRST HTML response: no flash of the wrong brand, no CLS, and no rebuild to
 * change a colour.
 *
 * Every field is optional. An omitted key simply keeps the default already in
 * globals.css, so a partial config from the backend is safe — a tenant that
 * only wants to change its ink does not have to restate the whole palette.
 */
const hex = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a 6-digit hex colour, e.g. #33240F');

export const brandThemeSchema = z.object({
  brandInk: hex.optional(),
  brandInkSoft: hex.optional(),
  brandInkDeep: hex.optional(),
  brandInkRaised: hex.optional(),
  onInk: hex.optional(),
  onInkSecondary: hex.optional(),
  onInkAccent: hex.optional(),
  onFill: hex.optional(),
});

export type BrandTheme = z.infer<typeof brandThemeSchema>;

/** Config key -> the CSS custom property it sets. */
const CSS_VAR: Record<keyof BrandTheme, string> = {
  brandInk: '--kf-brand-ink',
  brandInkSoft: '--kf-brand-ink-soft',
  brandInkDeep: '--kf-brand-ink-deep',
  brandInkRaised: '--kf-brand-ink-raised',
  onInk: '--kf-on-ink',
  onInkSecondary: '--kf-on-ink-secondary',
  onInkAccent: '--kf-on-ink-accent',
  onFill: '--kf-on-fill',
};

/**
 * Renders a theme as CSS custom properties.
 *
 * Values are validated as strict hex by the schema before reaching here, so
 * they cannot carry `;`, `}` or `</style>` — that is what makes injecting this
 * into a <style> tag safe even when the values come from a backend.
 */
export function themeToCss(theme: BrandTheme): string {
  const decls = (Object.keys(CSS_VAR) as (keyof BrandTheme)[])
    .filter((key) => theme[key])
    .map((key) => `${CSS_VAR[key]}:${theme[key]}`)
    .join(';');
  return decls ? `:root{${decls}}` : '';
}

/** The local default. A tenant's config from the backend overrides this. */
export const brandTheme: BrandTheme = brandThemeSchema.parse(themeJson);
