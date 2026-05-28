import { NextResponse } from "next/server";
import { getStripe, stripeConfigured, LISTING_BOOST_PRICE } from "@/lib/stripe/server";
import { getUser } from "@/lib/auth";

// Loob Stripe Checkout sessiooni kuulutuse esiletõstmiseks (test mode skelett).
// MVP-s makset ei nõuta kuulutuse avaldamiseks.
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Logi sisse" }, { status: 401 });
  }

  if (!stripeConfigured) {
    return NextResponse.json(
      {
        error:
          "Stripe pole veel seadistatud. Lisa STRIPE_SECRET_KEY (test võti) keskkonnamuutujatesse.",
      },
      { status: 503 }
    );
  }

  let listingId: string | undefined;
  try {
    const body = await request.json();
    listingId = body.listingId;
  } catch {
    // listingId on valikuline
  }

  const stripe = getStripe()!;
  const origin =
    request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Kuulutuse esiletõstmine",
              description: "Tõsta oma kuulutus otsingutulemustes esile.",
            },
            unit_amount: LISTING_BOOST_PRICE,
          },
          quantity: 1,
        },
      ],
      metadata: { userId: user.id, listingId: listingId ?? "" },
      success_url: `${origin}/minu-kodu?payment=success`,
      cancel_url: `${origin}/minu-kodu?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("stripe checkout error:", err);
    return NextResponse.json(
      { error: "Makse sessiooni loomine ebaõnnestus" },
      { status: 500 }
    );
  }
}
