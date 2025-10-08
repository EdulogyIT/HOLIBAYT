import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlatformSettings } from "@/contexts/PlatformSettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceScreen } from "@/components/MaintenanceScreen";

// Normalize value
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
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // 1. Fetch maintenance status
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
      } finally {
        setIsChecking(false);
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

  // 2. Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.id) return;
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

  const maintenanceOn = dbMaintenanceMode === true;

  // 🔎 Debug log
  console.log("MaintenanceMode status", {
    dbMaintenanceMode,
    maintenanceOn,
    user,
    isAdmin,
  });

  // 3. While checking → block (prevents flash of homepage)
  if (isChecking || dbMaintenanceMode === null) {
    return <MaintenanceScreen loading />;
  }

  // 4. Maintenance ON → block unless admin
  if (maintenanceOn && !isAdmin) {
    return <MaintenanceScreen supportEmail={generalSettings.support_email} />;
  }

  // 5. Otherwise → allow app
  return <>{children}</>;
};
