import supabase from '@/lib/supabase';
import { NotificationWithDetails } from '@/types/supabase';
import { toast } from '@/components/ui/use-toast';

export const notificationsService = {
  async fetchNotifications(userId: string): Promise<NotificationWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles:profiles(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as NotificationWithDetails[];
    } catch (error: any) {
      console.error(`Error fetching notifications for ${userId}:`, error);
      toast({
        variant: 'destructive',
        title: 'Failed to load notifications',
        description: error.message || 'An unknown error occurred',
      });
      return [];
    }
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      return false;
    }
  },

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      
      if (error) throw error;
      
      toast({
        title: 'Notifications updated',
        description: 'All notifications have been marked as read.',
      });
      
      return true;
    } catch (error: any) {
      console.error(`Error marking all notifications as read for ${userId}:`, error);
      toast({
        variant: 'destructive',
        title: 'Action failed',
        description: error.message || 'An unknown error occurred',
      });
      return false;
    }
  },

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error(`Error deleting notification ${notificationId}:`, error);
      toast({
        variant: 'destructive',
        title: 'Failed to delete notification',
        description: error.message || 'An unknown error occurred',
      });
      return false;
    }
  }
};
