
import supabase from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export const avatarService = {
  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    try {
      // Upload avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been successfully updated.',
      });
      
      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        variant: 'destructive',
        title: 'Avatar upload failed',
        description: error.message || 'An unknown error occurred',
      });
      return null;
    }
  },
  
  async removeAvatar(userId: string): Promise<boolean> {
    try {
      // Update profile to remove avatar_url
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      // Try to remove the file from storage (not critical if it fails)
      try {
        await supabase.storage
          .from('avatars')
          .remove([`${userId}/avatar`]);
      } catch (storageError) {
        console.warn('Could not remove avatar file from storage:', storageError);
      }
      
      toast({
        title: 'Avatar removed',
        description: 'Your profile picture has been removed.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to remove avatar',
        description: error.message || 'An unknown error occurred',
      });
      return false;
    }
  }
};
