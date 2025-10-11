import { Shield, Scale, CreditCard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PropertyIconsProps {
  showEscrow?: boolean;
  showLegal?: boolean;
  showFinancing?: boolean;
  size?: "sm" | "md" | "lg";
}

export const PropertyIcons = ({ 
  showEscrow = true, 
  showLegal = false, 
  showFinancing = false,
  size = "md" 
}: PropertyIconsProps) => {
  const { t } = useLanguage();
  
  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  const iconClass = iconSizes[size];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {showEscrow && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-help">
                <Shield className={iconClass} />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{t('fundsInEscrow')}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {showLegal && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-1.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors cursor-help">
                <Scale className={iconClass} />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{t('legalAssistance')}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {showFinancing && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors cursor-help">
                <CreditCard className={iconClass} />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{t('financingAvailable')}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
