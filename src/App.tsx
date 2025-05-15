
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import ProfilePage from "@/pages/ProfilePage";
import PostPage from "@/pages/PostPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";
import CreatePostPage from "@/pages/CreatePostPage";
import ExplorePage from "@/pages/ExplorePage";
import NotificationsPage from "@/pages/NotificationsPage";
import FollowersPage from "@/pages/FollowersPage";
import FollowingPage from "@/pages/FollowingPage";
import BookmarksPage from "@/pages/BookmarksPage";
import MessagesPage from "@/pages/MessagesPage";
import AdminPage from "@/pages/AdminPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/post/:id" element={<PostPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/create-post" element={<CreatePostPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/followers/:id" element={<FollowersPage />} />
              <Route path="/following/:id" element={<FollowingPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
