
import { useState, useEffect } from "react";
import { useJournal } from "@/contexts/JournalContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import TradeList from "../trades/TradeList";
import TradeForm from "../trades/TradeForm";
import WeekSelector from "./WeekSelector";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const WeekDetail = () => {
  const { journal, currentWeekId, deleteWeek } = useJournal();
  const [isAddingTrade, setIsAddingTrade] = useState(false);
  const [settings, setSettings] = useState({
    weeklyTradesTitle: "Weekly Trades",
    addTradeButtonText: "Add Trade",
    weekPerformanceLabel: "Week Performance",
    totalPerformanceLabel: "Total Performance"
  });

  useEffect(() => {
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem("app-settings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({
          weeklyTradesTitle: parsedSettings.weeklyTradesTitle || "Weekly Trades",
          addTradeButtonText: parsedSettings.addTradeButtonText || "Add Trade",
          weekPerformanceLabel: parsedSettings.weekPerformanceLabel || "Week Performance",
          totalPerformanceLabel: parsedSettings.totalPerformanceLabel || "Total Performance"
        });
      } catch (e) {
        console.error("Error parsing settings:", e);
      }
    }
  }, []);

  const currentWeek = journal.weeks.find((week) => week.id === currentWeekId);

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{settings.weeklyTradesTitle}</CardTitle>
        <div className="flex items-center space-x-2">
          <WeekSelector />

          {currentWeekId && (
            <>
              <Button 
                size="sm" 
                onClick={() => setIsAddingTrade(true)}
              >
                <Plus className="mr-1 h-4 w-4" /> {settings.addTradeButtonText}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="icon" variant="destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Week</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete{" "}
                      <strong>{currentWeek?.name}</strong> and all its trades.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => deleteWeek(currentWeekId)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAddingTrade && currentWeekId ? (
          <TradeForm 
            weekId={currentWeekId} 
            onComplete={() => setIsAddingTrade(false)} 
          />
        ) : null}

        {currentWeek ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="text-muted-foreground">{settings.weekPerformanceLabel}:</span>{" "}
                <span className={
                  currentWeek.percentGain > 0 
                    ? "text-profit font-bold" 
                    : currentWeek.percentGain < 0 
                    ? "text-loss font-bold" 
                    : ""
                }>
                  {currentWeek.percentGain > 0 ? "+" : ""}
                  {currentWeek.percentGain.toFixed(2)}%
                </span>
              </div>
              
              <div>
                <span className="text-muted-foreground">{settings.totalPerformanceLabel}:</span>{" "}
                <span className={
                  journal.totalPercentGain > 0 
                    ? "text-profit font-bold" 
                    : journal.totalPercentGain < 0 
                    ? "text-loss font-bold" 
                    : ""
                }>
                  {journal.totalPercentGain > 0 ? "+" : ""}
                  {journal.totalPercentGain.toFixed(2)}%
                </span>
              </div>
            </div>
            
            <TradeList />
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No week selected. Select a week or create a new one.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeekDetail;
