
import supabase from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { PostWithDetails } from '@/types/supabase';
import { addLikeStatus } from './postLikeService';

export const bookmarksService = {
  async bookmarkPost(postId: string, userId: string): Promise<boolean> {
    try {
      // Check if post is already bookmarked
      const { data: existingBookmark, error: checkError } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingBookmark) {
        // Remove bookmark if it exists
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId);
        
        if (error) throw error;
        
        toast({
          title: 'Bookmark removed',
          description: 'Post has been removed from your bookmarks',
        });
        
        return false;
      } else {
        // Add bookmark if it doesn't exist
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: userId,
            post_id: postId
          });
        
        if (error) throw error;
        
        toast({
          title: 'Post bookmarked',
          description: 'Post has been added to your bookmarks',
        });
        
        return true;
      }
    } catch (error: any) {
      console.error(`Error toggling bookmark:`, error);
      toast({
        variant: 'destructive',
        title: 'Action failed',
        description: error.message || 'An unknown error occurred',
      });
      return false;
    }
  },

  async isBookmarked(postId: string, userId: string | null): Promise<boolean> {
    try {
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle();
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  },

  async fetchBookmarkedPosts(userId: string): Promise<PostWithDetails[]> {
    try {
      // First get the bookmarks
      const { data: bookmarks, error: bookmarksError } = await supabase
        .from('bookmarks')
        .select('post_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (bookmarksError) throw bookmarksError;
      
      if (!bookmarks || !bookmarks.length) return [];
      
      // Get the post IDs from the bookmarks
      const postIds = bookmarks.map(bookmark => bookmark.post_id);
      
      // Then fetch the posts with those IDs
      // FIX: Specify the exact relationship between posts and profiles
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey(*)
        `)
        .in('id', postIds)
        .order('created_at', { ascending: false });
      
      if (postsError) throw postsError;
      
      if (!posts || !posts.length) return [];
      
      // Transform the data to match PostWithDetails structure
      const transformedPosts = posts.map((post) => ({
        ...post,
        profiles: post.profiles,
        likes_count: 0,
        comments_count: 0,
        user_has_liked: false,
        is_bookmarked: true
      }));
      
      // Fetch likes and comments counts for each post
      const postsWithCounts = await Promise.all(transformedPosts.map(async (post) => {
        try {
          // Get likes count
          const { count: likesCount, error: likesError } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);
            
          if (likesError) console.error('Error fetching likes count:', likesError);
          
          // Get comments count
          const { count: commentsCount, error: commentsError } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);
            
          if (commentsError) console.error('Error fetching comments count:', commentsError);
          
          return {
            ...post,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0
          };
        } catch (error) {
          console.error(`Error fetching counts for post ${post.id}:`, error);
          return post;
        }
      }));
      
      // Add like status for the current user
      const postsWithLikeStatus = await addLikeStatus(postsWithCounts, userId);
      
      return postsWithLikeStatus;
    } catch (error: any) {
      console.error('Error fetching bookmarked posts:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load bookmarks',
        description: error.message || 'An unknown error occurred',
      });
      throw error; // Throw the error so we can handle it in the component
    }
  }
};
