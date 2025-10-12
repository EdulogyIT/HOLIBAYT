import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Shield, DollarSign, FileCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
          title: t('staySafeHolibaytPay') || 'Stay Safe with Holibayt Pay™',
          description: t('fundsInEscrow') || 'Your funds are held in escrow until you receive your property keys',
          cta: t('learnMore') || 'Learn More'
        };
      case 'rent':
        return {
          title: t('staySafeHolibaytPay') || 'Stay Safe with Holibayt Pay™',
          description: "",
          cta: t('learnMore') || 'Learn More'
        };
      case 'short-stay':
        return {
          title: t('holibaytPayProtected') || 'Protected by Holibayt Pay™',
          description: t('secureTransaction') || 'Your payment is held in escrow until check-in confirmation',
          cta: t('learnMore') || 'Learn More'
        };
    }
  };

  const content = getContent();

  return (
    <div className="bg-gradient-to-r from-primary via-primary to-primary-glow relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Content */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 font-playfair">
              {content.title}
            </h3>
            {content.description && (
              <p className="text-white/90 text-sm md:text-base font-inter max-w-xl">
                {content.description}
              </p>
            )}
          </div>

          {/* Trust Indicators - Different Icons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">{t('verifiedProperties') || 'Verified'}</span>
            </div>
            <div className="flex items-center gap-2 text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm font-medium">{t('securePayments') || 'Secure'}</span>
            </div>
            <div className="flex items-center gap-2 text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <FileCheck className="w-5 h-5" />
              <span className="text-sm font-medium">{t('legalAssistance') || 'Legal'}</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={() => navigate('/holibayt-pay')}
            className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
          >
            {content.cta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
