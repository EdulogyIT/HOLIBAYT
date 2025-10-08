import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlatformSettings } from "@/contexts/PlatformSettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceScreen } from "@/components/MaintenanceScreen";

// Helper to normalize DB values
const toBool = (v: any): boolean => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toLowerCase() === "true";
  if (typeof v === "number") return v === 1;
  return false;
};

export const MaintenanceMode = ({ children }: { children: React.ReactNode }) => {
  const { generalSettings } = usePlatformSettings();
  const { user } = useAuth();

  const [dbMaintenanceMode, setDbMaintenanceMode] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch maintenance mode from Supabase
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await supabase
          .from("platform_settings")
          .select("setting_value")
          .eq("setting_key", "general_settings")
          .maybeSingle();

        setDbMaintenanceMode(toBool((data?.setting_value as any)?.maintenance_mode));
      } catch (e) {
        console.error("Error fetching maintenance status:", e);
        setDbMaintenanceMode(false); // fail open
      }
    };

    fetchStatus();

    // Realtime updates
    const channel = supabase
      .channel("maintenance-mode-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "platform_settings", filter: "setting_key=eq.general_settings" },
        (payload) => {
          const newValue = (payload.new as any)?.setting_value?.maintenance_mode;
          setDbMaintenanceMode(toBool(newValue));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Check if user is admin via your `has_role` RPC
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        return;
      }
      try {
        const { data, error } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });
        if (error) throw error;
        setIsAdmin(data === true);
      } catch (err) {
        console.error("Error checking admin role:", err);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  // 🔎 Debug
  console.log("MaintenanceMode decision:", {
    dbMaintenanceMode,
    isAdmin,
    user,
  });

  // 🚨 Block by default until we know
  if (dbMaintenanceMode === null) {
    return <MaintenanceScreen loading />;
  }

  // 🚨 Maintenance ON → block unless admin
  if (dbMaintenanceMode === true && !isAdmin) {
    return <MaintenanceScreen supportEmail={generalSettings.support_email} />;
  }

  // ✅ Otherwise → allow normal app
  return <>{children}</>;
};
