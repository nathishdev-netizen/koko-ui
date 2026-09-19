import { isLive, request } from './client';
import { mockDelay } from './mocks';
import type { Order } from './types';

const RESOURCE = 'orders' as const;

/**
 * Orders for the signed-in customer.
 *
 * Scope comes from the session cookie — the endpoint takes no customer id.
 * The legacy `/api/first-order-coupon` accepted a `contactId` in the body and
 * skipped its auth check whenever one was present, so anyone could mint a
 * coupon for any customer.
 */
export async function getOrders(): Promise<readonly Order[]> {
  if (isLive(RESOURCE)) {
    return request<readonly Order[]>('/orders', { revalidate: 0 });
  }
  await mockDelay();
  return mockOrders;
}

export async function getOrder(id: string): Promise<Order | null> {
  if (isLive(RESOURCE)) {
    try {
      return await request<Order>(`/orders/${encodeURIComponent(id)}`, { revalidate: 0 });
    } catch {
      return null;
    }
  }
  await mockDelay();
  return mockOrders.find((order) => order.id === id) ?? null;
}

const inr = (amount: number) => ({ amount, currency: 'INR' }) as const;

const mockOrders: readonly Order[] = [
  {
    id: 'KF20460912',
    placedAt: '2026-09-12T09:24:00.000Z',
    status: 'shipped',
    lines: [
      {
        name: 'Mysore Rasam Powder',
        variantLabel: '200g',
        quantity: 1,
        unitPrice: inr(20000),
        image: null,
      },
      {
        name: 'Groundnut Chutney Powder',
        variantLabel: '100g',
        quantity: 2,
        unitPrice: inr(11000),
        image: null,
      },
    ],
    subtotal: inr(42000),
    shippingFee: inr(0),
    discount: inr(0),
    total: inr(42000),
    shippingAddress: {
      fullName: 'Priya Rao',
      line1: '14, 5th Cross, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'IN',
      phone: '+91 98450 00000',
    },
    trackingUrl: 'https://example.com/track/KF20460912',
  },
  {
    id: 'KF20460821',
    placedAt: '2026-08-21T14:02:00.000Z',
    status: 'delivered',
    lines: [
      {
        name: 'Malnad Black Pepper Powder',
        variantLabel: '100g',
        quantity: 1,
        unitPrice: inr(18000),
        image: null,
      },
    ],
    subtotal: inr(18000),
    shippingFee: inr(5000),
    discount: inr(0),
    total: inr(23000),
    shippingAddress: {
      fullName: 'Priya Rao',
      line1: '14, 5th Cross, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'IN',
      phone: '+91 98450 00000',
    },
  },
];
