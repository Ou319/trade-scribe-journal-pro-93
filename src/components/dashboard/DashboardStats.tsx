
import { useJournal } from "@/contexts/JournalContext";
import StatsCard from "./StatsCard";
import { useState, useEffect } from "react";
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
  const [settings, setSettings] = useState({
    dashboardTitle: "Dashboard",
    totalTradesLabel: "Total Trades",
    winTradesLabel: "Win Trades",
    loseTradesLabel: "Lose Trades",
    breakevenLabel: "Breakeven",
    winRateLabel: "Win Rate",
    riskRewardLabel: "Risk/Reward Average",
    profitLossLabel: "Total Profit/Loss"
  });

  useEffect(() => {
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem("app-settings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({
          dashboardTitle: parsedSettings.dashboardTitle || "Dashboard",
          totalTradesLabel: parsedSettings.totalTradesLabel || "Total Trades",
          winTradesLabel: parsedSettings.winTradesLabel || "Win Trades",
          loseTradesLabel: parsedSettings.loseTradesLabel || "Lose Trades",
          breakevenLabel: parsedSettings.breakevenLabel || "Breakeven",
          winRateLabel: parsedSettings.winRateLabel || "Win Rate",
          riskRewardLabel: parsedSettings.riskRewardLabel || "Risk/Reward Average",
          profitLossLabel: parsedSettings.profitLossLabel || "Total Profit/Loss"
        });
      } catch (e) {
        console.error("Error parsing settings:", e);
      }
    }
  }, []);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;
  const formatRatio = (value: number) => value.toFixed(2);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{settings.dashboardTitle}</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label={settings.totalTradesLabel}
          value={stats.totalTrades}
          icon={<BarChart3 size={20} />}
        />
        <StatsCard
          label={settings.winTradesLabel}
          value={stats.winTrades}
          valueClass="profit-text"
          icon={<TrendingUp size={20} />}
        />
        <StatsCard
          label={settings.loseTradesLabel}
          value={stats.loseTrades}
          valueClass="loss-text"
          icon={<TrendingDown size={20} />}
        />
        <StatsCard
          label={settings.breakevenLabel}
          value={stats.breakevenTrades}
          valueClass="neutral-text"
          icon={<Minus size={20} />}
        />
        <StatsCard
          label={settings.winRateLabel}
          value={stats.winRate}
          formatValue={formatPercent}
          valueClass={stats.winRate > 50 ? "profit-text" : stats.winRate < 50 ? "loss-text" : "neutral-text"}
          icon={<BarChart size={20} />}
        />
        <StatsCard
          label={settings.riskRewardLabel}
          value={stats.riskRewardAverage}
          formatValue={formatRatio}
          valueClass={stats.riskRewardAverage > 1 ? "profit-text" : "loss-text"}
          icon={<Scale size={20} />}
        />
        <StatsCard
          label={settings.profitLossLabel}
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
