import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { CommentWithProfile } from '@/types/supabase';
import { commentsService } from '@/services/commentsService';
import { User } from '@supabase/supabase-js';

interface PostCommentsProps {
  postId: string;
  commentsCount: number;
  user: User | null;
  onCommentUpdate: () => void;
  isCommenting: boolean;
  onCommentingChange: (isCommenting: boolean) => void;
}

const PostComments = ({ 
  postId, 
  commentsCount, 
  user, 
  onCommentUpdate,
  isCommenting,
  onCommentingChange 
}: PostCommentsProps) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoadComments = async () => {
    if (!showComments) {
      const fetchedComments = await commentsService.fetchComments(postId);
      setComments(fetchedComments);
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!user || !commentText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const newComment = await commentsService.addComment(
        postId, 
        user.id, 
        commentText.trim()
      );
      
      if (newComment) {
        // Fetch complete comment with profile info
        const updatedComments = await commentsService.fetchComments(postId);
        setComments(updatedComments);
        setCommentText('');
        onCommentingChange(false);
        onCommentUpdate();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string, userId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await commentsService.deleteComment(commentId, userId);
      // Refresh comments
      const updatedComments = await commentsService.fetchComments(postId);
      setComments(updatedComments);
      onCommentUpdate();
    }
  };

  return (
    <>
      {isCommenting && user && (
        <div className="flex items-start space-x-2 mt-3 w-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[60px]"
            />
            
            <div className="flex justify-end space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  onCommentingChange(false);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!commentText.trim() || isSubmitting}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {commentsCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 text-sm"
          onClick={handleLoadComments}
        >
          {showComments ? 'Hide comments' : `View all ${commentsCount} comments`}
        </Button>
      )}
      
      {showComments && comments.length > 0 && (
        <div className="mt-3 space-y-3 w-full">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={comment.profiles.avatar_url || undefined} />
                <AvatarFallback>{comment.profiles.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-muted p-2 rounded-md">
                  <div className="flex items-center justify-between">
                    <Link to={`/profile/${comment.user_id}`} className="font-medium text-sm">
                      {comment.profiles.username}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{comment.content}</p>
                </div>
                
                {user && user.id === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs mt-1"
                    onClick={() => handleDeleteComment(comment.id, user.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default PostComments;
