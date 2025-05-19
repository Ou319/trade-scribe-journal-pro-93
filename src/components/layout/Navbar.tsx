
import { Button } from "@/components/ui/button";
import { useJournal } from "@/contexts/JournalContext";
import ThemeToggle from "../ThemeToggle";
import { FileText } from "lucide-react";

const Navbar = () => {
  const { exportToPDF } = useJournal();

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
            onClick={exportToPDF} 
            className="flex text-xs h-8 bg-blue-500 hover:bg-blue-600 text-white"
            size="sm"
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" /> Export Comprehensive PDF
          </Button>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
