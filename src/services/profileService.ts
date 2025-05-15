import supabase from '@/lib/supabase';
import { Profile } from '@/types/supabase';
import { toast } from '@/components/ui/use-toast';

export const profileService = {
  async fetchProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error(`Error fetching profile for ${userId}:`, error);
      toast({
        variant: 'destructive',
        title: 'Failed to load profile',
        description: error.message || 'An unknown error occurred',
      });
      return null;
    }
  },

  async updateProfile(userId: string, profile: Partial<Profile>): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profile,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
      
      return data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to update profile',
        description: error.message || 'An unknown error occurred',
      });
      return null;
    }
  },

  async searchProfiles(query: string): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`);
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Error searching profiles:', error);
      toast({
        variant: 'destructive',
        title: 'Search failed',
        description: error.message || 'An unknown error occurred',
      });
      return [];
    }
  },
  
  // Get the current authenticated user
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  async isAdmin(userId: string): Promise<boolean> {
    try {
      // Get the current user's email directly
      const { data: userData, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      // Check if the email matches admin email
      return userData?.user?.email === 'nabilkarara2002@gmail.com';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },
  
  async getAllUsers(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Error fetching all users:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load users',
        description: error.message || 'An unknown error occurred',
      });
      return [];
    }
  },
  
  async deleteUser(userId: string): Promise<boolean> {
    try {
      // Delete the user's profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        title: 'User deleted',
        description: 'The user has been successfully deleted.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to delete user',
        description: error.message || 'An unknown error occurred',
      });
      return false;
    }
  },
  
  async blockUser(userId: string, isBlocked: boolean): Promise<boolean> {
    try {
      // Update user status
      const { error } = await supabase
        .from('profiles')
        .update({
          is_blocked: isBlocked,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        title: isBlocked ? 'User blocked' : 'User unblocked',
        description: `The user has been successfully ${isBlocked ? 'blocked' : 'unblocked'}.`,
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating user block status:', error);
      toast({
        variant: 'destructive',
        title: 'Action failed',
        description: error.message || 'An unknown error occurred',
      });
      return false;
    }
  }
};
