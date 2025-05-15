
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Profile } from '@/types/supabase';

interface PostHeaderProps {
  userId: string;
  profile: Profile;
  createdAt: string;
}

const PostHeader = ({ userId, profile, createdAt }: PostHeaderProps) => {
  return (
    <div className="space-y-0 flex flex-row items-center p-4">
      <Link to={`/profile/${userId}`} className="flex items-center">
        <Avatar className="h-10 w-10 mr-3 avatar-hover">
          <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
          <AvatarFallback>{profile.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <span className="font-medium">{profile.username}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>
      </Link>
    </div>
  );
};

export default PostHeader;
