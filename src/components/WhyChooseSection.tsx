import { Card, CardContent } from "@/components/ui/card";
import { Shield, CheckCircle2, Scale, CreditCard, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const WhyChooseSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const features = [
    {
      icon: CheckCircle2,
      title: t('whyFeature1Title') || '100% Verified Listings',
      description: t('whyFeature1Desc') || 'Every property and owner is verified by our local validation team.',
      color: 'bg-green-500'
    },
    {
      icon: Shield,
      title: t('whyFeature2Title') || 'Secure Transactions',
      description: t('whyFeature2Desc') || 'All payments protected with bank-level security and encryption.',
      color: 'bg-blue-500'
    },
    {
      icon: Scale,
      title: t('whyFeature3Title') || 'Legal Support',
      description: t('whyFeature3Desc') || 'Expert legal assistance for every transaction, ensuring peace of mind.',
      color: 'bg-amber-500'
    },
    {
      icon: CreditCard,
      title: t('whyFeature4Title') || 'Holibayt Pay™ Escrow',
      description: t('whyFeature4Desc') || 'Funds held in escrow until transaction completion. Your money is protected.',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-playfair font-bold text-foreground mb-4">
            {t('whyChooseTitle') || 'Why Thousands Trust'} <span className="text-primary">Holibayt</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 sm:h-6 sm:w-6 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 text-base sm:text-lg font-inter font-semibold text-foreground">
              4.8/5 {t('averageRating') || 'average rating'}
            </span>
          </div>
          <p className="text-base md:text-lg text-muted-foreground font-inter font-light max-w-2xl mx-auto">
            {t('whyChooseSubtitle') || 'Algeria\'s most trusted real estate platform with verified properties and secure transactions.'}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLegalSupport = feature.title.includes('Legal Support') || feature.title.includes('juridique') || feature.title.includes('قانوني');
            const isHolibaytPay = feature.title.includes('Holibayt Pay') || feature.title.includes('Séquestre');
            const isClickable = isLegalSupport || isHolibaytPay;
            
            const handleClick = () => {
              if (isLegalSupport) {
                navigate('/legal-process');
              } else if (isHolibaytPay) {
                navigate('/holibayt-pay');
              }
            };
            
            return (
              <Card 
                key={index} 
                onClick={isClickable ? handleClick : undefined}
                className={`group relative overflow-hidden border-2 border-border hover:border-primary/30 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 bg-card ${isClickable ? 'cursor-pointer' : ''}`}
              >
                <CardContent className="p-4 sm:p-6 text-center">
                  {/* Icon Container */}
                  <div className="relative mb-3 sm:mb-4 flex justify-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 ${feature.color} text-white rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-base sm:text-lg font-playfair font-semibold text-foreground mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground font-inter leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
