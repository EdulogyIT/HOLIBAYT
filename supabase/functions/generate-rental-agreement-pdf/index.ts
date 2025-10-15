import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeneratePDFRequest {
  agreement_id: string;
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

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) throw new Error("Unauthorized");

    const { agreement_id }: GeneratePDFRequest = await req.json();

    // Fetch agreement details
    const { data: agreement, error: agreementError } = await supabaseClient
      .from("rental_agreements")
      .select(`
        *,
        property:properties (
          title,
          full_address,
          city,
          district
        )
      `)
      .eq("id", agreement_id)
      .single();

    if (agreementError) throw agreementError;

    // Verify user has access
    if (user.id !== agreement.host_user_id && user.id !== agreement.tenant_user_id) {
      throw new Error("Access denied");
    }

    // Fetch host and tenant profiles
    const { data: hostProfile } = await supabaseClient
      .from("profiles")
      .select("name, email")
      .eq("id", agreement.host_user_id)
      .single();

    let tenantProfile = null;
    if (agreement.tenant_user_id) {
      const { data } = await supabaseClient
        .from("profiles")
        .select("name, email")
        .eq("id", agreement.tenant_user_id)
        .single();
      tenantProfile = data;
    }

    // Generate PDF HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Rental Agreement - ${agreement.property?.title || 'Property'}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              line-height: 1.6;
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #4F46E5; 
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #4F46E5;
              margin: 0;
            }
            .section { 
              margin-bottom: 25px; 
            }
            .section h2 {
              color: #4F46E5;
              border-bottom: 2px solid #E5E7EB;
              padding-bottom: 10px;
            }
            .details {
              background: #F9FAFB;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
            }
            .details strong {
              color: #1F2937;
            }
            .signature-section {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
            }
            .signature-box {
              width: 45%;
              border-top: 2px solid #000;
              padding-top: 10px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #6B7280;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RENTAL AGREEMENT</h1>
            <p>Agreement ID: ${agreement.id}</p>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="section">
            <h2>Property Details</h2>
            <div class="details">
              <p><strong>Property:</strong> ${agreement.property?.title || 'N/A'}</p>
              <p><strong>Address:</strong> ${agreement.property?.full_address || ''}, ${agreement.property?.district || ''}, ${agreement.property?.city || ''}</p>
            </div>
          </div>

          <div class="section">
            <h2>Parties</h2>
            <div class="details">
              <p><strong>Landlord:</strong> ${hostProfile?.name || 'N/A'}</p>
              <p><strong>Email:</strong> ${hostProfile?.email || 'N/A'}</p>
            </div>
            <div class="details">
              <p><strong>Tenant:</strong> ${tenantProfile?.name || 'Pending'}</p>
              <p><strong>Email:</strong> ${tenantProfile?.email || 'Pending'}</p>
            </div>
          </div>

          <div class="section">
            <h2>Lease Terms</h2>
            <div class="details">
              <p><strong>Start Date:</strong> ${new Date(agreement.start_date).toLocaleDateString()}</p>
              <p><strong>Duration:</strong> ${agreement.lease_duration_months} months</p>
              <p><strong>Monthly Rent:</strong> ${Number(agreement.monthly_rent).toLocaleString()} ${agreement.currency}</p>
              <p><strong>Security Deposit:</strong> ${Number(agreement.deposit_amount).toLocaleString()} ${agreement.currency}</p>
            </div>
          </div>

          ${agreement.special_clauses ? `
          <div class="section">
            <h2>Special Clauses</h2>
            <div class="details">
              <p>${agreement.special_clauses}</p>
            </div>
          </div>
          ` : ''}

          <div class="section">
            <h2>Payment Terms</h2>
            <div class="details">
              <p><strong>Payment Day:</strong> ${agreement.payment_terms.payment_day} of each month</p>
              <p><strong>Late Fee:</strong> ${agreement.payment_terms.late_fee_percentage}% after ${agreement.payment_terms.grace_period_days} days</p>
              <p><strong>Payment Method:</strong> ${agreement.payment_terms.payment_method}</p>
            </div>
          </div>

          ${agreement.host_signed_at && agreement.tenant_signed_at ? `
          <div class="signature-section">
            <div class="signature-box">
              <p><strong>Landlord Signature</strong></p>
              <p>Signed: ${new Date(agreement.host_signed_at).toLocaleDateString()}</p>
            </div>
            <div class="signature-box">
              <p><strong>Tenant Signature</strong></p>
              <p>Signed: ${new Date(agreement.tenant_signed_at).toLocaleDateString()}</p>
            </div>
          </div>
          ` : ''}

          <div class="footer">
            <p>This agreement is legally binding and protected by Holibayt Pay™</p>
            <p>Powered by Holibayt - Algeria's Trusted Real Estate Platform</p>
          </div>
        </body>
      </html>
    `;

    // Upload to storage
    const fileName = `${agreement.host_user_id}/${agreement.tenant_user_id || 'pending'}/${agreement_id}.html`;
    const { error: uploadError } = await supabaseClient.storage
      .from('rental-agreements')
      .upload(fileName, new Blob([htmlContent], { type: 'text/html' }), {
        contentType: 'text/html',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabaseClient.storage
      .from('rental-agreements')
      .getPublicUrl(fileName);

    // Update agreement with PDF URL
    await supabaseClient
      .from('rental_agreements')
      .update({ agreement_pdf_url: publicUrl })
      .eq('id', agreement_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdf_url: publicUrl,
        html_content: htmlContent 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error generating agreement PDF:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
