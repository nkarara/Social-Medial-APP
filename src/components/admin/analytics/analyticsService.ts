
import supabase from '@/lib/supabase';
import { format, subDays, startOfDay } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

export interface UserCountData {
  totalUsers: number;
  newUsers7d: number;
  activeUsers: number;
}

export interface ContentCountData {
  totalPosts: number;
  totalComments: number;
  postsTimeline: { date: string; count: number }[];
  commentsTimeline: { date: string; count: number }[];
}

export interface TopUserData {
  id: string;
  username: string;
  avatar_url: string | null;
  follower_count: number;
}

export interface TimelineDataPoint {
  date: string;
  Posts: number;
  Comments: number;
}

export const fetchUserCounts = async (): Promise<UserCountData> => {
  try {
    // Fetch user counts
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('id, created_at');
    
    if (usersError) throw usersError;
    
    const totalUsers = usersData?.length || 0;
    
    // Calculate new users in last 7 days
    const oneWeekAgo = subDays(new Date(), 7).toISOString();
    const newUsers7d = usersData?.filter(u => u.created_at >= oneWeekAgo).length || 0;
    
    // Estimate active users - in a real app, this would be based on login activity
    const activeUsers = Math.max(1, Math.round(totalUsers * 0.7));
    
    return {
      totalUsers,
      newUsers7d,
      activeUsers
    };
  } catch (error) {
    console.error("Error fetching user counts:", error);
    throw error;
  }
};

export const fetchContentCounts = async (): Promise<ContentCountData> => {
  try {
    // Fetch content counts
    const { count: postsCount, error: postsCountError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });
    
    if (postsCountError) throw postsCountError;
      
    const { count: commentsCount, error: commentsCountError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true });
    
    if (commentsCountError) throw commentsCountError;
    
    // Get actual timeline data for posts
    const postsTimeline = [];
    const commentsTimeline = [];
    
    // Create date ranges for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'MM/dd');
      const startDate = startOfDay(subDays(new Date(), i)).toISOString();
      const endDate = startOfDay(subDays(new Date(), i-1)).toISOString();
      
      // Count posts for this day
      const { count: dayPostsCount, error: dayPostsError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lt('created_at', endDate);
        
      if (dayPostsError) throw dayPostsError;
      
      // Count comments for this day
      const { count: dayCommentsCount, error: dayCommentsError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lt('created_at', endDate);
        
      if (dayCommentsError) throw dayCommentsError;
      
      postsTimeline.push({
        date: dateStr,
        count: dayPostsCount || 0
      });
      
      commentsTimeline.push({
        date: dateStr,
        count: dayCommentsCount || 0
      });
    }

    return {
      totalPosts: postsCount || 0,
      totalComments: commentsCount || 0,
      postsTimeline,
      commentsTimeline
    };
  } catch (error) {
    console.error("Error fetching content counts:", error);
    throw error;
  }
};

export const fetchTopUsers = async (): Promise<TopUserData[]> => {
  try {
    // Fetch top users (most followed)
    const { data: followData, error: followError } = await supabase
      .from('follows')
      .select('followed_id');
      
    if (followError) throw followError;
      
    // Count followers per user
    const followerCounts: Record<string, number> = {};
    followData?.forEach(follow => {
      followerCounts[follow.followed_id] = (followerCounts[follow.followed_id] || 0) + 1;
    });
    
    // Get top users
    const topUserIds = Object.entries(followerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);
      
    if (topUserIds.length === 0) {
      return [];
    }
    
    const { data: topUserProfiles, error: topUserError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', topUserIds);
      
    if (topUserError) throw topUserError;
      
    const topUsersWithFollowers = topUserProfiles?.map(user => ({
      ...user,
      follower_count: followerCounts[user.id] || 0
    }));
    
    return topUsersWithFollowers || [];
  } catch (error) {
    console.error("Error fetching top users:", error);
    throw error;
  }
};

export const combinedTimelineData = (contentData: ContentCountData): TimelineDataPoint[] => {
  return contentData.postsTimeline.map((item, index) => ({
    date: item.date,
    Posts: item.count,
    Comments: contentData.commentsTimeline[index]?.count || 0
  }));
};

export const fetchAnalyticsData = async () => {
  try {
    const userCountData = await fetchUserCounts();
    const contentData = await fetchContentCounts();
    const topUsers = await fetchTopUsers();
    
    return {
      userCountData,
      contentData,
      timelineData: combinedTimelineData(contentData),
      topUsers
    };
  } catch (error: any) {
    console.error("Error fetching analytics data:", error);
    toast({
      variant: 'destructive',
      title: 'Analytics error',
      description: 'Failed to load analytics data. Please try again.'
    });
    throw error;
  }
};
