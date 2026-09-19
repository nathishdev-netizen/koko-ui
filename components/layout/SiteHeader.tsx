'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { AnnouncementBar } from './AnnouncementBar';
import { CartIcon, HeartIcon, UserIcon } from '@/components/icons';
import {
  Badge,
  HStack,
  Icon,
  IconButton,
  TopNav,
  TopNavHeading,
  TopNavItem,
} from '@/components/ui';
import type { Brand } from '@/config/brand';
import type { NavItem } from '@/config/nav';
import { CartDrawer } from '@/components/commerce/CartDrawer';
import { useCart } from '@/lib/cart/CartProvider';

type Props = {
  brand: Brand;
  navItems: readonly NavItem[];
  announcement: { desktop: string; mobile: string };
  /** Wishlist count is still static until Phase 7. */
  cartCount?: number;
  wishlistCount?: number;
};

/**
 * Site header.
 *
 * AppShell (in the layout) owns the skip link, the <main> landmark and the
 * mobile drawer, so none of that is re-implemented here — doing so would
 * create a duplicate main landmark and a second skip link.
 *
 * Brand identity and nav come in as props from config, never read directly,
 * so this component holds no brand facts.
 */
export function SiteHeader({
  brand,
  navItems,
  announcement,
  wishlistCount = 0,
}: Props) {
  const pathname = usePathname();
  // Live count from the cart, so the badge reflects what is actually in it.
  const { cart } = useCart();
  const cartCount = cart.itemCount;
  const [cartOpen, setCartOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <div className="kf-header">
      <AnnouncementBar desktop={announcement.desktop} mobile={announcement.mobile} />

      <TopNav
        label="Main navigation"
        heading={
          <TopNavHeading
            heading={brand.name}
            headingHref="/"
            logo={
              // The real brand mark, self-hosted. Rendered directly rather than
              // through NavIcon, whose circular chip would crop a logo that
              // already carries its own shape. Alt is empty because the
              // adjacent wordmark names the link.
              <Image
                src={brand.logo.src}
                alt=""
                width={36}
                height={36}
                className="kf-logo"
                priority
              />
            }
          />
        }
        startContent={
          <>
            {navItems.map((item) => (
              <TopNavItem
                key={item.href}
                label={item.label}
                href={item.href}
                isSelected={isActive(item.href)}
              />
            ))}
          </>
        }
        endContent={
          <HStack gap={0.5} vAlign="center">
            <IconButton
              label="Search products"
              variant="ghost"
              icon={<Icon icon="search" />}
            />

            <CountedAction
              href="/account/wishlist"
              label="Wishlist"
              count={wishlistCount}
              icon={<HeartIcon />}
            />

            <IconButton
              label="Account"
              variant="ghost"
              href="/login"
              icon={<UserIcon />}
            />

            <CountedAction
              label="Cart"
              count={cartCount}
              icon={<CartIcon />}
              onClick={() => setCartOpen(true)}
            />
          </HStack>
        }
      />

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

/** Icon action with an optional count badge (cart, wishlist). */
function CountedAction({
  href,
  label,
  count,
  icon,
  onClick,
}: {
  href?: string;
  label: string;
  count: number;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  // The count is folded into the accessible name so screen-reader users hear
  // "Cart, 3 items" rather than an unexplained number.
  const accessibleLabel = count > 0 ? `${label}, ${count} items` : label;

  return (
    <span className="kf-counted-action">
      <IconButton
        label={accessibleLabel}
        variant="ghost"
        href={href}
        onClick={onClick}
        icon={icon}
      />
      {count > 0 ? (
        <span className="kf-count-badge" aria-hidden="true">
          <Badge label={String(count)} variant="orange" />
        </span>
      ) : null}
    </span>
  );
}
