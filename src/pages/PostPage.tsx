
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postsService } from '@/services/postsService';
import PostCard from '@/components/posts/PostCard';
import { Button } from '@/components/ui/button';
import { PostWithDetails } from '@/types/supabase';
import { useAuth } from '@/contexts/AuthContext';

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<PostWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    if (!id) return;
    
    setIsLoading(true);
    
    try {
      const postData = await postsService.fetchPostById(id, user?.id || null);
      setPost(postData);
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container max-w-2xl py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-6">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        ← Back
      </Button>
      
      <PostCard post={post} onPostUpdate={loadPost} />
    </div>
  );
};

export default PostPage;
