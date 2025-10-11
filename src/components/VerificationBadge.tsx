import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

interface VerificationBadgeProps {
  type: 'owner' | 'landlord' | 'property';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VerificationBadge = ({ 
  type, 
  size = 'md',
  className = '' 
}: VerificationBadgeProps) => {
  const { t } = useLanguage();

  const labels = {
    owner: t('verifiedOwner') || 'Verified Owner',
    landlord: t('verifiedLandlord') || 'Verified Landlord',
    property: t('verifiedProperty') || 'Verified Property'
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Badge 
      className={`
        bg-gradient-to-r from-green-600 to-emerald-600
        hover:from-green-700 hover:to-emerald-700
        text-white border-0
        flex items-center gap-1.5
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <ShieldCheck className={iconSizes[size]} />
      <span className="font-inter font-medium whitespace-nowrap">
        {labels[type]}
      </span>
    </Badge>
  );
};
