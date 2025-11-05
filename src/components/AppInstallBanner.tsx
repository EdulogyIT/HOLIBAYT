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
    <div className="fixed top-[72px] sm:top-16 left-0 right-0 z-30 bg-background border-b border-border shadow-sm animate-in slide-in-from-top duration-300">
      <div className="flex items-center justify-between gap-2 px-2 py-1.5 sm:px-4 sm:py-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
          <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-foreground truncate">Get the Holibayt App</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <Button size="sm" disabled className="text-xs px-2 h-7 sm:h-8">
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
