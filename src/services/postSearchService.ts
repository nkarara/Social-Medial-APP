
import { PostWithDetails } from '@/types/supabase';

/**
 * Search posts by content or username
 */
export const searchPosts = (posts: PostWithDetails[], searchQuery: string): PostWithDetails[] => {
  if (!searchQuery.trim()) return posts;
  
  return posts.filter(
    post => 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.profiles.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

export default {
  searchPosts
};
