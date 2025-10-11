import { Badge } from './ui/badge';
import { Flame, ShieldCheck, Sparkles, Shield, Home } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PropertyBadgesProps {
  isHotDeal?: boolean;
  isVerified?: boolean;
  isNew?: boolean;
  isHolibaytPayEligible?: boolean;
  isNewBuild?: boolean;
  showVerifiedOwner?: boolean;
}

export const PropertyBadges = ({ 
  isHotDeal, 
  isVerified, 
  isNew, 
  isHolibaytPayEligible = true, 
  isNewBuild = false,
  showVerifiedOwner = false 
}: PropertyBadgesProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
      {isHotDeal && (
        <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 flex items-center gap-1 shadow-lg">
          <Flame className="h-3 w-3" />
          {t('hotDeal') || 'Hot Deal'}
        </Badge>
      )}
      {isVerified && (
        <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 flex items-center gap-1 shadow-lg">
          <ShieldCheck className="h-3 w-3" />
          {t('verified') || 'Verified'}
        </Badge>
      )}
      {showVerifiedOwner && (
        <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 flex items-center gap-1 shadow-lg">
          <ShieldCheck className="h-3 w-3" />
          {t('verifiedOwner') || 'Verified Owner'}
        </Badge>
      )}
      {isNew && (
        <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 flex items-center gap-1 shadow-lg">
          <Sparkles className="h-3 w-3" />
          {t('new') || 'New'}
        </Badge>
      )}
      {isNewBuild && (
        <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 flex items-center gap-1 shadow-lg">
          <Home className="h-3 w-3" />
          {t('newBuild') || 'New Build'}
        </Badge>
      )}
      {isHolibaytPayEligible && (
        <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 flex items-center gap-1 shadow-lg">
          <Shield className="h-3 w-3" />
          {t('holibaytPayBrand') || 'Holibayt Pay™'}
        </Badge>
      )}
    </div>
  );
};
