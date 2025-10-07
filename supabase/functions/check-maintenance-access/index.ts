import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          reason: 'No authorization header' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the user from the auth token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          reason: 'Invalid auth token' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if maintenance mode is active
    const { data: settings, error: settingsError } = await supabase
      .from('platform_settings')
      .select('setting_value')
      .eq('setting_key', 'general_settings')
      .single();

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      // If we can't fetch settings, allow access (fail open for normal operations)
      return new Response(
        JSON.stringify({ 
          allowed: true, 
          reason: 'Could not verify maintenance mode' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const isMaintenanceMode = settings?.setting_value?.maintenance_mode || false;

    // If not in maintenance mode, allow access
    if (!isMaintenanceMode) {
      return new Response(
        JSON.stringify({ 
          allowed: true, 
          reason: 'Platform not in maintenance mode' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if user has admin role using has_role function
    const { data: isAdmin, error: roleError } = await supabase
      .rpc('has_role', { 
        _user_id: user.id, 
        _role: 'admin' 
      });

    if (roleError) {
      console.error('Error checking role:', roleError);
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          reason: 'Error verifying admin status' 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Allow access if user is admin, deny otherwise
    if (isAdmin) {
      return new Response(
        JSON.stringify({ 
          allowed: true, 
          reason: 'Admin access granted during maintenance' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          reason: 'Platform is under maintenance. Only administrators can access.' 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        allowed: false, 
        reason: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
