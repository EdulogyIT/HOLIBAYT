import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlatformSettings } from "@/contexts/PlatformSettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Helper: normalize to boolean
const toBool = (v: any) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toLowerCase() === "true";
  if (typeof v === "number") return v === 1;
  return false;
};

export const MaintenanceMode = ({ children }: { children: React.ReactNode }) => {
  const { generalSettings } = usePlatformSettings();
  const { user, login, isAuthenticated } = useAuth();

  const [dbMaintenanceMode, setDbMaintenanceMode] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Wait for auth to initialize
  useEffect(() => {
    // Give auth context time to check for existing session
    const timer = setTimeout(() => {
      setIsAuthChecking(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [user, isAuthenticated]);

  // Fetch maintenance status and subscribe to real-time changes
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

    // Subscribe to real-time changes
    const channel = supabase
      .channel("maintenance-mode-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "platform_settings",
          filter: "setting_key=eq.general_settings",
        },
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

  const maintenanceOn =
    toBool(generalSettings?.maintenance_mode) || dbMaintenanceMode === true;

  // Show loading spinner while checking maintenance status and auth
  if (isChecking || isAuthChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await login(email, password);
      setIsLoggingIn(false);
    } catch {
      setIsLoggingIn(false);
    }
  };

  // 🚨 If maintenance is ON and user is not admin → always show maintenance page
  if (maintenanceOn && (!user || user?.role !== "admin")) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Under Maintenance</CardTitle>
            <CardDescription>
              The site is temporarily unavailable. Only administrators can log in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoggingIn}
                />
              </div>
              <div>
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoggingIn}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? "Logging in..." : "Admin Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Otherwise → site works normally
  return <>{children}</>;
};
