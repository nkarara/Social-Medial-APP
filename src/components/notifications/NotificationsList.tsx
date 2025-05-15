
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from './NotificationItem';

const NotificationsList = () => {
  const { 
    notifications, 
    isLoading, 
    loadNotifications, 
    handleMarkAllAsRead,
    handleNotificationClick
  } = useNotifications();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No notifications yet</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          onClick={loadNotifications}
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Notifications</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleMarkAllAsRead}
        >
          Mark all as read
        </Button>
      </div>
      
      <div className="space-y-2">
        {notifications.map(notification => (
          <NotificationItem 
            key={notification.id}
            notification={notification}
            onClick={handleNotificationClick}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationsList;
