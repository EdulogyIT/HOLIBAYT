import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignAgreementRequest {
  agreement_id: string;
  signature_type: 'host' | 'tenant';
  signature_data: {
    ip_address: string;
    user_agent: string;
    timestamp: string;
  };
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

    const { agreement_id, signature_type, signature_data }: SignAgreementRequest = await req.json();

    // Fetch agreement
    const { data: agreement, error: fetchError } = await supabaseClient
      .from("rental_agreements")
      .select("*")
      .eq("id", agreement_id)
      .single();

    if (fetchError) throw fetchError;

    // Verify user can sign
    if (signature_type === 'host' && user.id !== agreement.host_user_id) {
      throw new Error("Only the host can sign as landlord");
    }
    if (signature_type === 'tenant' && user.id !== agreement.tenant_user_id) {
      throw new Error("Only the tenant can sign");
    }

    // Check if already signed
    if (signature_type === 'host' && agreement.host_signed_at) {
      throw new Error("Host has already signed this agreement");
    }
    if (signature_type === 'tenant' && agreement.tenant_signed_at) {
      throw new Error("Tenant has already signed this agreement");
    }

    // Prepare update data
    const updateData: any = {};
    if (signature_type === 'host') {
      updateData.host_signed_at = new Date().toISOString();
      updateData.host_signature_data = signature_data;
      // If tenant already signed, mark as active
      if (agreement.tenant_signed_at) {
        updateData.status = 'active';
      } else {
        updateData.status = 'pending_tenant';
      }
    } else {
      updateData.tenant_signed_at = new Date().toISOString();
      updateData.tenant_signature_data = signature_data;
      // If host already signed, mark as active
      if (agreement.host_signed_at) {
        updateData.status = 'active';
      } else {
        updateData.status = 'pending_host';
      }
    }

    // Update agreement
    const { data: updatedAgreement, error: updateError } = await supabaseClient
      .from('rental_agreements')
      .update(updateData)
      .eq('id', agreement_id)
      .select()
      .single();

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true,
        agreement: updatedAgreement
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error signing agreement:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
