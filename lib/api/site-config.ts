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
import { isLive, request } from './client';

const RESOURCE = 'siteConfig' as const;

export type SiteConfig = {
  readonly brand: Brand;
  readonly primaryNav: readonly NavItem[];
  readonly footerNav: readonly { title: string; items: readonly NavItem[] }[];
};

export async function getSiteConfig(): Promise<SiteConfig> {
  if (isLive(RESOURCE)) {
    return request<SiteConfig>('/site-config', {
      revalidate: 3600,
      tags: ['site-config'],
    });
  }
  return { brand, primaryNav, footerNav };
}
