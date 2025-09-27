import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RefundRequest {
  paymentId: string;
  refundAmount?: number;
  reason?: string;
}

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-REFUND] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Refund processing started");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const refundRequest: RefundRequest = await req.json();
    const { paymentId, refundAmount, reason } = refundRequest;
    
    logStep("Refund request parsed", { paymentId, refundAmount, reason });

    // Get payment details and verify ownership
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select(`
        *,
        bookings(*),
        properties(
          id,
          title,
          user_id
        ),
        commission_transactions(*)
      `)
      .eq('id', paymentId)
      .eq('user_id', user.id) // Ensure user owns this payment
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment not found or access denied');
    }

    if (payment.status !== 'completed') {
      throw new Error('Payment is not in a refundable state');
    }

    logStep("Payment verified", { 
      paymentId: payment.id, 
      status: payment.status,
      amount: payment.amount 
    });

    // Check refund policy and calculate refund amount
    const booking = payment.bookings?.[0];
    let calculatedRefundAmount = refundAmount || payment.amount;
    
    if (booking) {
      const checkInDate = new Date(booking.check_in_date);
      const now = new Date();
      const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      logStep("Booking details", {
        checkInDate: booking.check_in_date,
        hoursUntilCheckIn: hoursUntilCheckIn.toFixed(1)
      });

      // Apply refund policy based on timing
      if (hoursUntilCheckIn < 24) {
        // Less than 24 hours - no refund for strict policy
        calculatedRefundAmount = 0;
      } else if (hoursUntilCheckIn < 168) { // Less than 7 days
        // Moderate policy - 50% refund
        calculatedRefundAmount = payment.amount * 0.5;
      }
      // More than 7 days - full refund (flexible policy)
    }

    if (calculatedRefundAmount <= 0) {
      throw new Error('No refund available due to cancellation policy');
    }

    // Cap refund amount to original payment
    calculatedRefundAmount = Math.min(calculatedRefundAmount, payment.amount);

    logStep("Refund amount calculated", { calculatedRefundAmount });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2025-08-27.basil" 
    });

    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripe_payment_intent_id,
      amount: Math.round(calculatedRefundAmount * 100), // Convert to cents
      reason: reason || 'requested_by_customer',
      metadata: {
        payment_id: paymentId,
        user_id: user.id,
        original_amount: payment.amount.toString()
      }
    });

    logStep("Stripe refund created", { refundId: refund.id });

    // Update payment status
    await supabaseClient
      .from('payments')
      .update({ 
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        metadata: {
          ...payment.metadata,
          refund_id: refund.id,
          refunded_amount: calculatedRefundAmount,
          refund_reason: reason
        }
      })
      .eq('id', paymentId);

    // Update booking status if exists
    if (booking) {
      await supabaseClient
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('payment_id', paymentId);
    }

    // Handle commission reversal if there was a commission transaction
    const commissionTransaction = payment.commission_transactions?.[0];
    if (commissionTransaction && commissionTransaction.stripe_transfer_id) {
      try {
        // Reverse the transfer to host
        const commissionRefundAmount = calculatedRefundAmount * commissionTransaction.commission_rate;
        const hostRefundAmount = calculatedRefundAmount - commissionRefundAmount;

        if (hostRefundAmount > 0) {
          await stripe.transfers.createReversal(
            commissionTransaction.stripe_transfer_id,
            {
              amount: Math.round(hostRefundAmount * 100),
              metadata: {
                refund_id: refund.id,
                original_payment_id: paymentId
              }
            }
          );
        }

        // Update commission transaction status
        await supabaseClient
          .from('commission_transactions')
          .update({ status: 'refunded' })
          .eq('payment_id', paymentId);

        logStep("Commission reversal completed");
      } catch (reversalError) {
        const errorMessage = reversalError instanceof Error ? reversalError.message : String(reversalError);
        logStep("Commission reversal failed", { error: errorMessage });
        // Continue with refund even if commission reversal fails
      }
    }

    logStep("Refund processing completed", { 
      refundAmount: calculatedRefundAmount,
      refundId: refund.id 
    });

    return new Response(JSON.stringify({ 
      success: true,
      refundId: refund.id,
      refundAmount: calculatedRefundAmount,
      originalAmount: payment.amount
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-refund", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});