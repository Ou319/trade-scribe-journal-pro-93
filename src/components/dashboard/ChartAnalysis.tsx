
import { useState } from "react";
import { useJournal } from "@/contexts/JournalContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartLine, ChartBar, TrendingUp } from "lucide-react";

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
    <Card className="shadow-sm border-opacity-50 overflow-hidden rounded-xl bg-gradient-to-b from-card to-card/80 dark:from-gray-900 dark:to-gray-950">
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
          <TabsList className="grid w-full grid-cols-3 mb-2 rounded-lg">
            <TabsTrigger value="profitloss" className="text-xs sm:text-sm flex items-center justify-center">
              <ChartBar className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> P&L by Pair
            </TabsTrigger>
            <TabsTrigger value="daily" className="text-xs sm:text-sm flex items-center justify-center">
              <TrendingUp className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Performance
            </TabsTrigger>
            <TabsTrigger value="candlestick" className="text-xs sm:text-sm flex items-center justify-center">
              <ChartBar className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Trading View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profitloss" className="mt-2">
            {profitLossPairs.length > 0 ? (
              <div className="h-[160px] sm:h-[180px] lg:h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={profitLossPairs}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
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
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(15, 23, 42, 0.9)', 
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        fontSize: '11px',
                        padding: '8px',
                        color: '#f8fafc',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}
                      formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
                      labelFormatter={(label) => `Pair: ${label}`}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '0.7rem' }} 
                      iconSize={8}
                      iconType="circle"
                    />
                    <Bar 
                      dataKey="profit" 
                      name="Profit %" 
                      fill="#22c55e" 
                      radius={[3, 3, 0, 0]}
                      animationDuration={800}
                      maxBarSize={20}
                    />
                    <Bar 
                      dataKey="loss" 
                      name="Loss %" 
                      fill="#ef4444" 
                      radius={[3, 3, 0, 0]}
                      animationDuration={800}
                      maxBarSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No profit/loss data available yet.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="daily" className="mt-2">
            {dailyProfitLoss.length > 0 ? (
              <div className="h-[160px] sm:h-[180px] lg:h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={dailyProfitLoss}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 8 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(tick) => {
                        const date = new Date(tick);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                    />
                    <YAxis 
                      tick={{ fontSize: 9 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(15, 23, 42, 0.9)', 
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        fontSize: '11px',
                        padding: '8px',
                        color: '#f8fafc',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}
                      formatter={(value: number) => [`${value.toFixed(2)}%`, 'P/L']}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleDateString();
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      activeDot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 1 }}
                      name="Performance %"
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No daily profit/loss data available yet.
              </div>
            )}
          </TabsContent>

          <TabsContent value="candlestick" className="mt-2">
            <div className="h-[200px] sm:h-[250px] lg:h-[300px] bg-gradient-to-b from-gray-950/70 to-slate-900/90 rounded-md p-2 border border-gray-800/40">
              <div className="flex justify-between items-center mb-2 px-1 text-xs">
                <div className="text-green-400 font-mono">BTC/USD <span className="text-white/80">44,250.78</span> <span className="text-green-400">+2.34%</span></div>
                <div className="flex gap-2 text-white/70">
                  <span className="px-2 py-0.5 bg-gray-800/50 rounded text-[10px]">1H</span>
                  <span className="px-2 py-0.5 bg-blue-600/70 rounded text-[10px]">4H</span>
                  <span className="px-2 py-0.5 bg-gray-800/50 rounded text-[10px]">1D</span>
                  <span className="px-2 py-0.5 bg-gray-800/50 rounded text-[10px]">1W</span>
                </div>
              </div>

              <div className="relative h-[calc(100%-24px)] w-full">
                {/* This is a mockup of a trading chart since we don't have real candlestick data */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full relative overflow-hidden">
                    <svg viewBox="0 0 800 300" width="100%" height="100%" preserveAspectRatio="none" className="stroke-gray-600/30">
                      {/* Horizontal grid lines */}
                      <line x1="0" y1="50" x2="800" y2="50" strokeDasharray="2,2" />
                      <line x1="0" y1="100" x2="800" y2="100" strokeDasharray="2,2" />
                      <line x1="0" y1="150" x2="800" y2="150" strokeDasharray="2,2" />
                      <line x1="0" y1="200" x2="800" y2="200" strokeDasharray="2,2" />
                      <line x1="0" y1="250" x2="800" y2="250" strokeDasharray="2,2" />
                      
                      {/* Vertical grid lines */}
                      <line x1="100" y1="0" x2="100" y2="300" strokeDasharray="2,2" />
                      <line x1="200" y1="0" x2="200" y2="300" strokeDasharray="2,2" />
                      <line x1="300" y1="0" x2="300" y2="300" strokeDasharray="2,2" />
                      <line x1="400" y1="0" x2="400" y2="300" strokeDasharray="2,2" />
                      <line x1="500" y1="0" x2="500" y2="300" strokeDasharray="2,2" />
                      <line x1="600" y1="0" x2="600" y2="300" strokeDasharray="2,2" />
                      <line x1="700" y1="0" x2="700" y2="300" strokeDasharray="2,2" />

                      {/* Main chart line */}
                      <polyline 
                        points="0,200 100,180 200,210 300,150 400,165 500,120 600,100 700,140 800,80"
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="2"
                      />
                      
                      {/* Area fill under the line */}
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                      </linearGradient>
                      <path 
                        d="M0,200 L100,180 L200,210 L300,150 L400,165 L500,120 L600,100 L700,140 L800,80 L800,300 L0,300 Z" 
                        fill="url(#chartGradient)" 
                      />

                      {/* Candlesticks - simplified representation */}
                      <line x1="50" y1="175" x2="50" y2="205" stroke="#22c55e" strokeWidth="1" />
                      <rect x="45" y="185" width="10" height="15" fill="#22c55e" />
                      
                      <line x1="150" y1="170" x2="150" y2="200" stroke="#ef4444" strokeWidth="1" />
                      <rect x="145" y="180" width="10" height="20" fill="#ef4444" />
                      
                      <line x1="250" y1="190" x2="250" y2="220" stroke="#22c55e" strokeWidth="1" />
                      <rect x="245" y="200" width="10" height="15" fill="#22c55e" />
                      
                      <line x1="350" y1="140" x2="350" y2="165" stroke="#22c55e" strokeWidth="1" />
                      <rect x="345" y="145" width="10" height="10" fill="#22c55e" />
                      
                      <line x1="450" y1="150" x2="450" y2="175" stroke="#ef4444" strokeWidth="1" />
                      <rect x="445" y="160" width="10" height="15" fill="#ef4444" />
                      
                      <line x1="550" y1="110" x2="550" y2="130" stroke="#22c55e" strokeWidth="1" />
                      <rect x="545" y="115" width="10" height="10" fill="#22c55e" />
                      
                      <line x1="650" y1="90" x2="650" y2="120" stroke="#22c55e" strokeWidth="1" />
                      <rect x="645" y="100" width="10" height="15" fill="#22c55e" />
                      
                      <line x1="750" y1="120" x2="750" y2="150" stroke="#ef4444" strokeWidth="1" />
                      <rect x="745" y="130" width="10" height="15" fill="#ef4444" />
                    </svg>
                    
                    {/* Tooltip indicator */}
                    <div className="absolute top-[100px] left-[500px] pointer-events-none">
                      <div className="h-full border-l border-blue-400/50 absolute top-0 bottom-0"></div>
                      <div className="bg-blue-700/90 text-white px-2 py-1 rounded text-xs font-mono whitespace-nowrap">
                        Jun 12 | $42,850.65 | Vol: 2.4K
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Y-axis labels */}
                <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-gray-400 font-mono py-1">
                  <span>$46,000</span>
                  <span>$45,000</span>
                  <span>$44,000</span>
                  <span>$43,000</span>
                  <span>$42,000</span>
                </div>
                
                {/* X-axis labels */}
                <div className="absolute left-1 right-5 bottom-0 flex justify-between text-[9px] text-gray-400 font-mono">
                  <span>Jun&nbsp;10</span>
                  <span>Jun&nbsp;11</span>
                  <span>Jun&nbsp;12</span>
                  <span>Jun&nbsp;13</span>
                  <span>Jun&nbsp;14</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-2 pt-2 border-t border-t-border/30">
          <div className="h-[80px] sm:h-[100px]">
            {dailyProfitLoss.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={dailyProfitLoss.slice(-15)} // Show only last 15 days for clarity
                  margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                >
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 8 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(tick) => {
                      const date = new Date(tick);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 8 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.9)', 
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      fontSize: '10px',
                      padding: '6px',
                      color: '#f8fafc',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'P/L']}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString();
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Daily P/L" 
                    radius={[3, 3, 0, 0]}
                    animationDuration={800}
                    maxBarSize={10}
                    shape={(props) => {
                      const fill = props.value >= 0 ? "#22c55e" : "#ef4444";
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
              </ResponsiveContainer>
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
