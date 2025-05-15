
import supabase from '@/lib/supabase';
import { PostWithDetails } from '@/types/supabase';
import { toast } from '@/components/ui/use-toast';

export const postCrudService = {
  /**
   * Create a new post
   */
  createPost: async (userId: string, content: string, mediaFile: File | null): Promise<PostWithDetails | null> => {
    try {
      let mediaUrl = null;
      
      // If there's a media file, upload it first
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const filePath = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(filePath, mediaFile);
        
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('post-media')
          .getPublicUrl(filePath);
          
        mediaUrl = publicUrlData.publicUrl;
      }
      
      // Create the post
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          content,
          media_url: mediaUrl,
          created_at: new Date().toISOString()
        })
        .select(`*, profiles!posts_user_id_fkey(*)`);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Failed to create post');
      }
      
      // Format as PostWithDetails
      const newPost: PostWithDetails = {
        ...data[0],
        profiles: data[0].profiles,
        likes_count: 0,
        comments_count: 0,
        user_has_liked: false,
        is_bookmarked: false
      };
      
      toast({
        title: 'Post created',
        description: 'Your post has been published successfully!',
      });
      
      return newPost;
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to create post',
        description: error.message || 'An unknown error occurred',
      });
      return null;
    }
  },
  
  /**
   * Delete a post by ID
   */
  deletePost: async (postId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }
};

export const { createPost, deletePost } = postCrudService;
