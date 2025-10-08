import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-STRIPE-ACCOUNT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get host payment account - get the most recent one with a stripe_account_id
    const { data: paymentAccount, error: accountError } = await supabaseClient
      .from("host_payment_accounts")
      .select("stripe_account_id")
      .eq("user_id", user.id)
      .not("stripe_account_id", "is", null)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (accountError || !paymentAccount?.stripe_account_id) {
      throw new Error("No Stripe account found for this user");
    }

    const stripeAccountId = paymentAccount.stripe_account_id;
    logStep("Found Stripe account", { stripeAccountId });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve account details from Stripe
    const account = await stripe.accounts.retrieve(stripeAccountId);
    logStep("Retrieved Stripe account details", {
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });

    // Determine if account is verified
    const isVerified = account.charges_enabled === true && 
                      account.payouts_enabled === true &&
                      account.details_submitted === true;

    // Update verification status in database
    const { error: updateError } = await supabaseClient
      .from("host_payment_accounts")
      .update({ 
        is_verified: isVerified,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id)
      .eq("stripe_account_id", stripeAccountId);

    if (updateError) {
      logStep("ERROR updating verification status", { error: updateError });
      throw new Error(`Failed to update verification status: ${updateError.message}`);
    }

    logStep("Verification status updated", { isVerified });

    return new Response(
      JSON.stringify({ 
        is_verified: isVerified,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-stripe-account", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
