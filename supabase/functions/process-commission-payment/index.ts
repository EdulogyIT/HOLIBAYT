import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-COMMISSION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Commission processing started");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the webhook payload from Stripe
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2025-08-27.basil" 
    });

    // Verify webhook signature
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      logStep("No webhook secret, processing without verification");
    }

    let event;
    try {
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } else {
        event = JSON.parse(body);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("Webhook signature verification failed", { error: errorMessage });
      return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
    }

    logStep("Event received", { type: event.type });

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const paymentId = session.metadata?.payment_id;
      
      if (!paymentId) {
        logStep("No payment_id in session metadata");
        return new Response("No payment_id found", { status: 400 });
      }

      // Get payment details
      const { data: payment, error: paymentError } = await supabaseClient
        .from('payments')
        .select(`
          *,
          properties(
            id, 
            title, 
            user_id, 
            commission_rate
          )
        `)
        .eq('id', paymentId)
        .single();

      if (paymentError || !payment) {
        logStep("Payment not found", { paymentId, error: paymentError });
        return new Response("Payment not found", { status: 404 });
      }

      const property = payment.properties;
      const totalAmount = payment.amount;
      const commissionRate = property.commission_rate || 0.15; // Default 15%
      const commissionAmount = totalAmount * commissionRate;
      const hostAmount = totalAmount - commissionAmount;

      logStep("Processing commission", {
        totalAmount,
        commissionRate,
        commissionAmount,
        hostAmount
      });

      // Create commission transaction record
      const { error: commissionError } = await supabaseClient
        .from('commission_transactions')
        .insert({
          payment_id: paymentId,
          property_id: property.id,
          host_user_id: property.user_id,
          total_amount: totalAmount,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          host_amount: hostAmount,
          status: 'completed'
        });

      if (commissionError) {
        logStep("Failed to create commission transaction", { error: commissionError });
      }

      // Get host payment account for potential transfer
      const { data: paymentAccount } = await supabaseClient
        .from('host_payment_accounts')
        .select('*')
        .eq('user_id', property.user_id)
        .eq('is_active', true)
        .eq('is_verified', true)
        .limit(1)
        .single();

      if (paymentAccount && paymentAccount.stripe_account_id) {
        try {
          // Create transfer to host (if using Stripe Connect)
          const transfer = await stripe.transfers.create({
            amount: Math.round(hostAmount * 100), // Convert to cents
            currency: payment.currency.toLowerCase(),
            destination: paymentAccount.stripe_account_id,
            metadata: {
              payment_id: paymentId,
              property_id: property.id,
              commission_rate: commissionRate.toString()
            }
          });

          logStep("Transfer created", { transferId: transfer.id });

          // Update commission transaction with transfer ID
          await supabaseClient
            .from('commission_transactions')
            .update({ stripe_transfer_id: transfer.id })
            .eq('payment_id', paymentId);

        } catch (transferError) {
          const errorMessage = transferError instanceof Error ? transferError.message : String(transferError);
          logStep("Transfer failed", { error: errorMessage });
          // Mark as pending for manual processing
          await supabaseClient
            .from('commission_transactions')
            .update({ status: 'pending' })
            .eq('payment_id', paymentId);
        }
      }

      logStep("Commission processing completed");
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-commission-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});