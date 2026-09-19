import { BeakerIcon, LeafIcon, ShieldCheckIcon } from '@/components/icons';

const ICONS = {
  'shield-check': ShieldCheckIcon,
  leaf: LeafIcon,
  beaker: BeakerIcon,
} as const;

/**
 * Trust strip under the hero. Server component — no JS.
 *
 * The legacy version duplicated the badge markup so a CSS marquee could loop on
 * mobile; here the row simply scrolls if it overflows, which keeps the DOM
 * honest (a screen reader is not read the same three badges twice).
 */
export function TrustBadges({
  items,
}: {
  items: readonly { icon: string; label: string }[];
}) {
  return (
    <section className="kf-trust" aria-label="Our promises">
      <ul className="kf-trust-list">
        {items.map((item) => {
          const Icon = ICONS[item.icon as keyof typeof ICONS] ?? ShieldCheckIcon;
          return (
            <li key={item.label} className="kf-trust-item">
              <Icon aria-hidden="true" className="kf-trust-icon" />
              <span>{item.label}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
