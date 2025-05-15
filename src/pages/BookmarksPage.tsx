
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { bookmarksService } from '@/services/bookmarksService';
import { PostWithDetails } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import PostCard from '@/components/posts/PostCard';

const BookmarksPage = () => {
  const { user } = useAuth();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const posts = await bookmarksService.fetchBookmarkedPosts(user.id);
        setBookmarkedPosts(posts);
      } catch (err: any) {
        console.error('Error fetching bookmarks:', err);
        setError(err.message || 'Failed to load bookmarks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookmarks();
  }, [user]);
  
  const handlePostUpdate = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const posts = await bookmarksService.fetchBookmarkedPosts(user.id);
      setBookmarkedPosts(posts);
    } catch (err: any) {
      console.error('Error refreshing bookmarks:', err);
      setError(err.message || 'Failed to refresh bookmarks');
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              Please log in to view your bookmarks.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="container max-w-2xl mx-auto">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Your Bookmarks</CardTitle>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
                <p className="text-destructive font-medium mb-4">{error}</p>
                <Button onClick={handlePostUpdate} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : bookmarkedPosts.length > 0 ? (
              <div className="space-y-6">
                {bookmarkedPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onPostUpdate={handlePostUpdate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                You haven't bookmarked any posts yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookmarksPage;
