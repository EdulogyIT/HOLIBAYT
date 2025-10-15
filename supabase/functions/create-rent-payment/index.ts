import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { agreement_id, amount, currency } = await req.json();

    if (!agreement_id || !amount) {
      throw new Error("Missing required fields: agreement_id, amount");
    }

    // Get agreement details
    const { data: agreement, error: agreementError } = await supabaseClient
      .from('rental_agreements')
      .select('*, properties(title)')
      .eq('id', agreement_id)
      .eq('tenant_user_id', user.id)
      .single();

    if (agreementError || !agreement) {
      throw new Error("Agreement not found or unauthorized");
    }

    // Create rent payment record
    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    nextDueDate.setDate(agreement.payment_terms.payment_day);

    const { data: rentPayment, error: paymentError } = await supabaseClient
      .from('rent_payments')
      .insert({
        agreement_id,
        tenant_user_id: user.id,
        host_user_id: agreement.host_user_id,
        amount,
        currency: currency || 'DZD',
        due_date: nextDueDate.toISOString().split('T')[0],
        status: 'pending'
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: (currency || 'DZD').toLowerCase(),
            unit_amount: Math.round(amount * 100), // Convert to cents
            product_data: {
              name: `Rent Payment - ${agreement.properties.title}`,
              description: `Monthly rent for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/tenant/agreements?payment_success=true`,
      cancel_url: `${req.headers.get("origin")}/tenant/agreements?payment_cancelled=true`,
      metadata: {
        rent_payment_id: rentPayment.id,
        agreement_id: agreement_id,
        tenant_user_id: user.id,
        host_user_id: agreement.host_user_id
      }
    });

    // Update rent payment with Stripe session ID
    await supabaseClient
      .from('rent_payments')
      .update({ 
        stripe_payment_id: session.id,
        payment_intent_id: session.payment_intent as string
      })
      .eq('id', rentPayment.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating rent payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
