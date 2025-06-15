import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useLocation } from "wouter";

interface PremiumFeatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
}

export function PremiumFeatureDialog({
  open,
  onOpenChange,
  featureName
}: PremiumFeatureDialogProps) {
  const [_, navigate] = useLocation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black border border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Premium Feature: {featureName}
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-4 mt-4">
              <p className="text-base text-white/80">
                This feature is exclusively available with a Premium subscription.
                Upgrade now to unlock all premium features and enhance your profile!
              </p>
              <div className="bg-white/5 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium text-white">Premium includes:</p>
                <ul className="list-disc list-inside text-sm text-white/70 space-y-1">
                  <li>Unlimited social links</li>
                  <li>Monochrome social icons</li>
                  <li>Custom decorations and effects</li>
                  <li>AI-powered chatbot</li>
                  <li>Advanced background options</li>
                </ul>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Maybe Later
                </Button>
                <Button 
                  onClick={() => {
                    onOpenChange(false);
                    navigate('/pricing');
                  }}
                  className="bg-gradient-to-r from-yellow-500/80 to-yellow-600/80 hover:from-yellow-500 hover:to-yellow-600"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}