import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface VerifyPaymentRequest {
  sessionId: string;
  paymentId: string;
}

const logStep = (step: string, details?: unknown) =>
  console.log(`[VERIFY-PAYMENT] ${step}${details ? " - " + JSON.stringify(details) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Payment verification started");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const SUPABASE_SERVICE_ROLE =
      Deno.env.get("SUPABASE_SERVICE_ROLE") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Auth client (anon) — just to resolve the user from the bearer token
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // DB client (service role) — safe here because this runs server-side
    const dbClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Body
    const { sessionId, paymentId }: VerifyPaymentRequest = await req.json();
    if (!sessionId || !paymentId) throw new Error("Missing sessionId or paymentId");
    logStep("Verification request parsed", { sessionId, paymentId, userId: user.id });

    // Stripe
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

    // Retrieve session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Stripe session retrieved", {
      sessionId,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent,
    });

    // Get payment row (verify ownership)
    const { data: payment, error: paymentFetchError } = await dbClient
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .eq("user_id", user.id)
      .single();

    if (paymentFetchError || !payment) {
      throw new Error("Payment record not found or access denied");
    }

    // Determine new status
    let newStatus = payment.status;
    let completedAt: string | null = null;
    let paymentIntentId: string | null = null;

    switch (session.payment_status) {
      case "paid":
        newStatus = "completed";
        completedAt = new Date().toISOString();
        paymentIntentId = (session.payment_intent as string) ?? null;
        break;
      case "unpaid":
        newStatus = "failed";
        break;
      case "no_payment_required":
        newStatus = "completed";
        completedAt = new Date().toISOString();
        break;
      default:
        // leave the status as-is (e.g., 'open' or 'expired')
        break;
    }

    // Update payment
    const { error: updateError } = await dbClient
      .from("payments")
      .update({
        status: newStatus,
        stripe_payment_intent_id: paymentIntentId,
        completed_at: completedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    if (updateError) throw new Error(`Failed to update payment: ${updateError.message}`);

    // Update booking if present in metadata
    if (newStatus === "completed" && payment.metadata?.bookingData) {
      const { error: bookingUpdateError } = await dbClient
        .from("bookings")
        .update({ status: "confirmed", updated_at: new Date().toISOString() })
        .eq("payment_id", paymentId);

      if (bookingUpdateError) logStep("Booking update failed", { error: bookingUpdateError.message });
      else logStep("Booking confirmed");
    }

    logStep("Payment verification completed", { paymentId, newStatus, paymentIntentId });

    return new Response(
      JSON.stringify({
        success: true,
        paymentId,
        status: newStatus,
        paymentIntentId,
        sessionData: {
          paymentStatus: session.payment_status,
          customerDetails: session.customer_details,
          amountTotal: session.amount_total,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const message = (error as Error)?.message ?? String(error);
    logStep("ERROR in verify-payment", { message });
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
