
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PerformanceChartProps {
  title?: string;
}

// Sample data for the chart with both daily wins and performance
const sampleData = [
  { x: 0, performance: 200, dailyWin: 150 },
  { x: 1, performance: 280, dailyWin: 220 },
  { x: 2, performance: 290, dailyWin: 180 },
  { x: 3, performance: 500, dailyWin: 350 },
  { x: 4, performance: 470, dailyWin: 400 },
  { x: 5, performance: 600, dailyWin: 520 },
  { x: 6, performance: 550, dailyWin: 480 },
  { x: 7, performance: 700, dailyWin: 600 },
  { x: 8, performance: 800, dailyWin: 720 },
  { x: 9, performance: 750, dailyWin: 680 },
  { x: 10, performance: 950, dailyWin: 870 }
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-md">
        <p className="font-medium">Day: {payload[0].payload.x}</p>
        <p className="text-red-500">Performance: {payload[0].value}</p>
        {payload[1] && (
          <p className="text-blue-500">Daily Win: {payload[1].value}</p>
        )}
      </div>
    );
  }
  return null;
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  title = "Trading Performance"
}) => {
  return (
    <Card className="shadow-lg overflow-hidden rounded-xl bg-gradient-to-b from-white to-gray-50">
      <CardHeader className="bg-gradient-to-r from-background to-background/50 pb-2">
        <CardTitle className="text-lg font-medium text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sampleData}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorDailyWin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="x" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#94a3b8' }}
                axisLine={{ stroke: '#94a3b8' }}
                label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
                domain={[0, 10]}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#94a3b8' }}
                axisLine={{ stroke: '#94a3b8' }}
                label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
                domain={[0, 1000]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="performance"
                name="Performance"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: 'white', stroke: '#ef4444' }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                animationDuration={1500}
                fill="url(#colorPerformance)"
              />
              <Line
                type="monotone"
                dataKey="dailyWin"
                name="Daily Win"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: 'white', stroke: '#3b82f6' }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                animationDuration={1500}
                fill="url(#colorDailyWin)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
