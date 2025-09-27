import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PaymentRequest {
  propertyId: string;
  paymentType: "booking_fee" | "security_deposit" | "earnest_money" | "property_sale";
  amount: number;        // in EUR from the client
  currency?: string;     // ignored; we always charge EUR
  description?: string;
  bookingData?: {
    checkInDate: string;
    checkOutDate: string;
    guestsCount: number;
    specialRequests?: string;
    contactPhone?: string;
  };
}

const logStep = (step: string, details?: any) =>
  console.log(`[CREATE-PAYMENT] ${step}${details ? " - " + JSON.stringify(details) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    logStep("Payment creation started");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const SUPABASE_SERVICE_ROLE =
      Deno.env.get("SUPABASE_SERVICE_ROLE") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Clients (auth & DB)
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const dbClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse input
    const body: PaymentRequest = await req.json();
    const { propertyId, paymentType, amount, description, bookingData } = body;

    if (!propertyId || !paymentType || !Number.isFinite(amount)) {
      throw new Error("Missing/invalid payload");
    }
    // Basic guard – amounts in EUR
    if (amount < 0.5 || amount > 500000) {
      throw new Error(`Invalid amount: ${amount}. Must be between €0.50 and €500,000.`);
    }

    // Property lookup
    const { data: property, error: propertyError } = await dbClient
      .from("properties")
      .select("id, title, user_id, contact_name, contact_email, owner_account_id")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) throw new Error("Property not found");
    logStep("Property verified", { propertyTitle: property.title });

    // Stripe init
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

    // Reuse or create customer
    let customerId: string | undefined;
    const existing = await stripe.customers.list({ email: user.email, limit: 1 });
    if (existing.data.length) {
      customerId = existing.data[0].id;
      logStep("Existing customer", { customerId });
    }

    // Record payment row
    const { data: payment, error: paymentError } = await dbClient
      .from("payments")
      .insert({
        user_id: user.id,
        property_id: propertyId,
        amount: amount,
        currency: "EUR",
        payment_type: paymentType,
        status: "pending",
        description: description || `Payment for ${property.title}`,
        metadata: { propertyTitle: property.title, paymentType, bookingData },
      })
      .select()
      .single();

    if (paymentError) throw new Error(`Failed to create payment record: ${paymentError.message}`);
    logStep("Payment record created", { paymentId: payment.id });

    // Optional booking row
    let bookingId: string | null = null;
    if (bookingData && (paymentType === "booking_fee" || paymentType === "security_deposit")) {
      const { data: booking, error: bookingError } = await dbClient
        .from("bookings")
        .insert({
          user_id: user.id,
          property_id: propertyId,
          payment_id: payment.id,
          check_in_date: bookingData.checkInDate,
          check_out_date: bookingData.checkOutDate,
          guests_count: bookingData.guestsCount,
          total_amount: amount,
          booking_fee: paymentType === "booking_fee" ? amount : 0,
          security_deposit: paymentType === "security_deposit" ? amount : 0,
          special_requests: bookingData.specialRequests,
          contact_phone: bookingData.contactPhone,
          status: "pending",
        })
        .select()
        .single();

      if (!bookingError && booking) {
        bookingId = booking.id;
        logStep("Booking record created", { bookingId });
      } else if (bookingError) {
        logStep("Booking creation failed", { error: bookingError.message });
      }
    }

    // --- Stripe Checkout Session ---
    const origin = (Deno.env.get("APP_URL") || req.headers.get("origin") || "").replace(/\/$/, "");
    if (!origin) throw new Error("APP_URL not configured and no Origin header present");

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

    const amountCents = Math.round(Number(amount) * 100); // EUR → cents

    // Optional split for booking_fee via Connect (platform commission)
    // Adjust or remove as needed:
    const commissionRate = 0.048; // 4.8% default
    const applicationFee = Math.round(amountCents * commissionRate);
    const useSplit = paymentType === "booking_fee" && property.owner_account_id;

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
              description: description || `${paymentType.replace("_", " ")} for ${property.title}`,
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

      // ✅ Redirects that won't 404 on a SPA
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
      cancel_url: `${origin}/?checkout=cancelled&payment_id=${payment.id}`,

      metadata: {
        payment_id: payment.id,
        property_id: propertyId,
        booking_id: bookingId || "",
        payment_type: paymentType,
      },
    });

    // Save session id
    await dbClient.from("payments").update({ stripe_checkout_session_id: session.id }).eq("id", payment.id);

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ url: session.url, paymentId: payment.id, bookingId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
