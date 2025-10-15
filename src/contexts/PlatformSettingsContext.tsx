import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CommissionRates {
  default: number;
  short_stay: number;
  rental: number;
  sale: number;
  minimum_amount: number;
}

interface GeneralSettings {
  platform_name: string;
  support_email: string;
  support_phone: string;
  emergency_hotline: string;
  office_address: {
    street: string;
    city: string;
    country: string;
  };
  maintenance_mode: boolean;
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
}

interface CommentingSettings {
  blogs: boolean;
  properties: boolean;
}

interface PlatformSettingsContextType {
  commissionRates: CommissionRates;
  generalSettings: GeneralSettings;
  notificationSettings: NotificationSettings;
  commentingSettings: CommentingSettings;
  loading: boolean;
  settingsInitialized: boolean;
  refreshSettings: () => Promise<void>;
}

const PlatformSettingsContext = createContext<PlatformSettingsContextType | undefined>(undefined);

export const usePlatformSettings = () => {
  const context = useContext(PlatformSettingsContext);
  if (!context) {
    throw new Error('usePlatformSettings must be used within PlatformSettingsProvider');
  }
  return context;
};

interface PlatformSettingsProviderProps {
  children: ReactNode;
}

export const PlatformSettingsProvider = ({ children }: PlatformSettingsProviderProps) => {
  const [commissionRates, setCommissionRates] = useState<CommissionRates>({
    default: 15,
    short_stay: 12,
    rental: 10,
    sale: 5,
    minimum_amount: 1000
  });

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    platform_name: 'Holibayt',
    support_email: 'contact@holibayt.com',
    support_phone: '+213 21 123 456',
    emergency_hotline: '+213 21 999 999',
    office_address: {
      street: '123 Boulevard des Martyrs',
      city: 'Alger Centre, 16000',
      country: 'Algiers, Algeria'
    },
    maintenance_mode: false
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false
  });

  const [commentingSettings, setCommentingSettings] = useState<CommentingSettings>({
    blogs: true,
    properties: true
  });

  const [loading, setLoading] = useState(true);
  const [settingsInitialized, setSettingsInitialized] = useState(false);

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
            setGeneralSettings({
              platform_name: value?.platform_name || 'Holibayt',
              support_email: value?.support_email || 'contact@holibayt.com',
              support_phone: value?.support_phone || '+213 21 123 456',
              emergency_hotline: value?.emergency_hotline || '+213 21 999 999',
              office_address: value?.office_address || {
                street: '123 Boulevard des Martyrs',
                city: 'Alger Centre, 16000',
                country: 'Algiers, Algeria'
              },
              maintenance_mode: typeof value?.maintenance_mode === 'boolean' ? value.maintenance_mode : false
            });
            break;
          case 'commission_rates':
            setCommissionRates({
              default: value?.default || 15,
              short_stay: value?.short_stay || 12,
              rental: value?.rental || 10,
              sale: value?.sale || 5,
              minimum_amount: value?.minimum_amount || 1000
            });
            break;
          case 'notification_settings':
            setNotificationSettings({
              email_notifications: value?.email_notifications !== false,
              push_notifications: value?.push_notifications !== false,
              sms_notifications: value?.sms_notifications || false
            });
            break;
          case 'commenting_enabled':
            setCommentingSettings({
              blogs: value?.blogs !== false,
              properties: value?.properties !== false
            });
            break;
        }
      });
      setSettingsInitialized(true);
    } catch (error) {
      console.error('Error fetching platform settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('platform_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'platform_settings'
        },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <PlatformSettingsContext.Provider
      value={{
        commissionRates,
        generalSettings,
        notificationSettings,
        commentingSettings,
        loading,
        settingsInitialized,
        refreshSettings: fetchSettings
      }}
    >
      {children}
    </PlatformSettingsContext.Provider>
  );
};
