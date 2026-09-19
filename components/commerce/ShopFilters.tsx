'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Button, HStack, Text } from '@/components/ui';
import type { Collection } from '@/lib/api/types';
import { PRICE_BANDS } from '@/lib/shop/priceBands';

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name';

/**
 * A `<select>` sizes itself to its LONGEST option, not the selected one, so
 * verbose labels widen the closed control and leave a gap before the chevron.
 * These stay unambiguous while keeping it compact — the "SORT" label beside the
 * control already supplies the context a longer phrase would repeat.
 */
const SORTS: readonly { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: low first' },
  { key: 'price-desc', label: 'Price: high first' },
  { key: 'name', label: 'Name: A–Z' },
];

/**
 * Filter and sort controls.
 *
 * State lives in the URL, not in React: every filtered view is linkable,
 * shareable and server-rendered. The legacy shop kept this in client state and
 * silently defaulted the category to "Best Sellers", so /shop never showed the
 * full catalogue on first load.
 */
export function ShopFilters({
  collections,
  activeCollection,
  activeSort,
  activeQuery,
  activePriceBand,
  total,
}: {
  collections: readonly Collection[];
  activeCollection: string | null;
  activeSort: SortKey;
  activeQuery: string;
  activePriceBand: string | null;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null) next.delete(key);
      else next.set(key, value);
      // Any filter change resets paging — page 3 of the old filter is meaningless.
      next.delete('page');
      const query = next.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  // The search box is typed into, so it needs local state; it is debounced into
  // the URL rather than pushing a route on every keystroke.
  const [query, setQuery] = useState(activeQuery);

  // Keep in step when the URL changes from elsewhere (chip, Clear, back button).
  useEffect(() => setQuery(activeQuery), [activeQuery]);

  useEffect(() => {
    if (query === activeQuery) return;
    const timer = setTimeout(() => setParam('q', query.trim() || null), 300);
    return () => clearTimeout(timer);
  }, [query, activeQuery, setParam]);

  const hasFilters =
    activeCollection !== null ||
    activeSort !== 'featured' ||
    activeQuery !== '' ||
    activePriceBand !== null;

  return (
    <div className="kf-filters">
      <div className="kf-search">
        <SearchIcon />
        <input
          type="search"
          className="kf-search-input"
          placeholder="Search spices…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search products"
        />
      </div>

      <HStack gap={1.5} wrap="wrap" vAlign="center">
        <Text type="supporting" color="secondary" className="kf-filter-label">
          Type
        </Text>
        <FilterChip
          label="All"
          isActive={activeCollection === null}
          onClick={() => setParam('collection', null)}
        />
        {collections.map((collection) => (
          <FilterChip
            key={collection.slug}
            label={collection.name}
            isActive={activeCollection === collection.slug}
            onClick={() => setParam('collection', collection.slug)}
          />
        ))}
      </HStack>

      <HStack gap={1.5} wrap="wrap" vAlign="center">
        <Text type="supporting" color="secondary" className="kf-filter-label">
          Price
        </Text>
        <FilterChip
          label="Any"
          isActive={activePriceBand === null}
          onClick={() => setParam('price', null)}
        />
        {PRICE_BANDS.map((band) => (
          <FilterChip
            key={band.key}
            label={band.label}
            isActive={activePriceBand === band.key}
            onClick={() => setParam('price', band.key)}
          />
        ))}
      </HStack>

      <HStack gap={2} vAlign="center" wrap="wrap">
        <Text type="supporting" color="secondary">
          {total} {total === 1 ? 'product' : 'products'}
        </Text>

        <label className="kf-sort">
          {/* A visible label: on its own the control just reads "Featured",
              which does not say what it does. It also matches the TYPE / PRICE
              labels on the rows above. */}
          <span className="kf-filter-label">Sort</span>
          <select
            value={activeSort}
            onChange={(event) => setParam('sort', event.target.value)}
            className="kf-sort-select"
          >
            {SORTS.map((sort) => (
              <option key={sort.key} value={sort.key}>
                {sort.label}
              </option>
            ))}
          </select>
        </label>

        {hasFilters ? (
          <Button
            label="Clear"
            variant="ghost"
            size="sm"
            onClick={() => router.push(pathname, { scroll: false })}
          />
        ) : null}
      </HStack>
    </div>
  );
}

function FilterChip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="kf-chip"
      data-active={isActive || undefined}
      aria-pressed={isActive}
    >
      {label}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" className="kf-search-icon" aria-hidden="true">
      <path
        d="M9 3a6 6 0 104.24 10.24l3.26 3.26 1.5-1.5-3.26-3.26A6 6 0 009 3zm0 2a4 4 0 110 8 4 4 0 010-8z"
        fill="currentColor"
      />
    </svg>
  );
}

export { SORTS };
