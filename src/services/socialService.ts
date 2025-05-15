
import supabase from '@/lib/supabase';
import { Profile } from '@/types/supabase';
import { toast } from '@/components/ui/use-toast';

export const socialService = {
  async followUser(followerId: string, followedId: string): Promise<boolean> {
    try {
      // Check if already following
      const { data: existingFollow, error: checkError } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', followerId)
        .eq('followed_id', followedId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingFollow) {
        // Unfollow if already following
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', followerId)
          .eq('followed_id', followedId);
        
        if (error) throw error;
        
        toast({
          title: 'Unfollowed user',
          description: 'You are no longer following this user.',
        });
        
        return false;
      } else {
        // Follow the user
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: followerId,
            followed_id: followedId,
            created_at: new Date().toISOString()
          });
        
        if (error) throw error;
        
        // Create a notification for the followed user
        await supabase
          .from('notifications')
          .insert({
            user_id: followedId,
            type: 'follow',
            reference_id: followerId,
            is_read: false,
            created_at: new Date().toISOString()
          });
        
        toast({
          title: 'Followed user',
          description: 'You are now following this user.',
        });
        
        return true;
      }
    } catch (error: any) {
      console.error(`Error toggling follow relationship:`, error);
      toast({
        variant: 'destructive',
        title: 'Action failed',
        description: error.message || 'An unknown error occurred',
      });
      return false;
    }
  },

  async isFollowing(followerId: string, followedId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', followerId)
        .eq('followed_id', followedId)
        .maybeSingle();
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  },

  async getFollowers(userId: string): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower:profiles!follows_follower_id_fkey(*)
        `)
        .eq('followed_id', userId);
      
      if (error) throw error;
      
      // Extract profile data from the nested structure
      return data.map(item => item.follower as unknown as Profile);
    } catch (error: any) {
      console.error(`Error fetching followers for ${userId}:`, error);
      toast({
        variant: 'destructive',
        title: 'Failed to load followers',
        description: error.message || 'An unknown error occurred',
      });
      return [];
    }
  },

  async getFollowing(userId: string): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          followed:profiles!follows_followed_id_fkey(*)
        `)
        .eq('follower_id', userId);
      
      if (error) throw error;
      
      // Extract profile data from the nested structure
      return data.map(item => item.followed as unknown as Profile);
    } catch (error: any) {
      console.error(`Error fetching following for ${userId}:`, error);
      toast({
        variant: 'destructive',
        title: 'Failed to load following',
        description: error.message || 'An unknown error occurred',
      });
      return [];
    }
  }
};
