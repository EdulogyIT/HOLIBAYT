import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PaymentRequest {
  propertyId: string;
  paymentType: 'booking_fee' | 'security_deposit' | 'earnest_money' | 'property_sale';
  amount: number;
  currency?: string;
  description?: string;
  bookingData?: {
    checkInDate: string;
    checkOutDate: string;
    guestsCount: number;
    specialRequests?: string;
    contactPhone?: string;
  };
}

serve(async (req) => {
  console.log(`[CREATE-PAYMENT] ${new Date().toISOString()} - Request received: ${req.method}`);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Environment variables
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

    console.log("[CREATE-PAYMENT] Environment check:", {
      hasSupabaseUrl: !!SUPABASE_URL,
      hasAnonKey: !!SUPABASE_ANON_KEY,
      hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY,
      hasStripeKey: !!STRIPE_SECRET_KEY
    });

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

    console.log("[CREATE-PAYMENT] Authenticating user...");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    
    if (userError || !userData.user?.email) {
      console.log("[CREATE-PAYMENT] Authentication failed:", userError);
      throw new Error("Authentication failed");
    }

    const user = userData.user;
    console.log("[CREATE-PAYMENT] User authenticated:", user.email);

    // Parse request body
    console.log("[CREATE-PAYMENT] Parsing request body...");
    const body: PaymentRequest = await req.json();
    console.log("[CREATE-PAYMENT] Request body:", body);

    const { propertyId, paymentType, amount, description, bookingData } = body;

    if (!propertyId || !paymentType || !amount) {
      throw new Error("Missing required fields: propertyId, paymentType, amount");
    }

    if (amount < 0.5 || amount > 500000) {
      throw new Error(`Invalid amount: ${amount}. Must be between 0.5 and 500,000`);
    }

    // Get property details
    console.log("[CREATE-PAYMENT] Fetching property...");
    const { data: property, error: propertyError } = await dbClient
      .from("properties")
      .select("id, title, user_id, owner_account_id")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      console.log("[CREATE-PAYMENT] Property fetch failed:", propertyError);
      throw new Error("Property not found");
    }

    console.log("[CREATE-PAYMENT] Property found:", property.title);

    // Initialize Stripe
    console.log("[CREATE-PAYMENT] Initializing Stripe...");
    const stripe = new Stripe(STRIPE_SECRET_KEY, { 
      apiVersion: "2024-06-20"
    });

    // Find or create Stripe customer
    console.log("[CREATE-PAYMENT] Finding/creating customer...");
    const existingCustomers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });

    let customerId;
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      console.log("[CREATE-PAYMENT] Found existing customer:", customerId);
    } else {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.name || (user.email ? user.email.split('@')[0] : 'User')
      });
      customerId = newCustomer.id;
      console.log("[CREATE-PAYMENT] Created new customer:", customerId);
    }

    // Create payment record in database
    console.log("[CREATE-PAYMENT] Creating payment record...");
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

    if (paymentError || !payment) {
      console.log("[CREATE-PAYMENT] Payment creation failed:", paymentError);
      throw new Error("Failed to create payment record");
    }

    console.log("[CREATE-PAYMENT] Payment record created:", payment.id);

    // Determine redirect URLs
    const origin = req.headers.get("origin");
    let baseUrl = origin || "https://holibayt.vercel.app";
    
    if (baseUrl && !baseUrl.startsWith("http")) {
      baseUrl = `https://${baseUrl}`;
    }
    
    console.log("[CREATE-PAYMENT] Using base URL:", baseUrl);

    // Create Stripe checkout session
    console.log("[CREATE-PAYMENT] Creating Stripe session...");
    const productName = `${paymentType.replace(/_/g, " ")} - ${property.title}`;
    
    const sessionData = {
      mode: "payment" as const,
      customer: customerId,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: productName,
            description: description || `${paymentType.replace(/_/g, " ")} for ${property.title}`,
          },
        },
      }],
      success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
      cancel_url: `${baseUrl}/payment-cancelled?payment_id=${payment.id}`,
      metadata: {
        payment_id: payment.id,
        property_id: propertyId,
        payment_type: paymentType,
      },
    };

    console.log("[CREATE-PAYMENT] Session data:", JSON.stringify(sessionData, null, 2));
    
    const session = await stripe.checkout.sessions.create(sessionData);
    console.log("[CREATE-PAYMENT] Stripe session created:", session.id);

    // Update payment record with session ID
    await dbClient
      .from("payments")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", payment.id);

    console.log("[CREATE-PAYMENT] Payment updated with session ID");

    return new Response(
      JSON.stringify({ 
        url: session.url, 
        paymentId: payment.id 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error("[CREATE-PAYMENT] ERROR:", error);
    console.error("[CREATE-PAYMENT] ERROR STACK:", error instanceof Error ? error.stack : 'No stack trace');
    
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