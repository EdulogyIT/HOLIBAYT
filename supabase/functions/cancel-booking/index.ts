import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancelBookingRequest {
  bookingId: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-BOOKING] ${step}${detailsStr}`);
};

serve(async (req) => {
  logStep(`${new Date().toISOString()} - Request received: ${req.method}`);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY || !STRIPE_SECRET_KEY) {
      throw new Error("Missing required environment variables");
    }

    // Create Supabase clients
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const dbClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    logStep("Authenticating user...");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    
    if (userError || !userData.user?.email) {
      logStep("Authentication failed:", userError);
      throw new Error("Authentication failed");
    }

    const user = userData.user;
    logStep("User authenticated:", user.email);

    // Parse request body
    const body: CancelBookingRequest = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      throw new Error("Missing required field: bookingId");
    }

    logStep("Fetching booking...");
    const { data: booking, error: bookingError } = await dbClient
      .from("bookings")
      .select(`
        *,
        payments!inner(
          id,
          stripe_payment_intent_id,
          amount,
          status
        )
      `)
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .single();

    if (bookingError || !booking) {
      logStep("Booking fetch failed:", bookingError);
      throw new Error("Booking not found or access denied");
    }

    if (booking.status === 'cancelled') {
      throw new Error("Booking is already cancelled");
    }

    logStep("Booking found:", booking.id);

    // Initialize Stripe
    const stripe = new Stripe(STRIPE_SECRET_KEY, { 
      apiVersion: "2024-06-20"
    });

    let refundAmount = 0;
    let refundId = null;

    // Process refund if there's a payment
    if (booking.payments && booking.payments.length > 0) {
      const payment = booking.payments[0];
      
      if (payment.stripe_payment_intent_id && payment.status === 'completed') {
        logStep("Processing refund for payment:", payment.id);
        
        const refund = await stripe.refunds.create({
          payment_intent: payment.stripe_payment_intent_id,
          amount: Math.round(payment.amount * 100), // Convert to cents
          reason: 'requested_by_customer'
        });
        
        refundAmount = payment.amount;
        refundId = refund.id;
        logStep("Refund created:", refundId);

        // Update payment status
        await dbClient
          .from("payments")
          .update({ 
            status: 'refunded',
            refunded_at: new Date().toISOString()
          })
          .eq("id", payment.id);
      }
    }

    // Update booking status to cancelled
    logStep("Updating booking status...");
    const { error: updateError } = await dbClient
      .from("bookings")
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        refund_amount: refundAmount
      })
      .eq("id", bookingId);

    if (updateError) {
      logStep("Booking update failed:", updateError);
      throw new Error("Failed to cancel booking");
    }

    logStep("Booking cancelled successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        bookingId: bookingId,
        refundAmount: refundAmount,
        refundId: refundId
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );

  } catch (error) {
    logStep("ERROR:", error);
    logStep("ERROR STACK:", error instanceof Error ? error.stack : 'No stack trace');
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});