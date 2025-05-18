
import { Button } from "@/components/ui/button";
import { useJournal } from "@/contexts/JournalContext";
import ThemeToggle from "../ThemeToggle";
import { Download } from "lucide-react";

const Navbar = () => {
  const { exportToCSV } = useJournal();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold mr-2">YTR</h1>
          <span className="text-muted-foreground">Journal de Trading</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={exportToCSV} 
            className="hidden sm:flex"
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
