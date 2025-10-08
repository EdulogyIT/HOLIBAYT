import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlatformSettings } from "@/contexts/PlatformSettingsContext";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// routes that bypass maintenance (optional)
const MAINTENANCE_EXEMPT_ROUTES = ["/maintenance.html"];

export const MaintenanceMode = ({ children }: { children: React.ReactNode }) => {
  const { generalSettings, loading: settingsLoading, settingsInitialized } = usePlatformSettings();
  const { user, login, logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [dbMaintenanceMode, setDbMaintenanceMode] = useState<boolean | null>(null);

  // coerce helper
  const toBool = (v: unknown): boolean => {
    if (typeof v === "boolean") return v;
    if (typeof v === "string") return v.toLowerCase() === "true";
    if (typeof v === "number") return v === 1;
    return false;
  };

  // fetch once from db
  useEffect(() => {
    const fetchStatus = async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("setting_value")
        .eq("setting_key", "general_settings")
        .maybeSingle();

      setDbMaintenanceMode(toBool((data?.setting_value as any)?.maintenance_mode));
    };
    fetchStatus();
  }, []);

  const maintenanceOn =
    toBool(generalSettings?.maintenance_mode) || dbMaintenanceMode === true;

  const isExempt = MAINTENANCE_EXEMPT_ROUTES.some((r) =>
    location.pathname.startsWith(r)
  );

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const success = await login(email, password);
      if (!success) {
        toast({
          title: "Login Failed",
          description: "Invalid credentials",
          variant: "destructive",
        });
        setIsLoggingIn(false);
        return;
      }
      setIsLoggingIn(false);
    } catch (err) {
      console.error(err);
      toast({
        title: "Login Failed",
        description: "Unexpected error",
        variant: "destructive",
      });
      setIsLoggingIn(false);
    }
  };

  // 🚨 Render the maintenance screen if ON and user is not admin
  if (maintenanceOn && !isExempt && user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-2xl">Under Maintenance</CardTitle>
            <CardDescription>
              We're performing scheduled updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground text-center">
              The platform is temporarily unavailable. Only administrators can log in to manage settings.
            </p>

            {/* Admin login form */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold mb-4 text-center">Administrator Login</h3>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoggingIn}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoggingIn}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? "Logging in..." : "Admin Login"}
                </Button>
              </form>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                For urgent matters, contact{" "}
                <a
                  href={`mailto:${generalSettings?.support_email}`}
                  className="text-primary hover:underline"
                >
                  {generalSettings?.support_email}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Otherwise → normal site
  return <>{children}</>;
};
