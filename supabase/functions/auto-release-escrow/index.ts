import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTO-RELEASE-ESCROW] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Cron job started");

    // Initialize Supabase with service role
    const dbClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find bookings eligible for auto-release
    // Criteria: status = 'payment_escrowed', escrow_release_eligible_at < now
    const now = new Date().toISOString();
    const { data: eligibleBookings, error: fetchError } = await dbClient
      .from('bookings')
      .select(`
        id,
        property_id,
        user_id,
        check_out_date,
        escrow_release_eligible_at,
        auto_release_scheduled,
        properties (
          id,
          title,
          category,
          user_id
        )
      `)
      .eq('status', 'payment_escrowed')
      .eq('auto_release_scheduled', false)
      .lt('escrow_release_eligible_at', now)
      .not('escrow_release_eligible_at', 'is', null);

    if (fetchError) {
      throw new Error(`Failed to fetch eligible bookings: ${fetchError.message}`);
    }

    logStep("Found eligible bookings", { count: eligibleBookings?.length || 0 });

    if (!eligibleBookings || eligibleBookings.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No bookings eligible for auto-release', count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Process each eligible booking
    const results = [];
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    for (const booking of eligibleBookings) {
      try {
        logStep("Processing booking", { bookingId: booking.id });

        // Mark as scheduled to prevent duplicate processing
        await dbClient
          .from('bookings')
          .update({ auto_release_scheduled: true })
          .eq('id', booking.id);

        // Call release-escrow function
        const response = await fetch(`${supabaseUrl}/functions/v1/release-escrow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            bookingId: booking.id,
            reason: 'auto_release_24h_post_checkout'
          })
        });

        const result = await response.json();

        if (result.success) {
          logStep("Successfully released escrow", { bookingId: booking.id });
          results.push({ bookingId: booking.id, status: 'success' });
        } else {
          logStep("Failed to release escrow", { bookingId: booking.id, error: result.error });
          results.push({ bookingId: booking.id, status: 'failed', error: result.error });
          
          // Unmark as scheduled so it can be retried
          await dbClient
            .from('bookings')
            .update({ auto_release_scheduled: false })
            .eq('id', booking.id);
        }

      } catch (bookingError) {
        const errorMsg = bookingError instanceof Error ? bookingError.message : String(bookingError);
        logStep("Error processing booking", { bookingId: booking.id, error: errorMsg });
        results.push({ bookingId: booking.id, status: 'error', error: errorMsg });
        
        // Unmark as scheduled so it can be retried
        await dbClient
          .from('bookings')
          .update({ auto_release_scheduled: false })
          .eq('id', booking.id);
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    logStep("Cron job completed", { total: results.length, successful: successCount });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} bookings, ${successCount} successful`,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
