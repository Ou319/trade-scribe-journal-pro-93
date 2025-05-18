
import { useJournal } from "@/contexts/JournalContext";
import StatsCard from "./StatsCard";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart,
  Scale,
  Percent,
} from "lucide-react";

const DashboardStats = () => {
  const { stats } = useJournal();

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;
  const formatRatio = (value: number) => value.toFixed(2);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Trades"
          value={stats.totalTrades}
          icon={<BarChart3 size={20} />}
        />
        <StatsCard
          label="Win Trades"
          value={stats.winTrades}
          valueClass="profit-text"
          icon={<TrendingUp size={20} />}
        />
        <StatsCard
          label="Lose Trades"
          value={stats.loseTrades}
          valueClass="loss-text"
          icon={<TrendingDown size={20} />}
        />
        <StatsCard
          label="Breakeven"
          value={stats.breakevenTrades}
          valueClass="neutral-text"
          icon={<Minus size={20} />}
        />
        <StatsCard
          label="Win Rate"
          value={stats.winRate}
          formatValue={formatPercent}
          valueClass={stats.winRate > 50 ? "profit-text" : stats.winRate < 50 ? "loss-text" : "neutral-text"}
          icon={<BarChart size={20} />}
        />
        <StatsCard
          label="Risk/Reward Average"
          value={stats.riskRewardAverage}
          formatValue={formatRatio}
          valueClass={stats.riskRewardAverage > 1 ? "profit-text" : "loss-text"}
          icon={<Scale size={20} />}
        />
        <StatsCard
          label="Total Profit/Loss"
          value={stats.totalProfitLossPercent}
          formatValue={formatPercent}
          valueClass={stats.totalProfitLossPercent > 0 ? "profit-text" : stats.totalProfitLossPercent < 0 ? "loss-text" : "neutral-text"}
          icon={<Percent size={20} />}
        />
      </div>
    </div>
  );
};

export default DashboardStats;
