import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);

const toCents = (v: unknown) => {
  const n = Number(String(v).replace(/[^\d.,-]/g, "").replace(",", "."));
  if (!Number.isFinite(n)) throw new Error("Invalid amount");
  return Math.round(n * 100);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { bookingId, propertyId, totalEUR, commissionRate = 0.10 } = req.body || {};

    // 1) Fetch owner connected account from Supabase (don't trust client)
    const { data: prop, error } = await supabase
      .from("properties")
      .select("owner_account_id")
      .eq("id", propertyId)
      .single();

    if (error || !prop?.owner_account_id) {
      return res.status(400).json({ error: "Owner account not found" });
    }
    const ownerAccountId: string = prop.owner_account_id; // acct_...

    // 2) Validate amounts
    const amount = toCents(totalEUR);                // e.g., 75.81 -> 7581
    if (amount < 50) return res.status(400).json({ error: "Amount must be ≥ €0.50" });
    if (!(commissionRate > 0 && commissionRate < 1)) {
      return res.status(400).json({ error: "commissionRate must be (0,1)" });
    }
    const fee = Math.min(Math.round(amount * commissionRate), amount - 1);

    // 3) Create Checkout Session (destination charge)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "eur",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: amount,
            product_data: { name: `Booking #${bookingId}` },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: fee,
        transfer_data: { destination: ownerAccountId },
        metadata: { bookingId: String(bookingId), kind: "booking", propertyId: String(propertyId) },
      },
      success_url: `${process.env.APP_URL}/booking/success?bookingId=${encodeURIComponent(bookingId)}`,
      cancel_url: `${process.env.APP_URL}/booking/cancel?bookingId=${encodeURIComponent(bookingId)}`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("CHECKOUT-BOOKING ERROR:", err);
    const msg = err?.raw?.message || err?.message || "Unknown error";
    return res.status(500).json({ error: msg });
  }
}