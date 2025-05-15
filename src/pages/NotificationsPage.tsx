
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsService } from '@/services/notificationsService';
import { NotificationWithDetails } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Bell, Heart, MessageSquare, User } from 'lucide-react';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const data = await notificationsService.fetchNotifications(user.id);
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [user]);
  
  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    try {
      const success = await notificationsService.markAllAsRead(user.id);
      if (success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'follow':
        return <User className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  const getNotificationContent = (notification: NotificationWithDetails) => {
    if (!notification.profiles) return 'You received a notification';
    
    const username = notification.profiles.username;
    
    switch (notification.type) {
      case 'like':
        return (
          <span>
            <Link to={`/profile/${notification.profiles.id}`} className="font-semibold hover:underline">
              {username}
            </Link> liked your post
          </span>
        );
      case 'comment':
        return (
          <span>
            <Link to={`/profile/${notification.profiles.id}`} className="font-semibold hover:underline">
              {username}
            </Link> commented on your post
          </span>
        );
      case 'follow':
        return (
          <span>
            <Link to={`/profile/${notification.profiles.id}`} className="font-semibold hover:underline">
              {username}
            </Link> started following you
          </span>
        );
      default:
        return 'You received a notification';
    }
  };
  
  const handleNotificationClick = async (notification: NotificationWithDetails) => {
    if (notification.is_read) return;
    
    try {
      await notificationsService.markAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    
    // Navigate based on notification type
    // Implementation will be specific to your app's routing and notification types
  };
  
  if (!user) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              Please log in to view your notifications.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-3xl py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Stay updated on activity related to your account
            </CardDescription>
          </div>
          
          {notifications.some(n => !n.is_read) && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`flex items-start p-4 rounded-lg transition-colors ${
                    notification.is_read ? 'bg-background' : 'bg-muted'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mr-4 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    {notification.profiles && (
                      <div className="flex items-center mb-2">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={notification.profiles.avatar_url || undefined} />
                          <AvatarFallback>
                            {notification.profiles.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          {getNotificationContent(notification)}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  
                  {!notification.is_read && (
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              You don't have any notifications yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
