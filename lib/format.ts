import type { Money } from '@/lib/api/types';

/**
 * Formats money for display. Amounts are integer paise, so this is the only
 * place the conversion to rupees happens.
 *
 * Whole rupees drop the decimals (₹300, not ₹300.00) — that is how prices are
 * written on the storefront.
 */
export function formatMoney(money: Money): string {
  const rupees = money.amount / 100;
  const hasPaise = money.amount % 100 !== 0;
  return `₹${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
