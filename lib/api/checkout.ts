import { isLive, request } from './client';
import type { CheckoutRequest, CheckoutResult } from './types';

const RESOURCE = 'checkout' as const;

/**
 * Creates the order.
 *
 * Payment is a hosted redirect: the backend returns a payment URL from the
 * gateway and the browser goes there. No card details ever pass through this
 * frontend, which keeps PCI scope at its minimum.
 *
 * COD returns `paymentUrl: null` and a confirmed order.
 */
export async function createCheckout(input: CheckoutRequest): Promise<CheckoutResult> {
  if (isLive(RESOURCE)) {
    return request<CheckoutResult>('/checkout', {
      method: 'POST',
      body: input,
      revalidate: 0,
    });
  }

  await new Promise((resolve) => setTimeout(resolve, 400));
  return {
    orderId: `KF${Date.now().toString().slice(-8)}`,
    paymentUrl: input.paymentMethod === 'cod' ? null : '/checkout/mock-payment',
    status: input.paymentMethod === 'cod' ? 'confirmed' : 'awaiting_payment',
  };
}
