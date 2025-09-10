import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Check if admin user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const adminExists = existingUser.users.some(user => user.email === 'contact@holibayt.com')

    if (adminExists) {
      console.log('Admin user already exists')
      return new Response(
        JSON.stringify({ message: 'Admin user already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create the admin user
    const { data: user, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: 'contact@holibayt.com',
      password: 'Holibayt@123',
      user_metadata: {
        display_name: 'Holibayt Admin',
        role: 'admin',
        language: 'en'
      },
      email_confirm: true
    })

    if (signUpError) {
      console.error('Error creating admin user:', signUpError)
      return new Response(
        JSON.stringify({ error: signUpError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Admin user created successfully:', user.user?.email)

    return new Response(
      JSON.stringify({ 
        message: 'Admin user created successfully',
        user: {
          id: user.user?.id,
          email: user.user?.email
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})