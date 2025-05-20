
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";

const Settings = () => {
  const [settings, setSettings] = useState({
    appTitle: "YTR",
    appSubtitle: "Journal de Trading",
    ownerName: "Outmane El ouaafa",
    initialCapitalLabel: "Initial Capital",
    currentCapitalLabel: "Current Capital",
    editButtonText: "Edit",
    chartTitle: "Trading Performance",
    cardTitle: "Data Management",
    cardDescription: "Manage your trading journal settings and customize your application.",
    buttonText: "Go to Settings"
  });
  
  // Load settings from localStorage on component mount
  useEffect(() => {
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
  
  // Save settings to localStorage
  const handleSave = () => {
    localStorage.setItem("app-settings", JSON.stringify(settings));
    toast.success("Settings saved successfully!");
  };
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>
              Customize your application labels and information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <h3 className="text-lg font-medium">General Information</h3>
                <div className="grid gap-2">
                  <Label htmlFor="appTitle">Application Title</Label>
                  <Input
                    id="appTitle"
                    name="appTitle"
                    value={settings.appTitle}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="appSubtitle">Application Subtitle</Label>
                  <Input
                    id="appSubtitle"
                    name="appSubtitle"
                    value={settings.appSubtitle}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    name="ownerName"
                    value={settings.ownerName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid gap-3">
                <h3 className="text-lg font-medium">Capital Display Labels</h3>
                <div className="grid gap-2">
                  <Label htmlFor="initialCapitalLabel">Initial Capital Label</Label>
                  <Input
                    id="initialCapitalLabel"
                    name="initialCapitalLabel"
                    value={settings.initialCapitalLabel}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currentCapitalLabel">Current Capital Label</Label>
                  <Input
                    id="currentCapitalLabel"
                    name="currentCapitalLabel"
                    value={settings.currentCapitalLabel}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editButtonText">Edit Button Text</Label>
                  <Input
                    id="editButtonText"
                    name="editButtonText"
                    value={settings.editButtonText}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid gap-3">
                <h3 className="text-lg font-medium">Chart Settings</h3>
                <div className="grid gap-2">
                  <Label htmlFor="chartTitle">Chart Title</Label>
                  <Input
                    id="chartTitle"
                    name="chartTitle"
                    value={settings.chartTitle}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid gap-3">
                <h3 className="text-lg font-medium">Settings Card</h3>
                <div className="grid gap-2">
                  <Label htmlFor="cardTitle">Card Title</Label>
                  <Input
                    id="cardTitle"
                    name="cardTitle"
                    value={settings.cardTitle}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cardDescription">Card Description</Label>
                  <Input
                    id="cardDescription"
                    name="cardDescription"
                    value={settings.cardDescription}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input
                    id="buttonText"
                    name="buttonText"
                    value={settings.buttonText}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <Button onClick={handleSave}>Save Settings</Button>
            </div>
          </CardContent>
        </Card>
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
