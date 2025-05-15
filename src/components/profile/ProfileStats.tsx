
import { useState } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ConnectionsList } from './ConnectionsList';
import { socialService } from '@/services/socialService';
import { Profile } from '@/types/supabase';

interface ProfileStatsProps {
  userId: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

const ProfileStats = ({
  userId,
  postsCount,
  followersCount,
  followingCount
}: ProfileStatsProps) => {
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<Profile[]>([]);

  const loadConnections = async (type: 'followers' | 'following') => {
    if (type === 'followers') {
      const data = await socialService.getFollowers(userId);
      setFollowers(data);
    } else {
      const data = await socialService.getFollowing(userId);
      setFollowing(data);
    }
  };

  return (
    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
      <div>
        <span className="font-medium">{postsCount}</span>{' '}
        <span className="text-muted-foreground">Posts</span>
      </div>
      
      <Dialog open={followersDialogOpen} onOpenChange={setFollowersDialogOpen}>
        <DialogTrigger asChild>
          <button 
            className="bg-transparent"
            onClick={() => loadConnections('followers')}
          >
            <span className="font-medium">{followersCount}</span>{' '}
            <span className="text-muted-foreground">Followers</span>
          </button>
        </DialogTrigger>
        <ConnectionsList 
          title="Followers"
          connections={followers}
          onClose={() => setFollowersDialogOpen(false)}
        />
      </Dialog>
      
      <Dialog open={followingDialogOpen} onOpenChange={setFollowingDialogOpen}>
        <DialogTrigger asChild>
          <button 
            className="bg-transparent"
            onClick={() => loadConnections('following')}
          >
            <span className="font-medium">{followingCount}</span>{' '}
            <span className="text-muted-foreground">Following</span>
          </button>
        </DialogTrigger>
        <ConnectionsList 
          title="Following" 
          connections={following}
          onClose={() => setFollowingDialogOpen(false)}
        />
      </Dialog>
    </div>
  );
};

export default ProfileStats;
