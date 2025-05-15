
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

const ResetPasswordPage = () => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Connectify</h1>
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
