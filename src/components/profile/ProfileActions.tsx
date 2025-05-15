
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface ProfileActionsProps {
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollowToggle: () => void;
  profileId: string;
}

const ProfileActions = ({ isOwnProfile, isFollowing, onFollowToggle, profileId }: ProfileActionsProps) => {
  const navigate = useNavigate();
  
  const handleStartConversation = () => {
    navigate('/messages', { state: { conversationUserId: profileId } });
  };
  
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {isOwnProfile ? (
        <Button 
          variant="outline"
          onClick={() => navigate('/settings')}
        >
          Edit Profile
        </Button>
      ) : (
        <>
          <Button 
            variant={isFollowing ? "outline" : "default"}
            className={isFollowing ? '' : 'follow-button active'}
            onClick={onFollowToggle}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
          
          {isFollowing && (
            <Button 
              variant="outline" 
              onClick={handleStartConversation}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default ProfileActions;
