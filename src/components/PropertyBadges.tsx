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
  showInstantBooking?: boolean;
  showVerifiedHost?: boolean;
  showContractDigitallyAvailable?: boolean;
  showVerifiedLandlord?: boolean;
  size?: 'default' | 'sm' | 'xs';
}

export const PropertyBadges = ({ 
  isHotDeal, 
  isVerified, 
  isNew, 
  isHolibaytPayEligible = true, 
  isNewBuild = false,
  showVerifiedOwner = false,
  showInstantBooking = false,
  showVerifiedHost = false,
  showContractDigitallyAvailable = false,
  showVerifiedLandlord = false,
  size = 'default'
}: PropertyBadgesProps) => {
  const { t } = useLanguage();
  
  const badgeClasses = {
    default: "flex items-center gap-1 shadow-lg",
    sm: "flex items-center gap-1 shadow-md text-xs h-5 px-1.5",
    xs: "flex items-center gap-0.5 shadow text-[9px] h-4 px-1"
  };
  
  const iconClasses = {
    default: "h-3 w-3",
    sm: "h-2.5 w-2.5",
    xs: "h-2 w-2"
  };
  
  const badgeClass = badgeClasses[size];
  const iconClass = iconClasses[size];
  
  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
      {showVerifiedHost && (
        <Badge className={`bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 ${badgeClass}`}>
          <ShieldCheck className={iconClass} />
          {t('verifiedHost') || 'Verified Host'}
        </Badge>
      )}
      {showVerifiedLandlord && (
        <Badge className={`bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 ${badgeClass}`}>
          <ShieldCheck className={iconClass} />
          {t('verifiedLandlord') || 'Verified Landlord'}
        </Badge>
      )}
      {showContractDigitallyAvailable && (
        <Badge className={`bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 ${badgeClass}`}>
          <Shield className={iconClass} />
          {t('contractDigitallyAvailable') || 'Digital Contract Available'}
        </Badge>
      )}
      {showInstantBooking && (
        <Badge className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 ${badgeClass}`}>
          <Sparkles className={iconClass} />
          {t('instantBooking') || 'Instant Booking'}
        </Badge>
      )}
      {isHotDeal && (
        <Badge className={`bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 ${badgeClass}`}>
          <Flame className={iconClass} />
          {t('hotDeal') || 'Hot Deal'}
        </Badge>
      )}
      {isVerified && (
        <Badge className={`bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 ${badgeClass}`}>
          <ShieldCheck className={iconClass} />
          {t('verified') || 'Verified'}
        </Badge>
      )}
      {showVerifiedOwner && (
        <Badge className={`bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 ${badgeClass}`}>
          <ShieldCheck className={iconClass} />
          {t('verifiedOwner') || 'Verified Owner'}
        </Badge>
      )}
      {isNew && (
        <Badge className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 ${badgeClass}`}>
          <Sparkles className={iconClass} />
          {t('new') || 'New'}
        </Badge>
      )}
      {isNewBuild && (
        <Badge className={`bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 ${badgeClass}`}>
          <Home className={iconClass} />
          {t('newBuild') || 'New Build'}
        </Badge>
      )}
      {isHolibaytPayEligible && (
        <Badge className={`bg-gradient-to-r from-primary to-primary/90 text-white hover:from-primary/90 hover:to-primary ${badgeClass}`}>
          <Shield className={iconClass} />
          {t('holibaytPayBrand') || 'Holibayt Pay™'}
        </Badge>
      )}
    </div>
  );
};
