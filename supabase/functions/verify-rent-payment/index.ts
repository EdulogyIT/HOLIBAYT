import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();
  
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not set");
    }

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    console.log("Received event:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (!metadata?.rent_payment_id) {
        console.log("Not a rent payment, skipping");
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Update rent payment status
      const { error: updateError } = await supabaseAdmin
        .from('rent_payments')
        .update({
          status: 'paid',
          payment_date: new Date().toISOString()
        })
        .eq('id', metadata.rent_payment_id);

      if (updateError) {
        console.error("Error updating rent payment:", updateError);
        throw updateError;
      }

      // Get agreement details for notification
      const { data: agreement, error: agreementError } = await supabaseAdmin
        .from('rental_agreements')
        .select('*, properties(title)')
        .eq('id', metadata.agreement_id)
        .single();

      if (!agreementError && agreement) {
        // Notify host
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: metadata.host_user_id,
            title: 'Rent Payment Received',
            message: `Rent payment received for ${agreement.properties.title}`,
            type: 'rent_payment_received',
            related_id: metadata.rent_payment_id
          });

        // Notify tenant
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: metadata.tenant_user_id,
            title: 'Payment Confirmed',
            message: `Your rent payment for ${agreement.properties.title} has been confirmed`,
            type: 'rent_payment_confirmed',
            related_id: metadata.rent_payment_id
          });
      }

      console.log("Rent payment verified successfully");
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }
});
