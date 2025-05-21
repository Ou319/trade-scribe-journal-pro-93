
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

// Create the context
const JournalContext = createContext<JournalContextType | undefined>(undefined);

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
  
  // Export comprehensive report as PDF - enhanced version with modern design
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
        // Define modern color scheme - properly typed as RGB tuples
        const colors = {
          primary: [59, 130, 246] as [number, number, number],    // blue-500
          secondary: [99, 102, 241] as [number, number, number],  // indigo-500
          success: [16, 185, 129] as [number, number, number],    // green-500
          danger: [239, 68, 68] as [number, number, number],      // red-500
          warning: [245, 158, 11] as [number, number, number],    // amber-500
          light: [249, 250, 251] as [number, number, number],     // gray-50
          dark: [31, 41, 55] as [number, number, number],         // gray-800
          text: [55, 65, 81] as [number, number, number],         // gray-700
          lightText: [107, 114, 128] as [number, number, number], // gray-500
          border: [229, 231, 235] as [number, number, number]     // gray-200
        };
        
        // Modern Cover page
        pdf.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
        
        // Add decorative header
        pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 30, 'F');
        
        // Add title
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(28);
        pdf.setFont('helvetica', 'bold');
        pdf.text('YTR Trading Journal', 20, 20);
        
        // Add subtitle with date in modern format
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Comprehensive Report`, 20, 45);
        
        // Add date with more elegant formatting
        pdf.setFontSize(12);
        pdf.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        pdf.text(`Generated on ${formattedDate}`, 20, 52);
        
        // Add horizontal divider
        pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
        pdf.setLineWidth(0.5);
        pdf.line(20, 60, pdf.internal.pageSize.getWidth() - 20, 60);
        
        // Add total P/L info with modern style
        pdf.setFontSize(22);
        if (stats.totalProfitLossPercent >= 0) {
          pdf.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
          pdf.text(`Total P/L: +${stats.totalProfitLossPercent.toFixed(2)}%`, 20, 75);
        } else {
          pdf.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
          pdf.text(`Total P/L: ${stats.totalProfitLossPercent.toFixed(2)}%`, 20, 75);
        }
        
        // Add summary statistics in the cover
        pdf.setFontSize(12);
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.text(`Total Trades: ${stats.totalTrades}`, 20, 95);
        pdf.text(`Win Rate: ${stats.winRate.toFixed(2)}%`, 20, 105);
        pdf.text(`Win/Loss Ratio: ${(stats.winTrades / (stats.loseTrades || 1)).toFixed(2)}`, 20, 115);
        
        // Add decorative footer
        pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.rect(0, pdf.internal.pageSize.getHeight() - 15, pdf.internal.pageSize.getWidth(), 15, 'F');
        
        // Add page break after cover
        pdf.addPage();
        
        // Table of contents with modern style
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 15, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TABLE OF CONTENTS', 20, 10);
        
        // Reset text color for TOC items
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        let pageNum = 2;
        pdf.text(`1. Trading Performance Summary`, 20, 30);
        pdf.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
        pdf.text(`Page ${pageNum}`, 170, 30, { align: 'right' });
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        
        pageNum++;
        pdf.text(`2. Trading Statistics`, 20, 40);
        pdf.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
        pdf.text(`Page ${pageNum}`, 170, 40, { align: 'right' });
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        
        pageNum++;
        pdf.text(`3. Weekly Performance Details`, 20, 50);
        pdf.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
        pdf.text(`Page ${pageNum}`, 170, 50, { align: 'right' });
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        
        pageNum += journal.weeks.length;
        pdf.text(`4. Individual Trade Analysis`, 20, 60);
        pdf.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
        pdf.text(`Page ${pageNum}`, 170, 60, { align: 'right' });
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        
        // Add horizontal divider
        pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
        pdf.line(20, 70, pdf.internal.pageSize.getWidth() - 20, 70);
        
        // Add decorative footer on each page
        const addFooter = () => {
          pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
          pdf.rect(0, pdf.internal.pageSize.getHeight() - 10, pdf.internal.pageSize.getWidth(), 10, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(8);
          pdf.text(`YTR Trading Journal - ${formattedDate}`, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 4, { align: 'center' });
        };
        
        addFooter();
        
        // Add page break after TOC
        pdf.addPage();
        
        // Trading Performance Summary with modern design
        pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 15, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TRADING PERFORMANCE SUMMARY', 20, 10);
        
        // Create modern summary table
        const summaryColumns = [
          { header: 'Metric', dataKey: 'metric' },
          { header: 'Value', dataKey: 'value' }
        ];
        
        const summaryData = [
          { metric: "Total Trades", value: stats.totalTrades.toString() },
          { metric: "Win Rate", value: `${stats.winRate.toFixed(2)}%` },
          { metric: "Win Trades", value: stats.winTrades.toString() },
          { metric: "Loss Trades", value: stats.loseTrades.toString() },
          { metric: "Breakeven Trades", value: stats.breakevenTrades.toString() },
          { metric: "Total P/L", value: `${stats.totalProfitLossPercent.toFixed(2)}%` },
          { metric: "Avg Risk/Reward", value: stats.riskRewardAverage.toFixed(2) }
        ];
        
        autoTable(pdf, {
          head: [summaryColumns.map(col => col.header)],
          body: summaryData.map(row => [row.metric, row.value]),
          startY: 25,
          theme: 'grid',
          headStyles: {
            fillColor: colors.secondary,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          alternateRowStyles: {
            fillColor: colors.light
          },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 100 },
            1: { halign: 'center' }
          },
          styles: {
            cellPadding: 8,
            fontSize: 10,
            lineColor: colors.border,
            lineWidth: 0.1
          },
          margin: { top: 25 }
        });
        
        addFooter();
        
        // Add page break after summary
        pdf.addPage();
        
        // Trading Statistics with more details
        pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 15, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TRADING STATISTICS', 20, 10);
        
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
        
        // Create advanced statistics tables with modern design
        const statColumns = [
          { header: 'Category', dataKey: 'category' },
          { header: 'Long', dataKey: 'long' },
          { header: 'Short', dataKey: 'short' },
          { header: 'Total', dataKey: 'total' }
        ];
        
        const statData = [
          { 
            category: "Total Trades", 
            long: longTrades.length, 
            short: shortTrades.length, 
            total: stats.totalTrades 
          },
          { 
            category: "Win Rate", 
            long: `${longWinRate}%`, 
            short: `${shortWinRate}%`, 
            total: `${stats.winRate.toFixed(2)}%` 
          },
          { 
            category: "Wins", 
            long: longWins, 
            short: shortWins, 
            total: stats.winTrades 
          },
          { 
            category: "Losses", 
            long: longLosses, 
            short: shortLosses, 
            total: stats.loseTrades 
          }
        ];
        
        autoTable(pdf, {
          head: [statColumns.map(col => col.header)],
          body: statData.map(row => [row.category, row.long, row.short, row.total]),
          startY: 25,
          theme: 'grid',
          headStyles: {
            fillColor: colors.secondary,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          alternateRowStyles: {
            fillColor: colors.light
          },
          columnStyles: {
            0: { fontStyle: 'bold' },
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center' }
          },
          styles: {
            cellPadding: 8,
            fontSize: 10,
            lineColor: colors.border,
            lineWidth: 0.1
          }
        });
        
        addFooter();
        
        // Add page break before weekly performance details
        pdf.addPage();
        
        // Weekly Performance Details Section with modern Excel-like styling
        pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 15, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('WEEKLY PERFORMANCE DETAILS', 20, 10);
        
        // Loop through each week with Excel-like tables
        journal.weeks.forEach((week, weekIndex) => {
          // If not the first week, add a new page
          if (weekIndex > 0) {
            pdf.addPage();
            
            // Add header to each page
            pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
            pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 15, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('WEEKLY PERFORMANCE DETAILS', 20, 10);
          }
          
          // Set position for week header
          let yPosition = 25;
          
          // Create modern week header with performance indicator
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          
          // Set color based on performance
          const weekPerformance = week.percentGain;
          if (weekPerformance > 0) {
            pdf.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
          } else if (weekPerformance < 0) {
            pdf.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
          } else {
            pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
          }
          
          pdf.text(`${week.name} (${week.percentGain.toFixed(2)}%)`, 20, yPosition);
          pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]); // reset text color
          
          yPosition += 10;
          
          // Get week stats
          const weekTrades = week.trades.filter(t => t.status === 'Done');
          const weekWins = weekTrades.filter(t => t.result === 'Win').length;
          const weekLosses = weekTrades.filter(t => t.result === 'Loss').length;
          const weekWinRate = weekTrades.length > 0 ? (weekWins / weekTrades.length * 100).toFixed(2) : '0.00';
          
          // Add week summary with modern design
          const weekSummaryData = [
            { metric: "Total Trades", value: weekTrades.length },
            { metric: "Win Rate", value: `${weekWinRate}%` },
            { metric: "Win/Loss", value: `${weekWins}/${weekLosses}` },
            { metric: "P/L", value: `${week.percentGain.toFixed(2)}%` }
          ];
          
          // Create a summary table for the week stats
          autoTable(pdf, {
            head: [["Metric", "Value"]],
            body: weekSummaryData.map(row => [row.metric, row.value]),
            startY: yPosition,
            theme: 'grid',
            headStyles: {
              fillColor: colors.secondary,
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              halign: 'center'
            },
            styles: {
              cellPadding: 5,
              fontSize: 10,
              lineColor: colors.border,
              lineWidth: 0.1
            },
            columnStyles: {
              0: { fontStyle: 'bold', cellWidth: 80 },
              1: { halign: 'center' }
            },
            margin: { left: 20, right: 20 }
          });
          
          // Update Y position for trades table
          yPosition = pdf.previousAutoTable?.finalY ? pdf.previousAutoTable.finalY + 15 : yPosition + 40;
          
          // Excel-like trades table
          if (weekTrades.length > 0) {
            // Create modern Excel-like table for trades
            const tradeColumns = [
              "Trade #", "Date", "Pair", "Type", "Result", "Entry", "SL", "TP", "R/R", "P/L %"
            ];
            
            const tradeRows = weekTrades.map((trade, idx) => {
              const tradeDate = trade.date instanceof Date ? 
                trade.date.toLocaleDateString() : 
                new Date(trade.date).toLocaleDateString();
                
              return [
                (idx + 1).toString(),
                tradeDate,
                trade.pair,
                trade.type,
                trade.result || "-",
                trade.entry.toString(),
                trade.stopLoss.toString(),
                trade.takeProfit.toString(),
                trade.riskReward.toFixed(2),
                `${trade.gainLossPercent.toFixed(2)}%`
              ];
            });
            
            // Excel-like styling for the trades table
            autoTable(pdf, {
              head: [tradeColumns],
              body: tradeRows,
              startY: yPosition,
              theme: 'grid',
              headStyles: {
                fillColor: colors.secondary,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center'
              },
              alternateRowStyles: {
                fillColor: colors.light
              },
              styles: {
                cellPadding: 5,
                fontSize: 9,
                lineColor: colors.border,
                lineWidth: 0.1,
                halign: 'center'
              },
              columnStyles: {
                0: { cellWidth: 12 },  // Trade #
                1: { cellWidth: 22 },  // Date
                8: { cellWidth: 15 },  // R/R
                9: { cellWidth: 18 }   // P/L %
              },
              didDrawCell: (data) => {
                // Custom cell styling for results and P/L columns
                if (data.section === 'body') {
                  // For Result column (index 4)
                  if (data.column.index === 4) {
                    const value = data.cell.raw as string;
                    if (value === 'Win') {
                      pdf.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
                    } else if (value === 'Loss') {
                      pdf.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
                    } else {
                      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
                    }
                  }
                  // For P/L column (index 9)
                  else if (data.column.index === 9) {
                    const value = parseFloat(data.cell.raw as string);
                    if (value > 0) {
                      pdf.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
                    } else if (value < 0) {
                      pdf.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
                    } else {
                      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
                    }
                  } else {
                    pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
                  }
                }
              },
              margin: { left: 10, right: 10 }
            });
            
            // Update Y position
            yPosition = pdf.previousAutoTable?.finalY ? pdf.previousAutoTable.finalY + 15 : yPosition + 40;
          } else {
            // No trades message
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(10);
            pdf.text("No trades recorded for this week", 20, yPosition);
            yPosition += 15;
          }
          
          addFooter();
        });
        
        // Add page break before individual trade analysis
        pdf.addPage();
        
        // Individual Trade Analysis with modern design
        pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 15, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('INDIVIDUAL TRADE ANALYSIS', 20, 10);
        
        // Reset text color
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        
        let yPosition = 25;
        
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
        
        // Display detailed information for each trade with modern cards
        allTrades.forEach((trade, index) => {
          // Add new page if needed
          if (yPosition > pdf.internal.pageSize.getHeight() - 80) {
            pdf.addPage();
            
            // Add header to each page
            pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
            pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 15, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('INDIVIDUAL TRADE ANALYSIS', 20, 10);
            
            // Reset position and text color
            yPosition = 25;
            pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
          }
          
          // Card-like design for each trade
          // Draw card background
          pdf.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
          pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
          pdf.roundedRect(15, yPosition, pdf.internal.pageSize.getWidth() - 30, 65, 3, 3, 'FD');
          
          // Trade header with color based on result
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          
          if (trade.result === 'Win') {
            pdf.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
          } else if (trade.result === 'Loss') {
            pdf.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
          } else {
            pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
          }
          
          const tradeDate = trade.date instanceof Date ? 
            trade.date.toLocaleDateString() : 
            new Date(trade.date).toLocaleDateString();
            
          pdf.text(`Trade #${index + 1}: ${trade.pair} (${tradeDate})`, 20, yPosition + 10);
          
          // Reset text color for details
          pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
          
          // Trade details
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          
          let detailsY = yPosition + 20;
          
          // Left column
          pdf.text(`Week: ${(trade as any).weekName}`, 25, detailsY);
          pdf.text(`Type: ${trade.type}`, 25, detailsY + 10);
          pdf.text(`Entry: ${trade.entry}`, 25, detailsY + 20);
          
          // Middle column
          pdf.text(`Stop Loss: ${trade.stopLoss}`, 85, detailsY);
          pdf.text(`Take Profit: ${trade.takeProfit}`, 85, detailsY + 10);
          pdf.text(`Risk: ${trade.risk}%`, 85, detailsY + 20);
          
          // Right column
          pdf.text(`Risk/Reward: ${trade.riskReward.toFixed(2)}`, 145, detailsY);
          
          // Result with colored text
          if (trade.result === 'Win') {
            pdf.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
          } else if (trade.result === 'Loss') {
            pdf.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
          } else {
            pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
          }
          pdf.text(`Result: ${trade.result || 'N/A'}`, 145, detailsY + 10);
          
          // P/L with colored text
          if (trade.gainLossPercent > 0) {
            pdf.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
          } else if (trade.gainLossPercent < 0) {
            pdf.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
          } else {
            pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
          }
          pdf.text(`P/L: ${trade.gainLossPercent.toFixed(2)}%`, 145, detailsY + 20);
          
          // Reset text color
          pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
          
          // Add trade comments if any
          if (trade.comment) {
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'italic');
            pdf.text("Comments:", 25, detailsY + 35);
            
            // Wrap comments text to fit the card width
            pdf.setFont('helvetica', 'normal');
            const splitComment = pdf.splitTextToSize(trade.comment, 160);
            pdf.text(splitComment, 25, detailsY + 42);
          }
          
          // Move to next trade
          yPosition += 75;
          
          addFooter();
        });
        
        // Add final page with conclusions
        pdf.addPage();
        
        // Modern conclusion page
        pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 15, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TRADING JOURNAL SUMMARY', 20, 10);
        
        // Reset text color
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        
        // Add trading insights with modern design
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        const totalTrades = stats.totalTrades;
        const winRate = stats.winRate;
        
        // Create a conclusion card
        pdf.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
        pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
        pdf.roundedRect(15, 25, pdf.internal.pageSize.getWidth() - 30, 100, 3, 3, 'FD');
        
        let insights = "Performance Insights:";
        pdf.setFont('helvetica', 'bold');
        pdf.text(insights, 25, 35);
        pdf.setFont('helvetica', 'normal');
        
        if (totalTrades > 0) {
          let insightText = `Your overall win rate is ${winRate.toFixed(2)}% across ${totalTrades} trades.`;
          pdf.text(insightText, 25, 45);
          
          if (winRate > 60) {
            insightText = "You have a strong win rate above 60%, indicating good trade selection.";
            pdf.text(insightText, 25, 55);
          } else if (winRate < 40) {
            insightText = "Your win rate is below 40%, suggesting a review of your trading strategy might be beneficial.";
            pdf.text(insightText, 25, 55);
          } else {
            insightText = "Your win rate is in the average range, between 40-60%.";
            pdf.text(insightText, 25, 55);
          }
          
          if (stats.riskRewardAverage > 1.5) {
            insightText = "Your average risk/reward ratio is healthy at >1.5, showing good position sizing and profit targeting.";
            pdf.text(insightText, 25, 65);
          } else if (stats.riskRewardAverage < 1) {
            insightText = "Your average risk/reward ratio is below 1:1, which may impact long-term profitability.";
            pdf.text(insightText, 25, 65);
          }
        } else {
          pdf.text("No completed trades yet. Start adding trades with outcomes to get insights.", 25, 45);
        }
        
        // Add a thank you note
        pdf.setFont('helvetica', 'italic');
        pdf.text("Thank you for using YTR Trading Journal!", 25, 85);
        
        addFooter();
        
        // Save the PDF with modern filename
        pdf.save(`YTR_Trading_Journal_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        
        toast.success("Professional report exported to PDF");
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
