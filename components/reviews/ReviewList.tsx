import { StarRating } from '@/components/reviews/StarRating';
import { Badge, Divider, Heading, HStack, Text, VStack } from '@/components/ui';
import type { Review, ReviewSummary } from '@/lib/api/types';

/**
 * Review list with a rating breakdown.
 *
 * Only approved reviews reach here. When a product has none we say so plainly
 * rather than showing an empty five-star row, which would imply a rating that
 * does not exist.
 */
export function ReviewList({
  reviews,
  summary,
}: {
  reviews: readonly Review[];
  summary: ReviewSummary;
}) {
  if (summary.total === 0 || summary.average === null) {
    return (
      <VStack gap={1}>
        <Heading level={2}>Reviews</Heading>
        <Text color="secondary">
          No reviews yet. If you have cooked with this blend, we would like to hear
          about it.
        </Text>
      </VStack>
    );
  }

  const stars = [5, 4, 3, 2, 1] as const;

  return (
    <VStack gap={4}>
      <Heading level={2}>Reviews</Heading>

      <div className="kf-review-summary">
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <span className="kf-review-average kf-numeric">{summary.average}</span>
            <StarRating rating={summary.average} size="md" />
          </HStack>
          <Text type="supporting" color="secondary">
            {summary.total} {summary.total === 1 ? 'review' : 'reviews'}
          </Text>
        </VStack>

        <VStack gap={1} className="kf-review-bars">
          {stars.map((star) => {
            const count = summary.distribution[star];
            const percent = Math.round((count / summary.total) * 100);
            return (
              <HStack key={star} gap={2} vAlign="center">
                <Text type="supporting" color="secondary">
                  {star}★
                </Text>
                <span
                  className="kf-progress kf-review-bar"
                  role="img"
                  aria-label={`${star} stars: ${count} of ${summary.total}`}
                >
                  <span className="kf-progress-fill" style={{ width: `${percent}%` }} />
                </span>
                <Text type="supporting" color="secondary">
                  {count}
                </Text>
              </HStack>
            );
          })}
        </VStack>
      </div>

      <Divider />

      <VStack gap={4}>
        {reviews.map((review) => (
          <VStack key={review.id} gap={1.5}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <StarRating rating={review.rating} />
              {review.title ? <Text weight="medium">{review.title}</Text> : null}
              {review.isVerifiedPurchase ? (
                <Badge variant="green" label="Verified purchase" />
              ) : null}
            </HStack>

            <Text color="secondary">{review.body}</Text>

            <Text type="supporting" color="secondary">
              {review.authorName} ·{' '}
              <time dateTime={review.createdAt}>
                {new Date(review.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </Text>
          </VStack>
        ))}
      </VStack>
    </VStack>
  );
}
