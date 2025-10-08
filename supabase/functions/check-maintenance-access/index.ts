import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1) Read maintenance flag
    const { data, error } = await supabase
      .from("platform_settings")
      .select("setting_value")
      .eq("setting_key", "general_settings")
      .maybeSingle();

    if (error) {
      // Fail open if we can't read settings
      return new Response(JSON.stringify({ allowed: true }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const maintenanceOn = (data?.setting_value as any)?.maintenance_mode === true;

    // 2) If not in maintenance → allow
    if (!maintenanceOn) {
      return new Response(JSON.stringify({ allowed: true }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // 3) Maintenance ON → check admin only if Authorization header present
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabase.auth.getUser(token);
      if (userData?.user) {
        const { data: isAdmin } = await supabase.rpc("has_role", {
          _user_id: userData.user.id,
          _role: "admin",
        });
        if (isAdmin === true) {
          return new Response(JSON.stringify({ allowed: true }), {
            headers: { ...cors, "Content-Type": "application/json" },
          });
        }
      }
    }

    // 4) Otherwise block
    return new Response(JSON.stringify({ allowed: false }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (_e) {
    // Fail open if function errors
    return new Response(JSON.stringify({ allowed: true }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
