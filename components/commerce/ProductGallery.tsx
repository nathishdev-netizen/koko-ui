'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import { MaximizeIcon } from '@/components/icons';
import { Dialog, Grid, SelectableCard, VStack } from '@/components/ui';
import type { Image as ProductImage } from '@/lib/api/types';

/**
 * Product gallery — main image, thumbnails, and a full-screen lightbox.
 *
 * Thumbnails select on CLICK, not hover. The legacy gallery switched on
 * mouseenter, which made the image flicker as the cursor crossed the strip on
 * its way somewhere else.
 *
 * Clicking the main image opens the lightbox, as legacy did. Inside it, arrow
 * keys and the thumbnail strip move between images — the legacy lightbox
 * showed a single frozen image with no way to reach the others, so a customer
 * had to close it, pick another thumbnail and reopen.
 */
export function ProductGallery({
  images,
  productName,
}: {
  images: readonly ProductImage[];
  productName: string;
}) {
  const [selected, setSelected] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const active = images[selected] ?? images[0];
  const count = images.length;

  const step = useCallback(
    (delta: number) => setSelected((i) => (i + delta + count) % count),
    [count],
  );

  // Arrow keys page through the lightbox.
  useEffect(() => {
    if (!lightboxOpen || count < 2) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') step(1);
      else if (event.key === 'ArrowLeft') step(-1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, count, step]);

  if (!active) {
    return <div className="kf-pdp-media kf-pdp-placeholder" aria-hidden="true" />;
  }

  return (
    <VStack gap={2}>
      <div className="kf-pdp-media">
        <Image
          src={active.url}
          alt={active.alt || productName}
          fill
          sizes="(max-width: 860px) 100vw, 520px"
          className="kf-pdp-img"
          priority
        />
        <button
          type="button"
          className="kf-zoom-btn"
          onClick={() => setLightboxOpen(true)}
          aria-label={`View ${productName} full screen`}
        >
          <MaximizeIcon aria-hidden="true" />
        </button>
        {count > 1 ? (
          <span className="kf-gallery-count" aria-hidden="true">
            {selected + 1} / {count}
          </span>
        ) : null}
      </div>

      {count > 1 ? (
        <Grid gap={2} columns={{ minWidth: 72, repeat: 'fit' }}>
          {images.map((image, index) => (
            <SelectableCard
              key={image.url}
              label={`${productName} image ${index + 1}`}
              isSelected={selected === index}
              onChange={() => setSelected(index)}
              padding={0}
            >
              <div className="kf-thumb">
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="kf-thumb-img"
                />
              </div>
            </SelectableCard>
          ))}
        </Grid>
      ) : null}

      <Dialog
        isOpen={lightboxOpen}
        onOpenChange={setLightboxOpen}
        purpose="info"
        padding={0}
        width={980}
      >
        <div className="kf-lightbox">
          <button
            type="button"
            className="kf-lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
          >
            <CloseMark />
          </button>

          <div className="kf-lightbox-stage">
            <Image
              src={active.url}
              alt={active.alt || productName}
              fill
              sizes="(max-width: 1000px) 100vw, 940px"
              className="kf-lightbox-img"
            />
          </div>

          {count > 1 ? (
            <>
              <button
                type="button"
                className="kf-lightbox-nav kf-lightbox-nav--prev"
                onClick={() => step(-1)}
                aria-label="Previous image"
              >
                <Chevron direction="left" />
              </button>
              <button
                type="button"
                className="kf-lightbox-nav kf-lightbox-nav--next"
                onClick={() => step(1)}
                aria-label="Next image"
              >
                <Chevron direction="right" />
              </button>
              <div className="kf-lightbox-strip">
                {images.map((image, index) => (
                  <button
                    key={image.url}
                    type="button"
                    className="kf-lightbox-thumb"
                    data-active={selected === index || undefined}
                    onClick={() => setSelected(index)}
                    aria-label={`Show image ${index + 1} of ${count}`}
                    aria-current={selected === index ? 'true' : undefined}
                  >
                    <Image src={image.url} alt="" fill sizes="64px" className="kf-thumb-img" />
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </Dialog>
    </VStack>
  );
}

function CloseMark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  );
}
