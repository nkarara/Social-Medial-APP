
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TimelineDataPoint {
  date: string;
  Posts: number;
  Comments: number;
}

interface ContentActivityChartProps {
  data: TimelineDataPoint[];
  loading: boolean;
}

const ContentActivityChart: React.FC<ContentActivityChartProps> = ({ data, loading }) => {
  const hasData = data.some(point => point.Posts > 0 || point.Comments > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Activity (Last 7 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Posts" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Comments" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No activity data available for the last 7 days</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentActivityChart;
