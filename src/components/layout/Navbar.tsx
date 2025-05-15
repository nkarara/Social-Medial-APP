
import { Link } from 'react-router-dom';
import SearchBar from './navbar/SearchBar';
import NotificationsIcon from './navbar/NotificationsIcon';
import UserDropdown from './navbar/UserDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

const Navbar = () => {
  const { user } = useAuth();
  const { open, toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="mr-2"
            aria-label={open ? "Hide sidebar" : "Show sidebar"}
          >
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <Link to="/" className="flex items-center">
            <span className="text-xl font-semibold">Connectify</span>
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-end space-x-2">
          {/* Mobile Search Button */}
          <div className="md:hidden">
            <SearchBar isMobile={true} />
          </div>
          
          {/* Desktop Search */}
          <SearchBar />
          
          {user ? (
            <>
              <NotificationsIcon />
              <UserDropdown />
            </>
          ) : (
            <UserDropdown />
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
