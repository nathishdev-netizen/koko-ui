import { redirect } from 'next/navigation';

import { AccountNav } from '@/components/account/AccountNav';
import { UserIcon } from '@/components/icons';
import { getSession } from '@/lib/api/session';

/**
 * Account shell. Every page under /account requires a session; the guard lives
 * here so no individual page can forget it.
 *
 * The header reproduces the legacy profile card — avatar tile with a presence
 * dot, name, welcome line and the "Verified Customer" badge — above the
 * section nav, so every account screen opens the same way the old one did.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { customer } = await getSession();
  if (!customer) redirect('/login?next=/account');

  return (
    <div className="kf-container kf-account">
      <header className="kf-profile-card">
        <div className="kf-profile-avatar">
          <UserIcon className="kf-profile-avatar-icon" aria-hidden="true" />
          <span className="kf-profile-dot" aria-hidden="true" />
        </div>
        <div className="kf-profile-identity">
          <h1 className="kf-profile-name">{customer.name}</h1>
          <p className="kf-profile-welcome">Welcome back! Manage your account and orders</p>
          <span className="kf-profile-badge">✓ Verified Customer</span>
        </div>
      </header>

      <div className="kf-account-grid">
        <AccountNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
