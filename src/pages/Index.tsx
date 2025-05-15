
import { useState } from 'react';
import CreatePostForm from '@/components/posts/CreatePostForm';
import PostsList from '@/components/posts/PostsList';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="w-full max-w-6xl p-6">
      {user ? (
        <>
          <CreatePostForm onPostCreated={handlePostCreated} />
          <PostsList refreshTrigger={refreshTrigger} />
        </>
      ) : (
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold mb-6">Welcome to Connectify</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Connect with friends, share moments, and discover new content.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/register">Get Started</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
