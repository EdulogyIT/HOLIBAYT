import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  propertyId: string;
  hostEmail: string;
  hostName: string;
  propertyTitle: string;
  status: 'approved' | 'rejected';
  reason?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { propertyId, hostEmail, hostName, propertyTitle, status, reason }: EmailRequest = await req.json();

    const isApproved = status === 'approved';
    const subject = isApproved 
      ? `Property Approved: ${propertyTitle}` 
      : `Property Submission Update: ${propertyTitle}`;

    const html = isApproved ? `
      <h1>Congratulations ${hostName}!</h1>
      <p>Your property <strong>"${propertyTitle}"</strong> has been approved and is now live on Holibayt!</p>
      <p>Your property is now visible to potential guests and can start receiving bookings.</p>
      <p>You can view your property listing by visiting your host dashboard.</p>
      <p>Best regards,<br>The Holibayt Team</p>
    ` : `
      <h1>Property Submission Update</h1>
      <p>Hello ${hostName},</p>
      <p>We have reviewed your property submission <strong>"${propertyTitle}"</strong>.</p>
      <p>Unfortunately, we cannot approve it at this time for the following reason:</p>
      <p><strong>${reason || 'Please review your property details and resubmit.'}</strong></p>
      <p>You can edit your property and resubmit it for approval from your host dashboard.</p>
      <p>If you have any questions, please contact our support team.</p>
      <p>Best regards,<br>The Holibayt Team</p>
    `;

    const emailResponse = await resend.emails.send({
      from: "Holibayt <onboarding@resend.dev>",
      to: [hostEmail],
      subject,
      html,
    });

    // Create notification in database
    const { data: property } = await supabaseClient
      .from('properties')
      .select('user_id')
      .eq('id', propertyId)
      .single();

    if (property) {
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: property.user_id,
          title: isApproved ? 'Property Approved!' : 'Property Update',
          message: isApproved 
            ? `Your property "${propertyTitle}" is now live!` 
            : `Your property "${propertyTitle}" requires updates. ${reason || ''}`,
          type: isApproved ? 'property_approval' : 'property_rejection',
          related_id: propertyId
        });
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-property-approval-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
