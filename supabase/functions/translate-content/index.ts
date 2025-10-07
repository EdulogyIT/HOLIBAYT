import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLanguage, contentType } = await req.json();
    
    if (!text || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: text and targetLanguage' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const languageNames: Record<string, string> = {
      'FR': 'French',
      'AR': 'Arabic',
      'EN': 'English'
    };

    const contextualInstructions: Record<string, string> = {
      'property_title': 'Translate this real estate property title concisely and professionally',
      'property_description': 'Translate this real estate property description naturally, maintaining the selling points',
      'blog_title': 'Translate this blog post title engagingly',
      'blog_content': 'Translate this blog content naturally, maintaining the tone and style'
    };

    const instruction = contextualInstructions[contentType || 'property_title'] || 'Translate this text';
    const targetLang = languageNames[targetLanguage] || targetLanguage;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator specializing in real estate and blog content. ${instruction} to ${targetLang}. Return ONLY the translated text without any explanations, quotes, or additional formatting.`
          },
          {
            role: 'user',
            content: text
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim() || text;

    return new Response(
      JSON.stringify({ translatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Translation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
