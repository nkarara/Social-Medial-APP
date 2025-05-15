
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Home, Users, Search, BookmarkIcon, Settings, MessageSquare, Bell, User, LogOut, PlusSquare 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarTrigger, 
  SidebarContent, 
  SidebarHeader,
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton
} from '@/components/ui/sidebar';

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const isAdmin = profile?.username === 'admin'; // Simple admin check - you may want to enhance this
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between h-12 px-4">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold">Connectify</h2>
            </div>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/')}
                tooltip="Home"
              >
                <Link to="/">
                  <Home />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/explore')}
                tooltip="Explore"
              >
                <Link to="/explore">
                  <Search />
                  <span>Explore</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {user && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive('/messages')}
                    tooltip="Messages"
                  >
                    <Link to="/messages">
                      <MessageSquare />
                      <span>Messages</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive('/notifications')}
                    tooltip="Notifications"
                  >
                    <Link to="/notifications">
                      <Bell />
                      <span>Notifications</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive('/bookmarks')}
                    tooltip="Bookmarks"
                  >
                    <Link to="/bookmarks">
                      <BookmarkIcon />
                      <span>Bookmarks</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive('/create-post')}
                    tooltip="Create Post"
                  >
                    <Link to="/create-post">
                      <PlusSquare />
                      <span>Create Post</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                {user && profile && (
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(`/profile/${user.id}`)}
                      tooltip="Profile"
                    >
                      <Link to={`/profile/${user.id}`}>
                        <User />
                        <span>Profile</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive('/admin')}
                      tooltip="Admin"
                    >
                      <Link to="/admin">
                        <Users />
                        <span>Admin</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive('/settings')}
                    tooltip="Settings"
                  >
                    <Link to="/settings">
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem className="mt-auto">
                  <SidebarMenuButton 
                    onClick={handleLogout}
                    tooltip="Log out"
                  >
                    <LogOut />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
            
            {!user && (
              <div className="p-4 space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </div>
            )}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
};

export default AppSidebar;
