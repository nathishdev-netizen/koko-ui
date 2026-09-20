'use client';

import { useState, type FormEvent } from 'react';

import { submitComment } from '@/lib/api/comments';
import type { Comment } from '@/lib/api/types';

import { formatPostDate } from './format';

type Copy = {
  title: string;
  empty: string;
  formTitle: string;
  formNote: string;
  pending: string;
};

/**
 * Discussion thread + comment form.
 *
 * Approved comments arrive as props from the server. A new submission lands
 * as `pending` and is NOT appended to the visible list — the reader is told it
 * awaits moderation, which is the truth. Rendering it as live would show the
 * author something nobody else can see.
 *
 * The hidden `website` field is a honeypot: real browsers leave it empty.
 */
export function PostComments({
  postSlug,
  comments,
  copy,
}: {
  postSlug: string;
  comments: readonly Comment[];
  copy: Copy;
}) {
  const [contact, setContact] = useState('');
  const [body, setBody] = useState('');
  const [website, setWebsite] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!contact.trim() || trimmed.length < 3) {
      setStatus({ ok: false, message: 'Please add a contact and a comment of at least a few words.' });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      await submitComment({ postSlug, contact: contact.trim(), body: trimmed, website });
      setStatus({ ok: true, message: copy.pending });
      setBody('');
    } catch {
      setStatus({ ok: false, message: 'Could not post your comment. Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="kf-comments" id="comments" aria-labelledby="comments-title">
      <h2 id="comments-title" className="kf-comments-title">
        {copy.title} <span className="kf-comments-count">({comments.length})</span>
      </h2>

      {comments.length === 0 ? (
        <p className="kf-comments-empty">{copy.empty}</p>
      ) : (
        <ul className="kf-comments-list">
          {comments.map((c) => (
            <li key={c.id} className="kf-comment">
              <span className="kf-comment-avatar" aria-hidden="true">
                {c.authorName.charAt(0).toUpperCase() || 'K'}
              </span>
              <div className="kf-comment-body">
                <div className="kf-comment-head">
                  <span className="kf-comment-author">{c.authorName}</span>
                  <span className="kf-blog-dot" aria-hidden="true">
                    •
                  </span>
                  <time className="kf-comment-date" dateTime={c.createdAt}>
                    {formatPostDate(c.createdAt)}
                  </time>
                </div>
                <p className="kf-comment-text">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="kf-comment-form" onSubmit={onSubmit} noValidate>
        <h3 className="kf-comment-form-title">{copy.formTitle}</h3>
        <p className="kf-comment-form-note">{copy.formNote}</p>

        {/* Honeypot — off-screen, not display:none, so it is still "fillable". */}
        <div className="kf-honeypot" aria-hidden="true">
          <label>
            Website
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>
        </div>

        <label className="kf-field">
          <span>Mobile Number or Email *</span>
          <input
            type="text"
            className="kf-text-input"
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="e.g. 9876543210 or name@example.com"
            autoComplete="email"
          />
        </label>

        <label className="kf-field">
          <span>Comment *</span>
          <textarea
            className="kf-text-input kf-textarea"
            required
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your thoughts or ask a question about this recipe..."
          />
        </label>

        {status ? (
          <p className="kf-save-status" data-ok={status.ok || undefined} role="alert">
            {status.message}
          </p>
        ) : null}

        <button type="submit" className="kf-comment-submit" disabled={busy}>
          {busy ? 'Posting…' : 'Post Comment'}
        </button>
      </form>
    </section>
  );
}
