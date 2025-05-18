
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Trade, Week, TradeJournal, DashboardStats, TradeType, TradeResult, TradeStatus } from '@/types';
import { toast } from 'sonner';

interface JournalContextType {
  journal: TradeJournal;
  stats: DashboardStats;
  currentWeekId: string | null;
  setCurrentWeekId: (id: string | null) => void;
  addWeek: (name: string) => void;
  updateWeek: (id: string, data: Partial<Week>) => void;
  deleteWeek: (id: string) => void;
  addTrade: (weekId: string, trade: Omit<Trade, 'id'>) => void;
  updateTrade: (weekId: string, tradeId: string, data: Partial<Trade>) => void;
  deleteTrade: (weekId: string, tradeId: string) => void;
  calculateStats: () => DashboardStats;
  exportToCSV: () => void;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

// Generate a simple ID for our entities
const generateId = () => Math.random().toString(36).substring(2, 11);

// Default journal with one empty week
const defaultJournal: TradeJournal = {
  weeks: [
    {
      id: generateId(),
      name: 'Week 1',
      trades: [],
      percentGain: 0,
    },
  ],
  totalPercentGain: 0,
};

// Default stats
const defaultStats: DashboardStats = {
  totalTrades: 0,
  winTrades: 0,
  loseTrades: 0,
  breakevenTrades: 0,
  winRate: 0,
  riskRewardAverage: 0,
  totalProfitLossPercent: 0,
};

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [journal, setJournal] = useState<TradeJournal>(defaultJournal);
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [currentWeekId, setCurrentWeekId] = useState<string | null>(defaultJournal.weeks[0].id);

  // Load journal data from localStorage on component mount
  useEffect(() => {
    const savedJournal = localStorage.getItem('tradeJournal');
    if (savedJournal) {
      try {
        const parsedJournal = JSON.parse(savedJournal);
        
        // Convert string dates back to Date objects
        parsedJournal.weeks.forEach((week: Week) => {
          week.trades.forEach((trade: Trade) => {
            if (trade.date) {
              trade.date = new Date(trade.date);
            }
          });
        });
        
        setJournal(parsedJournal);
        
        // If there are weeks, set the current week to the first one
        if (parsedJournal.weeks.length > 0) {
          setCurrentWeekId(parsedJournal.weeks[0].id);
        }
        
        // Calculate stats
        setStats(calculateStats(parsedJournal));
      } catch (error) {
        console.error("Error loading journal data:", error);
        toast.error("Error loading saved journal data");
      }
    }
  }, []);

  // Save journal data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tradeJournal', JSON.stringify(journal));
    setStats(calculateStats(journal));
  }, [journal]);

  // Calculate dashboard statistics
  const calculateStats = (currentJournal: TradeJournal = journal): DashboardStats => {
    let totalTrades = 0;
    let winTrades = 0;
    let loseTrades = 0;
    let breakevenTrades = 0;
    let totalRiskReward = 0;
    let totalProfitLossPercent = 0;
    
    currentJournal.weeks.forEach(week => {
      week.trades.forEach(trade => {
        if (trade.status === 'Done') {
          totalTrades++;
          
          if (trade.result === 'Win') {
            winTrades++;
          } else if (trade.result === 'Loss') {
            loseTrades++;
          } else if (trade.result === 'Breakeven') {
            breakevenTrades++;
          }
          
          totalRiskReward += trade.riskReward;
          totalProfitLossPercent += trade.gainLossPercent;
        }
      });
    });
    
    const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;
    const riskRewardAverage = totalTrades > 0 ? totalRiskReward / totalTrades : 0;
    
    return {
      totalTrades,
      winTrades,
      loseTrades,
      breakevenTrades,
      winRate,
      riskRewardAverage,
      totalProfitLossPercent
    };
  };

  // Calculate the percentage gain for a week
  const calculateWeekPercentGain = (trades: Trade[]): number => {
    return trades
      .filter(trade => trade.status === 'Done')
      .reduce((total, trade) => total + trade.gainLossPercent, 0);
  };

  // Calculate the total percentage gain across all weeks
  const calculateTotalPercentGain = (weeks: Week[]): number => {
    return weeks.reduce((total, week) => total + week.percentGain, 0);
  };

  // Add a new week
  const addWeek = (name: string) => {
    const newWeek: Week = {
      id: generateId(),
      name,
      trades: [],
      percentGain: 0,
    };
    
    setJournal(prev => {
      const updatedWeeks = [...prev.weeks, newWeek];
      return {
        ...prev,
        weeks: updatedWeeks,
        totalPercentGain: calculateTotalPercentGain(updatedWeeks),
      };
    });
    
    setCurrentWeekId(newWeek.id);
    toast.success(`Week "${name}" added`);
  };

  // Update a week
  const updateWeek = (id: string, data: Partial<Week>) => {
    setJournal(prev => {
      const updatedWeeks = prev.weeks.map(week => {
        if (week.id === id) {
          return { ...week, ...data };
        }
        return week;
      });
      
      return {
        ...prev,
        weeks: updatedWeeks,
        totalPercentGain: calculateTotalPercentGain(updatedWeeks),
      };
    });
  };

  // Delete a week
  const deleteWeek = (id: string) => {
    setJournal(prev => {
      const weekToDelete = prev.weeks.find(w => w.id === id);
      const updatedWeeks = prev.weeks.filter(week => week.id !== id);
      
      // If the deleted week was the current week, set to the first available week or null
      if (currentWeekId === id) {
        setCurrentWeekId(updatedWeeks.length > 0 ? updatedWeeks[0].id : null);
      }
      
      toast.success(`Week "${weekToDelete?.name || 'Unknown'}" deleted`);
      
      return {
        ...prev,
        weeks: updatedWeeks,
        totalPercentGain: calculateTotalPercentGain(updatedWeeks),
      };
    });
  };

  // Add a new trade to a week
  const addTrade = (weekId: string, trade: Omit<Trade, 'id'>) => {
    const newTrade: Trade = {
      ...trade,
      id: generateId(),
    };
    
    setJournal(prev => {
      const updatedWeeks = prev.weeks.map(week => {
        if (week.id === weekId) {
          const updatedTrades = [...week.trades, newTrade];
          return {
            ...week,
            trades: updatedTrades,
            percentGain: calculateWeekPercentGain(updatedTrades),
          };
        }
        return week;
      });
      
      return {
        ...prev,
        weeks: updatedWeeks,
        totalPercentGain: calculateTotalPercentGain(updatedWeeks),
      };
    });
    
    toast.success(`Trade added for ${trade.pair}`);
  };

  // Update a trade
  const updateTrade = (weekId: string, tradeId: string, data: Partial<Trade>) => {
    setJournal(prev => {
      const updatedWeeks = prev.weeks.map(week => {
        if (week.id === weekId) {
          const updatedTrades = week.trades.map(trade => {
            if (trade.id === tradeId) {
              return { ...trade, ...data };
            }
            return trade;
          });
          
          return {
            ...week,
            trades: updatedTrades,
            percentGain: calculateWeekPercentGain(updatedTrades),
          };
        }
        return week;
      });
      
      return {
        ...prev,
        weeks: updatedWeeks,
        totalPercentGain: calculateTotalPercentGain(updatedWeeks),
      };
    });
  };

  // Delete a trade
  const deleteTrade = (weekId: string, tradeId: string) => {
    setJournal(prev => {
      const updatedWeeks = prev.weeks.map(week => {
        if (week.id === weekId) {
          const updatedTrades = week.trades.filter(trade => trade.id !== tradeId);
          
          return {
            ...week,
            trades: updatedTrades,
            percentGain: calculateWeekPercentGain(updatedTrades),
          };
        }
        return week;
      });
      
      return {
        ...prev,
        weeks: updatedWeeks,
        totalPercentGain: calculateTotalPercentGain(updatedWeeks),
      };
    });
    
    toast.success("Trade deleted");
  };

  // Export journal data to CSV
  const exportToCSV = () => {
    try {
      // Create CSV header
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Week,Date,Pair,Type,Entry,Stop Loss,Take Profit,Risk %,Risk/Reward,Status,Result,Gain/Loss %,Comment\n";
      
      // Add all trades
      journal.weeks.forEach(week => {
        week.trades.forEach(trade => {
          const date = trade.date instanceof Date ? trade.date.toISOString().split('T')[0] : '';
          const row = [
            week.name,
            date,
            trade.pair,
            trade.type,
            trade.entry,
            trade.stopLoss,
            trade.takeProfit,
            trade.risk,
            trade.riskReward,
            trade.status,
            trade.result || '',
            trade.gainLossPercent,
            `"${trade.comment.replace(/"/g, '""')}"` // Escape quotes in comments
          ].join(',');
          
          csvContent += row + '\n';
        });
      });
      
      // Create download link and trigger click
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `YTR_Trading_Journal_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Journal exported to CSV");
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast.error("Error exporting journal data");
    }
  };

  const contextValue: JournalContextType = {
    journal,
    stats,
    currentWeekId,
    setCurrentWeekId,
    addWeek,
    updateWeek,
    deleteWeek,
    addTrade,
    updateTrade,
    deleteTrade,
    calculateStats,
    exportToCSV
  };

  return <JournalContext.Provider value={contextValue}>{children}</JournalContext.Provider>;
};

export const useJournal = (): JournalContextType => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};
