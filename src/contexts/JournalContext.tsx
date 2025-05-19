import React, { createContext, useContext, useEffect, useState } from 'react';
import { Trade, Week, TradeJournal, DashboardStats, TradeType, TradeResult, TradeStatus } from '@/types';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

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
  exportToPDF: () => void;
}

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
  
  // Export comprehensive report as PDF
  const exportToPDF = () => {
    try {
      // Initialize PDF document with A4 portrait format
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add header with logo and title
      pdf.setFillColor(245, 245, 245);
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 25, 'F');
      pdf.setTextColor(40, 40, 40);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('YTR - Trading Journal Report', 15, 15);
      
      // Add subtitle with date
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pdf.internal.pageSize.getWidth() - 60, 15);
      
      // Add overall statistics section
      pdf.setTextColor(40, 40, 40);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Trading Performance Summary', 15, 35);
      
      // Create stats table
      const tableColumn = ["Metric", "Value"];
      const tableRows = [
        ["Total Trades", stats.totalTrades.toString()],
        ["Win Rate", `${stats.winRate.toFixed(2)}%`],
        ["Win Trades", stats.winTrades.toString()],
        ["Loss Trades", stats.lossTrades.toString()],
        ["Breakeven Trades", stats.breakevenTrades.toString()],
        ["Total P/L", `${stats.totalProfitLossPercent.toFixed(2)}%`],
        ["Avg Risk/Reward", stats.riskRewardAverage.toFixed(2)]
      ];
      
      // @ts-ignore - autotable is added via import
      pdf.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'striped',
        headStyles: {
          fillColor: [59, 130, 246], // blue-500
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          cellPadding: 3,
          fontSize: 10
        },
        margin: { top: 30 }
      });
      
      // Add a page break after the summary
      pdf.addPage();
      
      // Add trades detail section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Trading Details by Week', 15, 15);
      
      let yPosition = 25;
      
      // Loop through each week
      journal.weeks.forEach((week, weekIndex) => {
        // Add page break if needed
        if (yPosition > pdf.internal.pageSize.getHeight() - 60) {
          pdf.addPage();
          yPosition = 15;
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text(`${week.name} (${week.percentGain.toFixed(2)}%)`, 15, yPosition);
        yPosition += 5;
        
        // Prepare trade data for this week
        if (week.trades.length > 0) {
          const tradeColumns = ["Date", "Pair", "Type", "Entry", "SL", "TP", "Status", "Result", "P/L %"];
          const tradeRows = week.trades.map(trade => [
            trade.date instanceof Date ? trade.date.toLocaleDateString() : new Date(trade.date).toLocaleDateString(),
            trade.pair,
            trade.type,
            trade.entry.toString(),
            trade.stopLoss.toString(),
            trade.takeProfit.toString(),
            trade.status,
            trade.result || "-",
            `${trade.gainLossPercent.toFixed(2)}%`
          ]);
          
          // @ts-ignore - autotable is added via import
          pdf.autoTable({
            head: [tradeColumns],
            body: tradeRows,
            startY: yPosition + 5,
            theme: 'grid',
            headStyles: {
              fillColor: [100, 116, 139], // slate-500
              textColor: [255, 255, 255],
              fontStyle: 'bold'
            },
            styles: {
              cellPadding: 2,
              fontSize: 8
            },
            margin: { top: 30, right: 15, bottom: 15, left: 15 }
          });
          
          // Update Y position after the table
          // @ts-ignore - autotable is added via import
          yPosition = pdf.previousAutoTable.finalY + 15;
        } else {
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(10);
          pdf.text("No trades recorded for this week", 20, yPosition + 10);
          yPosition += 20;
        }
        
        // Add page break between weeks if not the last week
        if (weekIndex < journal.weeks.length - 1) {
          pdf.addPage();
          yPosition = 15;
        }
      });
      
      // Try to capture the chart and add it to the PDF
      const chartElement = document.querySelector('[data-chart]') as HTMLElement;
      if (chartElement) {
        try {
          html2canvas(chartElement, { scale: 2 }).then(canvas => {
            const imgWidth = 180;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const imgData = canvas.toDataURL('image/png');
            
            pdf.addPage();
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Trading Performance Charts', 15, 15);
            
            pdf.addImage(imgData, 'PNG', 15, 25, imgWidth, imgHeight);
            
            // Save the PDF after chart is captured
            pdf.save(`YTR_Trading_Journal_${new Date().toISOString().split('T')[0]}.pdf`);
          });
        } catch (chartError) {
          console.error("Error capturing chart:", chartError);
          // Save PDF even if chart capture fails
          pdf.save(`YTR_Trading_Journal_${new Date().toISOString().split('T')[0]}.pdf`);
        }
      } else {
        // Save PDF if chart element doesn't exist
        pdf.save(`YTR_Trading_Journal_${new Date().toISOString().split('T')[0]}.pdf`);
      }
      
      toast.success("Report exported to PDF");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error("Error exporting report to PDF");
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
    exportToCSV,
    exportToPDF
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
