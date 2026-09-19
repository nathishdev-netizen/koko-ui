'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  addToCart as apiAdd,
  getCart,
  removeCartLine as apiRemove,
  updateCartLine as apiUpdate,
} from '@/lib/api/cart';
import type { Cart, CartLine } from '@/lib/api/types';

type CartContextValue = {
  readonly cart: Cart;
  readonly isLoading: boolean;
  readonly add: (line: Omit<CartLine, 'id'>) => Promise<void>;
  readonly update: (id: string, quantity: number) => Promise<void>;
  readonly remove: (id: string) => Promise<void>;
};

const EMPTY: Cart = { id: '', lines: [], itemCount: 0 };

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Cart state.
 *
 * Every mutation goes through `lib/api/cart`, so the cart is server-owned and
 * this holds only the last response. Nothing about money is computed here —
 * totals come from `getQuote()` at the point of display.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCart()
      .then((next) => {
        if (active) setCart(next);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const add = useCallback(async (line: Omit<CartLine, 'id'>) => {
    setCart(await apiAdd(line));
  }, []);

  const update = useCallback(async (id: string, quantity: number) => {
    setCart(await apiUpdate(id, quantity));
  }, []);

  const remove = useCallback(async (id: string) => {
    setCart(await apiRemove(id));
  }, []);

  const value = useMemo(
    () => ({ cart, isLoading, add, update, remove }),
    [cart, isLoading, add, update, remove],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
