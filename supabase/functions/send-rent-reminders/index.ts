import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const today = new Date();
    const dayOfMonth = today.getDate();
    
    console.log(`[RENT-REMINDERS] Running check for day ${dayOfMonth}`);

    // Get all active rental agreements
    const { data: agreements, error: agreementsError } = await supabaseClient
      .from("rental_agreements")
      .select(`
        id,
        tenant_user_id,
        host_user_id,
        monthly_rent,
        currency,
        start_date,
        payment_terms,
        property_id,
        properties (
          id,
          title
        )
      `)
      .eq("status", "active");

    if (agreementsError) throw agreementsError;

    console.log(`[RENT-REMINDERS] Found ${agreements?.length || 0} active agreements`);

    let createdPayments = 0;
    let sentReminders = 0;

    // Process each agreement
    for (const agreement of agreements || []) {
      const paymentDay = agreement.payment_terms?.payment_day || 1;
      
      // Check if rent is due today (1st of month or payment day)
      if (dayOfMonth === 1) {
        // Check if payment record already exists for this month
        const dueDate = new Date(today.getFullYear(), today.getMonth(), paymentDay);
        
        const { data: existingPayment } = await supabaseClient
          .from("rent_payments")
          .select("id")
          .eq("agreement_id", agreement.id)
          .eq("due_date", dueDate.toISOString().split('T')[0])
          .maybeSingle();

        if (!existingPayment) {
          // Create rent payment record for this month
          const { error: paymentError } = await supabaseClient
            .from("rent_payments")
            .insert({
              agreement_id: agreement.id,
              tenant_user_id: agreement.tenant_user_id,
              host_user_id: agreement.host_user_id,
              amount: agreement.monthly_rent,
              currency: agreement.currency,
              due_date: dueDate.toISOString().split('T')[0],
              status: "pending"
            });

          if (paymentError) {
            console.error(`[RENT-REMINDERS] Failed to create payment for ${agreement.id}:`, paymentError);
            continue;
          }

          createdPayments++;

          // Send notification to tenant
          await supabaseClient.from("notifications").insert({
            user_id: agreement.tenant_user_id,
            title: "Rent Payment Due",
            message: `Your monthly rent of ${agreement.monthly_rent} ${agreement.currency} for "${agreement.properties.title}" is due today. Please pay by the ${paymentDay}${paymentDay === 1 ? 'st' : paymentDay === 2 ? 'nd' : paymentDay === 3 ? 'rd' : 'th'} to avoid late fees.`,
            type: "rent_due",
            related_id: agreement.id
          });

          console.log(`[RENT-REMINDERS] ✅ Created payment & notification for agreement ${agreement.id}`);
        }
      }
      
      // Check if it's end of month (last 3 days)
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      if (dayOfMonth >= lastDayOfMonth - 2) {
        // Check if next month's rent is already paid
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const { data: existingPayment } = await supabaseClient
          .from("rent_payments")
          .select("status")
          .eq("agreement_id", agreement.id)
          .gte("due_date", nextMonth.toISOString().split('T')[0])
          .eq("status", "paid")
          .maybeSingle();

        if (!existingPayment) {
          // Send reminder for upcoming rent
          await supabaseClient.from("notifications").insert({
            user_id: agreement.tenant_user_id,
            title: "Upcoming Rent Payment",
            message: `Reminder: Your rent of ${agreement.monthly_rent} ${agreement.currency} for "${agreement.properties.title}" will be due on the 1st of next month.`,
            type: "rent_reminder",
            related_id: agreement.id
          });

          sentReminders++;
          console.log(`[RENT-REMINDERS] ✅ Sent end-of-month reminder for ${agreement.id}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${agreements?.length || 0} agreements`,
        created_payments: createdPayments,
        sent_reminders: sentReminders,
        date: today.toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[RENT-REMINDERS] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
