import { Shield, CheckCircle2, Scale, Clock, HeadphonesIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TrustIndicatorsProps {
  variant?: 'full' | 'compact';
  type?: 'default' | 'shortStay';
  className?: string;
}

export const TrustIndicators = ({ variant = 'full', type = 'default', className = '' }: TrustIndicatorsProps) => {
  const { t } = useLanguage();

  const defaultIndicators = [
    {
      icon: CheckCircle2,
      label: t('trustVerifiedListings') || '100% Verified Listings',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: Shield,
      label: t('trustPaymentsProtected') || 'Payments Protected',
      color: 'text-primary'
    },
    {
      icon: Scale,
      label: t('trustLegalSupport') || 'Legal Support',
      color: 'text-amber-600 dark:text-amber-400'
    }
  ];

  const shortStayIndicators = [
    {
      icon: Shield,
      label: t('verifiedHosts') || 'Verified Hosts',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: CheckCircle2,
      label: t('securedPaymentsEscrow') || 'Secured Payments (Escrow)',
      color: 'text-primary'
    },
    {
      icon: Clock,
      label: t('instantBookingConfirmation') || 'Instant Booking',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: HeadphonesIcon,
      label: t('localSupport247') || '24/7 Local Support',
      color: 'text-amber-600 dark:text-amber-400'
    }
  ];

  const indicators = type === 'shortStay' ? shortStayIndicators : defaultIndicators;

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-center gap-4 flex-wrap ${className}`}>
        {indicators.map((indicator, index) => {
          const Icon = indicator.icon;
          return (
            <div key={index} className="flex items-center gap-1.5 text-xs sm:text-sm font-inter">
              <Icon className={`h-4 w-4 ${indicator.color}`} />
              <span className="text-muted-foreground whitespace-nowrap">{indicator.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${className}`}>
      {indicators.map((indicator, index) => {
        const Icon = indicator.icon;
        return (
          <div 
            key={index} 
            className="flex items-center gap-3 p-4 bg-card/80 backdrop-blur-sm rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-300"
          >
            <div className={`p-2 rounded-lg bg-background ${indicator.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="font-inter font-medium text-sm text-foreground">{indicator.label}</span>
          </div>
        );
      })}
    </div>
  );
};
