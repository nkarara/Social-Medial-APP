import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageSquare, UserPlus } from 'lucide-react';
import { NotificationWithDetails } from '@/types/supabase';
import { Link } from 'react-router-dom';

interface NotificationItemProps {
  notification: NotificationWithDetails;
  onClick: (notification: NotificationWithDetails) => void;
}

const NotificationItem = ({ notification, onClick }: NotificationItemProps) => {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
  
  const renderNotificationContent = () => {
    switch (notification.type) {
      case 'like':
        return (
          <>
            <div className="w-8 h-8 rounded-full bg-social-like/10 flex items-center justify-center text-social-like mr-2">
              <Heart size={16} />
            </div>
            <div className="flex-1">
              <p>
                <Link to={`/profile/${notification.profiles?.id}`} className="font-medium hover:underline">
                  {notification.profiles?.username}
                </Link>{' '}
                liked your post{' '}
                <span className="text-muted-foreground">{timeAgo}</span>
              </p>
            </div>
          </>
        );
      
      case 'comment':
        return (
          <>
            <div className="w-8 h-8 rounded-full bg-social-comment/10 flex items-center justify-center text-social-comment mr-2">
              <MessageSquare size={16} />
            </div>
            <div className="flex-1">
              <p>
                <Link to={`/profile/${notification.profiles?.id}`} className="font-medium hover:underline">
                  {notification.profiles?.username}
                </Link>{' '}
                commented on your post{' '}
                <span className="text-muted-foreground">{timeAgo}</span>
              </p>
            </div>
          </>
        );
      
      case 'follow':
        return (
          <>
            <div className="w-8 h-8 rounded-full bg-social-follow/10 flex items-center justify-center text-social-follow mr-2">
              <UserPlus size={16} />
            </div>
            <div className="flex-1">
              <p>
                <Link to={`/profile/${notification.reference_id}`} className="font-medium hover:underline">
                  {notification.profiles?.username}
                </Link>{' '}
                started following you{' '}
                <span className="text-muted-foreground">{timeAgo}</span>
              </p>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div 
      className={`flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors ${
        !notification.is_read ? 'bg-muted/50' : ''
      }`}
      onClick={() => onClick(notification)}
    >
      <Avatar className="h-10 w-10 mr-3">
        <AvatarImage src={notification.profiles?.avatar_url || undefined} />
        <AvatarFallback>
          {notification.profiles?.username.substring(0, 2).toUpperCase() || '??'}
        </AvatarFallback>
      </Avatar>
      {renderNotificationContent()}
      {!notification.is_read && (
        <div className="w-2 h-2 bg-social-primary rounded-full"></div>
      )}
    </div>
  );
};

export default NotificationItem;
