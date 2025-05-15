
import { useState, useEffect } from 'react';
import StatsCard from './analytics/StatsCard';
import ContentActivityChart from './analytics/ContentActivityChart';
import TopUsersList from './analytics/TopUsersList';
import { 
  fetchAnalyticsData, 
  UserCountData, 
  ContentCountData, 
  TopUserData, 
  TimelineDataPoint
} from './analytics/analyticsService';

const AnalyticsDashboard = () => {
  const [userCountData, setUserCountData] = useState<UserCountData>({
    totalUsers: 0,
    newUsers7d: 0,
    activeUsers: 0
  });
  const [contentData, setContentData] = useState<ContentCountData>({
    totalPosts: 0,
    totalComments: 0,
    postsTimeline: [],
    commentsTimeline: []
  });
  const [timelineData, setTimelineData] = useState<TimelineDataPoint[]>([]);
  const [topUsers, setTopUsers] = useState<TopUserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    try {
      const data = await fetchAnalyticsData();
      
      setUserCountData(data.userCountData);
      setContentData(data.contentData);
      setTimelineData(data.timelineData);
      setTopUsers(data.topUsers);
    } catch (error) {
      // Error is handled in the service
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* User Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard 
          title="Total Users" 
          value={userCountData.totalUsers}
          subtitle={`+${userCountData.newUsers7d} in the last 7 days`}
        />
        
        <StatsCard 
          title="Active Users" 
          value={userCountData.activeUsers}
          subtitle={`${userCountData.totalUsers ? Math.round((userCountData.activeUsers / userCountData.totalUsers) * 100) : 0}% of total users`}
        />
        
        <StatsCard 
          title="Content Stats" 
          value={contentData.totalPosts}
          subtitle={`Posts with ${contentData.totalComments} comments`}
        />
      </div>

      {/* Content Timeline Chart */}
      <ContentActivityChart 
        data={timelineData} 
        loading={loading} 
      />

      {/* Top Users */}
      <TopUsersList 
        users={topUsers} 
        loading={loading} 
      />
    </div>
  );
};

export default AnalyticsDashboard;
