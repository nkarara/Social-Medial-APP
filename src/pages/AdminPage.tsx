
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import UserManagement from '@/components/admin/UserManagement';
import PostManagement from '@/components/admin/PostManagement';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import { toast } from '@/components/ui/use-toast';

const AdminPage = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Check if the user's email matches the admin email
        const isAdminUser = user.email === 'nabilkarara2002@gmail.com';
        setIsAdmin(isAdminUser);
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast({
          variant: 'destructive',
          title: 'Authentication error',
          description: 'Failed to verify admin privileges.'
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [user]);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  if (loading) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="py-10 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              Please log in to access this page.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p>You don't have permission to access the admin panel.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <CardTitle>Admin Panel</CardTitle>
          </div>
          <CardDescription>
            Manage users and content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-4">
              <AnalyticsDashboard />
            </TabsContent>
            
            <TabsContent value="users" className="space-y-4">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="posts" className="space-y-4">
              <PostManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
