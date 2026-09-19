'use client';

import Image from 'next/image';
import { useEffect } from 'react';

import { Button, Divider, Heading, HStack, Icon, IconButton, Text, VStack } from '@/components/ui';
import { commerce } from '@/config/commerce';
import { useCart } from '@/lib/cart/CartProvider';
import { formatMoney } from '@/lib/format';

/**
 * Slide-out cart.
 *
 * Opening the cart should not cost the customer their place on the page, which
 * is why the header icon opens this rather than navigating to /cart. The full
 * page still exists for anyone who lands on it directly.
 */
export function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { cart, update, remove } = useCart();

  // Escape closes, and the page behind must not scroll while it is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotal = cart.lines.reduce(
    (sum, line) => sum + line.unitPrice.amount * line.quantity,
    0,
  );
  const shortfall = commerce.shipping.freeThresholdPaise - subtotal;

  return (
    <>
      <button
        type="button"
        className="kf-scrim"
        aria-label="Close cart"
        onClick={onClose}
      />
      <aside className="kf-drawer" role="dialog" aria-label="Your cart" aria-modal="true">
        <VStack gap={3}>
          <HStack gap={2} hAlign="between" vAlign="center">
            <Heading level={2}>Your cart</Heading>
            <IconButton
              label="Close cart"
              variant="ghost"
              onClick={onClose}
              icon={<Icon icon="close" />}
            />
          </HStack>

          <Divider />

          {cart.lines.length === 0 ? (
            <VStack gap={3} padding={4} hAlign="center">
              <Text color="secondary">Your cart is empty.</Text>
              <Button label="Shop all blends" href="/shop" variant="primary" onClick={onClose} />
            </VStack>
          ) : (
            <>
              <div className="kf-drawer-lines">
                {cart.lines.map((line) => (
                  <div key={line.id} className="kf-drawer-line">
                    <div className="kf-drawer-media">
                      {line.image ? (
                        <Image
                          src={line.image.url}
                          alt=""
                          fill
                          sizes="64px"
                          className="kf-cart-img"
                        />
                      ) : null}
                    </div>
                    <VStack gap={0.5}>
                      <Text type="supporting" weight="medium" maxLines={2}>
                        {line.name}
                      </Text>
                      <Text type="supporting" color="secondary">
                        {line.variantLabel} × {line.quantity}
                      </Text>
                      <HStack gap={1.5} vAlign="center">
                        <span className="kf-numeric">
                          {formatMoney({
                            amount: line.unitPrice.amount * line.quantity,
                            currency: 'INR',
                          })}
                        </span>
                        <button
                          type="button"
                          className="kf-link-button"
                          onClick={() => remove(line.id)}
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          className="kf-link-button"
                          onClick={() => update(line.id, line.quantity + 1)}
                        >
                          + Add one
                        </button>
                      </HStack>
                    </VStack>
                  </div>
                ))}
              </div>

              <Divider />

              <VStack gap={2}>
                <HStack gap={2} hAlign="between" vAlign="end">
                  <Text weight="medium">Subtotal</Text>
                  <span className="kf-price kf-price--sm kf-numeric">
                    {formatMoney({ amount: subtotal, currency: 'INR' })}
                  </span>
                </HStack>
                <Text type="supporting" color="secondary">
                  {shortfall > 0
                    ? `Add ${formatMoney({ amount: shortfall, currency: 'INR' })} more for free shipping.`
                    : 'Free shipping applied.'}
                </Text>
                <Button label="View cart" href="/cart" variant="secondary" onClick={onClose} />
                <Button label="Checkout" href="/checkout" variant="primary" onClick={onClose} />
              </VStack>
            </>
          )}
        </VStack>
      </aside>
    </>
  );
}
