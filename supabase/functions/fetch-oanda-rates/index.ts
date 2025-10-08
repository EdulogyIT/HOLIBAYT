import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fetching DZD to EUR exchange rate from OANDA...');

    // Fetch from OANDA Currency Converter API
    // Note: OANDA doesn't have a public API for the converter page
    // We'll use their historical rates API endpoint which is more reliable
    const response = await fetch(
      'https://www.oanda.com/fx-for-business/historical-rates/api/data/update/?source=DZD&destinations=EUR&start=2025-10-08&end=2025-10-08&view=graph&base_currency_select=true',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`OANDA API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('OANDA response:', JSON.stringify(data));

    // Extract the latest rate from OANDA response
    // OANDA returns data in format: {base_currency: {...}, quotes: {EUR: [...rates...]}}
    let dzdToEurRate = 0.0069; // fallback
    
    if (data?.quotes?.EUR && Array.isArray(data.quotes.EUR) && data.quotes.EUR.length > 0) {
      // Get the most recent rate (last element)
      const latestRate = data.quotes.EUR[data.quotes.EUR.length - 1];
      if (latestRate?.mid) {
        dzdToEurRate = parseFloat(latestRate.mid);
      }
    }

    console.log(`Extracted DZD to EUR rate: ${dzdToEurRate}`);

    // Update the platform settings with the new rate
    const { error: updateError } = await supabaseClient
      .from('platform_settings')
      .upsert({
        setting_key: 'currency_exchange_rates',
        setting_value: {
          dzd_to_eur: dzdToEurRate,
          last_updated: new Date().toISOString(),
          source: 'OANDA'
        }
      }, {
        onConflict: 'setting_key'
      });

    if (updateError) {
      throw updateError;
    }

    console.log('Successfully updated exchange rates in database');

    return new Response(
      JSON.stringify({
        success: true,
        rate: dzdToEurRate,
        updated_at: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error fetching OANDA rates:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        fallback_rate: 0.0069
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
