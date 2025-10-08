import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  sessionId: string;
  paymentId: string;
}

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payment verification started");

    // Initialize Supabase clients (auth client + service client for DB writes)
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const dbClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Parse request body
    const { sessionId, paymentId }: VerifyPaymentRequest = await req.json();
    logStep("Verification request parsed", { sessionId, paymentId });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2025-08-27.basil" 
    });

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Stripe session retrieved", { 
      sessionId, 
      paymentStatus: session.payment_status,
      paymentIntentId: session.payment_intent 
    });

    // Get current payment record (using auth client for security)
    const { data: payment, error: paymentFetchError } = await authClient
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .single();

    if (paymentFetchError || !payment) {
      throw new Error('Payment record not found or access denied');
    }

    let newStatus = payment.status;
    let completedAt = null;
    let paymentIntentId = null;

    // Update payment status based on Stripe session
    if (session.payment_status === 'paid') {
      newStatus = 'completed';
      completedAt = new Date().toISOString();
      paymentIntentId = session.payment_intent as string;
      logStep("Payment successful");
    } else if (session.payment_status === 'unpaid') {
      newStatus = 'failed';
      logStep("Payment failed");
    }

    // Update payment record (using service client for DB writes)
    const { error: updateError } = await dbClient
      .from('payments')
      .update({
        status: newStatus,
        stripe_payment_intent_id: paymentIntentId,
        completed_at: completedAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId);

    if (updateError) {
      throw new Error(`Failed to update payment: ${updateError.message}`);
    }

    // If payment is successful and there's booking data, create the booking (using service client)
    if (newStatus === 'completed' && payment.metadata?.bookingData) {
      const bookingData = payment.metadata.bookingData;
      
      // CHECK FOR EXISTING BOOKINGS - PREVENT DOUBLE BOOKING
      const { data: existingBookings, error: checkError } = await dbClient
        .from('bookings')
        .select('check_in_date, check_out_date')
        .eq('property_id', payment.property_id)
        .in('status', ['confirmed', 'pending']);

      if (checkError) {
        logStep("Error checking existing bookings", { error: checkError.message });
        throw new Error('Failed to verify availability');
      }

      // Check for date overlap
      const requestedCheckIn = new Date(bookingData.checkInDate);
      const requestedCheckOut = new Date(bookingData.checkOutDate);

      const hasConflict = existingBookings?.some(booking => {
        const bookingCheckIn = new Date(booking.check_in_date);
        const bookingCheckOut = new Date(booking.check_out_date);
        
        // Check if there's any overlap
        return (
          (requestedCheckIn >= bookingCheckIn && requestedCheckIn < bookingCheckOut) ||
          (requestedCheckOut > bookingCheckIn && requestedCheckOut <= bookingCheckOut) ||
          (requestedCheckIn <= bookingCheckIn && requestedCheckOut >= bookingCheckOut)
        );
      });

      if (hasConflict) {
        logStep("Booking conflict detected - dates already booked", { 
          requestedCheckIn: bookingData.checkInDate,
          requestedCheckOut: bookingData.checkOutDate
        });
        
        // Refund the payment since dates are not available
        await dbClient
          .from('payments')
          .update({
            status: 'refunded',
            refunded_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentId);
        
        // Create notification for user about the conflict
        await dbClient
          .from('notifications')
          .insert({
            user_id: user.id,
            title: '❌ Booking Unavailable',
            message: 'Sorry, these dates were just booked by someone else. Your payment has been refunded.',
            type: 'booking_failed',
            related_id: paymentId
          });
        
        throw new Error('These dates are no longer available. Your payment has been refunded.');
      }

      logStep("No booking conflicts - proceeding with booking creation");
      
      // Get property details for commission calculation
      const { data: property } = await dbClient
        .from('properties')
        .select('commission_rate, user_id')
        .eq('id', payment.property_id)
        .single();
      
      const { data: booking, error: bookingCreateError } = await dbClient
        .from('bookings')
        .insert({
          user_id: user.id,
          property_id: payment.property_id,
          payment_id: paymentId,
          check_in_date: bookingData.checkInDate,
          check_out_date: bookingData.checkOutDate,
          guests_count: bookingData.guestsCount,
          total_amount: payment.amount,
          booking_fee: payment.payment_type === 'booking_fee' ? payment.amount : 0,
          security_deposit: payment.payment_type === 'security_deposit' ? payment.amount : 0,
          special_requests: bookingData.specialRequests,
          contact_phone: bookingData.contactPhone,
          status: 'confirmed',
        })
        .select()
        .single();

      if (bookingCreateError) {
        logStep("Booking creation failed", { error: bookingCreateError.message });
      } else {
        logStep("Booking created successfully", { bookingId: booking.id });
        
        // Get property and profile details for notifications
        const { data: propertyDetails } = await dbClient
          .from('properties')
          .select('title, user_id')
          .eq('id', payment.property_id)
          .single();

        const { data: guestProfile } = await dbClient
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        const { data: hostProfile } = await dbClient
          .from('profiles')
          .select('name')
          .eq('id', propertyDetails?.user_id)
          .single();

        // Create celebratory notification for guest
        logStep("Attempting to create guest notification", { 
          userId: user.id, 
          bookingId: booking.id,
          propertyTitle: propertyDetails?.title 
        });
        
        const { data: guestNotifData, error: guestNotifError } = await dbClient
          .from('notifications')
          .insert({
            user_id: user.id,
            title: '🎉 Booking Confirmed!',
            message: `Welcome home! ${hostProfile?.name || 'Your host'} is excited to host you at "${propertyDetails?.title}". Get ready for an amazing stay! ✨`,
            type: 'booking_confirmed_guest',
            related_id: booking.id
          })
          .select();

        if (guestNotifError) {
          logStep("Failed to create guest notification", { 
            error: guestNotifError.message,
            code: guestNotifError.code,
            details: guestNotifError.details,
            hint: guestNotifError.hint
          });
        } else {
          logStep("Guest notification created successfully", { notificationId: guestNotifData?.[0]?.id });
        }

        // Create celebratory notification for host
        if (propertyDetails?.user_id) {
          logStep("Attempting to create host notification", { 
            hostUserId: propertyDetails.user_id, 
            bookingId: booking.id,
            propertyTitle: propertyDetails?.title 
          });
          
          const { data: hostNotifData, error: hostNotifError } = await dbClient
            .from('notifications')
            .insert({
              user_id: propertyDetails.user_id,
              title: '🌟 New Booking - Yay!',
              message: `Exciting news! ${guestProfile?.name || 'A guest'} just booked "${propertyDetails?.title}". Time to prepare for your special guest! 🏡`,
              type: 'booking_confirmed_host',
              related_id: booking.id
            })
            .select();
          
          if (hostNotifError) {
            logStep("Failed to create host notification", { 
              error: hostNotifError.message,
              code: hostNotifError.code,
              details: hostNotifError.details,
              hint: hostNotifError.hint
            });
          } else {
            logStep("Host notification created successfully", { notificationId: hostNotifData?.[0]?.id });
          }
        } else {
          logStep("No host user_id found for notifications", { propertyDetails });
        }
        
        // NOTE: Commission transaction is automatically created by database trigger
        // on booking insert (create_commission_transaction_on_booking function)
        logStep("Commission transaction will be created by database trigger");
      }
    }

    logStep("Payment verification completed", { 
      paymentId, 
      newStatus, 
      paymentIntentId 
    });

    return new Response(JSON.stringify({ 
      success: true,
      paymentId,
      status: newStatus,
      paymentIntentId,
      sessionData: {
        paymentStatus: session.payment_status,
        customerDetails: session.customer_details,
        amountTotal: session.amount_total
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});



