import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RELEASE-ESCROW] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase clients
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const dbClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Parse request body first (only once!)
    const requestBody = await req.json();
    const { bookingId, reason } = requestBody;
    
    if (!bookingId) throw new Error("Booking ID is required");
    
    // Authenticate user (skip for system auto-release calls)
    const authHeader = req.headers.get("Authorization");
    let user = null;
    const isSystemCall = reason === 'auto_release_24h_post_checkout';
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user: authUser }, error: userError } = await authClient.auth.getUser(token);
      if (!userError && authUser) {
        user = authUser;
        logStep("User authenticated", { userId: user.id });
      }
    }
    
    if (!user && !isSystemCall) {
      throw new Error("User not authenticated");
    }

    logStep("Request parsed", { bookingId, reason });

    // Fetch booking with related data
    const { data: booking, error: bookingError } = await dbClient
      .from('bookings')
      .select(`
        *,
        properties (
          id,
          title,
          category,
          user_id,
          commission_rate
        ),
        payments (
          id,
          amount,
          currency,
          status,
          escrow_status,
          metadata
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error(`Booking not found: ${bookingError?.message}`);
    }
    logStep("Booking fetched", { bookingId, status: booking.status });

    // Verify user is guest or system (for auto-release)
    const isGuest = user ? booking.user_id === user.id : false;
    const isAdmin = false; // TODO: Check admin role if needed

    if (!isGuest && !isSystemCall && !isAdmin) {
      throw new Error("Unauthorized: Only guest or system can release escrow");
    }

    // Verify booking is eligible for escrow release
    if (booking.status !== 'payment_escrowed') {
      throw new Error(`Booking status must be 'payment_escrowed', got: ${booking.status}`);
    }

    const payment = booking.payments;
    if (!payment || payment.escrow_status !== 'escrowed') {
      throw new Error(`Payment escrow status must be 'escrowed', got: ${payment?.escrow_status}`);
    }

    // For short-stay, verify checkout date has passed
    if (booking.properties.category === 'short-stay') {
      const checkoutDateTime = new Date(booking.check_out_date);
      checkoutDateTime.setHours(11, 0, 0, 0); // Checkout time 11:00 AM
      const now = new Date();
      
      if (now < checkoutDateTime && reason !== 'guest_confirmed') {
        throw new Error("Cannot release escrow before checkout time");
      }
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe secret key not configured");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get host Stripe account ID from payment metadata or host_payment_accounts
    const hostStripeAccountId = payment.metadata?.host_stripe_account_id;
    if (!hostStripeAccountId) {
      logStep("No host Stripe account found, skipping transfer");
    }

    // Calculate amounts
    const totalAmount = payment.amount;
    const commissionRate = booking.properties.commission_rate || 0.15;
    const commissionAmount = totalAmount * commissionRate;
    const hostPayoutAmount = totalAmount - commissionAmount;

    logStep("Calculated payout", {
      totalAmount,
      commissionRate,
      commissionAmount,
      hostPayoutAmount
    });

    // Create Stripe Transfer to host (if account exists)
    let transferId = null;
    if (hostStripeAccountId && hostPayoutAmount > 0) {
      try {
        const transfer = await stripe.transfers.create({
          amount: Math.round(hostPayoutAmount * 100), // Convert to cents
          currency: payment.currency.toLowerCase(),
          destination: hostStripeAccountId,
          description: `Payout for booking ${bookingId}`,
          metadata: {
            booking_id: bookingId,
            payment_id: payment.id,
            property_id: booking.property_id,
            commission_amount: commissionAmount.toString(),
            release_reason: reason || 'guest_confirmed'
          }
        });
        transferId = transfer.id;
        logStep("Stripe transfer created", { transferId, amount: hostPayoutAmount });
      } catch (stripeError) {
        logStep("Stripe transfer failed", { error: stripeError.message });
        // Continue anyway to mark escrow as released
      }
    }

    // Update payment status
    const { error: paymentUpdateError } = await dbClient
      .from('payments')
      .update({
        escrow_status: 'released',
        escrow_released_at: new Date().toISOString(),
        escrow_release_reason: reason || 'guest_confirmed',
        status: 'completed'
      })
      .eq('id', payment.id);

    if (paymentUpdateError) {
      throw new Error(`Failed to update payment: ${paymentUpdateError.message}`);
    }
    logStep("Payment updated to released");

    // Update booking status
    const { error: bookingUpdateError } = await dbClient
      .from('bookings')
      .update({
        status: 'completed',
        guest_confirmed_completion: reason === 'guest_confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (bookingUpdateError) {
      throw new Error(`Failed to update booking: ${bookingUpdateError.message}`);
    }
    logStep("Booking updated to completed");

    // Update commission transaction
    const { error: commissionUpdateError } = await dbClient
      .from('commission_transactions')
      .update({
        status: 'completed',
        stripe_transfer_id: transferId,
        escrow_released_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', payment.id);

    if (commissionUpdateError) {
      logStep("Failed to update commission", { error: commissionUpdateError.message });
    } else {
      logStep("Commission updated to completed");
    }

    // Send notifications to guest and host
    try {
      // Notification to guest
      await dbClient.from('notifications').insert({
        user_id: booking.user_id,
        title: 'Payment Released',
        message: `Your payment for "${booking.properties.title}" has been released to the host. Thank you for your stay!`,
        type: 'payment_released',
        related_id: bookingId
      });

      // Notification to host
      await dbClient.from('notifications').insert({
        user_id: booking.properties.user_id,
        title: 'Payment Received',
        message: `Payment for booking "${booking.properties.title}" has been released to your account.`,
        type: 'payment_received',
        related_id: bookingId
      });

      logStep("Notifications sent");
    } catch (notifError) {
      logStep("Failed to send notifications", { error: notifError.message });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Escrow released successfully',
        booking_id: bookingId,
        transfer_id: transferId,
        payout_amount: hostPayoutAmount
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
