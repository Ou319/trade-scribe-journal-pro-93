
import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const Settings = () => {
  const [settings, setSettings] = useState({
    // App info
    appTitle: "YTR",
    appSubtitle: "Journal de Trading",
    ownerName: "Outmane El ouaafa",
    exportButtonText: "Export Comprehensive PDF",
    
    // Dashboard labels
    dashboardTitle: "Dashboard",
    totalTradesLabel: "Total Trades",
    winTradesLabel: "Win Trades",
    loseTradesLabel: "Lose Trades",
    breakevenLabel: "Breakeven",
    winRateLabel: "Win Rate",
    riskRewardLabel: "Risk/Reward Average",
    profitLossLabel: "Total Profit/Loss",
    
    // Weekly section
    weeklyTradesTitle: "Weekly Trades",
    addTradeButtonText: "Add Trade",
    weekPerformanceLabel: "Week Performance",
    totalPerformanceLabel: "Total Performance",
    
    // Table headers
    dateLabel: "Date",
    pairLabel: "Pair",
    typeLabel: "Type",
    entryLabel: "Entry",
    slLabel: "SL",
    tpLabel: "TP",
    riskLabel: "Risk %",
    rrLabel: "R:R",
    statusLabel: "Status",
    resultLabel: "Result",
    gainLossLabel: "Gain/Loss %",
    actionsLabel: "Actions",
    
    // Capital section
    initialCapitalLabel: "Initial Capital",
    currentCapitalLabel: "Current Capital",
    editButtonText: "Edit"
  });

  useEffect(() => {
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem("app-settings");
    if (savedSettings) {
      try {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...JSON.parse(savedSettings)
        }));
      } catch (e) {
        console.error("Error parsing settings:", e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem("app-settings", JSON.stringify(settings));
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-2 sm:px-4 py-3 sm:py-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <Tabs defaultValue="app">
          <TabsList className="mb-4 w-full sm:w-auto">
            <TabsTrigger value="app">App Information</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard Labels</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Section</TabsTrigger>
            <TabsTrigger value="table">Table Headers</TabsTrigger>
            <TabsTrigger value="capital">Capital Section</TabsTrigger>
          </TabsList>
          
          <TabsContent value="app">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="appTitle">Application Title</Label>
                  <Input 
                    id="appTitle" 
                    name="appTitle" 
                    value={settings.appTitle} 
                    onChange={handleChange}
                    placeholder="Main title of your application" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="appSubtitle">Application Subtitle</Label>
                  <Input 
                    id="appSubtitle" 
                    name="appSubtitle" 
                    value={settings.appSubtitle} 
                    onChange={handleChange}
                    placeholder="Subtitle displayed next to title" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input 
                    id="ownerName" 
                    name="ownerName" 
                    value={settings.ownerName} 
                    onChange={handleChange}
                    placeholder="Your name shown in footer" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exportButtonText">Export Button Text</Label>
                  <Input 
                    id="exportButtonText" 
                    name="exportButtonText" 
                    value={settings.exportButtonText} 
                    onChange={handleChange}
                    placeholder="Text for PDF export button" 
                  />
                </div>
                
                <Button 
                  onClick={saveSettings} 
                  className="w-full mt-4"
                >
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dashboard Labels</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dashboardTitle">Dashboard Title</Label>
                      <Input 
                        id="dashboardTitle" 
                        name="dashboardTitle" 
                        value={settings.dashboardTitle} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="totalTradesLabel">Total Trades Label</Label>
                      <Input 
                        id="totalTradesLabel" 
                        name="totalTradesLabel" 
                        value={settings.totalTradesLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="winTradesLabel">Win Trades Label</Label>
                      <Input 
                        id="winTradesLabel" 
                        name="winTradesLabel" 
                        value={settings.winTradesLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="loseTradesLabel">Lose Trades Label</Label>
                      <Input 
                        id="loseTradesLabel" 
                        name="loseTradesLabel" 
                        value={settings.loseTradesLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="breakevenLabel">Breakeven Label</Label>
                      <Input 
                        id="breakevenLabel" 
                        name="breakevenLabel" 
                        value={settings.breakevenLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="winRateLabel">Win Rate Label</Label>
                      <Input 
                        id="winRateLabel" 
                        name="winRateLabel" 
                        value={settings.winRateLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="riskRewardLabel">Risk/Reward Label</Label>
                      <Input 
                        id="riskRewardLabel" 
                        name="riskRewardLabel" 
                        value={settings.riskRewardLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="profitLossLabel">Profit/Loss Label</Label>
                      <Input 
                        id="profitLossLabel" 
                        name="profitLossLabel" 
                        value={settings.profitLossLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <Button onClick={saveSettings} className="w-full">
                      Save Dashboard Labels
                    </Button>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="weekly">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Section Labels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weeklyTradesTitle">Weekly Trades Title</Label>
                  <Input 
                    id="weeklyTradesTitle" 
                    name="weeklyTradesTitle" 
                    value={settings.weeklyTradesTitle} 
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="addTradeButtonText">Add Trade Button Text</Label>
                  <Input 
                    id="addTradeButtonText" 
                    name="addTradeButtonText" 
                    value={settings.addTradeButtonText} 
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weekPerformanceLabel">Week Performance Label</Label>
                  <Input 
                    id="weekPerformanceLabel" 
                    name="weekPerformanceLabel" 
                    value={settings.weekPerformanceLabel} 
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="totalPerformanceLabel">Total Performance Label</Label>
                  <Input 
                    id="totalPerformanceLabel" 
                    name="totalPerformanceLabel" 
                    value={settings.totalPerformanceLabel} 
                    onChange={handleChange}
                  />
                </div>
                
                <Button onClick={saveSettings} className="w-full">
                  Save Weekly Section Labels
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Table Headers</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateLabel">Date Label</Label>
                      <Input 
                        id="dateLabel" 
                        name="dateLabel" 
                        value={settings.dateLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pairLabel">Pair Label</Label>
                      <Input 
                        id="pairLabel" 
                        name="pairLabel" 
                        value={settings.pairLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="typeLabel">Type Label</Label>
                      <Input 
                        id="typeLabel" 
                        name="typeLabel" 
                        value={settings.typeLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="entryLabel">Entry Label</Label>
                      <Input 
                        id="entryLabel" 
                        name="entryLabel" 
                        value={settings.entryLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="slLabel">Stop Loss Label</Label>
                      <Input 
                        id="slLabel" 
                        name="slLabel" 
                        value={settings.slLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tpLabel">Take Profit Label</Label>
                      <Input 
                        id="tpLabel" 
                        name="tpLabel" 
                        value={settings.tpLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="riskLabel">Risk % Label</Label>
                      <Input 
                        id="riskLabel" 
                        name="riskLabel" 
                        value={settings.riskLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rrLabel">R:R Label</Label>
                      <Input 
                        id="rrLabel" 
                        name="rrLabel" 
                        value={settings.rrLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="statusLabel">Status Label</Label>
                      <Input 
                        id="statusLabel" 
                        name="statusLabel" 
                        value={settings.statusLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="resultLabel">Result Label</Label>
                      <Input 
                        id="resultLabel" 
                        name="resultLabel" 
                        value={settings.resultLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gainLossLabel">Gain/Loss % Label</Label>
                      <Input 
                        id="gainLossLabel" 
                        name="gainLossLabel" 
                        value={settings.gainLossLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="actionsLabel">Actions Label</Label>
                      <Input 
                        id="actionsLabel" 
                        name="actionsLabel" 
                        value={settings.actionsLabel} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <Button onClick={saveSettings} className="w-full">
                      Save Table Headers
                    </Button>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="capital">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Capital Section Labels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="initialCapitalLabel">Initial Capital Label</Label>
                  <Input 
                    id="initialCapitalLabel" 
                    name="initialCapitalLabel" 
                    value={settings.initialCapitalLabel} 
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentCapitalLabel">Current Capital Label</Label>
                  <Input 
                    id="currentCapitalLabel" 
                    name="currentCapitalLabel" 
                    value={settings.currentCapitalLabel} 
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editButtonText">Edit Button Text</Label>
                  <Input 
                    id="editButtonText" 
                    name="editButtonText" 
                    value={settings.editButtonText} 
                    onChange={handleChange}
                  />
                </div>
                
                <Button onClick={saveSettings} className="w-full">
                  Save Capital Labels
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t py-3 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-3 text-center">
          <div className="text-xs sm:text-sm text-muted-foreground mb-1">
            {settings.appTitle} - {settings.appSubtitle} &copy; {new Date().getFullYear()}
          </div>
          <div className="text-xs font-medium text-primary">
            This web site made By {settings.ownerName}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Settings;
