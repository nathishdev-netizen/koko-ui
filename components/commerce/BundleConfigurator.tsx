'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

import { BundleSlot } from '@/components/commerce/BundleSlot';
import {
  Badge,
  Button,
  Divider,
  Heading,
  HStack,
  ProgressBar,
  Text,
  VStack,
} from '@/components/ui';
import { formatMoney } from '@/lib/format';
import type { Bundle, ProductSummary } from '@/lib/api/types';
import {
  isComplete,
  ruleProgress,
  totalRequired,
  validateSelection,
  type Pick,
} from '@/lib/validations/bundle';

/**
 * Bundle configurator — one component driven entirely by the bundle's rules.
 *
 * The legacy site had three hand-built, copy-pasted pages; this renders any
 * bundle the backend describes. Picks are an array keyed by collection slug, so
 * a "pick 5" rule needs no code change, and a product can only satisfy a rule
 * whose collection it actually belongs to.
 */
export function BundleConfigurator({
  bundle,
  catalogue,
  included,
  children,
}: {
  bundle: Bundle;
  /** Cards that stack below the builder, inside the scrolling column. */
  children?: React.ReactNode;
  /** Products eligible for each rule, keyed by collection slug. */
  catalogue: Readonly<Record<string, readonly ProductSummary[]>>;
  /** Auto-added items the customer does not choose. */
  included: readonly ProductSummary[];
}) {
  const [picks, setPicks] = useState<Pick[]>([]);

  const progress = useMemo(() => ruleProgress(bundle, picks), [bundle, picks]);
  const required = totalRequired(bundle);
  const complete = isComplete(bundle, picks);

  const allProducts = useMemo(
    () => Object.values(catalogue).flat(),
    [catalogue],
  );

  const validation = validateSelection(bundle, picks, allProducts);

  /**
   * Slots are positional: "Blend 1", "Blend 2". Assigning to a slot replaces
   * whatever sat there, which is what the labelled-slot UI implies — unlike the
   * old toggle grid, where a click could silently evict an unrelated pick.
   *
   * `picks` stays a flat array so `lib/validations/bundle` is unchanged; the
   * slot index is just its position among that rule's picks.
   */
  function assign(collectionSlug: string, slotIndex: number, productSlug: string) {
    setPicks((current) => {
      const mine = current.filter((p) => p.collectionSlug === collectionSlug);
      const others = current.filter((p) => p.collectionSlug !== collectionSlug);
      const next = [...mine];
      // Pad so a later slot can be filled before an earlier one.
      while (next.length <= slotIndex) {
        next.push({ collectionSlug, productSlug: '' });
      }
      next[slotIndex] = { collectionSlug, productSlug };
      return [...others, ...next.filter((p) => p.productSlug !== '')];
    });
  }

  /** The product sitting in a given slot, or null. */
  function slotProduct(
    collectionSlug: string,
    slotIndex: number,
  ): ProductSummary | null {
    const mine = picks.filter((p) => p.collectionSlug === collectionSlug);
    const slug = mine[slotIndex]?.productSlug;
    if (!slug) return null;
    return (catalogue[collectionSlug] ?? []).find((p) => p.slug === slug) ?? null;
  }

  return (
    <div className="kf-bundle-grid">
      <div className="kf-bundle-picker">
        <VStack gap={4}>
          {/* Price card — the legacy page leads the right column with this, so
              the saving is visible before any picking starts. */}
          <div className="kf-price-card">
            <HStack gap={3} vAlign="end" wrap="wrap">
              <span className="kf-price kf-price--xl kf-numeric">
                {formatMoney(bundle.price)}
              </span>
              <span className="kf-price-was kf-numeric">
                {formatMoney(bundle.compareAtPrice)}
              </span>
            </HStack>
            <p className="kf-save-pill">
              You save {formatMoney(bundle.savings)} ({bundle.savingsPercent}% OFF)
            </p>
          </div>

          <div className="kf-build-card">
            <VStack gap={6}>
              <Heading level={2} className="kf-build-title">
                Build Your Bundle
              </Heading>
          {bundle.rules.map((rule, index) => {
            const state = progress[index]!;
            const options = catalogue[rule.collectionSlug] ?? [];

            return (
              <VStack key={rule.collectionSlug} gap={4}>
                <VStack gap={1.5}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Heading level={2}>
                      {index + 1}. Pick {rule.count} {rule.label}
                    </Heading>
                    {state.isComplete ? <Badge variant="success" label="Done" /> : null}
                  </HStack>
                  <ProgressBar
                    label={`${rule.label}: ${state.chosen} of ${state.required} chosen`}
                    value={state.chosen}
                    max={rule.count}
                    isLabelHidden
                  />
                  <Text type="supporting" color="secondary">
                    {state.chosen} of {state.required} chosen
                  </Text>
                </VStack>

                <div className="kf-slot-grid">
                  {Array.from({ length: rule.count }, (_, slotIndex) => (
                    <BundleSlot
                      key={`${rule.collectionSlug}-${slotIndex}`}
                      label={`${singular(rule.label)} ${slotIndex + 1}`}
                      products={options}
                      selected={slotProduct(rule.collectionSlug, slotIndex)}
                      onSelect={(slug) =>
                        assign(rule.collectionSlug, slotIndex, slug)
                      }
                    />
                  ))}
                </div>
              </VStack>
            );
          })}


              <div className="kf-build-cta">
                <Button
                  label={
                    complete
                      ? 'Add Customized Bundle to Cart'
                      : `Pick ${required - picks.length} more`
                  }
                  variant="primary"
                  size="lg"
                  // Disabled until the selection is valid: the legacy version
                  // let you click and then toasted a wrong item count.
                  isDisabled={!complete}
                />
                <Text type="supporting" color="secondary">
                  {validation.ok
                    ? 'Ground fresh after you order · delivered in 3–5 days'
                    : validation.message}
                </Text>
              </div>
            </VStack>
          </div>

          {children}
        </VStack>
      </div>

      {/* Summary rail — sticky on desktop so the action stays reachable. */}
      <aside className="kf-bundle-summary" aria-label="Your bundle">
        <VStack gap={4}>
          {/* The bundle's own photograph, as the legacy page led with: it shows
              what arrives, which a list of counts cannot. */}
          {bundle.image ? (
            <div className="kf-summary-media">
              <Image
                src={bundle.image.url}
                alt=""
                fill
                sizes="340px"
                className="kf-summary-img"
                priority
              />
            </div>
          ) : null}

          <VStack gap={1} hAlign="center" className="kf-center-text">
            <Heading level={2}>{bundle.name}</Heading>
            <p className="kf-accent kf-card-tagline">{bundle.tagline}</p>
          </VStack>

          <p className="kf-collection-rule">Premium Collection</p>

          <div className="kf-included-box">
            <p className="kf-included-title">What&rsquo;s Included</p>
            <ul className="kf-tick-list kf-tick-list--sm">
              {bundle.rules.map((rule) => (
                <li key={rule.collectionSlug}>
                  <TickSmall />
                  <span>
                    {rule.count} {rule.label}
                  </span>
                </li>
              ))}
              {included.map((product) => (
                <li key={product.slug}>
                  <TickSmall />
                  <span>
                    {product.name} &mdash; <strong>Included</strong>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Divider />

          <VStack gap={1.5}>
            {progress.map((state) => (
              <HStack key={state.collectionSlug} gap={2} hAlign="between">
                <Text type="supporting" color="secondary">
                  {state.label}
                </Text>
                <Text type="supporting" weight="medium">
                  {state.chosen}/{state.required}
                </Text>
              </HStack>
            ))}
            {included.map((product) => (
              <HStack key={product.slug} gap={2} hAlign="between">
                <Text type="supporting" color="secondary">
                  {product.name}
                </Text>
                <Text type="supporting" weight="medium">
                  Included
                </Text>
              </HStack>
            ))}
          </VStack>

        </VStack>
      </aside>
    </div>
  );
}


/** "Chutney Powders" -> "Chutney Powder", so a slot reads "Chutney Powder 1". */
function singular(label: string): string {
  return label.endsWith('s') ? label.slice(0, -1) : label;
}

function TickSmall() {
  return (
    <svg viewBox="0 0 16 16" className="kf-list-icon" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M4.8 8.3l2.1 2.1 4.3-4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
