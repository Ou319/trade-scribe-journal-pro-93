
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";

const ChartAnalysis = () => {
  const [settings, setSettings] = useState({
    cardTitle: "Data Management",
    cardDescription: "Manage your trading journal settings and customize your application.",
    buttonText: "Go to Settings"
  });

  useEffect(() => {
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem("app-settings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings.cardTitle) setSettings(s => ({...s, cardTitle: parsedSettings.cardTitle}));
        if (parsedSettings.cardDescription) setSettings(s => ({...s, cardDescription: parsedSettings.cardDescription}));
        if (parsedSettings.buttonText) setSettings(s => ({...s, buttonText: parsedSettings.buttonText}));
      } catch (e) {
        console.error("Error parsing settings:", e);
      }
    }
  }, []);

  return (
    <Card className="shadow-sm border-opacity-50 overflow-hidden rounded-xl bg-gradient-to-b from-card to-card/80 dark:from-gray-900 dark:to-gray-950">
      <CardHeader className="border-b pb-3 bg-gradient-to-r from-background to-background/50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base md:text-lg font-medium flex items-center gap-2 text-primary">
            {settings.cardTitle}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 text-center">
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {settings.cardDescription}
          </p>
          <Button asChild variant="outline">
            <Link to="/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              {settings.buttonText}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartAnalysis;
