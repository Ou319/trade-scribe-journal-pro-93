
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
    .slice(0, 10); // Top 10 pairs by profit/loss
  
  // Process daily profit/loss data
  const dailyProfitLoss = processDailyProfitLoss(journal.weeks);
  
  return (
    <Card className="shadow-md border-opacity-50 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-xl font-semibold flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-primary" /> 
          Trading Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <Tabs
          defaultValue="profitloss"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="profitloss" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" /> Profit & Loss by Pair
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" /> Profit/Loss by Day
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profitloss" className="mt-4">
            {profitLossPairs.length > 0 ? (
              <div className="h-[300px] sm:h-[350px] md:h-[400px]">
                <ChartContainer
                  config={{
                    profit: { theme: { dark: "#10B981", light: "#10B981" } },
                    loss: { theme: { dark: "#F43F5E", light: "#F43F5E" } },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={profitLossPairs}
                      margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 10 }} 
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
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
              <div className="h-[300px] sm:h-[350px] md:h-[400px]">
                <ChartContainer
                  config={{
                    value: { theme: { dark: "#3b82f6", light: "#3b82f6" } },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={dailyProfitLoss}
                      margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent nameKey="date" />} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#3b82f6" }}
                        activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff" }}
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

        <div className="mt-6 pt-4 border-t">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Total Profit/Loss by Day</h3>
          <div className="h-[180px] sm:h-[200px]">
            {dailyProfitLoss.length > 0 ? (
              <ChartContainer
                config={{
                  value: { theme: { dark: "#10B981", light: "#10B981" } },
                  negative: { theme: { dark: "#F43F5E", light: "#F43F5E" } },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={dailyProfitLoss}
                    margin={{ top: 5, right: 5, left: 0, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 9 }}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fontSize: 9 }} />
                    <ChartTooltip content={<ChartTooltipContent nameKey="date" />} />
                    <Bar 
                      dataKey="value" 
                      name="Daily P/L" 
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={1000}
                      shape={(props) => {
                        // Determine color based on value
                        const fill = props.value >= 0 ? "#10B981" : "#F43F5E";
                        return <rect 
                          x={props.x} 
                          y={props.value >= 0 ? props.y : props.y - props.height} 
                          width={props.width} 
                          height={Math.abs(props.height)} 
                          fill={fill} 
                          radius={[4, 4, 0, 0]}
                        />
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
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
