import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { profileService } from '@/services/profileService';
import { socialService } from '@/services/socialService';
import { postsService } from '@/services/postsService';
import { Profile, PostWithDetails } from '@/types/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PostsList from '@/components/posts/PostsList';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [postsCount, setPostsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (id) {
      loadProfile();
    }
  }, [id]);

  const loadProfile = async () => {
    if (!id) return;
    
    setIsLoading(true);
    
    try {
      // Load profile data
      const profileData = await profileService.fetchProfile(id);
      setProfile(profileData);
      
      if (profileData) {
        // Load posts
        const userPosts = await postsService.fetchUserPosts(id, user?.id || null);
        setPosts(userPosts);
        setPostsCount(userPosts.length);
        
        // Load followers count
        const followers = await socialService.getFollowers(id);
        setFollowersCount(followers.length);
        
        // Load following count
        const following = await socialService.getFollowing(id);
        setFollowingCount(following.length);
        
        // Check if current user is following this profile
        if (user) {
          const followStatus = await socialService.isFollowing(user.id, id);
          setIsFollowing(followStatus);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !id) return;
    
    const result = await socialService.followUser(user.id, id);
    setIsFollowing(result);
    
    // Update followers count
    if (result) {
      setFollowersCount(prev => prev + 1);
    } else {
      setFollowersCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleAvatarChange = (url: string) => {
    if (profile) {
      setProfile({
        ...profile,
        avatar_url: url
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container max-w-4xl py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
        <p className="text-muted-foreground">The profile you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6">
      <ProfileHeader
        profile={profile}
        postsCount={postsCount}
        followersCount={followersCount}
        followingCount={followingCount}
        isFollowing={isFollowing}
        onFollowToggle={handleFollowToggle}
        onAvatarChange={handleAvatarChange}
      />
      
      <div className="mt-6">
        <PostsList
          userId={id}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
