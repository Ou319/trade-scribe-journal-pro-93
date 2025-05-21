
import { Button } from "@/components/ui/button";
import { useJournal } from "@/contexts/JournalContext";
import ThemeToggle from "../ThemeToggle";
import { FileText, Home, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const Navbar = () => {
  const { exportToPDF } = useJournal();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold mr-2">YTR</h1>
            <span className="text-muted-foreground">Journal de Trading</span>
          </Link>
          
          <NavigationMenu className="ml-4">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/" className={navigationMenuTriggerStyle()}>
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/settings" className={navigationMenuTriggerStyle()}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={exportToPDF} 
            className="flex text-xs h-8 bg-primary hover:bg-primary/90 text-white"
            size="sm"
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" /> Export PDF Report
          </Button>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
