
import { useState } from "react";
import { Trade } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle, XCircle, MinusCircle, Clock, Image } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TradeDetailViewProps {
  trade: Trade;
  isOpen: boolean;
  onClose: () => void;
}

const TradeDetailView = ({ trade, isOpen, onClose }: TradeDetailViewProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Trade Details: {trade.pair}</DialogTitle>
          <DialogDescription>
            {trade.date instanceof Date
              ? format(trade.date, 'PPP')
              : format(new Date(trade.date), 'PPP')}
            {' '} • {' '}
            <Badge variant={trade.type === 'Long' ? 'default' : 'destructive'}>
              {trade.type}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Entry Price</p>
              <p>{trade.entry}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Result</p>
              <p className="flex items-center">
                {trade.result === 'Win' && (
                  <><CheckCircle className="mr-1 h-4 w-4 text-green-500" /> Win</>
                )}
                {trade.result === 'Loss' && (
                  <><XCircle className="mr-1 h-4 w-4 text-red-500" /> Loss</>
                )}
                {trade.result === 'Breakeven' && (
                  <><MinusCircle className="mr-1 h-4 w-4 text-gray-500" /> Breakeven</>
                )}
                {!trade.result && (
                  <><Clock className="mr-1 h-4 w-4 text-yellow-500" /> Pending</>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Stop Loss</p>
              <p className="text-loss">{trade.stopLoss}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Take Profit</p>
              <p className="text-profit">{trade.takeProfit}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Risk %</p>
              <p>{trade.risk}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Risk/Reward</p>
              <p>{trade.riskReward.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p>{trade.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gain/Loss %</p>
              <p className={
                trade.gainLossPercent > 0 
                  ? "text-profit" 
                  : trade.gainLossPercent < 0 
                  ? "text-loss" 
                  : ""
              }>
                {trade.gainLossPercent > 0 ? '+' : ''}{trade.gainLossPercent.toFixed(2)}%
              </p>
            </div>
          </div>

          {(trade.beforeTradeImage || trade.afterTradeImage) && (
            <Tabs defaultValue="before" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="before" disabled={!trade.beforeTradeImage}>Before Trade</TabsTrigger>
                <TabsTrigger value="after" disabled={!trade.afterTradeImage}>After Trade</TabsTrigger>
              </TabsList>
              <TabsContent value="before" className="mt-2">
                {trade.beforeTradeImage ? (
                  <div className="flex justify-center">
                    <img 
                      src={trade.beforeTradeImage} 
                      alt="Before Trade" 
                      className="max-h-64 object-contain rounded-md border border-border"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 bg-muted/30 rounded-md">
                    <Image className="h-10 w-10 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground mt-2">No image available</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="after" className="mt-2">
                {trade.afterTradeImage ? (
                  <div className="flex justify-center">
                    <img 
                      src={trade.afterTradeImage} 
                      alt="After Trade" 
                      className="max-h-64 object-contain rounded-md border border-border"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 bg-muted/30 rounded-md">
                    <Image className="h-10 w-10 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground mt-2">No image available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {trade.comment && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Comments</h4>
              <div className="p-3 bg-muted/30 rounded-md whitespace-pre-wrap">
                {trade.comment}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradeDetailView;
