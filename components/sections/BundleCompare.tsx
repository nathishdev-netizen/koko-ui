import { Heading, Text, VStack } from '@/components/ui';
import { formatMoney } from '@/lib/format';
import type { Bundle } from '@/lib/api/types';

/**
 * "Compare Our Bundles" — the legacy comparison table, driven by bundle data
 * rather than the hardcoded three columns it used.
 *
 * Scrolls inside its own container on narrow screens; the first column is
 * sticky so the row label stays readable while the values scroll.
 */
export function BundleCompare({
  bundles,
  currentSlug,
}: {
  bundles: readonly Bundle[];
  /** Highlights the bundle being viewed, as the legacy table did. */
  currentSlug?: string;
}) {
  if (bundles.length < 2) return null;

  const rows: readonly { label: string; value: (b: Bundle) => string }[] = [
    { label: 'Price', value: (b) => formatMoney(b.price) },
    { label: 'Items', value: (b) => `${b.itemCount} items` },
    { label: 'You save', value: (b) => formatMoney(b.savings) },
    { label: 'Best for', value: (b) => b.bestFor ?? '—' },
    { label: 'Lasts', value: (b) => b.lasts ?? '—' },
    {
      label: 'Gift ready',
      value: (b) => (b.giftReady === 'premium' ? 'Premium' : b.giftReady === 'yes' ? 'Yes' : '—'),
    },
  ];

  return (
    <VStack gap={4}>
      <VStack gap={1} hAlign="center" className="kf-center-text">
        <Heading level={2}>Compare Our Bundles</Heading>
        <Text type="supporting" color="secondary" className="kf-swipe-hint">
          Swipe to compare
        </Text>
      </VStack>

      <div className="kf-compare-scroll">
        <table className="kf-compare">
          <caption className="kf-sr-only">
            Price, contents and savings for each bundle
          </caption>
          <thead>
            <tr>
              <th scope="col">Bundle</th>
              {bundles.map((bundle) => (
                <th
                  key={bundle.slug}
                  scope="col"
                  data-current={bundle.slug === currentSlug || undefined}
                >
                  {bundle.name}
                  {bundle.slug === currentSlug ? (
                    <span className="kf-compare-current">Viewing</span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {bundles.map((bundle) => (
                  <td
                    key={bundle.slug}
                    className="kf-numeric"
                    data-current={bundle.slug === currentSlug || undefined}
                  >
                    {row.value(bundle)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </VStack>
  );
}
