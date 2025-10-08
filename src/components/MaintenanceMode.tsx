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

// … imports stay the same …

export const MaintenanceMode = ({ children }: { children: React.ReactNode }) => {
  const { generalSettings, loading: settingsLoading, settingsInitialized } = usePlatformSettings();
  const { user, login, logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [dbMaintenanceMode, setDbMaintenanceMode] = useState<boolean | null>(null);

  // Always coerce to boolean
  const toBool = (v: unknown): boolean => {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') return v.toLowerCase() === 'true';
    if (typeof v === 'number') return v === 1;
    return false;
  };

  // Query once on mount
  useEffect(() => {
    const verifyMaintenanceStatus = async () => {
      try {
        const { data } = await supabase
          .from('platform_settings')
          .select('setting_value')
          .eq('setting_key', 'general_settings')
          .maybeSingle();

        const maintenanceMode = toBool((data?.setting_value as any)?.maintenance_mode);
        setDbMaintenanceMode(maintenanceMode);
      } catch (error) {
        console.error('[MaintenanceMode] Error fetching maintenance status:', error);
        setDbMaintenanceMode(false);
      }
    };
    verifyMaintenanceStatus();
  }, []);

  // Decide if maintenance is on
  const maintenanceOn =
    toBool(generalSettings?.maintenance_mode) || dbMaintenanceMode === true;

  const isExemptRoute = MAINTENANCE_EXEMPT_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  // 🚨 Safety: if still loading, assume maintenance is ON until proven otherwise
  if (settingsLoading || !settingsInitialized || dbMaintenanceMode === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking site status…</p>
      </div>
    );
  }

  // Block everyone except admin + exempt routes
  if (maintenanceOn && !isExemptRoute && user?.role !== 'admin') {
    return (
      // your maintenance card + admin login form (keep your JSX here)
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="max-w-md w-full">
          {/* ... your header and login form JSX ... */}
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
