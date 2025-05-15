
// Re-export all post-related services from their respective files
import { postFetchService, fetchPosts, fetchUserPosts, fetchPostById } from './postFetchService';
import { postCrudService, createPost, deletePost } from './postCrudService';
import { searchPosts } from './postSearchService';

// Export individual functions to maintain compatibility with existing code
export {
  fetchPosts,
  fetchUserPosts,
  fetchPostById,
  createPost,
  deletePost,
  searchPosts
};

// Export the combined service for new code
export const postManagementService = {
  ...postFetchService,
  ...postCrudService,
  searchPosts
};

export default postManagementService;
