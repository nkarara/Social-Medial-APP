
import { useState, useEffect } from 'react';
import { PostWithDetails } from '@/types/supabase';
import { postManagementService } from '@/services/postManagementService';
import PostCard from '@/components/posts/PostCard';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PostSearchBar from './post-management/PostSearchBar';

const PostManagement = () => {
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [allPosts, setAllPosts] = useState<PostWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const postsData = await postManagementService.fetchPosts();
      setPosts(postsData);
      setAllPosts(postsData);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to load posts',
        description: 'Could not retrieve post data. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filteredPosts = postManagementService.searchPosts(allPosts, searchQuery);
    setPosts(filteredPosts);
  };

  const resetSearch = () => {
    setSearchQuery('');
    setPosts(allPosts);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await postManagementService.deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
      setAllPosts(allPosts.filter(post => post.id !== postId));
      toast({
        title: 'Post deleted',
        description: 'The post has been successfully removed.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: 'Could not delete the post. Please try again.'
      });
    }
  };

  return (
    <div className="space-y-4">
      <PostSearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearch={handleSearch}
        onReset={resetSearch}
      />
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="relative">
              <Button 
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 z-10"
                onClick={() => handleDeletePost(post.id)}
              >
                <Trash className="h-4 w-4" />
                <span className="ml-1">Delete Post</span>
              </Button>
              <PostCard post={post} onPostUpdate={loadPosts} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          No posts found.
        </div>
      )}
    </div>
  );
};

export default PostManagement;
