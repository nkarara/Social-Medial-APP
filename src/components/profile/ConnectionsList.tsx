
import { useNavigate } from 'react-router-dom';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Profile } from '@/types/supabase';

interface ConnectionsListProps {
  title: string;
  connections: Profile[];
  onClose: () => void;
}

export const ConnectionsList = ({ title, connections, onClose }: ConnectionsListProps) => {
  const navigate = useNavigate();
  
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Connections</DialogTitle>
      </DialogHeader>
      
      <Tabs defaultValue={title.toLowerCase()}>
        <TabsList className="w-full">
          <TabsTrigger value={title.toLowerCase()} className="flex-1">
            {title}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={title.toLowerCase()} className="h-[300px] overflow-y-auto">
          {connections.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {title === 'Followers' ? 'No followers yet' : 'Not following anyone yet'}
            </p>
          ) : (
            <div className="space-y-2">
              {connections.map((connection) => (
                <div 
                  key={connection.id}
                  className="flex items-center p-2 hover:bg-muted rounded-md cursor-pointer"
                  onClick={() => {
                    navigate(`/profile/${connection.id}`);
                    onClose();
                  }}
                >
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={connection.avatar_url || undefined} />
                    <AvatarFallback>{connection.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{connection.username}</p>
                    {connection.full_name && (
                      <p className="text-xs text-muted-foreground">{connection.full_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
};
