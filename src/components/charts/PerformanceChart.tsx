
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
import { format } from "date-fns";
import { useJournal } from "@/contexts/JournalContext";

interface PerformanceChartProps {
  title?: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  title = "Trading Performance"
}) => {
  const { journal } = useJournal();
  
  // Transform journal data for the chart
  const chartData = useMemo(() => {
    // Collect all trades from all weeks and sort by date
    const allTrades = journal.weeks
      .flatMap(week => 
        week.trades
          .filter(trade => trade.status === 'Done')
          .map(trade => ({
            date: trade.date instanceof Date ? trade.date : new Date(trade.date),
            value: trade.gainLossPercent
          }))
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Group trades by date and calculate daily sum
    const dailyData = allTrades.reduce((acc, trade) => {
      const dateKey = format(trade.date, 'dd/MM');
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          fullDate: trade.date,
          value: 0
        };
      }
      
      acc[dateKey].value += trade.value;
      return acc;
    }, {} as Record<string, { date: string, fullDate: Date, value: number }>);
    
    // Convert to array and ensure there's at least some data
    const result = Object.values(dailyData);
    
    // If no data, provide some sample data
    if (result.length === 0) {
      const today = new Date();
      return [
        { date: format(today, 'dd/MM'), fullDate: today, value: 0 }
      ];
    }
    
    return result;
  }, [journal]);
  
  // Calculate cumulative performance
  const cumulativeData = useMemo(() => {
    let cumulative = 0;
    
    return chartData.map(item => {
      cumulative += item.value;
      return {
        ...item,
        cumulative: parseFloat(cumulative.toFixed(2))
      };
    });
  }, [chartData]);

  return (
    <Card className="shadow-md overflow-hidden bg-gradient-to-b from-card to-card/80">
      <CardHeader className="bg-gradient-to-r from-background to-background/50 pb-2">
        <CardTitle className="text-lg font-medium text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={cumulativeData}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#94a3b8' }}
                axisLine={{ stroke: '#94a3b8' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
                tickLine={{ stroke: '#94a3b8' }}
                axisLine={{ stroke: '#94a3b8' }}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Performance']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cumulative"
                name="Cumulative P/L"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
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
