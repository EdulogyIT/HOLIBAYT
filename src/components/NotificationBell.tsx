import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { SuperhostCelebration } from "@/components/SuperhostCelebration";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSuperhostCelebration, setShowSuperhostCelebration] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const newNotification = payload.new as Notification;
        
        console.log('🔔 New notification received:', newNotification);
        
        // Show immediate toast popup for non-superhost notifications
        if (newNotification.type !== 'superhost_promotion') {
          toast.success(newNotification.title, {
            description: newNotification.message,
            duration: 5000,
          });
        } else {
          console.log('🎉 Superhost notification received! Will show celebration when clicked.');
        }
        
        // Refresh notifications list
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    fetchNotifications();
  };

  const handleNotificationClick = async (notification: Notification) => {
    console.log('📌 Notification clicked:', notification);
    
    markAsRead(notification.id);
    
    // Check if it's a superhost notification
    if (notification.type === 'superhost_promotion') {
      console.log('🎊 Opening superhost celebration!');
      setShowSuperhostCelebration(true);
      return;
    }
    
    // Navigate based on notification type
    if (notification.type === 'message') {
      navigate('/messages');
    } else if (notification.type === 'property_approval' || notification.type === 'property_rejection' || notification.type === 'property_approved') {
      navigate('/host/listings');
    } else if (notification.type === 'review_request' && notification.related_id) {
      // related_id is booking_id for review_request
      // Check if review already exists for this booking
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', notification.related_id)
        .single();

      if (existingReview) {
        toast.success("Already Reviewed", {
          description: "You have already submitted a review for this stay. Thank you!"
        });
      } else {
        // Navigate to bookings page where they can review
        navigate('/bookings');
      }
    } else if (notification.related_id) {
      // For other types, assume related_id is property_id
      navigate(`/property/${notification.related_id}`);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    
    fetchNotifications();
  };

  if (!user) return null;

  return (
    <>
      {showSuperhostCelebration && (
        <SuperhostCelebration onClose={() => setShowSuperhostCelebration(false)} />
      )}
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
          <ScrollArea className="h-[400px]">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No notifications
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      notification.is_read 
                        ? 'bg-muted/50 hover:bg-muted' 
                        : 'bg-primary/10 hover:bg-primary/20'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="h-2 w-2 bg-primary rounded-full mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </>
  );
};
