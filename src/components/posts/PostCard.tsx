
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PostWithDetails } from '@/types/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { postsService } from '@/services/postsService';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';
import PostComments from './PostComments';

interface PostCardProps {
  post: PostWithDetails;
  onPostUpdate?: () => void;
}

const PostCard = ({ post, onPostUpdate }: PostCardProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.user_has_liked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked || false);
  
  // Extract actual count from the likes_count and comments_count
  const extractCount = (countData: number | { count: number } | { count: number }[]): number => {
    if (typeof countData === 'number') {
      return countData;
    } else if (Array.isArray(countData)) {
      return countData[0]?.count || 0;
    } else {
      return countData.count || 0;
    }
  };
  
  const likesCountValue = extractCount(post.likes_count);
  const commentsCountValue = extractCount(post.comments_count);
  
  const [likesCount, setLikesCount] = useState(likesCountValue);
  const [isCommenting, setIsCommenting] = useState(false);
  
  const handleLikeChange = (newLiked: boolean, newCount: number) => {
    setIsLiked(newLiked);
    setLikesCount(newCount);
    if (onPostUpdate) onPostUpdate();
  };

  const handleBookmarkChange = (newBookmarked: boolean) => {
    setIsBookmarked(newBookmarked);
    if (onPostUpdate) onPostUpdate();
  };
  
  const toggleCommenting = () => {
    setIsCommenting(!isCommenting);
  };

  return (
    <Card className="post-card mb-6">
      <CardHeader className="p-0">
        <PostHeader 
          userId={post.user_id} 
          profile={post.profiles} 
          createdAt={post.created_at} 
        />
      </CardHeader>
      
      <CardContent className="p-0">
        <PostContent content={post.content} mediaUrl={post.media_url} />
      </CardContent>
      
      <CardFooter className="flex flex-col p-4 pt-0">
        <div className="flex items-center justify-between w-full mb-2">
          <div className="flex space-x-1 text-sm text-muted-foreground">
            <span>{likesCount} likes</span>
            <span>•</span>
            <span>{commentsCountValue} comments</span>
          </div>
          
          {user && user.id === post.user_id && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this post?')) {
                  await postsService.deletePost(post.id);
                  if (onPostUpdate) onPostUpdate();
                }
              }}
            >
              Delete
            </Button>
          )}
        </div>
        
        <PostActions 
          postId={post.id}
          userId={post.user_id}
          isLiked={isLiked}
          isBookmarked={isBookmarked}
          likesCount={likesCount}
          commentsCount={commentsCountValue}
          user={user}
          onLikeChange={handleLikeChange}
          onBookmarkChange={handleBookmarkChange}
          onCommentClick={toggleCommenting}
        />
        
        <PostComments
          postId={post.id}
          commentsCount={commentsCountValue}
          user={user}
          onCommentUpdate={() => {
            if (onPostUpdate) onPostUpdate();
          }}
        />
      </CardFooter>
    </Card>
  );
};

export default PostCard;
