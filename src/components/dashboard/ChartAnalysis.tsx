
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
import { BarChart3, ChartLine, TrendingUp } from "lucide-react";
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
    .slice(0, 6); // Top 6 pairs for better visibility on smaller screens
  
  // Process daily profit/loss data
  const dailyProfitLoss = processDailyProfitLoss(journal.weeks);
  
  return (
    <Card className="shadow-lg border-opacity-50 overflow-hidden rounded-xl backdrop-blur-sm bg-card">
      <CardHeader className="border-b pb-3 bg-gradient-to-r from-background to-background/50">
        <CardTitle className="text-lg md:text-xl font-medium flex items-center gap-2 text-primary">
          <ChartLine className="h-5 w-5" strokeWidth={2.5} /> 
          Trading Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 px-2 sm:px-4 md:px-6">
        <Tabs
          defaultValue="profitloss"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-5 rounded-lg">
            <TabsTrigger value="profitloss" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" /> P&L by Pair
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" /> P/L Trend
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profitloss" className="mt-4">
            {profitLossPairs.length > 0 ? (
              <div className="h-[220px] sm:h-[250px] md:h-[280px]">
                <ChartContainer
                  config={{
                    profit: { theme: { dark: "#9b87f5", light: "#9b87f5" } }, // Modern purple
                    loss: { theme: { dark: "#F97316", light: "#F97316" } },   // Modern orange
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={profitLossPairs}
                      margin={{ top: 5, right: 5, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.07)" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 9 }} 
                        angle={-45}
                        textAnchor="end"
                        height={50}
                        tickMargin={5}
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
                        wrapperStyle={{ paddingTop: 10, fontSize: '0.75rem' }} 
                        iconSize={8}
                        iconType="circle"
                      />
                      <Bar 
                        dataKey="profit" 
                        name="Profit %" 
                        fill="#9b87f5" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={800}
                        animationEasing="ease-in-out"
                        maxBarSize={25}
                      />
                      <Bar 
                        dataKey="loss" 
                        name="Loss %" 
                        fill="#F97316" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={800}
                        animationEasing="ease-in-out"
                        maxBarSize={25}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No profit/loss data available yet.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="daily" className="mt-4">
            {dailyProfitLoss.length > 0 ? (
              <div className="h-[220px] sm:h-[250px] md:h-[280px]">
                <ChartContainer
                  config={{
                    value: { theme: { dark: "#0EA5E9", light: "#0EA5E9" } }, // Modern blue
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={dailyProfitLoss}
                      margin={{ top: 5, right: 5, left: -20, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.07)" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 9 }}
                        angle={-45}
                        textAnchor="end"
                        height={50}
                        tickMargin={5}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 9 }} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(255, 255, 255, 0.9)', 
                          border: '1px solid #eee',
                          borderRadius: '6px',
                          fontSize: '12px',
                          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value: number) => [`${value.toFixed(2)}%`, 'P/L']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#0EA5E9" 
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        dot={{ r: 3, fill: "#0EA5E9", strokeWidth: 1, stroke: "#fff" }}
                        activeDot={{ r: 5, fill: "#0EA5E9", stroke: "#fff", strokeWidth: 1 }}
                        name="Profit/Loss %"
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No daily profit/loss data available yet.
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-5 pt-4 border-t border-t-border/30">
          <h3 className="text-sm font-medium text-primary/80 mb-2 pl-1">Daily P&L Summary</h3>
          <div className="h-[140px]">
            {dailyProfitLoss.length > 0 ? (
              <ChartContainer
                config={{
                  positive: { theme: { dark: "#9b87f5", light: "#9b87f5" } },
                  negative: { theme: { dark: "#F97316", light: "#F97316" } },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={dailyProfitLoss}
                    margin={{ top: 5, right: 5, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 8 }}
                      angle={-45}
                      textAnchor="end"
                      height={40}
                      tickMargin={5}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 8 }} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(255, 255, 255, 0.9)', 
                        border: '1px solid #eee', 
                        borderRadius: '6px',
                        fontSize: '11px' 
                      }}
                      formatter={(value: number) => [`${value.toFixed(2)}%`, 'P/L']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar 
                      dataKey="value" 
                      name="Daily P/L" 
                      radius={[3, 3, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-in-out"
                      maxBarSize={16}
                      shape={(props) => {
                        const fill = props.value >= 0 ? "#9b87f5" : "#F97316";
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
              <div className="text-center py-6 text-muted-foreground text-sm">
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
