'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { Dialog } from '@/components/ui';
import { getProducts } from '@/lib/api/products';
import { formatMoney } from '@/lib/format';
import type { ProductSummary } from '@/lib/api/types';

/**
 * Header search — the legacy ProductSearch overlay.
 *
 * Empty state offers popular searches and the categories, as legacy did, so
 * the panel is useful before a single key is pressed. Typing queries the
 * products API (debounced 250ms); results are keyboard-navigable with the
 * arrow keys and Enter.
 *
 * Search state is NOT in the URL here — this is a jump-to-product affordance,
 * not a filtered view. Pressing Enter with no highlighted result falls through
 * to /shop?q=, which IS linkable and server-rendered.
 */
const POPULAR = [
  'Sambar Powder',
  'Rasam Powder',
  'Chutney Powder',
  'Black Pepper',
] as const;

export function SearchOverlay({
  isOpen,
  onClose,
  categories,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories: readonly { label: string; href: string }[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<readonly ProductSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the field when the panel opens, and reset it when it closes.
  useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(id);
    }
    setQuery('');
    setResults([]);
    setHighlighted(-1);
    return undefined;
  }, [isOpen]);

  // Debounced query. The trailing flag stops an in-flight response from
  // overwriting results for a newer query.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsSearching(false);
      return undefined;
    }
    let live = true;
    setIsSearching(true);
    const id = window.setTimeout(async () => {
      try {
        const page = await getProducts({ q: trimmed, pageSize: 6 });
        if (live) {
          setResults(page.items);
          setHighlighted(-1);
        }
      } finally {
        if (live) setIsSearching(false);
      }
    }, 250);
    return () => {
      live = false;
      window.clearTimeout(id);
    };
  }, [query]);

  function go(href: string) {
    onClose();
    router.push(href);
  }

  function productHref(product: ProductSummary) {
    return `/shop/${product.primaryCollectionSlug}/${product.slug}`;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const chosen = results[highlighted];
    if (chosen) {
      go(productHref(chosen));
      return;
    }
    const trimmed = query.trim();
    if (trimmed) go(`/shop?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()} purpose="info" padding={0} width={640}>
      <div className="kf-search-panel">
        <form className="kf-search-head" onSubmit={onSubmit} role="search">
          <SearchMark />
          <input
            ref={inputRef}
            type="search"
            className="kf-search-field"
            placeholder="Search masalas, chutney powders, spices…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlighted((i) => Math.min(i + 1, results.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlighted((i) => Math.max(i - 1, -1));
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            aria-label="Search products"
            autoComplete="off"
          />
          <button type="button" className="kf-picker-close" onClick={onClose} aria-label="Close search">
            <CloseMark />
          </button>
        </form>

        <div className="kf-search-body">
          {query.trim().length >= 2 ? (
            <>
              {isSearching && results.length === 0 ? (
                <p className="kf-search-note">Searching…</p>
              ) : null}

              {!isSearching && results.length === 0 ? (
                <p className="kf-search-note">
                  Nothing matched “{query.trim()}”. Try a blend name, or browse the
                  categories below.
                </p>
              ) : null}

              {results.length > 0 ? (
                <ul className="kf-search-results">
                  {results.map((product, index) => (
                    <li key={product.slug}>
                      <button
                        type="button"
                        className="kf-search-result"
                        data-highlighted={highlighted === index || undefined}
                        onMouseEnter={() => setHighlighted(index)}
                        onClick={() => go(productHref(product))}
                      >
                        <span className="kf-search-thumb">
                          {product.image ? (
                            <Image src={product.image.url} alt="" fill sizes="48px" className="kf-thumb-img" />
                          ) : null}
                        </span>
                        <span className="kf-search-result-text">
                          <span className="kf-search-result-name">{product.name}</span>
                          <span className="kf-search-result-price kf-numeric">
                            {formatMoney(product.priceFrom)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <>
              <section className="kf-search-group">
                <h3 className="kf-search-group-title">Popular searches</h3>
                <div className="kf-search-chips">
                  {POPULAR.map((term) => (
                    <button
                      key={term}
                      type="button"
                      className="kf-search-chip"
                      onClick={() => setQuery(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </section>

              {categories.length > 0 ? (
                <section className="kf-search-group">
                  <h3 className="kf-search-group-title">Browse categories</h3>
                  <div className="kf-search-chips">
                    {categories.map((category) => (
                      <button
                        key={category.href}
                        type="button"
                        className="kf-search-chip"
                        onClick={() => go(category.href)}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}

function SearchMark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="kf-search-mark" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CloseMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
