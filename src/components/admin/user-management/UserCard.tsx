
import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Profile } from '@/types/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserCheck, UserX, Trash } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/profileService';

interface UserCardProps {
  user: Profile;
  handleBlockUser: (userId: string, isBlocked: boolean) => Promise<void>;
  handleDeleteUser: (userId: string) => Promise<void>;
}

const UserCard: React.FC<UserCardProps> = ({ user, handleBlockUser, handleDeleteUser }) => {
  const { user: currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [canModifyUser, setCanModifyUser] = useState(false);

  // Check if current user is admin and if the displayed user is admin
  useEffect(() => {
    const checkPermissions = async () => {
      // Current user is admin if they have the admin email
      const currentUserIsAdmin = currentUser?.email === 'nabilkarara2002@gmail.com';
      setIsAdmin(currentUserIsAdmin);

      // Can modify user if current user is admin AND target user is not admin
      const targetIsAdmin = user.username === 'admin';
      setCanModifyUser(currentUserIsAdmin && !targetIsAdmin);
    };
    
    checkPermissions();
  }, [user, currentUser]);

  const onDeleteConfirm = async () => {
    await handleDeleteUser(user.id);
    setConfirmDelete(false);
  };

  return (
    <Card key={user.id}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{user.username}</p>
                {user.username === 'admin' && (
                  <Badge variant="outline" className="bg-primary/10">Admin</Badge>
                )}
                {'is_blocked' in user && user.is_blocked && (
                  <Badge variant="destructive">Blocked</Badge>
                )}
              </div>
              {user.full_name && (
                <p className="text-sm text-muted-foreground">{user.full_name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {isAdmin && (
            <div className="flex gap-2">
              {canModifyUser && (
                <>
                  <Button 
                    variant={'is_blocked' in user && user.is_blocked ? "outline" : "destructive"} 
                    size="sm"
                    onClick={() => handleBlockUser(user.id, !('is_blocked' in user && user.is_blocked))}
                  >
                    {'is_blocked' in user && user.is_blocked ? (
                      <>
                        <UserCheck className="mr-1 h-4 w-4" />
                        Unblock
                      </>
                    ) : (
                      <>
                        <UserX className="mr-1 h-4 w-4" />
                        Block
                      </>
                    )}
                  </Button>
                  
                  <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash className="mr-1 h-4 w-4" />
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm User Deletion</DialogTitle>
                      </DialogHeader>
                      <p className="py-4">
                        Are you sure you want to delete this user? This action cannot be undone.
                      </p>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                        <Button 
                          variant="destructive"
                          onClick={onDeleteConfirm}
                        >
                          Delete
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
