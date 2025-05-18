import { useState } from "react";
import { useJournal } from "@/contexts/JournalContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartBar, ChartLine, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

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
    .slice(0, 5); // Top 5 pairs for better visibility
  
  // Process daily profit/loss data
  const dailyProfitLoss = processDailyProfitLoss(journal.weeks);
  
  return (
    <Card className="shadow-sm border-opacity-50 overflow-hidden rounded-xl bg-card">
      <CardHeader className="border-b pb-3 bg-gradient-to-r from-background to-background/50">
        <CardTitle className="text-base md:text-lg font-medium flex items-center gap-2 text-primary">
          <ChartLine className="h-5 w-5" strokeWidth={2.5} /> 
          Trading Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <Tabs
          defaultValue="profitloss"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-2 rounded-lg">
            <TabsTrigger value="profitloss" className="text-xs sm:text-sm flex items-center justify-center">
              <ChartBar className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> P&L by Pair
            </TabsTrigger>
            <TabsTrigger value="daily" className="text-xs sm:text-sm flex items-center justify-center">
              <TrendingUp className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Performance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profitloss" className="mt-3">
            {profitLossPairs.length > 0 ? (
              <div className="h-[180px] sm:h-[200px] md:h-[230px]">
                <ChartContainer
                  config={{
                    profit: { theme: { dark: "#6E59A5", light: "#6E59A5" } }, // Modern purple
                    loss: { theme: { dark: "#F97316", light: "#F97316" } },   // Modern orange
                  }}
                >
                  <BarChart 
                    data={profitLossPairs}
                    margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 9 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 9 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />} 
                      cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '0.7rem' }} 
                      iconSize={8}
                      iconType="circle"
                    />
                    <Bar 
                      dataKey="profit" 
                      name="Profit %" 
                      fill="#6E59A5" 
                      radius={[3, 3, 0, 0]}
                      animationDuration={800}
                      maxBarSize={20}
                    />
                    <Bar 
                      dataKey="loss" 
                      name="Loss %" 
                      fill="#F97316" 
                      radius={[3, 3, 0, 0]}
                      animationDuration={800}
                      maxBarSize={20}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No profit/loss data available yet.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="daily" className="mt-3">
            {dailyProfitLoss.length > 0 ? (
              <div className="h-[180px] sm:h-[200px] md:h-[230px]">
                <ChartContainer
                  config={{
                    value: { theme: { dark: "#0EA5E9", light: "#0EA5E9" } }, // Modern blue
                  }}
                >
                  <LineChart 
                    data={dailyProfitLoss}
                    margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 8 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 9 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(255, 255, 255, 0.98)', 
                        border: '1px solid #eee',
                        borderRadius: '6px',
                        fontSize: '11px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: number) => [`${value.toFixed(2)}%`, 'P/L']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#0EA5E9" 
                      strokeWidth={2}
                      dot={{ r: 2, fill: "#0EA5E9", strokeWidth: 1, stroke: "#fff" }}
                      activeDot={{ r: 4, fill: "#0EA5E9", stroke: "#fff", strokeWidth: 1 }}
                      name="Performance %"
                      animationDuration={1000}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No daily profit/loss data available yet.
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-2 pt-2 border-t border-t-border/30">
          <div className="h-[100px] sm:h-[120px]">
            {dailyProfitLoss.length > 0 ? (
              <ChartContainer
                config={{
                  positive: { theme: { dark: "#6E59A5", light: "#6E59A5" } },
                  negative: { theme: { dark: "#F97316", light: "#F97316" } },
                }}
              >
                <BarChart 
                  data={dailyProfitLoss.slice(-15)} // Show only last 15 days for clarity
                  margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
                >
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 8 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 8 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.98)', 
                      border: '1px solid #eee', 
                      borderRadius: '6px',
                      fontSize: '10px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'P/L']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Daily P/L" 
                    radius={[3, 3, 0, 0]}
                    animationDuration={800}
                    maxBarSize={12}
                    shape={(props) => {
                      const fill = props.value >= 0 ? "#6E59A5" : "#F97316";
                      return <rect 
                        x={props.x} 
                        y={props.value >= 0 ? props.y : props.y - props.height} 
                        width={props.width} 
                        height={Math.abs(props.height)} 
                        fill={fill} 
                        rx={2}
                        ry={2}
                      />
                    }}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-xs">
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
