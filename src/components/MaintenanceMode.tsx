import { ReactNode } from "react";
import { usePlatformSettings } from "@/contexts/PlatformSettingsContext";
import { useIsAdmin } from "@/hooks/useIsAdmin"; // make sure this exists
import MaintenanceScreen from "@/components/MaintenanceScreen"; // your UI

interface Props {
  children: ReactNode;
}

export function MaintenanceMode({ children }: Props) {
  const { generalSettings, loading, settingsInitialized } = usePlatformSettings();
  const { isAdmin, loading: roleLoading } = useIsAdmin();

  // Show nothing until settings & role are loaded to avoid flicker
  if (loading || roleLoading || !settingsInitialized) {
    return null;
  }

  const maintenanceOn = !!generalSettings?.maintenance_mode;

  // 🚨 If maintenance is on and user is not an admin → show MaintenanceScreen
  if (maintenanceOn && !isAdmin) {
    return <MaintenanceScreen />;
  }

  // Otherwise → render the site
  return <>{children}</>;
}
