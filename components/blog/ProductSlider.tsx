'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { CardBuyRow } from '@/components/commerce/CardBuyRow';
import { formatMoney } from '@/lib/format';
import type { ProductSummary } from '@/lib/api/types';

const INTERVAL_MS = 5000;

/**
 * Sidebar product carousel — one blend at a time, auto-advancing every 5s
 * with dot navigation, as the legacy widget did. Pauses while hovered or
 * focused so a reader about to click is not yanked to the next slide, and
 * stops entirely under prefers-reduced-motion.
 */
export function ProductSlider({
  products,
  title,
}: {
  products: readonly ProductSummary[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (products.length < 2 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % products.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, [products.length, paused]);

  if (products.length === 0) return null;

  return (
    <div
      className="kf-widget kf-widget--slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <h3 className="kf-widget-title">{title}</h3>
      <div className="kf-slider" aria-roledescription="carousel" aria-label={title}>
        <div
          className="kf-slider-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {products.map((product, i) => (
            <article
              key={product.slug}
              className="kf-slide"
              aria-hidden={i !== index}
              aria-label={`${i + 1} of ${products.length}`}
            >
              <Link
                href={`/shop/${product.primaryCollectionSlug}/${product.slug}`}
                className="kf-slide-media"
                tabIndex={i === index ? 0 : -1}
              >
                {product.image ? (
                  <Image
                    src={product.image.url}
                    alt=""
                    fill
                    sizes="320px"
                    className="kf-slide-img"
                  />
                ) : (
                  // Same initials fallback as the product cards — an empty
                  // cream box reads as broken.
                  <span className="kf-slide-initials" aria-hidden="true">
                    {initials(product.name)}
                  </span>
                )}
              </Link>
              <div className="kf-slide-body">
                <h4 className="kf-slide-name">{product.name}</h4>
                <p className="kf-slide-price kf-numeric">{formatMoney(product.priceFrom)}</p>
                {product.inStock ? <CardBuyRow product={product} /> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
      {products.length > 1 ? (
        <div className="kf-slider-dots" role="tablist" aria-label="Choose slide">
          {products.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              className="kf-slider-dot"
              data-active={i === index || undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** First letters of the first two significant words, e.g. "Mint Chutney" -> "MC". */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
