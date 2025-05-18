
import { useState } from "react";
import { useJournal } from "@/contexts/JournalContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Cell, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PairAnalysis = {
  name: string;
  count: number;
  profit: number;
  loss: number;
  netResult: number;
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
  
  // Colors for the charts
  const COLORS = [
    "#8B5CF6", "#D946EF", "#F97316", "#0EA5E9", "#10B981", 
    "#6366F1", "#EC4899", "#F59E0B", "#3B82F6", "#14B8A6"
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="pairs"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pairs">Most Active Pairs</TabsTrigger>
            <TabsTrigger value="profitloss">Profit & Loss by Pair</TabsTrigger>
          </TabsList>
          <TabsContent value="pairs" className="mt-4">
            {mostActivePairs.length > 0 ? (
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    active: { theme: { dark: "#8B5CF6", light: "#8B5CF6" } },
                    inactive: { theme: { dark: "#6b6b6b", light: "#d4d4d4" } },
                  }}
                >
                  <PieChart>
                    <Pie
                      data={mostActivePairs}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
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
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    profit: { theme: { dark: "#10B981", light: "#10B981" } },
                    loss: { theme: { dark: "#F43F5E", light: "#F43F5E" } },
                  }}
                >
                  <BarChart data={profitLossPairs}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="profit" name="Profit %" fill="#10B981" />
                    <Bar dataKey="loss" name="Loss %" fill="#F43F5E" />
                  </BarChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No profit/loss data available. Add some completed trades to see the chart.
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

export default ChartAnalysis;
