
import { useState } from "react";
import { useJournal } from "@/contexts/JournalContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Cell, ResponsiveContainer, LineChart, Line } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartPie, BarChart3, TrendingUp } from "lucide-react";

type PairAnalysis = {
  name: string;
  count: number;
  profit: number;
  loss: number;
  netResult: number;
};

type DailyProfitLoss = {
  date: string;
  value: number;
};

const ChartAnalysis = () => {
  const { journal } = useJournal();
  const [activeTab, setActiveTab] = useState("pairs");
  
  // Process data for the charts
  const pairAnalysis = processPairData(journal.weeks);
  
  // Sort pairs by frequency
  const mostActivePairs = [...pairAnalysis]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 pairs
  
  // Sort pairs by profit/loss
  const profitLossPairs = [...pairAnalysis]
    .sort((a, b) => b.netResult - a.netResult)
    .slice(0, 10); // Top 10 pairs by profit/loss
  
  // Process daily profit/loss data
  const dailyProfitLoss = processDailyProfitLoss(journal.weeks);
  
  // Colors for the charts
  const COLORS = [
    "#8B5CF6", "#D946EF", "#F97316", "#0EA5E9", "#10B981", 
    "#6366F1", "#EC4899", "#F59E0B", "#3B82F6", "#14B8A6"
  ];
  
  return (
    <Card className="shadow-md border-opacity-50 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-xl font-semibold flex items-center">
          <ChartPie className="mr-2 h-5 w-5 text-primary" /> 
          Trading Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <Tabs
          defaultValue="pairs"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pairs" className="flex items-center">
              <ChartPie className="mr-2 h-4 w-4" /> Most Active Pairs
            </TabsTrigger>
            <TabsTrigger value="profitloss" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" /> Profit & Loss by Pair
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" /> Profit/Loss by Day
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pairs" className="mt-4">
            {mostActivePairs.length > 0 ? (
              <div className="h-[350px] sm:h-[400px]">
                <ChartContainer
                  config={{
                    active: { theme: { dark: "#8B5CF6", light: "#8B5CF6" } },
                    inactive: { theme: { dark: "#6b6b6b", light: "#d4d4d4" } },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mostActivePairs}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius="80%"
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {mostActivePairs.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No trade data available. Add some trades to see the chart.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="profitloss" className="mt-4">
            {profitLossPairs.length > 0 ? (
              <div className="h-[350px] sm:h-[400px]">
                <ChartContainer
                  config={{
                    profit: { theme: { dark: "#10B981", light: "#10B981" } },
                    loss: { theme: { dark: "#F43F5E", light: "#F43F5E" } },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitLossPairs}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend wrapperStyle={{ paddingTop: 15 }} />
                      <Bar dataKey="profit" name="Profit %" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="loss" name="Loss %" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No profit/loss data available. Add some completed trades to see the chart.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="daily" className="mt-4">
            {dailyProfitLoss.length > 0 ? (
              <div className="h-[350px] sm:h-[400px]">
                <ChartContainer
                  config={{
                    value: { theme: { dark: "#3b82f6", light: "#3b82f6" } },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyProfitLoss}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent nameKey="date" />} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#3b82f6" }}
                        activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff" }}
                        name="Profit/Loss %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No daily profit/loss data available. Add some completed trades to see the chart.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Helper function to process trade data by pair
const processPairData = (weeks: any[]): PairAnalysis[] => {
  const pairData: Record<string, PairAnalysis> = {};
  
  weeks.forEach(week => {
    week.trades.forEach((trade: any) => {
      if (!trade.pair) return;
      
      if (!pairData[trade.pair]) {
        pairData[trade.pair] = {
          name: trade.pair,
          count: 0,
          profit: 0,
          loss: 0,
          netResult: 0,
        };
      }
      
      // Increment trade count for this pair
      pairData[trade.pair].count++;
      
      // Only calculate P&L for completed trades
      if (trade.status === 'Done') {
        if (trade.gainLossPercent > 0) {
          pairData[trade.pair].profit += trade.gainLossPercent;
        } else if (trade.gainLossPercent < 0) {
          pairData[trade.pair].loss += Math.abs(trade.gainLossPercent);
        }
        pairData[trade.pair].netResult += trade.gainLossPercent;
      }
    });
  });
  
  return Object.values(pairData);
};

// Helper function to process daily profit/loss data
const processDailyProfitLoss = (weeks: any[]): DailyProfitLoss[] => {
  const dailyData: Record<string, number> = {};
  
  weeks.forEach(week => {
    week.trades.forEach((trade: any) => {
      if (trade.status === 'Done' && trade.date) {
        const date = trade.date instanceof Date 
          ? trade.date.toISOString().split('T')[0] 
          : new Date(trade.date).toISOString().split('T')[0];
        
        if (!dailyData[date]) {
          dailyData[date] = 0;
        }
        
        dailyData[date] += trade.gainLossPercent;
      }
    });
  });
  
  // Convert to array format for chart
  return Object.entries(dailyData)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export default ChartAnalysis;
