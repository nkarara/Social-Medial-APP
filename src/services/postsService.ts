
import { 
  postManagementService
} from './postManagementService';

import { likePost } from './postLikeService';
import { searchPosts as searchPostsQuery } from './postSearchService';
import supabase from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

// Admin functions for post management
const adminDeletePost = async (postId: string): Promise<boolean> => {
  try {
    // Delete the post
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
    
    toast({
      title: 'Post deleted',
      description: 'The post has been successfully deleted.',
    });
    
    return true;
  } catch (error: any) {
    console.error('Error deleting post:', error);
    toast({
      variant: 'destructive',
      title: 'Failed to delete post',
      description: error.message || 'An unknown error occurred',
    });
    return false;
  }
};

// Re-export all post-related services for backward compatibility
export const postsService = {
  fetchPosts: postManagementService.fetchPosts,
  fetchUserPosts: postManagementService.fetchUserPosts,
  fetchPostById: postManagementService.fetchPostById,
  createPost: postManagementService.createPost,
  deletePost: postManagementService.deletePost,
  likePost, // This now expects two parameters: postId and userId
  searchPosts: searchPostsQuery,
  adminDeletePost
};
