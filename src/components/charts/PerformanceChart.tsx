
import React, { useMemo } from "react";
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
import { useJournal } from "@/contexts/JournalContext";

interface PerformanceChartProps {
  title?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-md">
        <p className="font-medium">Day: {payload[0].payload.day}</p>
        <p className="text-red-500">Performance: {payload[0].value.toFixed(2)}%</p>
        {payload[1] && (
          <p className="text-blue-500">Daily Win: {payload[1].value.toFixed(2)}%</p>
        )}
      </div>
    );
  }
  return null;
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  title = "Trading Performance"
}) => {
  const { journal, stats } = useJournal();
  
  // Generate performance data from the journal
  const performanceData = useMemo(() => {
    let cumulativePerformance = 0;
    
    // Flatten all trades and sort by date
    const allTrades = journal.weeks
      .flatMap(week => week.trades)
      .filter(trade => trade.status === 'Done')
      .sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
    
    // Group trades by day for daily wins
    const tradesByDay = allTrades.reduce((acc, trade) => {
      const tradeDate = trade.date instanceof Date ? trade.date : new Date(trade.date);
      const dateKey = tradeDate.toISOString().split('T')[0];
      
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(trade);
      return acc;
    }, {} as Record<string, typeof allTrades>);
    
    // Generate chart data with performance accumulation
    const chartData = [];
    
    // If we have at least one trade
    if (allTrades.length > 0) {
      let day = 0;
      
      Object.entries(tradesByDay).forEach(([dateKey, trades]) => {
        const dailyWin = trades.reduce((sum, trade) => sum + trade.gainLossPercent, 0);
        cumulativePerformance += dailyWin;
        
        chartData.push({
          day: day,
          date: new Date(dateKey),
          dailyWin: dailyWin,
          performance: cumulativePerformance
        });
        
        day++;
      });
    } else {
      // Placeholder data if no trades
      for (let i = 0; i <= 10; i++) {
        chartData.push({
          day: i,
          date: new Date(),
          dailyWin: 0,
          performance: 0
        });
      }
    }
    
    return chartData;
  }, [journal]);
  
  // Calculate the maximum performance value for Y-axis domain
  const maxPerformance = useMemo(() => {
    if (performanceData.length === 0) return 1000;
    
    const max = Math.max(...performanceData.map(d => d.performance));
    // Round up to next nice number for Y-axis
    return Math.ceil(max / 100) * 100 || 1000;
  }, [performanceData]);
  
  return (
    <Card className="shadow-lg overflow-hidden rounded-xl bg-gradient-to-b from-white to-gray-50">
      <CardHeader className="bg-gradient-to-r from-background to-background/50 pb-2">
        <CardTitle className="text-lg font-medium text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={performanceData}
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
                dataKey="day" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#94a3b8' }}
                axisLine={{ stroke: '#94a3b8' }}
                label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#94a3b8' }}
                axisLine={{ stroke: '#94a3b8' }}
                label={{ value: 'Value (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, maxPerformance]}
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
