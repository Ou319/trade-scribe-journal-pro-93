
import { useState, useEffect } from "react";
import { useJournal } from "@/contexts/JournalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trade, TradeType, TradeStatus, TradeResult } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

type TradeFormData = Omit<Trade, "id">;

interface TradeFormProps {
  weekId: string;
  initialData?: Trade;
  onComplete: () => void;
  isEditing?: boolean;
}

const defaultFormData: TradeFormData = {
  date: new Date(),
  pair: "",
  type: "Long",
  entry: 0,
  stopLoss: 0,
  takeProfit: 0,
  risk: 1,
  riskReward: 0,
  status: "Pending",
  result: null,
  gainLossPercent: 0,
  comment: "",
};

// Common currency pairs
const commonPairs = [
  "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", 
  "USDCHF", "NZDUSD", "EURGBP", "EURJPY", "GBPJPY",
  "XAUUSD", "BTCUSD", "ETHUSD"
];

const TradeForm = ({ weekId, initialData, onComplete, isEditing = false }: TradeFormProps) => {
  const { addTrade, updateTrade } = useJournal();
  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState<TradeFormData>(initialData || defaultFormData);
  const [customPair, setCustomPair] = useState<string>(
    initialData && !commonPairs.includes(initialData.pair) ? initialData.pair : ""
  );
  const [showCustomPair, setShowCustomPair] = useState<boolean>(
    initialData && !commonPairs.includes(initialData.pair)
  );

  // Calculate Risk/Reward whenever relevant fields change
  useEffect(() => {
    if (formData.entry && formData.stopLoss && formData.takeProfit) {
      let riskPoints = 0;
      let rewardPoints = 0;

      if (formData.type === "Long") {
        riskPoints = formData.entry - formData.stopLoss;
        rewardPoints = formData.takeProfit - formData.entry;
      } else {
        riskPoints = formData.stopLoss - formData.entry;
        rewardPoints = formData.entry - formData.takeProfit;
      }

      // Avoid division by zero
      const riskReward = riskPoints > 0 ? rewardPoints / riskPoints : 0;
      
      setFormData((prev) => ({
        ...prev,
        riskReward: parseFloat(riskReward.toFixed(2)),
      }));
    }
  }, [formData.entry, formData.stopLoss, formData.takeProfit, formData.type]);

  // Calculate Gain/Loss % when result changes
  useEffect(() => {
    if (formData.result && formData.risk && formData.riskReward) {
      let gainLossPercent = 0;
      
      if (formData.result === "Win") {
        gainLossPercent = formData.risk * formData.riskReward;
      } else if (formData.result === "Loss") {
        gainLossPercent = -formData.risk;
      }
      // Breakeven is 0
      
      setFormData((prev) => ({
        ...prev,
        gainLossPercent: parseFloat(gainLossPercent.toFixed(2)),
      }));
    }
  }, [formData.result, formData.risk, formData.riskReward]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (["entry", "stopLoss", "takeProfit", "risk"].includes(name)) {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'pair' && value === 'custom') {
      setShowCustomPair(true);
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData({
        ...formData,
        date,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalData = {
      ...formData,
      pair: showCustomPair && customPair ? customPair : formData.pair,
    };
    
    if (isEditing && initialData) {
      updateTrade(weekId, initialData.id, finalData);
    } else {
      addTrade(weekId, finalData);
    }
    
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Trade" : "Add New Trade"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? (
                      format(formData.date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateChange}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Pair Selection */}
            <div className="space-y-2">
              <Label htmlFor="pair">Trading Pair</Label>
              {showCustomPair ? (
                <div className="flex space-x-2">
                  <Input
                    id="custom-pair"
                    value={customPair}
                    onChange={(e) => setCustomPair(e.target.value)}
                    placeholder="Enter pair (e.g. EURCAD)"
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setShowCustomPair(false);
                      setCustomPair("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.pair}
                  onValueChange={(value) => handleSelectChange("pair", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Pair" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonPairs.map((pair) => (
                      <SelectItem key={pair} value={pair}>
                        {pair}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Pair...</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {/* Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="type">Trade Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value as TradeType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Long">Long</SelectItem>
                  <SelectItem value="Short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Entry Price */}
            <div className="space-y-2">
              <Label htmlFor="entry">Entry Price</Label>
              <Input
                id="entry"
                name="entry"
                type="number"
                step="any"
                value={formData.entry || ""}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            
            {/* Stop Loss */}
            <div className="space-y-2">
              <Label htmlFor="stopLoss">Stop Loss</Label>
              <Input
                id="stopLoss"
                name="stopLoss"
                type="number"
                step="any"
                value={formData.stopLoss || ""}
                onChange={handleChange}
                placeholder="0.00"
                className="border-loss/40"
              />
            </div>
            
            {/* Take Profit */}
            <div className="space-y-2">
              <Label htmlFor="takeProfit">Take Profit</Label>
              <Input
                id="takeProfit"
                name="takeProfit"
                type="number"
                step="any"
                value={formData.takeProfit || ""}
                onChange={handleChange}
                placeholder="0.00"
                className="border-profit/40"
              />
            </div>
            
            {/* Risk % */}
            <div className="space-y-2">
              <Label htmlFor="risk">Risk %</Label>
              <Input
                id="risk"
                name="risk"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.risk || ""}
                onChange={handleChange}
                placeholder="1.0"
              />
            </div>
            
            {/* Risk/Reward (Calculated) */}
            <div className="space-y-2">
              <Label htmlFor="riskReward">Risk/Reward</Label>
              <Input
                id="riskReward"
                value={formData.riskReward}
                readOnly
                disabled
              />
            </div>
            
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value as TradeStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Result (only if status is Done) */}
            <div className="space-y-2">
              <Label htmlFor="result">Result</Label>
              <Select
                value={formData.result || ""}
                onValueChange={(value) => handleSelectChange("result", value as TradeResult)}
                disabled={formData.status !== "Done"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Win">Win</SelectItem>
                  <SelectItem value="Loss">Loss</SelectItem>
                  <SelectItem value="Breakeven">Breakeven</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Gain/Loss % (Calculated) */}
            <div className="space-y-2">
              <Label htmlFor="gainLossPercent">Gain/Loss %</Label>
              <Input
                id="gainLossPercent"
                value={formData.status === "Done" ? `${formData.gainLossPercent > 0 ? '+' : ''}${formData.gainLossPercent}%` : "-"}
                readOnly
                disabled
                className={formData.gainLossPercent > 0 ? "border-profit/40" : formData.gainLossPercent < 0 ? "border-loss/40" : ""}
              />
            </div>
          </div>
          
          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Add your notes or observations about this trade..."
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update Trade" : "Add Trade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TradeForm;
