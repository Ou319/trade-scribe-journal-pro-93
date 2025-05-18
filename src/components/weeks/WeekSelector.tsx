
import { useJournal } from "@/contexts/JournalContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const WeekSelector = () => {
  const { journal, currentWeekId, setCurrentWeekId, addWeek } = useJournal();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWeekName, setNewWeekName] = useState("");

  const handleAddWeek = () => {
    if (newWeekName.trim()) {
      addWeek(newWeekName.trim());
      setNewWeekName("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1">
        <Select
          value={currentWeekId || ""}
          onValueChange={(value) => setCurrentWeekId(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Week" />
          </SelectTrigger>
          <SelectContent>
            {journal.weeks.map((week) => (
              <SelectItem key={week.id} value={week.id}>
                {week.name} ({week.percentGain > 0 ? "+" : ""}
                {week.percentGain.toFixed(2)}%)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Week</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="week-name">Week Name</Label>
              <Input
                id="week-name"
                placeholder="e.g. Week 2"
                value={newWeekName}
                onChange={(e) => setNewWeekName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddWeek();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddWeek} disabled={!newWeekName.trim()}>
              Add Week
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeekSelector;
