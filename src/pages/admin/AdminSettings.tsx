import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Shield, Bell, Globe, DollarSign, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function AdminSettings() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  
  // General settings
  const [platformName, setPlatformName] = useState('Holibayt');
  const [supportEmail, setSupportEmail] = useState('contact@holibayt.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Commission settings
  const [defaultCommission, setDefaultCommission] = useState(15);
  const [shortStayCommission, setShortStayCommission] = useState(12);
  const [rentalCommission, setRentalCommission] = useState(10);
  const [saleCommission, setSaleCommission] = useState(5);
  const [minimumCommission, setMinimumCommission] = useState(1000);
  
  // Security settings
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [sessionTimeout, setSessionTimeout] = useState(3600);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  
  // Email settings
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [fromEmail, setFromEmail] = useState('noreply@holibayt.com');
  const [fromName, setFromName] = useState('Holibayt');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*');

      if (error) throw error;

      data?.forEach(setting => {
        const value = setting.setting_value as any;
        switch (setting.setting_key) {
          case 'general_settings':
            setPlatformName(value?.platform_name || 'Holibayt');
            setSupportEmail(value?.support_email || 'contact@holibayt.com');
            setMaintenanceMode(value?.maintenance_mode || false);
            break;
          case 'commission_rates':
            setDefaultCommission(value?.default || 15);
            setShortStayCommission(value?.short_stay || 12);
            setRentalCommission(value?.rental || 10);
            setSaleCommission(value?.sale || 5);
            setMinimumCommission(value?.minimum_amount || 1000);
            break;
          case 'security_settings':
            setMaxLoginAttempts(value?.max_login_attempts || 5);
            setSessionTimeout(value?.session_timeout || 3600);
            setRequireEmailVerification(value?.require_email_verification !== false);
            break;
          case 'notification_settings':
            setEmailNotifications(value?.email_notifications !== false);
            setPushNotifications(value?.push_notifications !== false);
            setSmsNotifications(value?.sms_notifications || false);
            break;
          case 'email_settings':
            setSmtpHost(value?.smtp_host || '');
            setSmtpPort(value?.smtp_port || 587);
            setFromEmail(value?.from_email || 'noreply@holibayt.com');
            setFromName(value?.from_name || 'Holibayt');
            break;
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const upsertSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert(
          { 
            setting_key: key, 
            setting_value: value 
          },
          { 
            onConflict: 'setting_key',
            ignoreDuplicates: false 
          }
        );

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating setting:', error);
      return false;
    }
  };

  const handleSaveGeneral = async () => {
    const success = await upsertSetting('general_settings', {
      platform_name: platformName,
      support_email: supportEmail,
      maintenance_mode: maintenanceMode
    });
    if (success) {
      toast.success('General settings saved successfully');
      await fetchSettings(); // Refresh settings
    } else {
      toast.error('Failed to save general settings');
    }
  };

  const handleSaveCommission = async () => {
    const success = await upsertSetting('commission_rates', {
      default: defaultCommission,
      short_stay: shortStayCommission,
      rental: rentalCommission,
      sale: saleCommission,
      minimum_amount: minimumCommission
    });
    if (success) {
      toast.success('Commission settings saved successfully');
      await fetchSettings(); // Refresh settings
    } else {
      toast.error('Failed to save commission settings');
    }
  };

  const handleSaveSecurity = async () => {
    const success = await upsertSetting('security_settings', {
      max_login_attempts: maxLoginAttempts,
      session_timeout: sessionTimeout,
      require_email_verification: requireEmailVerification
    });
    if (success) {
      toast.success('Security settings saved successfully');
      await fetchSettings(); // Refresh settings
    } else {
      toast.error('Failed to save security settings');
    }
  };

  const handleSaveNotifications = async () => {
    const success = await upsertSetting('notification_settings', {
      email_notifications: emailNotifications,
      push_notifications: pushNotifications,
      sms_notifications: smsNotifications
    });
    if (success) {
      toast.success('Notification settings saved successfully');
      await fetchSettings(); // Refresh settings
    } else {
      toast.error('Failed to save notification settings');
    }
  };

  const handleSaveEmail = async () => {
    const success = await upsertSetting('email_settings', {
      smtp_host: smtpHost,
      smtp_port: smtpPort,
      from_email: fromEmail,
      from_name: fromName
    });
    if (success) {
      toast.success('Email settings saved successfully');
      await fetchSettings(); // Refresh settings
    } else {
      toast.error('Failed to save email settings');
    }
  };

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Platform Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure platform-wide settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="commission">
            <DollarSign className="h-4 w-4 mr-2" />
            Commission
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage general platform settings and configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">Platform Name</Label>
                <Input 
                  id="siteName" 
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input 
                  id="supportEmail" 
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Put the platform in maintenance mode
                  </p>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>

              <Button onClick={handleSaveGeneral}>Save General Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
                <Input 
                  id="sessionTimeout" 
                  type="number" 
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input 
                  id="maxLoginAttempts" 
                  type="number" 
                  value={maxLoginAttempts}
                  onChange={(e) => setMaxLoginAttempts(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must verify their email before using the platform
                  </p>
                </div>
                <Switch 
                  checked={requireEmailVerification}
                  onCheckedChange={setRequireEmailVerification}
                />
              </div>

              <Button onClick={handleSaveSecurity}>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Settings</CardTitle>
              <CardDescription>
                Configure platform commission rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultCommission">Default Commission Rate (%)</Label>
                <Input 
                  id="defaultCommission" 
                  type="number" 
                  step="0.1"
                  value={defaultCommission}
                  onChange={(e) => setDefaultCommission(Number(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Applied to all new properties unless specified otherwise
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortStayCommission">Short-Stay Commission (%)</Label>
                <Input 
                  id="shortStayCommission" 
                  type="number" 
                  step="0.1"
                  value={shortStayCommission}
                  onChange={(e) => setShortStayCommission(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rentCommission">Rental Commission (%)</Label>
                <Input 
                  id="rentCommission" 
                  type="number" 
                  step="0.1"
                  value={rentalCommission}
                  onChange={(e) => setRentalCommission(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="saleCommission">Sale Commission (%)</Label>
                <Input 
                  id="saleCommission" 
                  type="number" 
                  step="0.1"
                  value={saleCommission}
                  onChange={(e) => setSaleCommission(Number(e.target.value))}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="minCommission">Minimum Commission Amount (DZD)</Label>
                <Input 
                  id="minCommission" 
                  type="number" 
                  value={minimumCommission}
                  onChange={(e) => setMinimumCommission(Number(e.target.value))}
                />
              </div>

              <Button onClick={handleSaveCommission}>Save Commission Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for important events
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send browser push notifications
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications via SMS
                  </p>
                </div>
                <Switch 
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>

              <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure email server settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input 
                  id="smtpHost" 
                  placeholder="smtp.example.com" 
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input 
                  id="smtpPort" 
                  type="number" 
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input 
                  id="fromEmail" 
                  type="email" 
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input 
                  id="fromName" 
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                />
              </div>

              <Button onClick={handleSaveEmail}>Save Email Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}