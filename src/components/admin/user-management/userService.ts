
import { Profile } from '@/types/supabase';
import { profileService } from '@/services/profileService';
import { toast } from '@/components/ui/use-toast';

export const fetchAllUsers = async (): Promise<Profile[]> => {
  try {
    const usersData = await profileService.getAllUsers();
    return usersData;
  } catch (error) {
    console.error('Error loading users:', error);
    toast({
      variant: 'destructive',
      title: 'Failed to load users',
      description: 'Could not retrieve user data. Please try again later.'
    });
    return [];
  }
};

export const blockUser = async (userId: string, isBlocked: boolean): Promise<boolean> => {
  try {
    // Only allow admin to block/unblock users
    const currentUser = await profileService.getCurrentUser();
    const isAdmin = currentUser?.email === 'nabilkarara2002@gmail.com';
    
    if (!isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Permission denied',
        description: 'Only administrators can block or unblock users.'
      });
      return false;
    }

    // Check if target user is admin
    const targetUserProfile = await profileService.fetchProfile(userId);
    const targetIsAdmin = targetUserProfile?.username === 'admin';
    
    if (targetIsAdmin) {
      toast({
        variant: 'destructive',
        title: 'Action restricted',
        description: 'Cannot modify admin user privileges.'
      });
      return false;
    }

    const success = await profileService.blockUser(userId, isBlocked);
    if (success) {
      toast({
        title: isBlocked ? 'User blocked' : 'User unblocked',
        description: `User has been ${isBlocked ? 'blocked' : 'unblocked'} successfully.`
      });
    }
    return success;
  } catch (error) {
    console.error('Error updating user status:', error);
    toast({
      variant: 'destructive',
      title: 'Action failed',
      description: `Failed to ${isBlocked ? 'block' : 'unblock'} user.`
    });
    return false;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // Only allow admin to delete users
    const currentUser = await profileService.getCurrentUser();
    const isAdmin = currentUser?.email === 'nabilkarara2002@gmail.com';
    
    if (!isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Permission denied',
        description: 'Only administrators can delete users.'
      });
      return false;
    }
    
    // Check if target user is admin
    const targetUserProfile = await profileService.fetchProfile(userId);
    const targetIsAdmin = targetUserProfile?.username === 'admin';
    
    if (targetIsAdmin) {
      toast({
        variant: 'destructive',
        title: 'Action restricted',
        description: 'Cannot delete admin user.'
      });
      return false;
    }

    const success = await profileService.deleteUser(userId);
    if (success) {
      toast({
        title: 'User deleted',
        description: 'User has been permanently removed from the system.'
      });
    }
    return success;
  } catch (error) {
    console.error('Error deleting user:', error);
    toast({
      variant: 'destructive',
      title: 'Delete failed',
      description: 'Could not delete the user. Please try again.'
    });
    return false;
  }
};

export const filterUsers = (
  users: Profile[], 
  searchQuery: string,
  roleFilter: string,
  statusFilter: string
): Profile[] => {
  return users.filter(user => {
    let match = true;
    
    // Apply search query filter
    if (searchQuery) {
      const usernameMatch = user.username.toLowerCase().includes(searchQuery.toLowerCase());
      const fullNameMatch = user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase());
      match = match && (usernameMatch || fullNameMatch);
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      const isAdmin = user.username === 'admin';
      match = match && (
        (roleFilter === 'admin' && isAdmin) ||
        (roleFilter === 'user' && !isAdmin)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      const isBlocked = 'is_blocked' in user && !!user.is_blocked;
      match = match && (
        (statusFilter === 'active' && !isBlocked) ||
        (statusFilter === 'blocked' && isBlocked)
      );
    }
    
    return match;
  });
};
