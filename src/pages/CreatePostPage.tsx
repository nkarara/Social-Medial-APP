
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CreatePostForm from '@/components/posts/CreatePostForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CreatePostPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePostCreated = () => {
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container max-w-2xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create a Post</CardTitle>
        </CardHeader>
        <CardContent>
          <CreatePostForm onPostCreated={handlePostCreated} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePostPage;
