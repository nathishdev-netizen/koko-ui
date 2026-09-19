import type { Metadata, Viewport } from 'next';

import './globals.css';
import { Providers } from './providers';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Parallax } from '@/components/layout/Parallax';
import { ServiceWorker } from '@/components/layout/ServiceWorker';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { AppShell } from '@/components/ui';
import { JsonLd } from '@/components/ui/JsonLd';
import { brand } from '@/config/brand';
import { getSiteConfig } from '@/lib/api/site-config';
import { organizationJsonLd, siteUrl } from '@/lib/seo';
import { fontClassName } from '@/themes/kokofresh/fonts';
import homeContent from '@/content/home.json';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s | ${brand.name}`,
  },
  description: brand.description,
  applicationName: brand.name,
  alternates: { canonical: '/' },
  // iOS ignores the web manifest for both the home-screen icon and the
  // standalone chrome, so these have to be declared explicitly or an installed
  // app on iPhone gets a screenshot as its icon and a Safari title bar.
  appleWebApp: {
    capable: true,
    title: brand.name,
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    siteName: brand.name,
    locale: brand.locale.replace('-', '_'),
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Tints the browser/OS chrome to the announcement bar so an installed app
  // reads as one surface rather than a page inside a frame.
  themeColor: '#33240F',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Resolved server-side. Today this is the local config; when tenant
  // resolution lands it becomes a per-tenant fetch with no change here.
  const config = await getSiteConfig();

  return (
    <html lang={config.brand.locale} className={fontClassName()}>
      <body>
        {/* Organization schema is rendered on every page — site-wide identity. */}
        <JsonLd data={organizationJsonLd()} />
        <Providers>
          {/* AppShell owns the skip link, the <main> landmark and the mobile
              drawer, so none of those are re-implemented in SiteHeader. */}
          <AppShell
            height="auto"
            variant="surface"
            topNav={
              <SiteHeader
                brand={config.brand}
                navItems={config.primaryNav}
                announcement={homeContent.announcement}
              />
            }
          >
            {children}
            <SiteFooter brand={config.brand} groups={config.footerNav} />
            <Parallax />
            <ServiceWorker />
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
