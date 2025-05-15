
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import PostCard from '@/components/posts/PostCard';
import { PostWithDetails } from '@/types/supabase';
import { postsService } from '@/services/postsService';
import { useAuth } from '@/contexts/AuthContext';

interface PostsListProps {
  userId?: string;
  refreshTrigger?: number;
  posts?: PostWithDetails[];  // Add optional posts prop
  showRefresh?: boolean;      // Add optional showRefresh prop
}

const PostsList = ({ userId, refreshTrigger = 0, posts: initialPosts, showRefresh = true }: PostsListProps) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithDetails[]>(initialPosts || []);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // If posts are provided externally, use those instead of fetching
    if (initialPosts) {
      setPosts(initialPosts);
      return;
    }
    
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, refreshTrigger, initialPosts]);

  const loadPosts = async (loadMore = false) => {
    if (isLoading || initialPosts) return;
    
    setIsLoading(true);
    
    try {
      const newPage = loadMore ? page + 1 : 0;
      
      let newPosts: PostWithDetails[] = [];
      
      if (userId) {
        // Fetch posts for a specific user
        newPosts = await postsService.fetchUserPosts(userId, user?.id || null);
      } else {
        // Fetch feed posts (for logged-in user or public)
        newPosts = await postsService.fetchPosts(user?.id || null, 10, newPage);
      }
      
      if (loadMore) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      
      setPage(newPage);
      setHasMore(newPosts.length >= 10); // Assuming 10 is the page size
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setPosts([]);
    await loadPosts();
  };

  if (posts.length === 0 && !isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">No posts found</p>
        {showRefresh && (
          <Button onClick={handleRefresh} variant="outline" size="sm">Refresh</Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          onPostUpdate={handleRefresh}
        />
      ))}
      
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading posts...</p>
        </div>
      )}
      
      {hasMore && !isLoading && !initialPosts && (
        <div className="text-center">
          <Button 
            variant="outline"
            onClick={() => loadPosts(true)}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostsList;
