import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { LoginForm } from '@/components/account/LoginForm';
import { LeafIcon, ShieldCheckIcon, SparklesIcon } from '@/components/icons';
import { Heading } from '@/components/ui';
import { brand } from '@/config/brand';
import { getSession } from '@/lib/api/session';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: 'noindex, nofollow',
};

const REASONS = [
  { Icon: SparklesIcon, text: 'Track every order from grind to doorstep' },
  { Icon: LeafIcon, text: 'Save your favourite blends and reorder in a tap' },
  { Icon: ShieldCheckIcon, text: 'No password to remember — we email you a link' },
] as const;

/**
 * Sign in. The legacy site had no login screen of its own (it bounced to a
 * Wix-hosted page), so this follows the marketing pages' treatment: dual-tone
 * heading, the warm card, brown pill button.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { customer } = await getSession();
  const params = await searchParams;
  const raw = params.next;
  const next = (Array.isArray(raw) ? raw[0] : raw) ?? '/account';

  // Only same-site paths are honoured. The legacy /auth/callback redirected to
  // an unvalidated absolute URL read from localStorage — an open redirect.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/account';

  if (customer) redirect(safeNext);

  return (
    <section className="kf-section kf-login">
      <div className="kf-container">
        <div className="kf-login-grid">
          <div className="kf-login-copy">
            <Heading level={1} className="kf-about-h2 kf-about-h2--xl">
              Welcome <span className="kf-h-alt">back</span>
            </Heading>
            <p className="kf-login-lead">
              Sign in to {brand.name} to follow your orders, keep your blends close and
              check out faster next time.
            </p>
            <ul className="kf-login-reasons">
              {REASONS.map(({ Icon, text }) => (
                <li key={text}>
                  <Icon className="kf-login-reason-icon" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="kf-login-card">
            <h2 className="kf-login-card-title">Sign in</h2>
            <p className="kf-login-card-note">
              We will email you a sign-in link — no password to remember.
            </p>
            <LoginForm next={safeNext} />
          </div>
        </div>
      </div>
    </section>
  );
}
