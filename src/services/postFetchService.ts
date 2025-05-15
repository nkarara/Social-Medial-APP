
import supabase from '@/lib/supabase';
import { PostWithDetails } from '@/types/supabase';

export const postFetchService = {
  /**
   * Fetch posts with user profiles and additional stats
   */
  fetchPosts: async (userId: string | null = null, limit = 10, page = 0): Promise<PostWithDetails[]> => {
    try {
      // Calculate offset based on page
      const offset = page * limit;
      
      // Fetch basic post data with profiles
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey(*)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      
      // Transform to match PostWithDetails interface
      const postsData: PostWithDetails[] = data.map(post => ({
        ...post,
        profiles: post.profiles,
        likes_count: 0,
        comments_count: 0,
        user_has_liked: false,
        is_bookmarked: false
      }));
      
      // Fetch additional post stats for each post
      for (const post of postsData) {
        // Get likes count
        const { count: likesCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
          
        // Get comments count
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
          
        post.likes_count = likesCount || 0;
        post.comments_count = commentsCount || 0;
        
        // Check if user has liked the post
        if (userId) {
          const { data: likeData } = await supabase
            .from('likes')
            .select('*')
            .eq('post_id', post.id)
            .eq('user_id', userId)
            .maybeSingle();
            
          post.user_has_liked = !!likeData;
        }
      }
      
      return postsData;
    } catch (error) {
      console.error('Error loading posts:', error);
      throw error;
    }
  },
  
  /**
   * Fetch posts by a specific user
   */
  fetchUserPosts: async (profileId: string, currentUserId: string | null): Promise<PostWithDetails[]> => {
    try {
      // Fetch posts by the specified user
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey(*)
        `)
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform to match PostWithDetails interface
      const postsData: PostWithDetails[] = data.map(post => ({
        ...post,
        profiles: post.profiles,
        likes_count: 0,
        comments_count: 0,
        user_has_liked: false,
        is_bookmarked: false
      }));
      
      // Add additional stats to each post
      for (const post of postsData) {
        // Get likes count
        const { count: likesCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
          
        // Get comments count
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
          
        post.likes_count = likesCount || 0;
        post.comments_count = commentsCount || 0;
        
        // Check if current user has liked the post
        if (currentUserId) {
          const { data: likeData } = await supabase
            .from('likes')
            .select('*')
            .eq('post_id', post.id)
            .eq('user_id', currentUserId)
            .maybeSingle();
            
          post.user_has_liked = !!likeData;
        }
      }
      
      return postsData;
    } catch (error) {
      console.error(`Error fetching posts for user ${profileId}:`, error);
      throw error;
    }
  },
  
  /**
   * Fetch a single post by ID
   */
  fetchPostById: async (postId: string, userId: string | null): Promise<PostWithDetails | null> => {
    try {
      // Fetch the post with profile data
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey(*)
        `)
        .eq('id', postId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Post not found
        }
        throw error;
      }
      
      // Transform to PostWithDetails
      const post: PostWithDetails = {
        ...data,
        profiles: data.profiles,
        likes_count: 0,
        comments_count: 0,
        user_has_liked: false,
        is_bookmarked: false
      };
      
      // Get likes count
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
        
      // Get comments count
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
        
      post.likes_count = likesCount || 0;
      post.comments_count = commentsCount || 0;
      
      // Check if user has liked the post
      if (userId) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('*')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .maybeSingle();
          
        post.user_has_liked = !!likeData;
      }
      
      return post;
    } catch (error) {
      console.error(`Error fetching post ${postId}:`, error);
      throw error;
    }
  }
};

export const { fetchPosts, fetchUserPosts, fetchPostById } = postFetchService;
