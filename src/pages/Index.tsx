
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
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <CapitalDisplay />
        
        <DashboardStats />
        
        <WeekDetail />
        
        <div className="my-8">
          <ChartAnalysis />
        </div>
      </main>
      
      <footer className="border-t py-4 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="text-sm text-muted-foreground mb-1">
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
