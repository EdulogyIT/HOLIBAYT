import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatformSettings } from '@/contexts/PlatformSettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export const MaintenanceMode = ({ children }: { children: React.ReactNode }) => {
  const { generalSettings, loading: settingsLoading } = usePlatformSettings();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [shouldBlock, setShouldBlock] = useState(false);

  useEffect(() => {
    if (settingsLoading) return;

    const isMaintenanceMode = generalSettings.maintenance_mode;
    const isAdmin = user?.role === 'admin';
    const isLoginPage = location.pathname === '/login';

    // If maintenance mode is on and user is not admin
    if (isMaintenanceMode && !isAdmin) {
      // Allow access to login page
      if (!isLoginPage) {
        setShouldBlock(true);
      } else {
        setShouldBlock(false);
      }
    } else {
      setShouldBlock(false);
    }
  }, [generalSettings.maintenance_mode, user, location.pathname, settingsLoading]);

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
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Our platform is temporarily unavailable while we perform important updates. 
              We'll be back online shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              Thank you for your patience!
            </p>
            <div className="pt-4">
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
