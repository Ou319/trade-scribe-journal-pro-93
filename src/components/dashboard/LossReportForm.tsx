
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

const lossSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Loss amount must be a positive number",
    })
});

interface LossReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capital: number | null;
  whatsappNumber: string; // The recipient's number
}

const LossReportForm = ({
  open,
  onOpenChange,
  capital,
  whatsappNumber
}: LossReportFormProps) => {
  const [lossAmount, setLossAmount] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    try {
      // Validate input using Zod
      lossSchema.parse({ amount: lossAmount });
      
      if (!capital) {
        toast.error("Initial capital must be set before reporting a loss");
        return;
      }

      // Construct WhatsApp URL
      const messageText = `Loss reported: ${lossAmount} against capital: ${capital.toFixed(2)}`;
      const encodedMessage = encodeURIComponent(messageText);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, "_blank");
      
      // Close dialog and reset form
      toast.success("Loss report sent to WhatsApp");
      setLossAmount("");
      setValidationError(null);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0].message);
      } else {
        console.error("Error sending loss report:", error);
        setValidationError("An unexpected error occurred");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Trading Loss</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="loss-amount">Loss Amount</Label>
            <Input
              id="loss-amount"
              type="number"
              placeholder="Enter loss amount"
              value={lossAmount}
              onChange={(e) => {
                setLossAmount(e.target.value);
                setValidationError(null);
              }}
              className={validationError ? "border-red-500" : ""}
            />
            {validationError && (
              <p className="text-sm text-red-500">{validationError}</p>
            )}
          </div>
          
          {capital !== null && (
            <div className="text-sm text-muted-foreground">
              Your current capital is: {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD' 
              }).format(capital)}
            </div>
          )}
          
          <div className="bg-amber-50 dark:bg-amber-950/50 p-3 rounded-md border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              This will send a WhatsApp message with your loss details. Make sure the information is correct before submitting.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Report Loss
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LossReportForm;
