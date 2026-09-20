import Link from 'next/link';

import type { ProductSummary } from '@/lib/api/types';

import { ProductSlider } from './ProductSlider';

type SidebarCopy = {
  story: { badge: string; title: string; body: string; cta: string };
  follow: { title: string; body: string; cta: string };
  products: { title: string };
};

/**
 * The three sidebar widgets from the legacy post page: product slider, brand
 * story, follow-on-Instagram. Sticky beside the article on desktop.
 */
export function PostSidebar({
  products,
  instagramUrl,
  copy,
}: {
  products: readonly ProductSummary[];
  instagramUrl: string | undefined;
  copy: SidebarCopy;
}) {
  return (
    <aside className="kf-post-sidebar" aria-label="More from KokoFresh">
      <ProductSlider products={products} title={copy.products.title} />

      <div className="kf-widget kf-widget--story">
        <span className="kf-widget-badge">{copy.story.badge}</span>
        <h3 className="kf-widget-title">{copy.story.title}</h3>
        <p className="kf-widget-text">{copy.story.body}</p>
        <Link href="/about" className="kf-widget-link">
          {copy.story.cta}
        </Link>
      </div>

      {instagramUrl ? (
        <div className="kf-widget">
          <h3 className="kf-widget-title">{copy.follow.title}</h3>
          <p className="kf-widget-text">{copy.follow.body}</p>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="kf-widget-social"
          >
            {copy.follow.cta}
          </a>
        </div>
      ) : null}
    </aside>
  );
}
