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
    <div className="fixed top-14 sm:top-16 left-0 right-0 z-40 bg-background border-b border-border shadow-sm animate-in slide-in-from-top duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0 px-3 py-2 sm:px-4 sm:py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-foreground">Get the Holibayt App</p>
            <p className="text-xs text-muted-foreground hidden sm:block">Better experience on mobile</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button size="sm" disabled className="text-xs px-2 sm:px-3 h-7 sm:h-8">
            Coming Soon
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
