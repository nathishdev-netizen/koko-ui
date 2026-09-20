import { isLive, request } from './client';
import { mockDelay } from './mocks';
import type { Comment, CommentSubmission } from './types';

import commentsJson from './mocks/comments.json';

const RESOURCE = 'comments' as const;

let mockComments = commentsJson as unknown as readonly Comment[];

/**
 * Approved comments for a post, oldest first — a discussion reads top-down.
 *
 * Same rule as reviews: pending and rejected comments are never returned.
 * `cmt-004` in the fixtures is a rejected spam entry and must not render.
 */
export async function getComments(postSlug: string): Promise<readonly Comment[]> {
  if (isLive(RESOURCE)) {
    return request<readonly Comment[]>('/comments', {
      searchParams: { post: postSlug },
      revalidate: 60,
      tags: ['comments', `comments:${postSlug}`],
    });
  }
  await mockDelay();
  return mockComments
    .filter((c) => c.postSlug === postSlug && c.status === 'approved')
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}

/**
 * Submits a comment. It lands as `pending` and will not appear until a human
 * approves it, so the caller must tell the reader that rather than showing
 * the comment as if it were live.
 */
export async function submitComment(input: CommentSubmission): Promise<Comment> {
  // Honeypot: real browsers leave hidden fields empty. Resolve silently so a
  // bot cannot tell it was caught.
  if (input.website) {
    return {
      id: 'cmt-discarded',
      postSlug: input.postSlug,
      authorName: '',
      body: '',
      createdAt: new Date().toISOString(),
      status: 'rejected',
    };
  }

  if (isLive(RESOURCE)) {
    return request<Comment>('/comments', { method: 'POST', body: input, revalidate: 0 });
  }

  await mockDelay(300);
  const comment: Comment = {
    id: `cmt-${Date.now()}`,
    postSlug: input.postSlug,
    // The legacy form took a phone/email as identity; we never display it.
    // Show a neutral name until the backend attaches a real one.
    authorName: 'Reader',
    body: input.body,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  mockComments = [...mockComments, comment];
  return comment;
}
