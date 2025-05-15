
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search } from 'lucide-react';
import { profilesService } from '@/services/profilesService';
import { Profile } from '@/types/supabase';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface SearchBarProps {
  isMobile?: boolean;
}

const SearchBar = ({ isMobile = false }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const results = await profilesService.searchProfiles(searchQuery.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching profiles:', error);
    }
  };

  const handleSearchResultClick = (profileId: string) => {
    setShowSearch(false);
    setSearchResults([]);
    setSearchQuery('');
    navigate(`/profile/${profileId}`);
  };
  
  if (isMobile) {
    return (
      <Sheet open={showSearch} onOpenChange={setShowSearch}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="top" className="w-full p-4">
          <SheetHeader>
            <SheetTitle>Search</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSearch} className="mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Search</Button>
            </div>
          </form>
          {searchResults.length > 0 && (
            <div className="mt-4 max-h-[300px] overflow-y-auto">
              <h4 className="text-sm font-medium mb-2">Results</h4>
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center p-2 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => handleSearchResultClick(result.id)}
                  >
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={result.avatar_url || undefined} />
                      <AvatarFallback>{result.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{result.username}</p>
                      {result.full_name && (
                        <p className="text-xs text-muted-foreground">{result.full_name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  }
  
  return (
    <div className="hidden md:flex relative">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-8"
          />
        </div>
      </form>
      {searchResults.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-background border rounded-md shadow-md z-10 max-h-[300px] overflow-y-auto">
          {searchResults.map((result) => (
            <div
              key={result.id}
              className="flex items-center p-2 hover:bg-muted cursor-pointer"
              onClick={() => handleSearchResultClick(result.id)}
            >
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={result.avatar_url || undefined} />
                <AvatarFallback>{result.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{result.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
