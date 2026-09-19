/**
 * Commerce icons.
 *
 * Astryx ships ~26 semantic icons (search, menu, close, chevrons…) but none for
 * commerce, so these five are hand-written rather than pulling in an icon
 * library for a handful of glyphs. They are plain SVG components matching the
 * shape Astryx's <Icon icon={...} /> expects.
 *
 * All use `currentColor` and inherit sizing from Icon, so they pick up theme
 * colour automatically. Paths are from Lucide (ISC licensed), the set the
 * legacy site used, so the visual language is unchanged.
 */
import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function CartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

export function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function LeafIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

export function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/**
 * Chilli — the heat indicator for a spice brand.
 *
 * Filled rather than stroked so a row of them reads at 12px, where an outline
 * would turn to mush. The stem is a separate path so it keeps its green even
 * when the pod is dimmed for an "off" step.
 */
export function ChilliIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M13.6 4.2c.9-1.1 2.3-1.6 3.6-1.3.3.07.5.36.45.67-.2 1.2-1 2.2-2.1 2.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="kf-chilli-stem"
      />
      <path
        d="M14.9 6.1c1.6 1.5 2.3 3.8 1.9 6-.6 3.5-3.4 6.3-6.9 6.9-2 .35-4-.2-5.5-1.5-.4-.35-.3-1 .2-1.2 2.4-1 4.2-3 5-5.5.7-2.2 2.3-4 4.4-4.8.3-.12.65-.05.9.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BeakerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 3h15" />
      <path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" />
      <path d="M6 14h12" />
    </svg>
  );
}
