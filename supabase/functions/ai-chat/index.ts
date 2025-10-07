import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = 'EN' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // System prompt that guides the conversation
    const systemPrompt = `You are Holibayt AI Assistant, a helpful real estate chatbot for properties in Algeria. Your role is to:

1. Greet users warmly and ask how you can help them
2. Guide them through questions to understand their needs:
   - Are they looking to buy, rent, or need a short stay?
   - What's their budget range?
   - Which city interests them (Alger, Oran, Constantine, Annaba)?
   - For short stays: How many guests and how many nights?
   - What type of property (apartment, villa, studio, etc.)?

3. Based on their answers, you can search the properties database and suggest relevant options
4. Always be conversational, friendly, and helpful
5. If they want to see properties or get more details, encourage them to visit the relevant page (Buy, Rent, or Short Stay)
6. If they need human assistance, mention they can contact advisors via the Contact page

CRITICAL RULES:
- ONLY suggest properties that are explicitly provided in the "Available properties" list below
- NEVER make up, invent, or hallucinate property listings
- If no properties match the criteria, honestly tell the user and suggest they browse the website or adjust their criteria
- When suggesting properties, use the exact details provided (title, city, price, bedrooms)

Language: Respond in ${language === 'AR' ? 'Arabic' : language === 'FR' ? 'French' : 'English'}

Keep responses concise and conversational. Ask one question at a time.`;

    // Check if we need to search for properties based on the conversation
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    let propertyContext = '';

    // Detect if user has provided enough info to search properties
    const hasBudget = /\d{1,2}[m|k|million|thousand]/i.test(lastMessage) || 
                      /\d{4,}/i.test(lastMessage);
    const hasCategory = /buy|rent|short|stay|séjour|إقامة|acheter|louer|شراء|إيجار/i.test(
      messages.map(m => m.content).join(' ')
    );
    const hasCity = /alger|oran|constantine|annaba|الجزائر|وهران|قسنطينة|عنابة/i.test(
      messages.map(m => m.content).join(' ')
    );

    // If user has provided category and either budget or city, fetch some properties
    if (hasCategory && (hasBudget || hasCity)) {
      let category = 'sale';
      if (lastMessage.includes('rent') || lastMessage.includes('louer') || lastMessage.includes('إيجار')) {
        category = 'rent';
      } else if (lastMessage.includes('short') || lastMessage.includes('stay') || lastMessage.includes('séjour') || lastMessage.includes('إقامة')) {
        category = 'short-stay';
      }

      // Extract city if mentioned
      let city = '';
      if (lastMessage.includes('alger') || lastMessage.includes('الجزائر')) city = 'Alger';
      else if (lastMessage.includes('oran') || lastMessage.includes('وهران')) city = 'Oran';
      else if (lastMessage.includes('constantine') || lastMessage.includes('قسنطينة')) city = 'Constantine';
      else if (lastMessage.includes('annaba') || lastMessage.includes('عنابة')) city = 'Annaba';

      // Query properties
      let query = supabase
        .from('properties')
        .select('id, title, price, price_currency, city, bedrooms, bathrooms, category, property_type')
        .eq('status', 'active')
        .eq('category', category)
        .limit(5);

      if (city) {
        query = query.eq('city', city);
      }

      const { data: properties, error } = await query;

      if (properties && properties.length > 0) {
        propertyContext = `\n\nAvailable properties in our database (share 2-3 most relevant):\n${properties.map(p => 
          `- ${p.title} in ${p.city}: ${p.price} ${p.price_currency}, ${p.bedrooms || 'N/A'} bedrooms, ${p.property_type}`
        ).join('\n')}`;
      }
    }

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt + propertyContext },
          ...messages
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI service temporarily unavailable. Please try again later.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
