
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsService } from '@/services/notificationsService';
import { profilesService } from '@/services/profilesService';
import { NotificationWithDetails } from '@/types/supabase';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);
  
  // Mark all notifications as read when component is mounted
  useEffect(() => {
    if (user && notifications.length > 0) {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      if (unreadNotifications.length > 0) {
        // Mark all as read in the database
        notificationsService.markAllAsRead(user.id);
        
        // Update local state
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({
            ...notification,
            is_read: true
          }))
        );
      }
    }
  }, [notifications, user]);
  
  const loadNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const data = await notificationsService.fetchNotifications(user.id);
      
      // Fetch profiles for notifications where we only have reference_id
      const enhancedNotifications = await Promise.all(
        data.map(async (notification) => {
          if (notification.type === 'follow' && !notification.profiles) {
            const profile = await profilesService.fetchProfile(notification.reference_id);
            return { ...notification, profiles: profile };
          }
          return notification;
        })
      );
      
      setNotifications(enhancedNotifications);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    const success = await notificationsService.markAllAsRead(user.id);
    
    if (success) {
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({
          ...notification,
          is_read: true
        }))
      );
    }
  };
  
  const handleNotificationClick = async (notification: NotificationWithDetails) => {
    // Mark as read
    await notificationsService.markAsRead(notification.id);
    
    // Update local state
    setNotifications(prevNotifications => 
      prevNotifications.map(n => 
        n.id === notification.id ? { ...n, is_read: true } : n
      )
    );
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
        navigate(`/post/${notification.reference_id}`);
        break;
      case 'follow':
        navigate(`/profile/${notification.reference_id}`);
        break;
    }
  };
  
  return {
    notifications,
    isLoading,
    loadNotifications,
    handleMarkAllAsRead,
    handleNotificationClick
  };
};
