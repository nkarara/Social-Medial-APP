import supabase from '@/lib/supabase';
import { Comment, CommentWithProfile } from '@/types/supabase';
import { toast } from '@/components/ui/use-toast';

export const commentsService = {
  async fetchComments(postId: string): Promise<CommentWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles(*)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return data as CommentWithProfile[];
    } catch (error: any) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      toast({
        variant: 'destructive',
        title: 'Failed to load comments',
        description: error.message || 'An unknown error occurred',
      });
      return [];
    }
  },

  async addComment(postId: string, userId: string, content: string): Promise<Comment | null> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create notification for the post owner (if not self-comment)
      const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();
      
      if (post && post.user_id !== userId) {
        await supabase
          .from('notifications')
          .insert({
            user_id: post.user_id,
            type: 'comment',
            reference_id: postId,
            is_read: false,
            created_at: new Date().toISOString()
          });
      }
      
      return data;
    } catch (error: any) {
      console.error(`Error adding comment to post ${postId}:`, error);
      toast({
        variant: 'destructive',
        title: 'Failed to add comment',
        description: error.message || 'An unknown error occurred',
      });
      return null;
    }
  },

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error(`Error deleting comment ${commentId}:`, error);
      toast({
        variant: 'destructive',
        title: 'Failed to delete comment',
        description: error.message || 'An unknown error occurred',
      });
      return false;
    }
  }
};
