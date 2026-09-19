import { Heading } from '@/components/ui';

/**
 * Stats band. These are marketing claims supplied as content, not measured
 * figures — they live in content/home.json so marketing owns them.
 */
export function SocialProof({
  items,
}: {
  items: readonly { value: string; label: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="kf-stats" aria-label="By the numbers">
      <div className="kf-container">
        <dl className="kf-stats-grid">
          {items.map((item) => (
            <div key={item.label} className="kf-stat">
              <dt className="kf-stat-label">{item.label}</dt>
              <dd className="kf-stat-value">
                <Heading level={3} type="display-2">
                  {item.value}
                </Heading>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
