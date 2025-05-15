
// Re-export all profile-related services for backward compatibility
import { profileService } from './profileService';
import { avatarService } from './avatarService';
import { socialService } from './socialService';

// Export individual services
export { profileService, avatarService, socialService };

// This maintains the existing API surface so no other files need to be changed
export const profilesService = {
  ...profileService,
  ...avatarService,
  ...socialService
};
