'use client';

import { useState, type FormEvent } from 'react';
import { z } from 'zod';

import { ArrowRightIcon } from '@/components/icons';
import { submitContactMessage } from '@/lib/api/contact';

export type ContactFormCopy = {
  firstName: { label: string; placeholder: string };
  lastName: { label: string; placeholder: string };
  email: { label: string; placeholder: string };
  phone: { label: string; placeholder: string };
  topic: { label: string; placeholder: string };
  topics: readonly string[];
  message: { label: string; placeholder: string };
  newsletter: string;
  submit: string;
  sending: string;
  success: string;
  error: string;
};

const schema = z.object({
  firstName: z.string().trim().min(1, 'Tell us your first name.'),
  lastName: z.string().trim().optional(),
  email: z.email('Enter a valid email address.'),
  // Tolerates +91, spaces and dashes; the backend normalises.
  phone: z.string().trim().regex(/^\+?[0-9][0-9\s-]{7,15}$/, 'Enter a valid phone number.'),
  topic: z.string().min(1, 'Pick a topic.'),
  message: z.string().trim().min(10, 'Tell us a little more.'),
});

type Values = z.infer<typeof schema>;
const EMPTY: Values = { firstName: '', lastName: '', email: '', phone: '', topic: '', message: '' };

/**
 * The legacy contact form, field for field: first/last name, email, phone,
 * topic, message, newsletter opt-in. Same placeholders, same "Send Message →".
 *
 * Differences that are deliberate: validation is client-side zod with
 * per-field messages (legacy relied on `required` alone), the phone field is
 * a plain tel input rather than a 40 KB country-picker dependency, and a
 * honeypot field catches naive bots. Submission goes through
 * `lib/api/contact`, so the Wix field-key mapping is gone.
 */
export function ContactForm({ copy }: { copy: ContactFormCopy }) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [newsletter, setNewsletter] = useState(false);
  const [website, setWebsite] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const set = (key: keyof Values) => (value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Partial<Record<keyof Values, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Values | undefined;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setBusy(true);
    try {
      await submitContactMessage({ ...parsed.data, newsletter, website });
      setValues(EMPTY);
      setNewsletter(false);
      setStatus({ ok: true, message: copy.success });
    } catch {
      setStatus({ ok: false, message: copy.error });
    } finally {
      setBusy(false);
    }
  }

  const field = (key: keyof Values, label: string, required: boolean, input: React.ReactNode) => (
    <label className="kf-field kf-contact-field" data-invalid={errors[key] ? '' : undefined}>
      <span>
        {label}
        {required ? ' *' : ''}
      </span>
      {input}
      {errors[key] ? <em className="kf-contact-error">{errors[key]}</em> : null}
    </label>
  );

  return (
    <form className="kf-contact-form" onSubmit={onSubmit} noValidate>
      {/* Honeypot — off-screen, not display:none, so it is still "fillable". */}
      <div className="kf-honeypot" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      <div className="kf-contact-row">
        {field('firstName', copy.firstName.label, true,
          <input className="kf-text-input" name="firstName" autoComplete="given-name" placeholder={copy.firstName.placeholder} value={values.firstName} onChange={(e) => set('firstName')(e.target.value)} />)}
        {field('lastName', copy.lastName.label, false,
          <input className="kf-text-input" name="lastName" autoComplete="family-name" placeholder={copy.lastName.placeholder} value={values.lastName ?? ''} onChange={(e) => set('lastName')(e.target.value)} />)}
      </div>

      {field('email', copy.email.label, true,
        <input className="kf-text-input" type="email" name="email" autoComplete="email" placeholder={copy.email.placeholder} value={values.email} onChange={(e) => set('email')(e.target.value)} />)}

      {field('phone', copy.phone.label, true,
        <input className="kf-text-input" type="tel" name="phone" autoComplete="tel" inputMode="tel" placeholder={copy.phone.placeholder} value={values.phone} onChange={(e) => set('phone')(e.target.value)} />)}

      {field('topic', copy.topic.label, true,
        <select className="kf-text-input kf-select" name="topic" value={values.topic} onChange={(e) => set('topic')(e.target.value)}>
          <option value="">{copy.topic.placeholder}</option>
          {copy.topics.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>)}

      {field('message', copy.message.label, true,
        <textarea className="kf-text-input kf-textarea" name="message" rows={6} placeholder={copy.message.placeholder} value={values.message} onChange={(e) => set('message')(e.target.value)} />)}

      <label className="kf-contact-check">
        <input type="checkbox" name="newsletter" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
        <span>{copy.newsletter}</span>
      </label>

      {status ? (
        <p className="kf-save-status" data-ok={status.ok || undefined} role="alert">
          {status.message}
        </p>
      ) : null}

      <button type="submit" className="kf-pill-btn kf-pill-btn--primary kf-contact-submit" disabled={busy}>
        {busy ? copy.sending : copy.submit}
        <ArrowRightIcon className="kf-pill-btn-icon" aria-hidden="true" />
      </button>
    </form>
  );
}
