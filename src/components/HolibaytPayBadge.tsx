import { Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HolibaytPayBadgeProps {
  variant?: 'default' | 'small' | 'large';
  showTooltip?: boolean;
  className?: string;
}

export const HolibaytPayBadge = ({ 
  variant = 'default', 
  showTooltip = true,
  className = '' 
}: HolibaytPayBadgeProps) => {
  const { t } = useLanguage();

  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    default: 'text-sm px-3 py-1.5',
    large: 'text-base px-4 py-2'
  };

  const iconSizes = {
    small: 'h-3 w-3',
    default: 'h-4 w-4',
    large: 'h-5 w-5'
  };

  const badgeContent = (
    <Badge 
      className={`
        bg-gradient-to-r from-blue-600 to-blue-700 
        hover:from-blue-700 hover:to-blue-800 
        text-white border-0 
        flex items-center gap-1.5 
        ${sizeClasses[variant]} 
        ${className}
      `}
    >
      <Shield className={iconSizes[variant]} />
      <span className="font-inter font-semibold whitespace-nowrap">
        {t('holibaytPayBrand') || 'Holibayt Pay™'}
      </span>
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm font-inter">
            {t('holibaytPayTooltip') || 'Funds held in escrow until transaction confirmation. Your payment is protected.'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
