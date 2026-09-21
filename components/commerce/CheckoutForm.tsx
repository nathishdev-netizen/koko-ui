'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CouponField } from '@/components/commerce/CouponField';
import { OrderSummary } from '@/components/commerce/OrderSummary';
import {
  Button,
  Divider,
  Grid,
  Heading,
  RadioList,
  RadioListItem,
  Text,
  TextInput,
  VStack,
} from '@/components/ui';
import { commerce } from '@/config/commerce';
import { createCheckout } from '@/lib/api/checkout';
import { useCart } from '@/lib/cart/CartProvider';
import { checkoutSchema, fieldErrors } from '@/lib/validations/checkout';

/**
 * Checkout — contact, address, payment method, then order creation.
 *
 * Payment is a hosted redirect: the backend returns the gateway's URL and we
 * navigate there. No card details are collected by this form, which keeps PCI
 * scope minimal. COD skips the redirect and confirms immediately.
 */
export function CheckoutForm() {
  const { cart } = useCart();
  const router = useRouter();

  const [values, setValues] = useState<Record<string, string>>({
    email: '',
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    paymentMethod: 'online',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (key: string) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  // Destination drives shipping, so the quote updates as soon as the PIN is
  // complete — the customer sees the real figure before committing.
  const destination =
    values.postalCode?.length === 6
      ? { postalCode: values.postalCode, state: values.state, country: 'IN' }
      : undefined;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    const parsed = checkoutSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await createCheckout({
        email: parsed.data.email,
        shippingAddress: {
          fullName: parsed.data.fullName,
          line1: parsed.data.line1,
          line2: parsed.data.line2,
          city: parsed.data.city,
          state: parsed.data.state,
          postalCode: parsed.data.postalCode,
          country: 'IN',
          phone: parsed.data.phone,
        },
        paymentMethod: parsed.data.paymentMethod,
        couponCode: parsed.data.couponCode,
      });

      if (result.paymentUrl) {
        router.push(result.paymentUrl);
      } else {
        router.push(`/checkout/confirmed?order=${result.orderId}`);
      }
    } catch {
      setSubmitError('We could not start your order. Please try again.');
      setIsSubmitting(false);
    }
  }

  if (cart.lines.length === 0) {
    return (
      <VStack gap={3} padding={8} hAlign="center" className="kf-center-text">
        <Heading level={2}>Nothing to check out</Heading>
        <Button label="Shop all blends" href="/shop" variant="primary" />
      </VStack>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="kf-cart-grid">
        <VStack gap={5}>
          <VStack gap={3}>
            <Heading level={2}>Contact</Heading>
            <TextInput
                label="Email"
                value={values.email ?? ''}
                onChange={set('email')}
                type="email"
                autoComplete="email"
                status={errors.email ? { type: 'error', message: errors.email } : undefined}
                isRequired
              />
          </VStack>

          <Divider />

          <VStack gap={3}>
            <Heading level={2}>Delivery address</Heading>
            <Grid gap={3} columns={{ minWidth: 220, repeat: 'fit' }}>
              <TextInput
                label="Full name"
                value={values.fullName ?? ''}
                onChange={set('fullName')}
                autoComplete="name"
                status={errors.fullName ? { type: 'error', message: errors.fullName } : undefined}
                isRequired
              />
              <TextInput
                label="Mobile number"
                value={values.phone ?? ''}
                onChange={set('phone')}
                autoComplete="tel"
                status={errors.phone ? { type: 'error', message: errors.phone } : undefined}
                isRequired
              />
            </Grid>

            <TextInput
                label="Address"
                value={values.line1 ?? ''}
                onChange={set('line1')}
                autoComplete="address-line1"
                status={errors.line1 ? { type: 'error', message: errors.line1 } : undefined}
                isRequired
              />
            <TextInput
                label="Apartment, landmark"
                value={values.line2 ?? ''}
                onChange={set('line2')}
                autoComplete="address-line2"
                isOptional
              />

            <Grid gap={3} columns={{ minWidth: 160, repeat: 'fit' }}>
              <TextInput
                label="City"
                value={values.city ?? ''}
                onChange={set('city')}
                autoComplete="address-level2"
                status={errors.city ? { type: 'error', message: errors.city } : undefined}
                isRequired
              />
              <TextInput
                label="State"
                value={values.state ?? ''}
                onChange={set('state')}
                autoComplete="address-level1"
                status={errors.state ? { type: 'error', message: errors.state } : undefined}
                isRequired
              />
              <TextInput
                label="PIN code"
                value={values.postalCode ?? ''}
                onChange={set('postalCode')}
                autoComplete="postal-code"
                status={errors.postalCode ? { type: 'error', message: errors.postalCode } : undefined}
                isRequired
              />
            </Grid>
          </VStack>

          <Divider />

          <VStack gap={3}>
            <Heading level={2}>Payment</Heading>
            <RadioList
              value={values.paymentMethod ?? 'online'}
              onChange={set('paymentMethod')}
              label="Payment method"
              isLabelHidden
            >
              <RadioListItem
                value="online"
                label="Pay online"
                description="UPI, card or netbanking on a secure payment page."
              />
              {/* COD is config-driven so it can be switched off without code. */}
              {commerce.payment.codEnabled ? (
                <RadioListItem
                  value="cod"
                  label="Cash on delivery"
                  description={commerce.payment.codNote}
                />
              ) : null}
            </RadioList>
          </VStack>

          {submitError ? (
            <Text className="kf-form-error">{submitError}</Text>
          ) : null}
        </VStack>

        {/* The whole column sticks, not the summary alone: `.kf-summary` was
            sticky while its siblings were not, so it slid down over the coupon
            field and the Place order button. */}
        <VStack gap={3} className="kf-checkout-aside">
          <OrderSummary
            cart={cart}
            destination={destination}
            couponCode={values.couponCode || undefined}
          />
          <CouponField
            applied={values.couponCode || null}
            onApply={(code) => set('couponCode')(code)}
            onClear={() => set('couponCode')('')}
          />
          <Button
            label={isSubmitting ? 'Placing order…' : 'Place order'}
            variant="primary"
            size="lg"
            type="submit"
            isDisabled={isSubmitting}
          />
          <Text type="supporting" color="secondary">
            {values.paymentMethod === 'cod'
              ? 'Your order is confirmed straight away.'
              : 'You will be taken to a secure payment page.'}
          </Text>
        </VStack>
      </div>
    </form>
  );
}
