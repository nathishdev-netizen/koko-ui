import { isLive, request } from './client';
import type { Session } from './types';

const RESOURCE = 'orders' as const;

/**
 * Current session.
 *
 * Identity comes from Frappe's httpOnly session cookie. This frontend never
 * reads, stores or forwards a token — the legacy site kept both access and
 * refresh tokens in JS-readable cookies, so any XSS handed an attacker a
 * long-lived refresh token.
 */
export async function getSession(): Promise<Session> {
  if (isLive(RESOURCE)) {
    try {
      return await request<Session>('/session', { revalidate: 0 });
    } catch {
      return { customer: null };
    }
  }

  // Mock: signed in, so account screens are reviewable before auth lands.
  if (process.env.NEXT_PUBLIC_MOCK_SIGNED_IN === '0') {
    return { customer: null };
  }
  return {
    customer: {
      id: 'cust-mock-1',
      email: 'nathish@example.com',
      name: 'Nathish L',
      phone: '+91 98450 00000',
    },
  };
}
