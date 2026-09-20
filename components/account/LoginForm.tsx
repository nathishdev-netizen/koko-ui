'use client';

import { useState, type FormEvent } from 'react';
import { z } from 'zod';

import { ArrowRightIcon, MailIcon } from '@/components/icons';

const emailSchema = z.email('Enter a valid email address.');

/**
 * Sign-in request.
 *
 * Email-link auth: this form never collects or stores a password, and the
 * session is established by Frappe as an httpOnly cookie. No token is ever
 * readable from JavaScript here.
 */
export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="kf-login-sent" role="status">
        <span className="kf-login-sent-icon" aria-hidden="true">
          <MailIcon />
        </span>
        <p className="kf-info-value">Check your inbox</p>
        <p className="kf-info-muted">We sent a sign-in link to {email}.</p>
      </div>
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    // The request itself lands with the auth endpoint in Phase 10.
    setSent(true);
  }

  return (
    <form className="kf-login-form" onSubmit={onSubmit} noValidate>
      <label className="kf-field kf-contact-field" data-invalid={error ? '' : undefined}>
        <span>Email *</span>
        <input
          className="kf-text-input"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(undefined);
          }}
        />
        {error ? <em className="kf-contact-error">{error}</em> : null}
      </label>
      <input type="hidden" name="next" value={next} />
      <button type="submit" className="kf-pill-btn kf-pill-btn--primary kf-login-submit">
        Email me a link
        <ArrowRightIcon className="kf-pill-btn-icon" aria-hidden="true" />
      </button>
    </form>
  );
}
