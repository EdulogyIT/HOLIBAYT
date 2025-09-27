import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  propertyId: string;
  paymentType: 'booking_fee' | 'security_deposit' | 'earnest_money' | 'property_sale';
  amount: number;
  currency: string;
  description?: string;
  bookingData?: {
    checkInDate: string;
    checkOutDate: string;
    guestsCount: number;
    specialRequests?: string;
    contactPhone?: string;
  };
}

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payment creation started");

    // Initialize Supabase client with anon key for auth
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Initialize Supabase client with service role key for database operations
    const dbClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Authenticate user using anon client
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const paymentRequest: PaymentRequest = await req.json();
    const { propertyId, paymentType, amount, currency, description, bookingData } = paymentRequest;
    
    logStep("Payment request parsed", { propertyId, paymentType, amount, currency });

  // Validate amount is reasonable (between $1 and $50,000)
  if (amount < 1 || amount > 500000) {
    throw new Error(`Invalid payment amount: $${amount}. Amount must be between $1 and $500,000. Note: For testing, if you see very large amounts, the property price might be in a different currency (DZD) - try converting it first.`);
  }

    // Verify property exists and get property details using service role
    const { data: property, error: propertyError } = await dbClient
      .from('properties')
      .select('id, title, user_id, contact_name, contact_email')
      .eq('id', propertyId)
      .single();
    
    if (propertyError || !property) {
      throw new Error('Property not found');
    }
    
    logStep("Property verified", { propertyTitle: property.title });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2025-08-27.basil" 
    });

    // Check if Stripe customer exists
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("Creating new customer");
    }

    // Create payment record in database using service role
    const { data: payment, error: paymentError } = await dbClient
      .from('payments')
      .insert({
        user_id: user.id,
        property_id: propertyId,
        amount: amount,
        currency: currency.toUpperCase(),
        payment_type: paymentType,
        status: 'pending',
        description: description || `Payment for ${property.title}`,
        metadata: {
          propertyTitle: property.title,
          paymentType,
          bookingData
        }
      })
      .select()
      .single();

    if (paymentError) {
      throw new Error(`Failed to create payment record: ${paymentError.message}`);
    }
    
    logStep("Payment record created", { paymentId: payment.id });

    // Create booking record if this is a booking-related payment using service role
    let bookingId = null;
    if (bookingData && (paymentType === 'booking_fee' || paymentType === 'security_deposit')) {
      const { data: booking, error: bookingError } = await dbClient
        .from('bookings')
        .insert({
          user_id: user.id,
          property_id: propertyId,
          payment_id: payment.id,
          check_in_date: bookingData.checkInDate,
          check_out_date: bookingData.checkOutDate,
          guests_count: bookingData.guestsCount,
          total_amount: amount,
          booking_fee: paymentType === 'booking_fee' ? amount : 0,
          security_deposit: paymentType === 'security_deposit' ? amount : 0,
          special_requests: bookingData.specialRequests,
          contact_phone: bookingData.contactPhone,
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) {
        logStep("Booking creation failed", { error: bookingError.message });
      } else {
        bookingId = booking.id;
        logStep("Booking record created", { bookingId });
      }
    }

    // Create Stripe checkout session with dynamic pricing
    const origin = req.headers.get("origin");
    logStep("Origin header received", { origin });
    
    // Use a proper fallback URL - this should match your actual domain
    const baseUrl = origin || "https://vsruezynaanqprobpvrr.supabase.co";
    logStep("Using base URL", { baseUrl });
    
    // Create product name based on payment type and property
    const productName = paymentType === 'booking_fee' 
      ? `Booking Fee - ${property.title}`
      : paymentType === 'security_deposit'
      ? `Security Deposit - ${property.title}`
      : paymentType === 'earnest_money'
      ? `Earnest Money - ${property.title}`
      : paymentType === 'property_sale'
      ? `Property Purchase - ${property.title}`
      : `Payment - ${property.title}`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: productName,
              description: description || `${paymentType.replace('_', ' ')} for ${property.title}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
      cancel_url: `${baseUrl}/payment-cancelled?payment_id=${payment.id}`,
      metadata: {
        payment_id: payment.id,
        property_id: propertyId,
        booking_id: bookingId || '',
        payment_type: paymentType,
      }
    });

    // Update payment record with checkout session ID using service role
    await dbClient
      .from('payments')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', payment.id);

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ 
      url: session.url,
      paymentId: payment.id,
      bookingId: bookingId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
