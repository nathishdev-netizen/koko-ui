import Image from 'next/image';

import { Badge, Heading, HStack, Text, VStack } from '@/components/ui';
import { formatMoney } from '@/lib/format';
import type { Bundle } from '@/lib/api/types';

/**
 * Bundle cards.
 *
 * Follows the live site's layout: the real "Build your…" banner, a Save badge,
 * a tagline, a "What's inside" chip row, then price with the struck-through
 * regular price and an explicit call to action. Every figure comes from the
 * bundle record, so a card cannot drift from the configurator.
 */
export function BundleGrid({
  bundles,
  hasHeading = true,
}: {
  bundles: readonly Bundle[];
  /** Off when the page already supplies its own heading. */
  hasHeading?: boolean;
}) {
  if (bundles.length === 0) return null;

  return (
    <section
      className="kf-section kf-section--light"
      aria-labelledby={hasHeading ? 'bundles-heading' : undefined}
      aria-label={hasHeading ? undefined : 'Bundles'}
    >
      <div className="kf-container">
        <VStack gap={5}>
          {hasHeading ? (
            <VStack gap={1}>
              <p className="kf-eyebrow">Mix &amp; match</p>
              <Heading level={2} id="bundles-heading">
                Build your own bundle
              </Heading>
              <Text color="secondary">
                Pick your favourites, we&rsquo;ll pack them for less.
              </Text>
            </VStack>
          ) : null}

          <div className="kf-card-grid kf-card-grid--wide kf-card-grid--centred">
            {bundles.map((bundle) => (
              <a
                key={bundle.slug}
                href={`/shop/bundles/${bundle.slug}`}
                className="kf-bundle-card"
              >
                <div className="kf-bundle-banner">
                  {bundle.image ? (
                    <Image
                      src={bundle.image.url}
                      alt={bundle.image.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, 380px"
                      className="kf-bundle-banner-img"
                    />
                  ) : null}
                  <span className="kf-bundle-save">
                    <Badge
                      variant="green"
                      label={`Save ${bundle.savingsPercent}%`}
                    />
                  </span>
                </div>

                <VStack gap={2} padding={4}>
                  <Heading level={3}>{bundle.name}</Heading>

                  <p className="kf-bundle-tagline">{bundle.tagline}</p>

                  <Text type="supporting" color="secondary" maxLines={2}>
                    {bundle.description}
                  </Text>

                  <VStack gap={1}>
                    <p className="kf-bundle-inside">What&rsquo;s inside</p>
                    <HStack gap={1} wrap="wrap">
                      {bundle.contents.map((item) => (
                        <span key={item} className="kf-chip-static">
                          {item}
                        </span>
                      ))}
                    </HStack>
                  </VStack>

                  <HStack
                    gap={2}
                    hAlign="between"
                    vAlign="end"
                    className="kf-bundle-foot"
                  >
                    <VStack gap={0}>
                      <HStack gap={1.5} vAlign="end">
                        <span className="kf-price kf-numeric">
                          {formatMoney(bundle.price)}
                        </span>
                        <span className="kf-price-was kf-numeric">
                          {formatMoney(bundle.compareAtPrice)}
                        </span>
                      </HStack>
                      <span className="kf-bundle-label">Bundle price</span>
                    </VStack>
                    <span className="kf-bundle-cta">Select bundle →</span>
                  </HStack>
                </VStack>
              </a>
            ))}
          </div>
        </VStack>
      </div>
    </section>
  );
}
