import Stripe from "stripe";

// Kuulutuse esiletõstmise tasu (sentides) — MVP-s ei jõustata
export const LISTING_BOOST_PRICE = 49000; // 490 €

const key = process.env.STRIPE_SECRET_KEY;

// Kas Stripe on päriselt seadistatud (mitte placeholder)
export const stripeConfigured =
  !!key && key.startsWith("sk_") && !key.includes("placeholder");

export function getStripe(): Stripe | null {
  if (!stripeConfigured) return null;
  return new Stripe(key!);
}
