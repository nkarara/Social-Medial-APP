
import { Card, CardContent } from '@/components/ui/card';
import { Profile } from '@/types/supabase';
import { useAuth } from '@/contexts/AuthContext';
import AvatarUpload from './AvatarUpload';
import ProfileStats from './ProfileStats';
import ProfileActions from './ProfileActions';

interface ProfileHeaderProps {
  profile: Profile;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  onFollowToggle: () => void;
  onAvatarChange?: (url: string) => void;
}

const ProfileHeader = ({
  profile,
  postsCount,
  followersCount,
  followingCount,
  isFollowing,
  onFollowToggle,
  onAvatarChange,
}: ProfileHeaderProps) => {
  const { user } = useAuth();
  const isOwnProfile = user?.id === profile.id;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <AvatarUpload
            userId={profile.id}
            avatarUrl={profile.avatar_url}
            username={profile.username}
            isOwnProfile={isOwnProfile}
            onAvatarChange={onAvatarChange}
          />
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">{profile.username}</h2>
            {profile.full_name && (
              <p className="text-muted-foreground">{profile.full_name}</p>
            )}
            
            <ProfileStats
              userId={profile.id}
              postsCount={postsCount}
              followersCount={followersCount}
              followingCount={followingCount}
            />
            
            {profile.bio && (
              <p className="mt-4">{profile.bio}</p>
            )}
            
            {profile.website && (
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline mt-1 inline-block"
              >
                {profile.website}
              </a>
            )}
            
            <ProfileActions
              isOwnProfile={isOwnProfile}
              isFollowing={isFollowing}
              onFollowToggle={onFollowToggle}
              profileId={profile.id}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
