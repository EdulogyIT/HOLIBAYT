import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatformSettings } from '@/contexts/PlatformSettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export const MaintenanceMode = ({ children }: { children: React.ReactNode }) => {
  const { generalSettings, loading: settingsLoading } = usePlatformSettings();
  const { user, login, logout } = useAuth();
  const { toast } = useToast();
  const [shouldBlock, setShouldBlock] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (settingsLoading) return;

    const isMaintenanceMode = generalSettings.maintenance_mode;
    
    console.log('[MaintenanceMode] Status check:', { 
      isMaintenanceMode, 
      userRole: user?.role,
      userEmail: user?.email 
    });

    // If maintenance is OFF, always allow access
    if (!isMaintenanceMode) {
      setShouldBlock(false);
      setIsCheckingAuth(false);
      return;
    }

    // Maintenance is ON - check if we have user data
    if (user === null) {
      // No user logged in - block and show login form
      setShouldBlock(true);
      setIsCheckingAuth(false);
    } else if (user.role === undefined || user.role === null) {
      // User is logged in but role hasn't loaded yet - show checking state
      setIsCheckingAuth(true);
      setShouldBlock(false);
    } else {
      // User data is complete - make final decision
      setIsCheckingAuth(false);
      const isAdmin = user.role === 'admin';
      setShouldBlock(!isAdmin);
    }
  }, [generalSettings.maintenance_mode, user, settingsLoading]);

  // CRITICAL: Real-time enforcement - Force logout non-admin users when maintenance is enabled
  useEffect(() => {
    if (generalSettings.maintenance_mode && user && user.role !== 'admin') {
      console.log('[MaintenanceMode] FORCING LOGOUT - Maintenance enabled for non-admin user:', user.email);
      
      // Force immediate logout
      logout();
      
      toast({
        title: "Maintenance Mode Active",
        description: "The platform is under maintenance. You have been logged out.",
        variant: "destructive",
      });
    }
  }, [generalSettings.maintenance_mode, user, logout, toast]);

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

  // CRITICAL: After successful login, verify user is admin during maintenance
  useEffect(() => {
    if (user && generalSettings.maintenance_mode) {
      console.log('[MaintenanceMode] Login verification:', { 
        userRole: user.role, 
        isAdmin: user.role === 'admin',
        email: user.email 
      });
      
      if (user.role !== 'admin') {
        // Non-admin tried to login during maintenance - logout immediately
        console.log('[MaintenanceMode] Non-admin detected, forcing logout');
        logout();
        toast({
          title: "Access Denied",
          description: "Platform is under maintenance. Only administrators can login at this time.",
          variant: "destructive",
        });
        setEmail('');
        setPassword('');
      }
    }
  }, [user, generalSettings.maintenance_mode, logout, toast]);

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying access...</p>
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
