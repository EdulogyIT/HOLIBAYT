// supabase/functions/create-payment/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type PaymentType =
  | "booking_fee"
  | "security_deposit"
  | "earnest_money"
  | "property_sale";

interface PaymentRequest {
  propertyId: string;
  paymentType: PaymentType;
  amount: number;       // expected in EUR
  currency?: string;    // ignored; we always create session in EUR
  description?: string;
  bookingData?: {
    checkInDate: string;
    checkOutDate: string;
    guestsCount: number;
    specialRequests?: string;
    contactPhone?: string;
  };
}

const logStep = (step: string, details?: unknown) =>
  console.log(`[CREATE-PAYMENT] ${step}${details ? " - " + JSON.stringify(details) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payment creation started");

    // ---- Env
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const SUPABASE_SERVICE_ROLE =
      Deno.env.get("SUPABASE_SERVICE_ROLE") ??
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      "";
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE) {
      throw new Error("Missing Supabase environment variables.");
    }
    if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");

    // ---- Two-client pattern
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    const dbClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    // ---- Auth (anon client)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email missing");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // ---- Parse input
    const body: PaymentRequest = await req.json();
    const { propertyId, paymentType, amount, description, bookingData } = body;

    logStep("Payment request parsed", { propertyId, paymentType, amount, currency: 'EUR' });
    // Guard – amounts in EUR
    if (amount < 0.5 || amount > 500000) {
      throw new Error(`Invalid payment amount: €${amount}. Must be between €0.50 and €500,000.`);
    }

    // ---- Property (service-role: DB writes/reads)
    const { data: property, error: propertyError } = await dbClient
      .from("properties")
      .select("id, title, user_id, contact_name, contact_email, owner_account_id")
      .eq("id", propertyId)
      .single();
    if (propertyError || !property) throw new Error("Property not found");
    logStep("Property verified", { propertyTitle: property.title });

    // ---- Stripe
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

    // Reuse or create customer
    let customerId: string | undefined;
    const existing = await stripe.customers.list({ email: user.email, limit: 1 });
    if (existing.data.length) {
      customerId = existing.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("Creating new customer");
      const newCustomer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.name || user.email.split('@')[0]
      });
      customerId = newCustomer.id;
      logStep("New customer created", { customerId });
    }

    // ---- Create payment row (service-role)
    const { data: payment, error: paymentError } = await dbClient
      .from("payments")
      .insert({
        user_id: user.id,
        property_id: propertyId,
        amount,                 // store EUR amount
        currency: "EUR",
        payment_type: paymentType,
        status: "pending",
        description: description || `Payment for ${property.title}`,
        metadata: { propertyTitle: property.title, paymentType, bookingData },
      })
      .select()
      .single();
    if (paymentError) throw new Error(`Failed to create payment: ${paymentError.message}`);
    logStep("Payment record created", { paymentId: payment.id });

    // ---- Store booking data in payment metadata for later use
    // Don't create booking record until payment is confirmed
    let bookingId: string | null = null;
    if (bookingData && (paymentType === "booking_fee" || paymentType === "security_deposit")) {
      logStep("Booking data stored in payment metadata", { bookingData });
    }

    // ---- Build redirect base URL (prefer Origin header, fallback to APP_URL)
    const origin = req.headers.get("origin");
    const appUrl = Deno.env.get("APP_URL");
    const baseUrl = (origin || appUrl || "").replace(/\/$/, "");
    if (!baseUrl) throw new Error("No origin header or APP_URL configured");
    logStep("Origin header received", { origin });
    logStep("Using base URL", { baseUrl });

    // ---- Product name
    const productName =
      paymentType === "booking_fee"
        ? `Booking Fee - ${property.title}`
        : paymentType === "security_deposit"
        ? `Security Deposit - ${property.title}`
        : paymentType === "earnest_money"
        ? `Earnest Money - ${property.title}`
        : paymentType === "property_sale"
        ? `Property Purchase - ${property.title}`
        : `Payment - ${property.title}`;

    // ---- Amount to cents, currency locked to EUR
    const amountCents = Math.round(amount * 100);

    // Optional platform fee via Connect (example: 4.8% on booking_fee)
    const commissionRate = 0.048;
    const useSplit = paymentType === "booking_fee" && property.owner_account_id;
    const applicationFee = Math.round(amountCents * commissionRate);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: {
              name: productName,
              description:
                description || `${paymentType.replace(/_/g, " ")} for ${property.title}`,
            },
          },
        },
      ],
      ...(useSplit
        ? {
            payment_intent_data: {
              application_fee_amount: applicationFee,
              transfer_data: { destination: property.owner_account_id },
            },
          }
        : {}),
      success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
      cancel_url: `${baseUrl}/payment-cancelled?payment_id=${payment.id}`,
      metadata: {
        payment_id: payment.id,
        property_id: propertyId,
        booking_id: bookingId || "",
        payment_type: paymentType,
      },
    });

    // ---- Save session id (service-role)
    await dbClient
      .from("payments")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", payment.id);

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ url: session.url, paymentId: payment.id, bookingId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logStep("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
