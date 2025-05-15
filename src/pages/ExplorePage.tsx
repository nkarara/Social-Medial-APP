
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { postsService } from '@/services/postsService';
import PostsList from '@/components/posts/PostsList';
import { PostWithDetails } from '@/types/supabase';
import { searchPosts } from '@/services/postSearchService';

const ExplorePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PostWithDetails[]>([]);
  
  // Fetch posts using React Query
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      return await postsService.fetchPosts(null);
    },
  });
  
  // Perform search whenever searchTerm or posts change
  useEffect(() => {
    if (posts && searchTerm) {
      const results = searchPosts(posts as PostWithDetails[], searchTerm);
      setSearchResults(results);
    } else {
      setSearchResults(posts as PostWithDetails[] || []);
    }
  }, [searchTerm, posts]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  return (
    <div className="container py-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Explore Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search posts by content or username..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="mb-4"
          />
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="text-center py-10">Loading posts...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">
          Error loading posts. Please try again.
        </div>
      ) : searchTerm ? (
        <PostsList posts={searchResults} />
      ) : (
        <PostsList posts={posts as PostWithDetails[]} />
      )}
    </div>
  );
};

export default ExplorePage;
