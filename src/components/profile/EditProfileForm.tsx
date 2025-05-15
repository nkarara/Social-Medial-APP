
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/types/supabase';

const EditProfileForm = () => {
  const { user, profile, updateProfile, isLoading } = useAuth();
  const [formData, setFormData] = useState<Partial<Profile>>({
    username: '',
    full_name: '',
    bio: '',
    website: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username,
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        website: profile.website || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Basic validation
    if (!formData.username || formData.username.length < 3) {
      alert('Username must be at least 3 characters long');
      return;
    }
    
    if (formData.website && !isValidUrl(formData.website)) {
      alert('Please enter a valid website URL');
      return;
    }
    
    await updateProfile(formData);
    navigate(`/profile/${user.id}`);
  };

  // Simple URL validation
  const isValidUrl = (url: string) => {
    if (!url) return true;
    
    try {
      // Add protocol if missing
      const urlWithProtocol = url.match(/^https?:\/\//) ? url : `https://${url}`;
      new URL(urlWithProtocol);
      return true;
    } catch (error) {
      return false;
    }
  };

  if (!user || !profile) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
            />
            <p className="text-sm text-muted-foreground">
              This is your public username. Must be at least 3 characters long.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name || ''}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio || ''}
              onChange={handleChange}
              className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
              Tell others about yourself in a few words.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={formData.website || ''}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>
          
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              Email: {user.email} (email cannot be changed)
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EditProfileForm;
