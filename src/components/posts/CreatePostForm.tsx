
import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { postsService } from '@/services/postsService';
import { Camera, X } from 'lucide-react';

interface CreatePostFormProps {
  onPostCreated: () => void;
}

const CreatePostForm = ({ onPostCreated }: CreatePostFormProps) => {
  const { user, profile } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const post = await postsService.createPost(user.id, content.trim(), mediaFile);
      
      if (post) {
        setContent('');
        setMediaFile(null);
        setMediaPreview(null);
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Check file type
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)|^video\/(mp4|webm|ogg)/)) {
      toast({
        variant: 'destructive',
        title: 'Unsupported file type',
        description: 'Please upload an image (JPEG, PNG, GIF, WEBP) or video (MP4, WEBM, OGG).',
      });
      return;
    }
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please upload a file smaller than 10MB.',
      });
      return;
    }
    
    setMediaFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <div className="flex space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>
                {profile ? profile.username.substring(0, 2).toUpperCase() : user.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder={`What's on your mind, ${profile?.username || 'there'}?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px]"
              />
              
              {mediaPreview && (
                <div className="relative rounded-md overflow-hidden border">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6 absolute top-2 right-2 z-10"
                    type="button"
                    onClick={removeMedia}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {mediaFile?.type.startsWith('video/') ? (
                    <video 
                      src={mediaPreview} 
                      controls 
                      className="max-h-[300px] mx-auto"
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Media preview"
                      className="max-h-[300px] mx-auto"
                    />
                  )}
                </div>
              )}
              
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-muted-foreground"
          >
            <Camera className="h-4 w-4 mr-2" />
            Add Photo/Video
          </Button>
          <Button 
            type="submit" 
            disabled={!content.trim() || isSubmitting}
            size="sm"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreatePostForm;
