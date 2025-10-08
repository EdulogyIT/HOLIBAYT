import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatformSettings } from '@/contexts/PlatformSettingsContext';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Routes that should be accessible even during maintenance
const MAINTENANCE_EXEMPT_ROUTES = ['/login', '/register', '/maintenance.html'];

export const MaintenanceMode = ({ children }: { children: React.ReactNode }) => {
  const { generalSettings, loading: settingsLoading, settingsInitialized } = usePlatformSettings();
  const { user, login, logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [shouldBlock, setShouldBlock] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [dbMaintenanceMode, setDbMaintenanceMode] = useState<boolean | null>(null);

  // Direct database query on mount
  useEffect(() => {
    const verifyMaintenanceStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('setting_value')
          .eq('setting_key', 'general_settings')
          .maybeSingle();

        if (error) throw error;

        const maintenanceMode = (data?.setting_value as any)?.maintenance_mode || false;
        console.log('[MaintenanceMode] Direct DB query result:', { maintenanceMode });
        setDbMaintenanceMode(maintenanceMode);
      } catch (error) {
        console.error('[MaintenanceMode] Error fetching maintenance status:', error);
        setDbMaintenanceMode(false);
      }
    };

    verifyMaintenanceStatus();
  }, []);

  useEffect(() => {
    // Wait until settings are loaded and DB query is complete
    if (settingsLoading || !settingsInitialized || dbMaintenanceMode === null) return;

    // Check if current route is exempt from maintenance
    const isExemptRoute = MAINTENANCE_EXEMPT_ROUTES.some(route => 
      location.pathname.startsWith(route)
    );

    if (isExemptRoute) {
      console.log('[MaintenanceMode] Exempt route, allowing access:', location.pathname);
      setShouldBlock(false);
      return;
    }

    // If maintenance is OFF, always allow access
    if (!dbMaintenanceMode) {
      setShouldBlock(false);
      return;
    }

    // Maintenance is ON - only block non-admin users
    console.log('[MaintenanceMode] Status check:', { 
      dbMaintenanceMode,
      userRole: user?.role,
      userEmail: user?.email,
      currentPath: location.pathname
    });

    // Allow admin access
    if (user && user.role === 'admin') {
      setShouldBlock(false);
      return;
    }

    // Block everyone else
    setShouldBlock(true);
  }, [dbMaintenanceMode, user, settingsLoading, settingsInitialized, location.pathname]);

  // Force logout non-admin users when maintenance mode is enabled
  useEffect(() => {
    // Only check if we're not on an exempt route
    const isExemptRoute = MAINTENANCE_EXEMPT_ROUTES.some(route => 
      location.pathname.startsWith(route)
    );

    if (!isExemptRoute && dbMaintenanceMode && user && user.role !== 'admin') {
      console.log('[MaintenanceMode] Forcing logout - non-admin during maintenance:', user.email);
      
      logout();
      
      toast({
        title: "Maintenance Mode Active",
        description: "The platform is under maintenance. Only administrators can access at this time.",
        variant: "destructive",
      });
    }
  }, [dbMaintenanceMode, user, logout, toast, location.pathname]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const success = await login(email, password);
      
      if (!success) {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        });
        setIsLoggingIn(false);
        return;
      }

      // Wait a bit for the user context to update
      setTimeout(() => {
        setIsLoggingIn(false);
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
      setIsLoggingIn(false);
    }
  };

  // After login, verify admin status during maintenance
  useEffect(() => {
    if (user && dbMaintenanceMode && user.role && user.role !== 'admin') {
      console.log('[MaintenanceMode] Non-admin logged in during maintenance, logging out:', user.email);
      
      logout();
      toast({
        title: "Access Denied",
        description: "Platform is under maintenance. Only administrators can access at this time.",
        variant: "destructive",
      });
      setEmail('');
      setPassword('');
    }
  }, [user, dbMaintenanceMode, logout, toast]);

  // Show loading only until initial settings are loaded
  if (settingsLoading || !settingsInitialized || dbMaintenanceMode === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (shouldBlock) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-2xl">Under Maintenance</CardTitle>
            <CardDescription>
              We're currently performing scheduled maintenance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Our platform is temporarily unavailable while we perform important updates. 
                We'll be back online shortly.
              </p>
              <p className="text-sm text-muted-foreground">
                Thank you for your patience!
              </p>
            </div>

            {/* Admin Login Form */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold mb-4 text-center">Administrator Login</h3>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoggingIn}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoggingIn}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? 'Logging in...' : 'Admin Login'}
                </Button>
              </form>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                For urgent matters, please contact: <br />
                <a 
                  href={`mailto:${generalSettings.support_email}`}
                  className="text-primary hover:underline"
                >
                  {generalSettings.support_email}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
