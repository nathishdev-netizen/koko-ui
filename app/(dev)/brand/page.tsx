import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getLocalTheme } from '@/lib/theme/store';
import { canPersist } from '@/lib/theme/store';

import { BrandStudio } from './BrandStudio';

export const metadata: Metadata = {
  title: 'Brand studio',
  // Never indexed: it is a tool, not a page of the shop.
  robots: { index: false, follow: false },
};

// Reads an env var at request time, so enabling it on a deployment does not
// need a code change.
export const dynamic = 'force-dynamic';

/**
 * Brand studio — demonstrates the white-label seam live.
 *
 * Available in development always, and in production only when
 * NEXT_PUBLIC_ENABLE_BRAND_STUDIO=1. That makes it showable to a client on the
 * real deployment without leaving a configuration surface exposed by default.
 */
export default async function BrandPage() {
  const enabled =
    process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_PUBLIC_ENABLE_BRAND_STUDIO === '1';
  if (!enabled) notFound();

  // Opens on the colours actually in effect, not the committed default, so the
  // studio never disagrees with the site it is editing.
  const theme = await getLocalTheme();

  return (
    <div className="kf-container kf-shop">
      <BrandStudio
        initial={theme as Record<string, string>}
        canPersist={canPersist()}
      />
    </div>
  );
}
