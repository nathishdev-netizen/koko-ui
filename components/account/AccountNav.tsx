'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/account', label: 'Overview' },
  { href: '/account/orders', label: 'Orders' },
  { href: '/account/wishlist', label: 'Wishlist' },
  { href: '/account/addresses', label: 'Addresses' },
] as const;

/** Account section navigation. */
export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="kf-account-nav">
      <ul>
        {LINKS.map((link) => {
          // Exact match for the overview, prefix match for the rest, so
          // /account/orders does not also light up Overview.
          const isActive =
            link.href === '/account'
              ? pathname === '/account'
              : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link href={link.href} data-active={isActive || undefined}>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
