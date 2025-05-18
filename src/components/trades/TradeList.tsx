
import { useJournal } from "@/contexts/JournalContext";
import { Trade } from "@/types";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MinusCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import TradeForm from "./TradeForm";

const TradeList = () => {
  const { journal, currentWeekId, deleteTrade } = useJournal();
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  if (!currentWeekId) {
    return <div className="text-center py-8">No week selected</div>;
  }

  const currentWeek = journal.weeks.find(week => week.id === currentWeekId);
  if (!currentWeek) {
    return <div className="text-center py-8">Week not found</div>;
  }

  const getStatusBadge = (status: string) => {
    return status === 'Done' 
      ? <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          <CheckCircle className="mr-1 h-3 w-3" /> Done
        </Badge>
      : <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>;
  };

  const getResultBadge = (result: string | null) => {
    if (result === 'Win') {
      return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
        <CheckCircle className="mr-1 h-3 w-3" /> Win
      </Badge>;
    }
    
    if (result === 'Loss') {
      return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
        <XCircle className="mr-1 h-3 w-3" /> Loss
      </Badge>;
    }
    
    if (result === 'Breakeven') {
      return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
        <MinusCircle className="mr-1 h-3 w-3" /> Breakeven
      </Badge>;
    }
    
    return <span className="text-muted-foreground">-</span>;
  };

  const getGainLossClass = (value: number) => {
    if (value > 0) return "text-profit";
    if (value < 0) return "text-loss";
    return "text-neutral";
  };

  return (
    <div className="relative overflow-x-auto">
      {editingTrade && (
        <TradeForm 
          initialData={editingTrade} 
          weekId={currentWeekId}
          onComplete={() => setEditingTrade(null)}
          isEditing={true}
        />
      )}
      
      <Table className="trades-table">
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Pair</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Entry</TableHead>
            <TableHead className="text-right">SL</TableHead>
            <TableHead className="text-right">TP</TableHead>
            <TableHead className="text-right">Risk %</TableHead>
            <TableHead className="text-right">R:R</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Result</TableHead>
            <TableHead className="text-right">Gain/Loss %</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentWeek.trades.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center text-muted-foreground">
                No trades recorded for this week
              </TableCell>
            </TableRow>
          ) : (
            currentWeek.trades.map(trade => (
              <TableRow key={trade.id}>
                <TableCell>
                  {trade.date instanceof Date 
                    ? format(trade.date, 'dd/MM/yyyy')
                    : format(new Date(trade.date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>{trade.pair}</TableCell>
                <TableCell>
                  <Badge variant={trade.type === 'Long' ? 'default' : 'destructive'}>
                    {trade.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{trade.entry}</TableCell>
                <TableCell className="text-right text-loss">{trade.stopLoss}</TableCell>
                <TableCell className="text-right text-profit">{trade.takeProfit}</TableCell>
                <TableCell className="text-right">{trade.risk}%</TableCell>
                <TableCell className="text-right">{trade.riskReward.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(trade.status)}</TableCell>
                <TableCell>{getResultBadge(trade.result)}</TableCell>
                <TableCell className={`text-right ${getGainLossClass(trade.gainLossPercent)}`}>
                  {trade.gainLossPercent > 0 ? '+' : ''}{trade.gainLossPercent.toFixed(2)}%
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => setEditingTrade(trade)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => deleteTrade(currentWeekId, trade.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TradeList;
