import type { Metadata } from 'next';
import Link from 'next/link';

import { MailIcon, MapPinIcon, PackageIcon, PhoneIcon } from '@/components/icons';
import { getOrders } from '@/lib/api/orders';
import { getSession } from '@/lib/api/session';
import { getWishlist } from '@/lib/api/wishlist';
import { formatMoney } from '@/lib/format';

export const metadata: Metadata = { title: 'Account', robots: 'noindex, nofollow' };

/**
 * Account overview, styled after the legacy profile page: a "Contact
 * Information" panel of icon rows, then the order history.
 *
 * Panel headings carry the legacy gradient rule to their left
 * (`.kf-panel-mark`). Unlike legacy, the address shown is the one on the most
 * recent order rather than an invented default — the addresses endpoint has
 * not landed, and fabricating a "default address" would be a lie.
 */
export default async function AccountPage() {
  const [{ customer }, orders, wishlist] = await Promise.all([
    getSession(),
    getOrders(),
    getWishlist(),
  ]);
  const address = orders[0]?.shippingAddress;
  const recent = orders.slice(0, 5);

  return (
    <div className="kf-account-stack">
      <section className="kf-profile-panel" aria-labelledby="contact-info">
        <div className="kf-panel-head">
          <h2 id="contact-info" className="kf-panel-title">
            <span className="kf-panel-mark" aria-hidden="true" />
            Contact Information
          </h2>
        </div>
        <div className="kf-panel-body">
          <div className="kf-info-row">
            <span className="kf-info-icon" aria-hidden="true">
              <MailIcon />
            </span>
            <div>
              <p className="kf-info-label">Primary Email</p>
              <p className="kf-info-value">{customer?.email ?? '—'}</p>
            </div>
          </div>

          <div className="kf-info-row">
            <span className="kf-info-icon" aria-hidden="true">
              <PhoneIcon />
            </span>
            <div>
              <p className="kf-info-label">Primary Phone</p>
              <p className="kf-info-value">{customer?.phone ?? '—'}</p>
            </div>
          </div>

          <div className="kf-info-row">
            <span className="kf-info-icon" aria-hidden="true">
              <MapPinIcon />
            </span>
            <div>
              <p className="kf-info-label">Shipping Address</p>
              {address ? (
                <div className="kf-info-address">
                  <p className="kf-info-value">{address.fullName}</p>
                  <p className="kf-info-sub">
                    {address.line1}
                    <br />
                    {address.city}, {address.state}, {address.postalCode}
                  </p>
                  <p className="kf-info-muted">{address.phone}</p>
                </div>
              ) : (
                <div className="kf-info-address">
                  <p className="kf-info-value">No address on file</p>
                  <p className="kf-info-muted">
                    Add a shipping address to complete your profile
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="kf-profile-panel" aria-labelledby="order-history">
        <div className="kf-panel-head">
          <h2 id="order-history" className="kf-panel-title">
            <span className="kf-panel-mark" aria-hidden="true" />
            Order History
          </h2>
          {orders.length > recent.length ? (
            <Link href="/account/orders" className="kf-panel-link">
              View all {orders.length} →
            </Link>
          ) : null}
        </div>

        {recent.length === 0 ? (
          <div className="kf-account-empty">
            <span className="kf-account-empty-icon" aria-hidden="true">
              <PackageIcon />
            </span>
            <p className="kf-info-value">No orders found</p>
            <p className="kf-info-muted">Your order history will appear here</p>
          </div>
        ) : (
          <ul className="kf-order-list">
            {recent.map((order) => (
              <li key={order.id}>
                <Link href={`/account/orders/${order.id}`} className="kf-order-row">
                  <span className="kf-order-id">{order.id}</span>
                  <span className="kf-order-meta">
                    {order.lines.length} {order.lines.length === 1 ? 'item' : 'items'} ·{' '}
                    {formatMoney(order.total)}
                  </span>
                  <span className="kf-order-status" data-status={order.status}>
                    {order.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="kf-profile-panel kf-account-tiles" aria-label="At a glance">
        <Link href="/account/orders" className="kf-account-tile">
          <span className="kf-account-tile-value kf-numeric">{orders.length}</span>
          <span className="kf-account-tile-label">Orders</span>
        </Link>
        <Link href="/account/wishlist" className="kf-account-tile">
          <span className="kf-account-tile-value kf-numeric">{wishlist.length}</span>
          <span className="kf-account-tile-label">Saved items</span>
        </Link>
      </section>
    </div>
  );
}
