
import { useJournal } from "@/contexts/JournalContext";
import Navbar from "@/components/layout/Navbar";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ChartAnalysis from "@/components/dashboard/ChartAnalysis";
import WeekDetail from "@/components/weeks/WeekDetail";
import CapitalDisplay from "@/components/dashboard/CapitalDisplay";

const Index = () => {
  const { stats } = useJournal();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-2 sm:px-4 py-3 sm:py-6">
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {/* Capital Display */}
          <CapitalDisplay />
          
          {/* Dashboard Stats */}
          <DashboardStats />
          
          {/* Week Detail */}
          <WeekDetail />
          
          {/* Chart Analysis - Positioned at the bottom */}
          <div className="mb-4">
            <ChartAnalysis />
          </div>
        </div>
      </main>
      
      <footer className="border-t py-3 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-3 text-center">
          <div className="text-xs sm:text-sm text-muted-foreground mb-1">
            YTR - Journal de Trading &copy; {new Date().getFullYear()}
          </div>
          <div className="text-xs font-medium text-primary">
            This web site made By Outmane El ouaafa
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
