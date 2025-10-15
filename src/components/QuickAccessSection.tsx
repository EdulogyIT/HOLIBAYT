import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Key, Bed, ArrowRight, Shield, DollarSign, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const QuickAccessSection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const quickActions = [
    {
      id: 'buy',
      icon: Home,
      title: t('buyPropertyTitle'),
      description: t('buyNewDescription') || 'Find your future home with verified sellers and full legal support.',
      subtitle: t('buyPropertySubtitle'),
      color: 'bg-primary',
      hoverColor: 'group-hover:bg-primary',
      borderColor: 'border-primary/20 group-hover:border-primary/40',
      trustIndicators: [
        { icon: Shield, text: t('verifiedProperties') || 'Verified Properties' },
        { icon: DollarSign, text: t('securePayments') || 'Secure Payments' },
        { icon: Scale, text: t('legalAssistance') || 'Legal Support' }
      ]
    },
    {
      id: 'rent',
      icon: Key,
      title: t('rentPropertyTitle'),
      description: t('rentNewDescription') || 'Long-term rentals with verified landlords and guaranteed payments.',
      subtitle: t('rentPropertySubtitle'),
      color: 'bg-accent',
      hoverColor: 'group-hover:bg-accent',
      borderColor: 'border-accent/20 group-hover:border-accent/40',
      trustIndicators: [
        { icon: Shield, text: t('verifiedProperties') || 'Verified Properties' },
        { icon: DollarSign, text: t('securePayments') || 'Secure Payments' },
        { icon: Scale, text: t('legalAssistance') || 'Legal Support' }
      ]
    },
    {
      id: 'stay',
      icon: Bed,
      title: t('shortStayTitle2'),
      description: t('shortStayNewDescription') || 'Your Algerian Airbnb — safe, verified, and convenient.',
      subtitle: t('shortStaySubtitle'),
      color: 'bg-foreground',
      hoverColor: 'group-hover:bg-foreground',
      borderColor: 'border-foreground/20 group-hover:border-foreground/40',
      trustIndicators: [
        { icon: Shield, text: t('verifiedHosts') || 'Verified Hosts' },
        { icon: DollarSign, text: t('securedPaymentsEscrow') || 'Secured Payments' },
        { icon: Scale, text: t('localSupport247') || '24/7 Support' }
      ]
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
            {t('howCanWeHelp')}
          </h2>
          <p className="text-lg text-muted-foreground font-inter font-light max-w-2xl mx-auto">
            {t('quickEntriesDesc')}
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-6 lg:gap-8">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Card 
                key={action.id} 
                onClick={() => navigate(`/${action.id === 'stay' ? 'short-stay' : action.id}`)}
                className={`group relative overflow-hidden border-2 ${action.borderColor} hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 cursor-pointer bg-card/50 backdrop-blur-sm flex flex-col h-full min-h-[480px]`}
              >
                <CardContent className="p-6 md:p-8 text-center flex flex-col h-full">
                  {/* Watermark Icon */}
                  <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
                    <IconComponent className="h-32 w-32 md:h-40 md:w-40" />
                  </div>
                  
                  {/* Icon Container */}
                  <div className="relative mb-6 z-10">
                    <div className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 ${action.color} text-primary-foreground rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <IconComponent className="h-8 w-8 md:h-10 md:w-10" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-6 flex-grow">
                    <h3 className="text-xl md:text-2xl font-playfair font-semibold text-foreground mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-primary font-inter font-medium mb-3">
                      {action.subtitle}
                    </p>
                    <p className="text-muted-foreground font-inter text-sm md:text-base leading-relaxed mb-4">
                      {action.description}
                    </p>

                    {/* Trust Indicators - Single Icons */}
                    <div className="space-y-2">
                      {action.trustIndicators.map((indicator, idx) => {
                        const TrustIcon = indicator.icon;
                        return (
                          <div key={idx} className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <TrustIcon className="h-4 w-4 text-primary" />
                            <span>{indicator.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* CTA Button - Footer */}
                  <div className="mt-auto pt-6">
                    <Button 
                      variant="ghost" 
                      className={`group/btn font-inter font-medium text-foreground hover:text-primary-foreground ${action.hoverColor} transition-all duration-300 h-11 px-5 text-sm whitespace-nowrap w-full`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/${action.id === 'stay' ? 'short-stay' : action.id}`);
                      }}
                    >
                      <span className="whitespace-nowrap">{t('start')}</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                </CardContent>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground font-inter text-2xl md:text-3xl mb-6 font-semibold animate-pulse">
            {t('needHelp')}
          </p>
          <Button 
            variant="outline" 
            size="lg" 
            className="font-inter font-medium text-lg px-8 py-3 hover:shadow-elegant hover:scale-105 transition-all duration-300 border-2 border-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => navigate('/contact-advisor')}
          >
            {t('speakToAdvisor')}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default QuickAccessSection;
