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

    // If payment is successful and there's booking data OR security deposit for rent, create the booking
    if (newStatus === 'completed' && (payment.metadata?.bookingData || payment.payment_type === 'security_deposit')) {
      const bookingData = payment.metadata?.bookingData;
      // Get property details to determine category
      const { data: property } = await dbClient
        .from('properties')
        .select('category, commission_rate, user_id')
        .eq('id', payment.property_id)
        .single();

      // For rent properties with security deposit, create booking without date validation
      if (property?.category === 'rent' && payment.payment_type === 'security_deposit' && !bookingData) {
        logStep("Creating rent security deposit booking");
        
        // Check if booking already exists for this payment
        const { data: existingBooking } = await dbClient
          .from("bookings")
          .select("*")
          .eq("payment_id", paymentId)
          .maybeSingle();

        if (!existingBooking) {
          const { data: newBooking, error: createError } = await dbClient
            .from('bookings')
            .insert({
              user_id: user.id,
              property_id: payment.property_id,
              payment_id: paymentId,
              check_in_date: new Date().toISOString().split('T')[0], // Placeholder
              check_out_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +1 year
              guests_count: 1,
              total_amount: payment.amount,
              booking_fee: 0,
              security_deposit: payment.amount,
              status: 'pending_agreement', // Waiting for rental agreement
            })
            .select()
            .single();

          if (!createError && newBooking) {
            logStep("Rent security deposit booking created", { bookingId: newBooking.id });
            
            // Notify user
            await dbClient
              .from('notifications')
              .insert({
                user_id: user.id,
                title: '✅ Security Deposit Paid',
                message: 'Your security deposit has been received. The host will contact you to finalize the rental agreement.',
                type: 'payment_success',
                related_id: newBooking.id
              });

            // Notify host
            if (property?.user_id) {
              await dbClient
                .from('notifications')
                .insert({
                  user_id: property.user_id,
                  title: '💰 Security Deposit Received',
                  message: `Security deposit received for your rental property. Please create a rental agreement for ${user.email}.`,
                  type: 'security_deposit_received',
                  related_id: newBooking.id
                });
            }
          }
        }

        return new Response(JSON.stringify({ 
          success: true,
          paymentId,
          status: newStatus,
          paymentIntentId,
          message: 'Security deposit paid. Host will contact you for rental agreement.'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // For short-stay bookings, check availability
      if (!bookingData) {
        throw new Error('Missing booking data for non-rent property');
      }
      
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
      
      // Check if booking already exists for this payment (idempotency check)
      const { data: existingBooking } = await dbClient
        .from("bookings")
        .select("*")
        .eq("payment_id", paymentId)
        .maybeSingle();

      let booking = existingBooking;
      let bookingCreateError = null;
      
      if (existingBooking) {
        logStep("Booking already exists for this payment", { bookingId: existingBooking.id });
      } else {
        // Create new booking
        const { data: newBooking, error: createError } = await dbClient
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
            status: 'payment_escrowed', // ESCROW: Funds held in escrow
          })
          .select()
          .single();

        booking = newBooking;
        bookingCreateError = createError;
      }

      if (bookingCreateError) {
        logStep("Booking creation failed", { error: bookingCreateError.message });
      } else if (booking) {
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

        // Create celebratory notification for guest using service role (bypass RLS)
        logStep("Creating guest notification", { 
          userId: user.id, 
          bookingId: booking.id,
          propertyTitle: propertyDetails?.title 
        });
        
        try {
          await dbClient
            .from('notifications')
            .insert({
              user_id: user.id,
              title: '🎉 Booking Confirmed!',
              message: `Welcome home! ${hostProfile?.name || 'Your host'} is excited to host you at "${propertyDetails?.title}". Get ready for an amazing stay! Check-in: ${bookingData.checkInDate}`,
              type: 'booking_confirmed_guest',
              related_id: booking.id
            });
          logStep("Guest notification created successfully");
        } catch (error) {
          logStep("Failed to create guest notification", { error: error.message });
        }

        // Create celebratory notification for host using service role (bypass RLS)
        if (propertyDetails?.user_id) {
          logStep("Creating host notification", { 
            hostUserId: propertyDetails.user_id, 
            bookingId: booking.id 
          });
          
          try {
            await dbClient
              .from('notifications')
              .insert({
                user_id: propertyDetails.user_id,
                title: '🌟 New Booking!',
                message: `Exciting news! ${guestProfile?.name || 'A guest'} (${user.email}) just booked "${propertyDetails?.title}" from ${bookingData.checkInDate} to ${bookingData.checkOutDate}. ${bookingData.guestsCount} guest(s). ${bookingData.contactPhone ? 'Contact: ' + bookingData.contactPhone : ''}`,
                type: 'booking_confirmed_host',
                related_id: booking.id
              });
            logStep("Host notification created successfully");
          } catch (error) {
            logStep("Failed to create host notification", { error: error.message });
          }
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



