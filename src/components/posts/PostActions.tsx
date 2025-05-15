
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, Share, Bookmark } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { postsService } from '@/services/postsService';
import { bookmarksService } from '@/services/bookmarksService';
import { User } from '@supabase/supabase-js';

interface PostActionsProps {
  postId: string;
  userId: string | undefined;
  isLiked: boolean;
  isBookmarked: boolean;
  likesCount: number;
  commentsCount: number;
  user: User | null;
  onLikeChange: (newLiked: boolean, newCount: number) => void;
  onBookmarkChange: (newBookmarked: boolean) => void;
  onCommentClick: () => void;
}

const PostActions = ({ 
  postId, 
  userId, 
  isLiked, 
  isBookmarked, 
  likesCount, 
  commentsCount, 
  user, 
  onLikeChange, 
  onBookmarkChange, 
  onCommentClick 
}: PostActionsProps) => {
  const [processingLike, setProcessingLike] = useState(false);
  const [processingBookmark, setProcessingBookmark] = useState(false);

  const handleLike = async () => {
    if (!user) return;
    if (processingLike) return;
    
    try {
      setProcessingLike(true);
      const success = await postsService.likePost(postId, user.id);
      
      if (success !== undefined) {
        onLikeChange(success, success ? likesCount + 1 : likesCount - 1);
      }
    } catch (error) {
      console.error('Like action failed:', error);
    } finally {
      setProcessingLike(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) return;
    if (processingBookmark) return;
    
    try {
      setProcessingBookmark(true);
      const success = await bookmarksService.bookmarkPost(postId, user.id);
      onBookmarkChange(success);
    } catch (error) {
      console.error('Bookmark action failed:', error);
    } finally {
      setProcessingBookmark(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Post`,
        text: 'Check out this post',
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: 'Link copied',
        description: 'Post link copied to clipboard',
      });
    }
  };

  return (
    <div className="flex items-center justify-between w-full border-t border-b py-2">
      <Button
        variant="ghost"
        size="sm"
        className={`flex-1 ${isLiked ? 'text-red-500' : ''}`}
        onClick={handleLike}
        disabled={!user || processingLike}
      >
        <Heart className={`mr-1 h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
        Like
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex-1"
        onClick={onCommentClick}
        disabled={!user}
      >
        <MessageSquare className="mr-1 h-4 w-4" />
        Comment
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className={`flex-1 ${isBookmarked ? 'text-blue-500' : ''}`}
        onClick={handleBookmark}
        disabled={!user || processingBookmark}
      >
        <Bookmark className={`mr-1 h-4 w-4 ${isBookmarked ? 'fill-blue-500 text-blue-500' : ''}`} />
        Save
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex-1"
        onClick={handleShare}
      >
        <Share className="mr-1 h-4 w-4" />
        Share
      </Button>
    </div>
  );
};

export default PostActions;
