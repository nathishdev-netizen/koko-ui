import { Text } from '@/components/ui';

/** Trust row from the legacy bundle page — same three claims. */
const CLAIMS: readonly string[] = [
  'Freshly Ground',
  'No Preservatives',
  'Best Value',
];

export function BundleTrust() {
  return (
    <ul className="kf-bundle-trust" aria-label="Why buy a bundle">
      {CLAIMS.map((claim) => (
        <li key={claim}>
          <CheckIcon />
          <Text type="supporting" weight="medium">
            {claim}
          </Text>
        </li>
      ))}
    </ul>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="kf-trust-icon" aria-hidden="true">
      <path
        d="M2.5 8.5l3.5 3.5 7.5-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
