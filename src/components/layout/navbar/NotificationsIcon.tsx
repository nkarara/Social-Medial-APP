
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsService } from '@/services/notificationsService';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import NotificationsList from '@/components/notifications/NotificationsList';

const NotificationsIcon = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);
  
  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const notifications = await notificationsService.fetchNotifications(user.id);
      const unreadNotifications = notifications.filter(n => !n.is_read);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-xs rounded-full bg-social-accent text-white">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <NotificationsList />
      </SheetContent>
    </Sheet>
  );
};

export default NotificationsIcon;
