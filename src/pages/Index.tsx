
import { useJournal } from "@/contexts/JournalContext";
import Navbar from "@/components/layout/Navbar";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ChartAnalysis from "@/components/dashboard/ChartAnalysis";
import WeekDetail from "@/components/weeks/WeekDetail";

const Index = () => {
  const { stats } = useJournal();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <DashboardStats />
        
        <div className="my-6">
          <ChartAnalysis />
        </div>
        
        <WeekDetail />
      </main>
      
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          YTR - Journal de Trading &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;
