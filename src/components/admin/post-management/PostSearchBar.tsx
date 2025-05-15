
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface PostSearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

const PostSearchBar = ({ 
  searchQuery, 
  onSearchQueryChange, 
  onSearch, 
  onReset 
}: PostSearchBarProps) => {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Search posts..."
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        className="flex-1"
      />
      <Button variant="outline" onClick={onSearch}>
        <Search className="h-4 w-4" />
      </Button>
      {searchQuery && (
        <Button variant="ghost" onClick={onReset}>
          Clear
        </Button>
      )}
    </div>
  );
};

export default PostSearchBar;
