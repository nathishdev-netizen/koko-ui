/**
 * Shared types matching the API contract.
 *
 * PROVISIONAL — this is the frontend's expectation, drafted against the legacy
 * catalogue shape. The Frappe team confirms or adjusts. When their contract
 * differs, this file and lib/api/* change; pages must not.
 */

export type Money = {
  /** Minor units (paise). Integer arithmetic only — never float rupees. */
  readonly amount: number;
  readonly currency: 'INR';
};

export type Image = {
  readonly url: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
};

/** Per-page SEO overrides. Content team controls these; blog rankings depend on it. */
export type SeoFields = {
  readonly title?: string;
  readonly description?: string;
  readonly canonical?: string;
  readonly robots?: string;
  readonly keywords?: readonly string[];
  readonly ogImage?: string;
  /** Arbitrary JSON-LD supplied by the content team, rendered verbatim. */
  readonly jsonLd?: readonly Record<string, unknown>[];
};

export type ProductVariant = {
  readonly id: string;
  readonly sku: string;
  /** e.g. "100g", "500g" — weight-based variants. */
  readonly label: string;
  readonly weightGrams: number;
  readonly price: Money;
  /** Pre-discount price, when on offer. */
  readonly compareAtPrice: Money | null;
  readonly inStock: boolean;
};

/** Long-form merchandising blocks (Origin Story, Nutrition, Storage, ...). */
export type ProductSection = {
  readonly key: string;
  readonly title: string;
  /** Sanitised HTML. */
  readonly html: string;
};

export type ProductSummary = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly shortDescription: string;
  readonly image: Image | null;
  readonly priceFrom: Money;
  readonly compareAtPriceFrom: Money | null;
  readonly inStock: boolean;
  readonly ribbon: string | null;
  /** 0–5, averaged over approved reviews only. Null when there are none. */
  readonly rating: number | null;
  readonly reviewCount: number;
  /** 0–5 heat scale. Null when not applicable. */
  readonly spiceLevel: number | null;
  readonly collectionSlugs: readonly string[];
  /** Canonical category for URL construction: /shop/{primaryCollectionSlug}/{slug} */
  readonly primaryCollectionSlug: string;
  /** Enough variant detail for the card's weight selector and unit price. */
  readonly variantOptions: readonly {
    readonly id: string;
    readonly label: string;
    readonly weightGrams: number;
    readonly price: Money;
    readonly compareAtPrice: Money | null;
    readonly inStock: boolean;
  }[];
};

export type Product = ProductSummary & {
  readonly descriptionHtml: string;
  readonly images: readonly Image[];
  readonly variants: readonly ProductVariant[];
  readonly sections: readonly ProductSection[];
  readonly seo: SeoFields;
};

export type Collection = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly heroImage: Image | null;
  readonly seo: SeoFields;
};

export type Paginated<T> = {
  readonly items: readonly T[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly hasMore: boolean;
};

export type ProductSort = 'featured' | 'price-asc' | 'price-desc' | 'name';

export type ProductListParams = {
  readonly page?: number;
  readonly pageSize?: number;
  readonly collection?: string;
  readonly sort?: ProductSort;
  /** Free-text search across product names. */
  readonly q?: string;
  /** Inclusive price floor, in paise. */
  readonly minPrice?: number;
  /** Inclusive price ceiling, in paise. */
  readonly maxPrice?: number;
};

/** A "pick N from category" rule within a bundle. */
export type BundleRule = {
  /** Collection slug the picks must come from — an ID, never a name match. */
  readonly collectionSlug: string;
  readonly label: string;
  readonly count: number;
};

export type Bundle = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly image: Image | null;
  readonly price: Money;
  readonly compareAtPrice: Money;
  readonly savings: Money;
  readonly savingsPercent: number;
  /** Total items the customer receives, including auto-included extras. */
  readonly itemCount: number;
  readonly rules: readonly BundleRule[];
  /** Added automatically, not chosen (e.g. jaggery, millet). */
  readonly includedSlugs: readonly string[];
  /** Short "what's inside" chips, e.g. ["2 Masala", "2 Chutney"]. */
  readonly contents: readonly string[];
  /** Long-form "About this bundle" copy; blank lines separate paragraphs. */
  readonly fullDescription?: string;
  /** Heading for the benefits list — varies per bundle in the legacy copy. */
  readonly benefitsTitle?: string;
  readonly benefits?: readonly string[];
  /** "Quick Prep Ideas" — short serving suggestions. */
  readonly quickPrep?: {
    readonly title: string;
    readonly items: readonly string[];
    readonly link?: string;
  };
  readonly testimonials?: readonly { readonly quote: string; readonly author: string }[];
  /** Per-day value maths, shown for the monthly pack. */
  readonly smartMath?: {
    readonly items: readonly string[];
    readonly footer?: string;
  };
  /** Marks the best-value bundle with a badge. */
  readonly bestValue?: boolean;
  /** Comparison-table facts shown on the bundles listing. */
  readonly bestFor?: string;
  readonly lasts?: string;
  /** 'yes' | 'premium' — premium means gift-ready packaging as standard. */
  readonly giftReady?: string;
  readonly seo: SeoFields;
};

// ── Cart ───────────────────────────────────────────────────────────────────

export type CartLine = {
  readonly id: string;
  readonly variantId: string;
  readonly productSlug: string;
  readonly name: string;
  readonly variantLabel: string;
  readonly image: Image | null;
  readonly unitPrice: Money;
  readonly quantity: number;
  /** Present when this line is a configured bundle. */
  readonly bundle?: {
    readonly slug: string;
    readonly name: string;
    /** Chosen + auto-included contents, for display. */
    readonly contents: readonly string[];
  };
};

export type Cart = {
  readonly id: string;
  readonly lines: readonly CartLine[];
  /** Line count, not distinct products. */
  readonly itemCount: number;
};

// ── Checkout ───────────────────────────────────────────────────────────────

export type Address = {
  readonly fullName: string;
  readonly line1: string;
  readonly line2?: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
  readonly phone: string;
};

export type PaymentMethod = 'online' | 'cod';

export type CheckoutRequest = {
  readonly email: string;
  readonly shippingAddress: Address;
  readonly paymentMethod: PaymentMethod;
  readonly couponCode?: string;
};

export type CheckoutResult = {
  readonly orderId: string;
  /**
   * Hosted payment page to redirect to. Null for COD, where the order is
   * already confirmed. Card details never touch this frontend.
   */
  readonly paymentUrl: string | null;
  readonly status: 'awaiting_payment' | 'confirmed';
};

// ── Account ────────────────────────────────────────────────────────────────

export type Customer = {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly phone?: string;
};

/** Resolved from the httpOnly session cookie — never from a caller-supplied id. */
export type Session = {
  readonly customer: Customer | null;
};

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type OrderLine = {
  readonly name: string;
  readonly variantLabel: string;
  readonly quantity: number;
  readonly unitPrice: Money;
  readonly image: Image | null;
};

export type Order = {
  readonly id: string;
  readonly placedAt: string;
  readonly status: OrderStatus;
  readonly lines: readonly OrderLine[];
  readonly subtotal: Money;
  readonly shippingFee: Money;
  readonly discount: Money;
  readonly total: Money;
  readonly shippingAddress: Address;
  /** Set once the carrier has it. */
  readonly trackingUrl?: string;
};

export type SavedAddress = Address & {
  readonly id: string;
  readonly isDefault: boolean;
};

// ── Blog ───────────────────────────────────────────────────────────────────

export type Author = {
  readonly name: string;
  readonly avatar: Image | null;
};

export type BlogPostSummary = {
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly coverImage: Image | null;
  readonly publishedAt: string;
  readonly updatedAt?: string;
  readonly author: Author;
  readonly tags: readonly string[];
  readonly readingMinutes: number;
};

export type BlogPost = BlogPostSummary & {
  /** Sanitised HTML from the CMS. */
  readonly html: string;
  /**
   * Per-post SEO overrides authored by the content team — title, description,
   * robots, canonical and arbitrary JSON-LD. Blog rankings depend on these, so
   * Frappe must expose equivalents to the old Wix SEO panel.
   */
  readonly seo: SeoFields;
};

// ── Promotions ─────────────────────────────────────────────────────────────

export type Coupon = {
  readonly code: string;
  readonly percentOff: number;
  readonly expiresAt: string;
  readonly minSubtotal: Money | null;
};

export type FirstOrderOffer = {
  readonly isEligible: boolean;
  /** 25 at >= ₹399, else 20. Server decides; never computed client-side. */
  readonly percentOff: number;
  readonly minSubtotalForHigher: Money;
};

export type BogoOffer = {
  readonly productSlug: string;
  readonly productName: string;
  /** free = floor(qty / 2) */
  readonly qtyInCart: number;
  readonly freeQty: number;
  /** Set when one more unit would earn another free item. */
  readonly oneMoreEarnsFree: boolean;
};

export type SpinPrize = {
  readonly id: string;
  readonly label: string;
  /** Null for a "better luck" segment. */
  readonly code: string | null;
  readonly weight: number;
};

// ── Reviews ────────────────────────────────────────────────────────────────

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export type Review = {
  readonly id: string;
  readonly productSlug: string;
  readonly rating: number;
  readonly title?: string;
  readonly body: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly status: ReviewStatus;
  /** Set when the reviewer actually bought the product. */
  readonly isVerifiedPurchase: boolean;
};

export type ReviewSummary = {
  /** Averaged over APPROVED reviews only. Null when there are none. */
  readonly average: number | null;
  readonly total: number;
  /** Count per star, 1–5. */
  readonly distribution: Readonly<Record<1 | 2 | 3 | 4 | 5, number>>;
};

export type ReviewSubmission = {
  readonly productSlug: string;
  readonly rating: number;
  readonly title?: string;
  readonly body: string;
  readonly authorName: string;
  readonly email: string;
};
