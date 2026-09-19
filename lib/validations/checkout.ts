import { z } from 'zod';

/**
 * Checkout form rules.
 *
 * Indian address shapes: a 6-digit PIN and a 10-digit mobile (optionally with
 * +91). Phone matching tolerates spaces because that is how people type it.
 */
export const checkoutSchema = z.object({
  email: z.email('Enter a valid email address.'),
  fullName: z.string().min(2, 'Enter the recipient’s name.'),
  phone: z
    .string()
    .transform((value) => value.replace(/[\s-]/g, ''))
    .refine(
      (value) => /^(\+?91)?[6-9]\d{9}$/.test(value),
      'Enter a 10-digit Indian mobile number.',
    ),
  line1: z.string().min(4, 'Enter the street address.'),
  line2: z.string().optional(),
  city: z.string().min(2, 'Enter the city.'),
  state: z.string().min(2, 'Enter the state.'),
  postalCode: z
    .string()
    .regex(/^\d{6}$/, 'Enter a 6-digit PIN code.'),
  paymentMethod: z.enum(['online', 'cod']),
  couponCode: z.string().optional(),
});

export type CheckoutForm = z.infer<typeof checkoutSchema>;

/** Field-keyed errors, so each input can show its own message. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '');
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
