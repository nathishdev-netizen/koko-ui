import { isLive, request } from './client';
import type { Cart, CartLine } from './types';

const RESOURCE = 'cart' as const;

/**
 * Cart. Session-scoped and server-persisted — identity comes from the httpOnly
 * session cookie, never a caller-supplied id.
 *
 * The mock keeps an in-memory cart so the flow is demoable; it resets on
 * reload, which is fine because the real cart lives in Frappe.
 */
let mockCart: Cart = { id: 'mock-cart', lines: [], itemCount: 0 };

/**
 * Dev-only seed so the cart and checkout can be reviewed without clicking
 * through. Off in production, and it never runs when the cart is live.
 */
if (process.env.NEXT_PUBLIC_SEED_CART === '1') {
  mockCart = {
    id: 'mock-cart',
    itemCount: 3,
    lines: [
      {
        id: 'line-1',
        variantId: 'mysore-rasam-powder-200g',
        productSlug: 'signature-blends/mysore-rasam-powder',
        name: 'Mysore Rasam Powder',
        variantLabel: '200g',
        image: null,
        unitPrice: { amount: 20000, currency: 'INR' },
        quantity: 1,
      },
      {
        id: 'line-2',
        variantId: 'mysore-sambar-powder-100g',
        productSlug: 'signature-blends/mysore-sambar-powder',
        name: 'Mysore Sambar Powder',
        variantLabel: '100g',
        image: null,
        unitPrice: { amount: 14000, currency: 'INR' },
        quantity: 2,
      },
    ],
  };
}

function recount(lines: readonly CartLine[]): Cart {
  return {
    id: 'mock-cart',
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
  };
}

export async function getCart(): Promise<Cart> {
  if (isLive(RESOURCE)) {
    return request<Cart>('/cart', { revalidate: 0 });
  }
  return mockCart;
}

export async function addToCart(line: Omit<CartLine, 'id'>): Promise<Cart> {
  if (isLive(RESOURCE)) {
    return request<Cart>('/cart', { method: 'POST', body: line, revalidate: 0 });
  }

  const existing = mockCart.lines.find((l) => l.variantId === line.variantId);
  const lines = existing
    ? mockCart.lines.map((l) =>
        l.variantId === line.variantId
          ? { ...l, quantity: l.quantity + line.quantity }
          : l,
      )
    : [...mockCart.lines, { ...line, id: `line-${mockCart.lines.length + 1}` }];

  mockCart = recount(lines);
  return mockCart;
}

export async function updateCartLine(id: string, quantity: number): Promise<Cart> {
  if (isLive(RESOURCE)) {
    return request<Cart>('/cart', {
      method: 'PATCH',
      body: { id, quantity },
      revalidate: 0,
    });
  }
  const lines = mockCart.lines
    .map((l) => (l.id === id ? { ...l, quantity } : l))
    .filter((l) => l.quantity > 0);
  mockCart = recount(lines);
  return mockCart;
}

export async function removeCartLine(id: string): Promise<Cart> {
  if (isLive(RESOURCE)) {
    return request<Cart>('/cart', { method: 'DELETE', body: { id }, revalidate: 0 });
  }
  mockCart = recount(mockCart.lines.filter((l) => l.id !== id));
  return mockCart;
}
