
import { useState } from "react";
import { useJournal } from "@/contexts/JournalContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("profitloss");
  
  // Process data for the charts
  const pairAnalysis = processPairData(journal.weeks);
  
  // Sort pairs by profit/loss
  const profitLossPairs = [...pairAnalysis]
    .sort((a, b) => b.netResult - a.netResult)
    .slice(0, 8); // Reduced to top 8 pairs for better visibility
  
  // Process daily profit/loss data
  const dailyProfitLoss = processDailyProfitLoss(journal.weeks);
  
  return (
    <Card className="shadow-lg border-opacity-50 overflow-hidden rounded-xl bg-gradient-to-br from-white/80 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/80 backdrop-blur-sm">
      <CardHeader className="border-b pb-3 bg-gradient-to-r from-background to-background/50">
        <CardTitle className="text-xl font-medium flex items-center text-primary">
          <BarChart3 className="mr-2 h-5 w-5" /> 
          Trading Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <Tabs
          defaultValue="profitloss"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6 rounded-lg">
            <TabsTrigger value="profitloss" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" /> Profit & Loss by Pair
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" /> P/L Trend
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profitloss" className="mt-4">
            {profitLossPairs.length > 0 ? (
              <div className="h-[250px] sm:h-[280px] md:h-[300px]">
                <ChartContainer
                  config={{
                    profit: { theme: { dark: "#8B5CF6", light: "#8B5CF6" } }, // Modern purple
                    loss: { theme: { dark: "#F97316", light: "#F97316" } },   // Modern orange
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={profitLossPairs}
                      margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 10 }} 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <ChartTooltip 
                        content={<ChartTooltipContent />} 
                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: 10 }} />
                      <Bar 
                        dataKey="profit" 
                        name="Profit %" 
                        fill="#8B5CF6" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={800}
                        animationEasing="ease-in-out"
                      />
                      <Bar 
                        dataKey="loss" 
                        name="Loss %" 
                        fill="#F97316" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={800}
                        animationEasing="ease-in-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No profit/loss data available. Add some completed trades to see the chart.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="daily" className="mt-4">
            {dailyProfitLoss.length > 0 ? (
              <div className="h-[240px] sm:h-[280px] md:h-[300px]">
                <ChartContainer
                  config={{
                    value: { theme: { dark: "#0EA5E9", light: "#0EA5E9" } }, // Modern blue
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={dailyProfitLoss}
                      margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent nameKey="date" />} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#0EA5E9" 
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#0EA5E9", strokeWidth: 1, stroke: "#fff" }}
                        activeDot={{ r: 5, fill: "#0EA5E9", stroke: "#fff" }}
                        name="Profit/Loss %"
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No daily profit/loss data available. Add some completed trades to see the chart.
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t border-t-border/30">
          <h3 className="text-sm font-medium text-primary/80 mb-2">Daily P&L Summary</h3>
          <div className="h-[150px]">
            {dailyProfitLoss.length > 0 ? (
              <ChartContainer
                config={{
                  positive: { theme: { dark: "#8B5CF6", light: "#8B5CF6" } }, // Purple for positive
                  negative: { theme: { dark: "#D946EF", light: "#D946EF" } }, // Magenta for negative
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={dailyProfitLoss}
                    margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 8 }}
                      angle={-45}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis tick={{ fontSize: 9 }} />
                    <ChartTooltip content={<ChartTooltipContent nameKey="date" />} />
                    <Bar 
                      dataKey="value" 
                      name="Daily P/L" 
                      radius={[3, 3, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-in-out"
                      shape={(props) => {
                        const fill = props.value >= 0 ? "#8B5CF6" : "#D946EF";
                        return <rect 
                          x={props.x} 
                          y={props.value >= 0 ? props.y : props.y - props.height} 
                          width={props.width} 
                          height={Math.abs(props.height)} 
                          fill={fill} 
                          rx={3}
                          ry={3}
                        />
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No daily profit/loss data available.
              </div>
            )}
          </div>
        </div>
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
