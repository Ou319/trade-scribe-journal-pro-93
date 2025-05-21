
import { useJournal } from "@/contexts/JournalContext";
import Navbar from "@/components/layout/Navbar";
import DashboardStats from "@/components/dashboard/DashboardStats";
import WeekDetail from "@/components/weeks/WeekDetail";
import CapitalDisplay from "@/components/dashboard/CapitalDisplay";
import PerformanceChart from "@/components/charts/PerformanceChart";
import { useEffect, useState } from "react";

const Index = () => {
  const { stats } = useJournal();
  const [settings, setSettings] = useState({
    appTitle: "YTR",
    appSubtitle: "Journal de Trading",
    ownerName: "Outmane El ouaafa",
    initialCapitalLabel: "Initial Capital",
    currentCapitalLabel: "Current Capital",
    editButtonText: "Edit",
    chartTitle: "Trading Performance"
  });

  useEffect(() => {
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem("app-settings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prevSettings => ({...prevSettings, ...parsedSettings}));
      } catch (e) {
        console.error("Error parsing settings:", e);
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-2 sm:px-4 py-3 sm:py-6">
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {/* Capital Display */}
          <CapitalDisplay
            initialCapitalLabel={settings.initialCapitalLabel}
            currentCapitalLabel={settings.currentCapitalLabel}
            editButtonText={settings.editButtonText}
          />
          
          {/* Dashboard Stats */}
          <DashboardStats />
          
          {/* Week Detail */}
          <WeekDetail />
          
          {/* Performance Chart - now positioned at the bottom */}
          <PerformanceChart title={settings.chartTitle} />
        </div>
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

export default Index;
