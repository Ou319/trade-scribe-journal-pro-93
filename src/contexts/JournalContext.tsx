
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Trade, Week, TradeJournal, DashboardStats, TradeType, TradeResult, TradeStatus } from '@/types';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { jsPDF as jsPDFType } from 'jspdf';
import html2canvas from 'html2canvas';

// Define a type that includes autoTable method
interface jsPDFWithAutoTable extends jsPDFType {
  autoTable: any;
  previousAutoTable?: { finalY?: number };
}

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

// Create the context
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
  
  // Export comprehensive report as PDF - enhanced version
  const exportToPDF = () => {
    try {
      // Initialize PDF document with A4 portrait format
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      }) as jsPDFWithAutoTable;
      
      // Load the autoTable plugin
      import('jspdf-autotable').then(async ({ default: autoTable }) => {
        // Cover page
        pdf.setFillColor(245, 245, 245);
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
        
        // Add title
        pdf.setTextColor(40, 40, 40);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('YTR Trading Journal', pdf.internal.pageSize.getWidth() / 2, 50, { align: 'center' });
        
        // Add date
        pdf.setFontSize(14);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Comprehensive Report: ${new Date().toLocaleDateString()}`, 
                 pdf.internal.pageSize.getWidth() / 2, 65, { align: 'center' });
        
        // Add total P/L info
        pdf.setFontSize(18);
        pdf.setTextColor(stats.totalProfitLossPercent >= 0 ? 0 : 255, 
                         stats.totalProfitLossPercent >= 0 ? 150 : 0, 0);
        pdf.text(`Total P/L: ${stats.totalProfitLossPercent.toFixed(2)}%`, 
                 pdf.internal.pageSize.getWidth() / 2, 85, { align: 'center' });
        
        // Add page break after cover
        pdf.addPage();
        
        // Table of contents
        pdf.setTextColor(40, 40, 40);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Table of Contents', 15, 20);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        let pageNum = 2;
        pdf.text(`1. Trading Performance Summary .......................... Page ${pageNum}`, 20, 35);
        pageNum++;
        pdf.text(`2. Trading Statistics ......................................... Page ${pageNum}`, 20, 45);
        pageNum++;
        pdf.text(`3. Weekly Performance Details .......................... Page ${pageNum}`, 20, 55);
        pageNum += journal.weeks.length;
        pdf.text(`4. Individual Trade Analysis .............................. Page ${pageNum}`, 20, 65);
        
        // Add page break after TOC
        pdf.addPage();
        
        // Trading Performance Summary
        pdf.setTextColor(40, 40, 40);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Trading Performance Summary', 15, 20);
        
        // Create summary table
        const summaryColumns = ["Metric", "Value"];
        const summaryRows = [
          ["Total Trades", stats.totalTrades.toString()],
          ["Win Rate", `${stats.winRate.toFixed(2)}%`],
          ["Win Trades", stats.winTrades.toString()],
          ["Loss Trades", stats.loseTrades.toString()],
          ["Breakeven Trades", stats.breakevenTrades.toString()],
          ["Total P/L", `${stats.totalProfitLossPercent.toFixed(2)}%`],
          ["Avg Risk/Reward", stats.riskRewardAverage.toFixed(2)]
        ];
        
        autoTable(pdf, {
          head: [summaryColumns],
          body: summaryRows,
          startY: 30,
          theme: 'grid',
          headStyles: {
            fillColor: [59, 130, 246], // blue-500
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          styles: {
            cellPadding: 5,
            fontSize: 10
          },
          margin: { top: 30 }
        });
        
        // Add page break after summary
        pdf.addPage();
        
        // Trading Statistics with more details
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Trading Statistics', 15, 20);
        
        // Add more detailed statistics
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        
        // Calculate additional statistics
        const longTrades = journal.weeks.flatMap(w => 
          w.trades.filter(t => t.status === 'Done' && t.type === 'Long'));
        const shortTrades = journal.weeks.flatMap(w => 
          w.trades.filter(t => t.status === 'Done' && t.type === 'Short'));
        
        const longWins = longTrades.filter(t => t.result === 'Win').length;
        const longLosses = longTrades.filter(t => t.result === 'Loss').length;
        const shortWins = shortTrades.filter(t => t.result === 'Win').length;
        const shortLosses = shortTrades.filter(t => t.result === 'Loss').length;
        
        const longWinRate = longTrades.length > 0 ? (longWins / longTrades.length * 100).toFixed(2) : '0.00';
        const shortWinRate = shortTrades.length > 0 ? (shortWins / shortTrades.length * 100).toFixed(2) : '0.00';
        
        const advancedStats = [
          ["Total Long Trades", longTrades.length.toString(), "Total Short Trades", shortTrades.length.toString()],
          ["Long Win Rate", `${longWinRate}%`, "Short Win Rate", `${shortWinRate}%`],
          ["Long Wins", longWins.toString(), "Short Wins", shortWins.toString()],
          ["Long Losses", longLosses.toString(), "Short Losses", shortLosses.toString()]
        ];
        
        autoTable(pdf, {
          body: advancedStats,
          startY: 30,
          theme: 'plain',
          styles: {
            cellPadding: 5,
            fontSize: 10
          }
        });
        
        // Draw mock charts - this would be replaced with actual chart data in a real implementation
        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(240, 240, 240);
        pdf.roundedRect(15, 70, 85, 60, 3, 3, 'FD');
        pdf.setFontSize(10);
        pdf.text('Win/Loss Distribution', 57.5, 75, { align: 'center' });
        
        // Draw mock win/loss bars
        const winHeight = 30 * (stats.winRate / 100);
        const lossHeight = 30 * ((100 - stats.winRate) / 100);
        pdf.setFillColor(75, 192, 192);
        pdf.rect(40, 100 - winHeight, 15, winHeight, 'F');
        pdf.setFillColor(255, 99, 132);
        pdf.rect(60, 100 - lossHeight, 15, lossHeight, 'F');
        
        // Legend
        pdf.setFillColor(75, 192, 192);
        pdf.rect(25, 110, 5, 5, 'F');
        pdf.setFillColor(255, 99, 132);
        pdf.rect(65, 110, 5, 5, 'F');
        pdf.setFontSize(8);
        pdf.text('Win', 32, 114);
        pdf.text('Loss', 72, 114);
        
        // Second chart - type distribution
        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(240, 240, 240);
        pdf.roundedRect(110, 70, 85, 60, 3, 3, 'FD');
        pdf.setFontSize(10);
        pdf.text('Trade Type Distribution', 152.5, 75, { align: 'center' });
        
        // Draw mock pie sections for long/short
        const longPct = longTrades.length / (longTrades.length + shortTrades.length) || 0;
        pdf.setFillColor(54, 162, 235);
        pdf.ellipse(152.5, 100, 20, 20, 'F');
        pdf.setFillColor(255, 206, 86);
        pdf.setDrawColor(240, 240, 240);
        pdf.arc(152.5, 100, 20, 20, 0, longPct * 2 * Math.PI, 'F');
        
        // Legend
        pdf.setFillColor(54, 162, 235);
        pdf.rect(125, 110, 5, 5, 'F');
        pdf.setFillColor(255, 206, 86);
        pdf.rect(165, 110, 5, 5, 'F');
        pdf.setFontSize(8);
        pdf.text('Long', 132, 114);
        pdf.text('Short', 172, 114);
        
        // Add page break after statistics
        pdf.addPage();
        
        // Weekly Performance Details Section
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Weekly Performance Details', 15, 20);
        
        let yPosition = 30;
        
        // Loop through each week
        journal.weeks.forEach((week, weekIndex) => {
          // Add new page if needed
          if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
            pdf.addPage();
            yPosition = 20;
          }
          
          // Week header with performance indicator
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          
          // Set color based on performance
          const weekPerformance = week.percentGain;
          if (weekPerformance > 0) {
            pdf.setTextColor(0, 150, 0); // green for profit
          } else if (weekPerformance < 0) {
            pdf.setTextColor(200, 0, 0); // red for loss
          } else {
            pdf.setTextColor(100, 100, 100); // gray for breakeven
          }
          
          pdf.text(`${week.name}: ${week.percentGain.toFixed(2)}%`, 15, yPosition);
          pdf.setTextColor(40, 40, 40); // reset text color
          
          yPosition += 10;
          
          // Add week summary table
          const weekTrades = week.trades.filter(t => t.status === 'Done');
          const weekWins = weekTrades.filter(t => t.result === 'Win').length;
          const weekLosses = weekTrades.filter(t => t.result === 'Loss').length;
          const weekWinRate = weekTrades.length > 0 ? (weekWins / weekTrades.length * 100).toFixed(2) : '0.00';
          
          const weekSummaryData = [
            ["Total Trades", weekTrades.length.toString()],
            ["Win Rate", `${weekWinRate}%`],
            ["Win/Loss", `${weekWins}/${weekLosses}`],
            ["P/L", `${week.percentGain.toFixed(2)}%`]
          ];
          
          autoTable(pdf, {
            body: weekSummaryData,
            startY: yPosition,
            theme: 'plain',
            styles: {
              cellPadding: 2,
              fontSize: 8
            },
            columnStyles: {
              0: { fontStyle: 'bold' }
            },
            margin: { left: 20 }
          });
          
          // Get table end position
          yPosition = pdf.previousAutoTable?.finalY ? pdf.previousAutoTable.finalY + 10 : yPosition + 25;
          
          // Weekly trades summary if there are trades
          if (week.trades.length > 0) {
            // Prepare simplified trade data
            const tradeColumns = ["Pair", "Type", "Result", "P/L %"];
            const tradeRows = week.trades
              .filter(t => t.status === 'Done')
              .map(trade => [
                trade.pair,
                trade.type,
                trade.result || "-",
                `${trade.gainLossPercent.toFixed(2)}%`
              ]);
            
            // Only add table if we have completed trades
            if (tradeRows.length > 0) {
              autoTable(pdf, {
                head: [tradeColumns],
                body: tradeRows,
                startY: yPosition,
                theme: 'striped',
                headStyles: {
                  fillColor: [100, 116, 139], // slate-500
                  textColor: [255, 255, 255],
                  fontStyle: 'bold'
                },
                styles: {
                  cellPadding: 2,
                  fontSize: 8
                },
                margin: { left: 20, right: 20 }
              });
              
              // Update Y position for next content
              yPosition = pdf.previousAutoTable?.finalY ? pdf.previousAutoTable.finalY + 15 : yPosition + 40;
            }
          } else {
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(10);
            pdf.text("No trades recorded for this week", 20, yPosition);
            yPosition += 15;
          }
          
          // Add page break between weeks (except the last one)
          if (weekIndex < journal.weeks.length - 1) {
            pdf.addPage();
            yPosition = 20;
          }
        });
        
        // Add page break before individual trade analysis
        pdf.addPage();
        
        // Individual Trade Analysis
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Individual Trade Analysis', 15, 20);
        
        yPosition = 30;
        
        // Get all completed trades across all weeks
        const allTrades = journal.weeks.flatMap(week => 
          week.trades.filter(t => t.status === 'Done').map(trade => ({
            ...trade,
            weekName: week.name
          }))
        );
        
        // Sort trades by date (newest first)
        allTrades.sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date);
          const dateB = b.date instanceof Date ? b.date : new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        
        // Display detailed information for each trade
        allTrades.forEach((trade, index) => {
          // Add new page if needed
          if (yPosition > pdf.internal.pageSize.getHeight() - 70) {
            pdf.addPage();
            yPosition = 20;
          }
          
          // Trade header with color based on result
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          
          if (trade.result === 'Win') {
            pdf.setTextColor(0, 150, 0);
          } else if (trade.result === 'Loss') {
            pdf.setTextColor(200, 0, 0);
          } else {
            pdf.setTextColor(100, 100, 100);
          }
          
          const tradeDate = trade.date instanceof Date ? 
            trade.date.toLocaleDateString() : 
            new Date(trade.date).toLocaleDateString();
            
          pdf.text(`Trade #${index + 1}: ${trade.pair} (${tradeDate})`, 15, yPosition);
          pdf.setTextColor(40, 40, 40); // reset text color
          
          yPosition += 8;
          
          // Trade details
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          
          const tradeDetails = [
            [`Week: ${(trade as any).weekName}`, `Type: ${trade.type}`, `Result: ${trade.result || 'N/A'}`],
            [`Entry: ${trade.entry}`, `Stop Loss: ${trade.stopLoss}`, `Take Profit: ${trade.takeProfit}`],
            [`Risk %: ${trade.risk}%`, `Risk/Reward: ${trade.riskReward.toFixed(2)}`, `P/L: ${trade.gainLossPercent.toFixed(2)}%`]
          ];
          
          autoTable(pdf, {
            body: tradeDetails,
            startY: yPosition,
            theme: 'plain',
            styles: {
              cellPadding: 2,
              fontSize: 8
            },
            margin: { left: 20, right: 20 }
          });
          
          // Update Y position
          yPosition = pdf.previousAutoTable?.finalY ? pdf.previousAutoTable.finalY + 5 : yPosition + 20;
          
          // Add trade comments if any
          if (trade.comment) {
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'italic');
            pdf.text("Comments:", 20, yPosition);
            
            // Wrap comments text to fit the page width
            const splitComment = pdf.splitTextToSize(trade.comment, 170);
            pdf.text(splitComment, 20, yPosition + 5);
            
            // Update position based on comment length
            yPosition += 5 + (splitComment.length * 3.5);
          }
          
          // Add trade separator
          pdf.setDrawColor(200, 200, 200);
          pdf.line(15, yPosition + 5, 195, yPosition + 5);
          yPosition += 15;
        });
        
        // Add final page with conclusions
        pdf.addPage();
        pdf.setTextColor(40, 40, 40);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Trading Journal Summary', 15, 20);
        
        // Add some trading insights
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        const totalTrades = stats.totalTrades;
        const winRate = stats.winRate;
        
        let insights = "Performance Insights:\n\n";
        
        if (totalTrades > 0) {
          insights += `Your overall win rate is ${winRate.toFixed(2)}% across ${totalTrades} trades.\n\n`;
          
          if (winRate > 60) {
            insights += "You have a strong win rate above 60%, indicating good trade selection.\n";
          } else if (winRate < 40) {
            insights += "Your win rate is below 40%, suggesting a review of your trading strategy might be beneficial.\n";
          } else {
            insights += "Your win rate is in the average range, between 40-60%.\n";
          }
          
          if (stats.riskRewardAverage > 1.5) {
            insights += "\nYour average risk/reward ratio is healthy at >1.5, showing good position sizing and profit targeting.";
          } else if (stats.riskRewardAverage < 1) {
            insights += "\nYour average risk/reward ratio is below 1:1, which may impact long-term profitability.";
          }
        } else {
          insights += "No completed trades yet. Start adding trades with outcomes to get insights.";
        }
        
        const splitInsights = pdf.splitTextToSize(insights, 180);
        pdf.text(splitInsights, 15, 35);
        
        // Save the PDF
        pdf.save(`YTR_Trading_Journal_Comprehensive_${new Date().toISOString().split('T')[0]}.pdf`);
        
        toast.success("Comprehensive report exported to PDF");
      }).catch(err => {
        console.error("Error loading jspdf-autotable:", err);
        toast.error("Error exporting report to PDF");
      });
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
