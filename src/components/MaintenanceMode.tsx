import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlatformSettings } from "@/contexts/PlatformSettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceScreen } from "@/components/MaintenanceScreen";

// Helper
const toBool = (v: any) => {
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

  useEffect(() => {
    const fetchStatus = async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("setting_value")
        .eq("setting_key", "general_settings")
        .maybeSingle();

      setDbMaintenanceMode(toBool((data?.setting_value as any)?.maintenance_mode));
      setIsChecking(false);
    };
    fetchStatus();

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

  const maintenanceOn = dbMaintenanceMode === true;

  // Debug
  console.log("MaintenanceMode", { maintenanceOn, dbMaintenanceMode, user });

  // While loading → block
  if (isChecking || dbMaintenanceMode === null) {
    return <MaintenanceScreen loading />;
  }

  // Maintenance ON → block non-admins
  if (maintenanceOn && user?.role !== "admin") {
    return <MaintenanceScreen supportEmail={generalSettings.support_email} />;
  }

  // Otherwise → allow app
  return <>{children}</>;
};
