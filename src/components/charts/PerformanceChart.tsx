
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PerformanceChartProps {
  title?: string;
}

// Sample data for the chart
const sampleData = [
  { x: 0, y: 200 },
  { x: 1, y: 280 },
  { x: 2, y: 290 },
  { x: 3, y: 500 },
  { x: 4, y: 470 },
  { x: 5, y: 600 },
  { x: 6, y: 550 },
  { x: 7, y: 700 },
  { x: 8, y: 800 },
  { x: 9, y: 750 },
  { x: 10, y: 950 }
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-md">
        <p className="font-medium">Day: {payload[0].payload.x}</p>
        <p className="text-red-500">Performance: {payload[0].value}</p>
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
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
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
                label={{ value: 'Performance', angle: -90, position: 'insideLeft' }}
                domain={[0, 1000]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="y"
                name="Performance"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: 'white', stroke: '#ef4444' }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                animationDuration={1500}
                fill="url(#colorGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
