/**
 * Site config — the white-label config endpoint.
 *
 * Today this returns the hardcoded KokoFresh brand. When tenant resolution
 * lands, the same function resolves per tenant server-side and every consumer
 * keeps working unchanged. Components read brand facts from here (or from
 * config/brand.ts directly in static contexts), never from literals.
 */
import { brand, type Brand } from '@/config/brand';
import { footerNav, primaryNav, type NavItem } from '@/config/nav';
import { brandThemeSchema, type BrandTheme } from '@/config/theme';
import { getLocalTheme } from '@/lib/theme/store';
import { isLive, request } from './client';

const RESOURCE = 'siteConfig' as const;

export type SiteConfig = {
  readonly brand: Brand;
  readonly primaryNav: readonly NavItem[];
  readonly footerNav: readonly { title: string; items: readonly NavItem[] }[];
  /** Brand surface colours, rendered to CSS custom properties by the layout. */
  readonly theme: BrandTheme;
};

export async function getSiteConfig(): Promise<SiteConfig> {
  if (isLive(RESOURCE)) {
    const live = await request<SiteConfig>('/site-config', {
      revalidate: 3600,
      tags: ['site-config'],
    });
    // The theme is injected into a <style> tag, so it is re-validated here
    // rather than trusted: strict hex parsing is what stops a compromised or
    // careless backend from breaking out of the stylesheet. A malformed theme
    // falls back to the local default instead of failing the page.
    const parsed = brandThemeSchema.safeParse(live.theme ?? {});
    return { ...live, theme: parsed.success ? parsed.data : await getLocalTheme() };
  }
  const theme = await getLocalTheme();
  return {
    // Identity overrides are applied here rather than in each component, so
    // the header, footer, PWA manifest and SEO all follow one source.
    brand: applyIdentity(brand, theme),
    primaryNav,
    footerNav,
    theme,
  };
}

/** Overlays a theme's identity fields onto the brand config. */
function applyIdentity(base: Brand, theme: BrandTheme): Brand {
  if (!theme.brandName && !theme.tagline && !theme.logoSrc) return base;
  return {
    ...base,
    ...(theme.brandName ? { name: theme.brandName } : {}),
    ...(theme.tagline ? { tagline: theme.tagline } : {}),
    ...(theme.logoSrc ? { logo: { ...base.logo, src: theme.logoSrc } } : {}),
  };
}
