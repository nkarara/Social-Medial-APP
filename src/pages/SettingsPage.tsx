
import { useAuth } from '@/contexts/AuthContext';
import EditProfileForm from '@/components/profile/EditProfileForm';

const SettingsPage = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <EditProfileForm />
    </div>
  );
};

export default SettingsPage;
