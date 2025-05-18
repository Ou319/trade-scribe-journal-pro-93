
export type TradeType = 'Long' | 'Short';
export type TradeResult = 'Win' | 'Loss' | 'Breakeven';
export type TradeStatus = 'Done' | 'Pending';

export interface Trade {
  id: string;
  date: Date;
  pair: string;
  type: TradeType;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  risk: number;
  riskReward: number;
  status: TradeStatus;
  result: TradeResult | null;
  gainLossPercent: number;
  comment: string;
}

export interface Week {
  id: string;
  name: string;
  trades: Trade[];
  percentGain: number;
}

export interface TradeJournal {
  weeks: Week[];
  totalPercentGain: number;
}

export interface DashboardStats {
  totalTrades: number;
  winTrades: number;
  loseTrades: number;
  breakevenTrades: number;
  winRate: number;
  riskRewardAverage: number;
  totalProfitLossPercent: number;
}
