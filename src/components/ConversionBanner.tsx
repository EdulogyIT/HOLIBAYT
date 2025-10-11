import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { HolibaytPayBadge } from "./HolibaytPayBadge";
import { useNavigate } from "react-router-dom";

interface ConversionBannerProps {
  type: 'buy' | 'rent' | 'short-stay';
}

export const ConversionBanner = ({ type }: ConversionBannerProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const getContent = () => {
    switch (type) {
      case 'buy':
        return {
          title: t('secureTransaction'),
          description: t('fundsInEscrow'),
          cta: t('learnMore')
        };
      case 'rent':
        return {
          title: t('avoidScams'),
          description: "",
          cta: t('learnMore')
        };
      case 'short-stay':
        return {
          title: t('staySafeHolibaytPay'),
          description: t('holibaytPayProtected'),
          cta: t('learnMore')
        };
    }
  };

  const content = getContent();

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-t border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <HolibaytPayBadge variant="large" showTooltip={false} />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-playfair">
            {content.title}
          </h2>
          
          {content.description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {content.description}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-5 w-5 text-primary" />
              <span>{t('verifiedProperties')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-5 w-5 text-primary" />
              <span>{t('securePayments')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-5 w-5 text-primary" />
              <span>{t('legalAssistance')}</span>
            </div>
          </div>

          <Button 
            size="lg" 
            className="mt-4"
            onClick={() => navigate('/holibayt-pay')}
          >
            {content.cta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
