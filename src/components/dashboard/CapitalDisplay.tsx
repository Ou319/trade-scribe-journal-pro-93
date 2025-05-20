
import { useState, useEffect } from "react";
import { useJournal } from "@/contexts/JournalContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DollarSign } from "lucide-react";

interface CapitalDisplayProps {
  initialCapitalLabel?: string;
  currentCapitalLabel?: string;
  editButtonText?: string;
}

const CapitalDisplay = ({
  initialCapitalLabel = "Initial Capital",
  currentCapitalLabel = "Current Capital",
  editButtonText = "Edit"
}: CapitalDisplayProps) => {
  const { journal, stats } = useJournal();
  const [capital, setCapital] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [inputCapital, setInputCapital] = useState("");

  // Check if capital is stored in localStorage
  useEffect(() => {
    const storedCapital = localStorage.getItem('tradeCapital');
    if (storedCapital) {
      setCapital(parseFloat(storedCapital));
    } else {
      // If not stored, show dialog on first login
      setShowDialog(true);
    }
  }, []);

  // Calculate current capital with profit/loss
  const currentCapital = capital !== null 
    ? capital * (1 + stats.totalProfitLossPercent / 100) 
    : null;

  const handleCapitalSubmit = () => {
    const capitalValue = parseFloat(inputCapital);
    if (!isNaN(capitalValue) && capitalValue > 0) {
      setCapital(capitalValue);
      localStorage.setItem('tradeCapital', capitalValue.toString());
      setShowDialog(false);
      toast.success("Capital amount saved!");
    } else {
      toast.error("Please enter a valid capital amount");
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <>
      {capital !== null && (
        <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-900 border-none shadow-md overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
              <div className="p-6 flex items-center">
                <div className="rounded-full bg-primary/10 p-3 mr-4">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{initialCapitalLabel}</p>
                  <h2 className="text-2xl font-bold">{formatCurrency(capital)}</h2>
                </div>
              </div>
              
              <div className="p-6 flex items-center">
                <div className="rounded-full bg-primary/10 p-3 mr-4">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{currentCapitalLabel}</p>
                  <h2 className={`text-2xl font-bold ${currentCapital && currentCapital > capital ? 'text-profit' : currentCapital && currentCapital < capital ? 'text-loss' : ''}`}>
                    {currentCapital !== null ? formatCurrency(currentCapital) : 'N/A'}
                  </h2>
                  {stats.totalProfitLossPercent !== 0 && (
                    <span className={`text-sm font-medium ${stats.totalProfitLossPercent > 0 ? 'text-profit' : 'text-loss'}`}>
                      {stats.totalProfitLossPercent > 0 ? '+' : ''}{stats.totalProfitLossPercent.toFixed(2)}%
                    </span>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => setShowDialog(true)}
                >
                  {editButtonText}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Your Trading Capital</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              placeholder="Enter your initial capital"
              value={inputCapital}
              onChange={(e) => setInputCapital(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleCapitalSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CapitalDisplay;
