import { isLive, request } from './client';
import { mockDelay } from './mocks';
import type { ContactReceipt, ContactSubmission } from './types';

const RESOURCE = 'contact' as const;

/**
 * Sends a contact-form message. The legacy site posted this to a Wix form
 * (`/api/form-submission`, field keys like `first_name_7a97`); here it is a
 * plain typed POST the backend team maps to a CRM lead.
 *
 * The receipt carries no message body back — nothing on the page should
 * echo what the customer typed as if it had been "published".
 */
export async function submitContactMessage(input: ContactSubmission): Promise<ContactReceipt> {
  // Honeypot: real browsers leave hidden fields empty. Resolve silently so a
  // bot cannot tell it was caught.
  if (input.website) {
    return { id: 'msg-discarded', receivedAt: new Date().toISOString() };
  }

  if (isLive(RESOURCE)) {
    return request<ContactReceipt>('/contact', { method: 'POST', body: input, revalidate: 0 });
  }

  await mockDelay(350);
  return { id: `msg-${Date.now()}`, receivedAt: new Date().toISOString() };
}
