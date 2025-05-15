
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface TopUser {
  id: string;
  username: string;
  avatar_url: string | null;
  follower_count: number;
}

interface TopUsersListProps {
  users: TopUser[];
  loading: boolean;
}

const TopUsersList: React.FC<TopUsersListProps> = ({ users, loading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Followed Users</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-5">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.username}</p>
                  </div>
                </div>
                <Badge variant="outline">{user.follower_count} followers</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5 text-muted-foreground">
            No follower data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopUsersList;
