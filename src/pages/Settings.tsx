
import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Settings = () => {
  const [settings, setSettings] = useState({
    appTitle: "YTR",
    appSubtitle: "Journal de Trading",
    ownerName: "Outmane El ouaafa",
    exportButtonText: "Export Comprehensive PDF",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const saveSettings = () => {
    // In a real app, this would save to localStorage or a backend
    localStorage.setItem("app-settings", JSON.stringify(settings));
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-2 sm:px-4 py-3 sm:py-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Appearance Settings</CardTitle>
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
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-2">About Your Journal</h3>
                <p className="text-sm text-muted-foreground">
                  This trading journal application helps you track your trades, analyze performance, 
                  and improve your trading strategy over time.
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-2">Data Storage</h3>
                <p className="text-sm text-muted-foreground">
                  Currently, your data is stored locally in your browser. 
                  It's recommended to regularly export your journal as PDF for backup.
                </p>
              </div>
            </CardContent>
          </Card>
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

export default Settings;
