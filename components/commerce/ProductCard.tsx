import Image from 'next/image';

import { ChilliIcon } from '@/components/icons';
import { CardBuyRow } from '@/components/commerce/CardBuyRow';
import { CardNotifyButton } from '@/components/commerce/CardNotifyButton';
import { WishlistButton } from '@/components/commerce/WishlistButton';

import { Badge, Card, ClickableCard, Heading, HStack, Text, VStack } from '@/components/ui';
import { formatMoney } from '@/lib/format';
import type { ProductSummary } from '@/lib/api/types';

/**
 * Product card. Server component — no JS unless a parent needs interaction.
 *
 * Ratings render only when a product actually has reviews; an empty star row on
 * a product with none is a quiet lie, and the same discipline keeps our
 * Product JSON-LD honest.
 */
export function ProductCard({ product }: { product: ProductSummary }) {
  const href = `/shop/${product.primaryCollectionSlug}/${product.slug}`;
  const hasRating = product.rating !== null && product.reviewCount > 0;

  // Legacy made the whole card inert when unavailable (`CardWrapper` became a
  // div) so a click could not land on a product page that cannot sell. Only the
  // Notify Me button stays live.
  if (!product.inStock) {
    // A plain <div> here dropped the border, radius and clipping that come from
    // the card component itself — those cards rendered edge-less next to their
    // neighbours. Card is the non-clickable sibling of ClickableCard, so the
    // silhouette matches exactly; only the link behaviour is gone.
    return (
      <Card className="kf-card-link kf-card-link--inert" padding={0}>
        <CardBody product={product} hasRating={hasRating} />
      </Card>
    );
  }

  return (
    <ClickableCard
      className="kf-card-link"
      href={href}
      label={`${product.name} — from ${formatMoney(product.priceFrom)}`}
      padding={0}
    >
      <CardBody product={product} hasRating={hasRating} />
    </ClickableCard>
  );
}

/** Card interior — shared by the clickable and the inert (unavailable) card. */
function CardBody({
  product,
  hasRating,
}: {
  product: ProductSummary;
  hasRating: boolean;
}) {
  return (
    <article className="kf-product">
      <div className="kf-product-media">
        <WishlistButton productSlug={product.slug} productName={product.name} />
        {product.image ? (
          <Image
            src={product.image.url}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 260px"
            className="kf-product-img"
          />
        ) : (
          // Until catalogue photography lands, show the product's initials on
          // the brand ground rather than an empty grey box.
          <div className="kf-product-placeholder" aria-hidden="true">
            <span>{initials(product.name)}</span>
          </div>
        )}
        {product.ribbon ? (
          <span className="kf-product-ribbon">
            <Badge label={product.ribbon} variant="orange" />
          </span>
        ) : null}
      </div>

      <VStack gap={1.5} padding={4}>
        <Heading level={3} maxLines={2} className="kf-product-title">
          {product.name}
        </Heading>

        {/* The green FSSAI veg mark the legacy card carried — a required
            signal on Indian packaged food, and every product here is veg. */}
        <span className="kf-veg" title="Vegetarian">
          <span className="kf-sr-only">Vegetarian</span>
        </span>

        {hasRating ? (
          <HStack gap={1} vAlign="center">
            <Stars rating={product.rating as number} />
            <Text type="supporting" color="secondary">
              {product.rating?.toFixed(1)} ({product.reviewCount})
            </Text>
          </HStack>
        ) : null}

        {product.spiceLevel !== null && product.spiceLevel > 0 ? (
          <SpiceLevel level={product.spiceLevel} />
        ) : null}

        <VStack gap={1} className="kf-product-foot">
          <HStack gap={1} vAlign="end" wrap="wrap">
            <span className="kf-price kf-price--sm kf-numeric">
              {formatMoney(product.priceFrom)}
            </span>
            {product.compareAtPriceFrom ? (
              <>
                <span className="kf-price-was kf-numeric">
                  {formatMoney(product.compareAtPriceFrom)}
                </span>
                <span className="kf-off">
                  {discountPercent(
                    product.priceFrom.amount,
                    product.compareAtPriceFrom.amount,
                  )}
                  % OFF
                </span>
              </>
            ) : null}
          </HStack>

          {/* Unit price makes sizes comparable at a glance. */}
          <span className="kf-unit-price">{unitPrice(product)}</span>

          {product.inStock ? (
            <CardBuyRow product={product} />
          ) : (
            // Unavailable products keep a conversion path: the legacy card
            // left Notify Me clickable while the rest of the card was inert.
            // No "Coming soon" line here: the ribbon at the top of the card
            // already says it, and repeating it above the button made the
            // status look like a second, disabled control.
            <div className="kf-card-buy">
              <CardNotifyButton productName={product.name} />
            </div>
          )}
        </VStack>
      </VStack>
    </article>
  );
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span className="kf-stars" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="kf-star" data-filled={i < filled || undefined}>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}

/**
 * Heat shown as chillies out of five — the vernacular a spice buyer already
 * reads. Only the filled count is drawn: five greyed chillies would imply the
 * product is missing something rather than that it is mild.
 */
function SpiceLevel({ level }: { level: number }) {
  return (
    <span className="kf-spice" title={`Heat ${level} of 5`}>
      <span className="kf-sr-only">Heat level {level} of 5</span>
      {Array.from({ length: level }, (_, i) => (
        <ChilliIcon key={i} className="kf-chilli" aria-hidden="true" />
      ))}
    </span>
  );
}

/** First letters of the first two significant words, e.g. "Mysore Sambar" -> "MS". */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function discountPercent(price: number, compareAt: number): number {
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/** "(₹120.00/100 g)" — lets a shopper compare sizes without doing the maths. */
function unitPrice(product: ProductSummary): string {
  const cheapest = product.variantOptions[0];
  if (!cheapest || cheapest.weightGrams === 0) return '';
  const per100 = (cheapest.price.amount / cheapest.weightGrams) * 100;
  return `(₹${(per100 / 100).toFixed(2)}/100 g)`;
}
