'use client';

import Image from 'next/image';
import { useState } from 'react';

import { Grid, SelectableCard, VStack } from '@/components/ui';
import type { Image as ProductImage } from '@/lib/api/types';

/**
 * Product gallery — main image with thumbnails.
 *
 * Thumbnails select on CLICK, not hover. The legacy gallery switched on
 * mouseenter, which made the image flicker as the cursor crossed the strip on
 * its way somewhere else.
 */
export function ProductGallery({
  images,
  productName,
}: {
  images: readonly ProductImage[];
  productName: string;
}) {
  const [selected, setSelected] = useState(0);
  const active = images[selected] ?? images[0];

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
      </div>

      {images.length > 1 ? (
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
    </VStack>
  );
}
