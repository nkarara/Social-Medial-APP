import supabase from '@/lib/supabase';
import { PostWithDetails } from '@/types/supabase';
import { toast } from '@/components/ui/use-toast';

export async function addLikeStatus(posts: PostWithDetails[], userId: string | null): Promise<PostWithDetails[]> {
  // If no user is logged in, no posts are liked
  if (!userId) {
    return posts.map(post => ({
      ...post,
      user_has_liked: false
    }));
  }
  
  // Get all likes for the current user for these posts
  const { data: likes } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', posts.map(post => post.id));
  
  // Create a Set of liked post IDs for quick lookup
  const likedPostIds = new Set(likes?.map(like => like.post_id) || []);
  
  // Add the user_has_liked property to each post
  return posts.map(post => ({
    ...post,
    user_has_liked: likedPostIds.has(post.id)
  }));
}

export async function likePost(postId: string, userId?: string): Promise<boolean> {
  try {
    if (!userId) return false;
    
    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingLike) {
      // Unlike if already liked
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return false;
    } else {
      // Like the post
      const { error } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: userId,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Create notification for the post owner (if not self-like)
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
            type: 'like',
            reference_id: postId,
            is_read: false,
            created_at: new Date().toISOString()
          });
      }
      
      return true;
    }
  } catch (error: any) {
    console.error(`Error toggling like for post ${postId}:`, error);
    toast({
      variant: 'destructive',
      title: 'Action failed',
      description: error.message || 'An unknown error occurred',
    });
    return false;
  }
}
