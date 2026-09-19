import { isLive, request } from './client';
import { mockDelay } from './mocks';
import type { Review, ReviewSubmission, ReviewSummary } from './types';

import reviewsJson from './mocks/reviews.json';

const RESOURCE = 'reviews' as const;

let mockReviews = reviewsJson as unknown as Review[];

/**
 * Reviews for a product.
 *
 * Only APPROVED reviews are ever returned for display, and the average is
 * computed over approved only — the legacy rule, kept. A pending review is
 * visible to nobody until a moderator clears it.
 */
export async function getReviews(productSlug: string): Promise<readonly Review[]> {
  if (isLive(RESOURCE)) {
    return request<readonly Review[]>('/reviews', {
      searchParams: { product: productSlug },
      revalidate: 300,
      tags: ['reviews', `reviews:${productSlug}`],
    });
  }
  await mockDelay();
  return mockReviews.filter(
    (r) => r.productSlug === productSlug && r.status === 'approved',
  );
}

export function summarise(reviews: readonly Review[]): ReviewSummary {
  const approved = reviews.filter((r) => r.status === 'approved');
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;

  for (const review of approved) {
    const star = Math.round(review.rating) as 1 | 2 | 3 | 4 | 5;
    if (star >= 1 && star <= 5) distribution[star] += 1;
  }

  if (approved.length === 0) {
    return { average: null, total: 0, distribution };
  }

  const sum = approved.reduce((total, r) => total + r.rating, 0);
  return {
    average: Math.round((sum / approved.length) * 10) / 10,
    total: approved.length,
    distribution,
  };
}

/**
 * Submits a review. It lands as PENDING — moderated before it appears, which
 * is what keeps the rating on a product honest.
 *
 * One review per customer per product is enforced by the backend against the
 * session, not by anything this layer can check.
 */
export async function submitReview(input: ReviewSubmission): Promise<Review> {
  if (isLive(RESOURCE)) {
    return request<Review>('/reviews', { method: 'POST', body: input, revalidate: 0 });
  }

  await mockDelay(300);
  const review: Review = {
    id: `rev-${Date.now()}`,
    productSlug: input.productSlug,
    rating: input.rating,
    title: input.title,
    body: input.body,
    authorName: input.authorName,
    createdAt: new Date().toISOString(),
    status: 'pending',
    isVerifiedPurchase: false,
  };
  mockReviews = [...mockReviews, review];
  return review;
}
