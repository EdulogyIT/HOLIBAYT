import { supabase } from '@/integrations/supabase/client';
import { usePlatformSettings } from '@/contexts/PlatformSettingsContext';

interface CreateNotificationParams {
  user_id: string;
  title: string;
  message: string;
  type: string;
  related_id?: string;
}

export const useNotifications = () => {
  const { notificationSettings } = usePlatformSettings();

  const createNotification = async (params: CreateNotificationParams) => {
    try {
      // Check if any notification type is enabled
      const notificationsEnabled = 
        notificationSettings.email_notifications ||
        notificationSettings.push_notifications ||
        notificationSettings.sms_notifications;

      if (!notificationsEnabled) {
        console.log('All notifications are disabled in platform settings');
        return null;
      }

      // Create in-app notification
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: params.user_id,
          title: params.title,
          message: params.message,
          type: params.type,
          related_id: params.related_id
        })
        .select()
        .single();

      if (error) throw error;

      // Here you would trigger email/push/sms based on settings
      // For now, we just log what would be sent
      if (notificationSettings.email_notifications) {
        console.log('Would send email notification:', params);
      }
      if (notificationSettings.push_notifications) {
        console.log('Would send push notification:', params);
      }
      if (notificationSettings.sms_notifications) {
        console.log('Would send SMS notification:', params);
      }

      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  };

  return { createNotification, notificationSettings };
};
