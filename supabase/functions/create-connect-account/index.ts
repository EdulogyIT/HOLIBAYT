import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CONNECT-ACCOUNT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !STRIPE_SECRET_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user?.email) {
      throw new Error("Authentication failed");
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get user profile for additional info
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const stripe = new Stripe(STRIPE_SECRET_KEY, { 
      apiVersion: "2025-08-27.basil" 
    });

    // Check if user already has a Stripe Connect account
    const { data: existingAccount } = await supabaseClient
      .from('host_payment_accounts')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .not('stripe_account_id', 'is', null)
      .limit(1)
      .single();

    let accountId;
    
    if (existingAccount?.stripe_account_id) {
      accountId = existingAccount.stripe_account_id;
      logStep("Found existing Stripe account", { accountId });
    } else {
      // Create new Stripe Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'FR', // France - matches platform account region
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        individual: {
          email: user.email,
          first_name: profile?.name?.split(' ')[0],
          last_name: profile?.name?.split(' ').slice(1).join(' ') || undefined,
        },
      });

      accountId = account.id;
      logStep("Created new Stripe account", { accountId });

      // Store in database
      await supabaseClient
        .from('host_payment_accounts')
        .insert({
          user_id: user.id,
          stripe_account_id: accountId,
          account_holder_name: profile?.name || 'Host',
          bank_name: 'Stripe Connect',
          account_number: 'N/A',
          account_type: 'express',
          country: 'FR',
          currency: 'EUR',
          is_active: true,
          is_verified: false,
        });
    }

    // Create account link for onboarding
    const origin = req.headers.get("origin") || "https://holibayt.vercel.app";
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/host/payouts?refresh=true`,
      return_url: `${origin}/host/payouts?success=true`,
      type: 'account_onboarding',
    });

    logStep("Account link created", { url: accountLink.url });

    return new Response(
      JSON.stringify({ 
        url: accountLink.url,
        accountId: accountId 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
