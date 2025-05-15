
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socialService } from '@/services/socialService';
import { Profile } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import supabase from '@/lib/supabase';

const FollowersPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (!id) return;
    
    const fetchFollowers = async () => {
      setLoading(true);
      try {
        // Simulated followers data until we have a real follows table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(5);
          
        if (error) throw error;
        
        setFollowers(data || []);
        
        // If user is logged in, simulate follow status for each follower
        if (user) {
          const status: Record<string, boolean> = {};
          for (const follower of data || []) {
            status[follower.id] = Math.random() > 0.5; // Random status for demo
          }
          setFollowStatus(status);
        }
      } catch (error) {
        console.error('Error fetching followers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFollowers();
  }, [id, user]);
  
  const handleToggleFollow = async (followedId: string) => {
    if (!user) return;
    
    try {
      // Toggle follow status locally for demo purposes
      setFollowStatus(prev => ({
        ...prev,
        [followedId]: !prev[followedId]
      }));
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };
  
  return (
    <div className="container max-w-3xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>Followers</CardTitle>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : followers.length > 0 ? (
            <div className="divide-y">
              {followers.map((profile) => (
                <div key={profile.id} className="flex items-center justify-between py-4">
                  <Link to={`/profile/${profile.id}`} className="flex items-center">
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback>{profile.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{profile.username}</p>
                      {profile.full_name && (
                        <p className="text-sm text-muted-foreground">{profile.full_name}</p>
                      )}
                    </div>
                  </Link>
                  
                  {user && user.id !== profile.id && (
                    <Button
                      variant={followStatus[profile.id] ? "secondary" : "default"}
                      size="sm"
                      onClick={() => handleToggleFollow(profile.id)}
                    >
                      {followStatus[profile.id] ? "Following" : "Follow"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No followers found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FollowersPage;
