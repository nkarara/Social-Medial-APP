
import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { avatarService } from '@/services/avatarService';

interface AvatarUploadProps {
  userId: string;
  avatarUrl: string | null;
  username: string;
  isOwnProfile: boolean;
  onAvatarChange?: (url: string) => void;
}

const AvatarUpload = ({
  userId,
  avatarUrl,
  username,
  isOwnProfile,
  onAvatarChange
}: AvatarUploadProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be smaller than 2MB');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const newAvatarUrl = await avatarService.uploadAvatar(userId, file);
      
      if (newAvatarUrl && onAvatarChange) {
        onAvatarChange(newAvatarUrl);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <Avatar className="h-24 w-24 md:h-32 md:w-32">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback className="text-xl">{username.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      
      {isOwnProfile && (
        <>
          <input
            type="file"
            accept="image/*"
            id="avatar-upload"
            className="hidden"
            onChange={handleAvatarUpload}
            disabled={isUpdating}
          />
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer"
            title="Change profile picture"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
            </svg>
          </label>
        </>
      )}
    </div>
  );
};

export default AvatarUpload;
