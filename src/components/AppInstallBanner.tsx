import { useState, useEffect } from "react";
import { X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export const AppInstallBanner = () => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('app-install-banner-dismissed');
    if (!dismissed && isMobile) {
      setIsVisible(true);
    }
  }, [isMobile]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('app-install-banner-dismissed', 'true');
  };

  if (!isMobile || !isVisible) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-background border-b border-border shadow-sm animate-in slide-in-from-top duration-300">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 flex-1">
          <Smartphone className="h-8 w-8 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Get the Holibayt App</p>
            <p className="text-xs text-muted-foreground">Better experience on mobile</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" disabled className="text-xs px-3">
            Coming Soon
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
