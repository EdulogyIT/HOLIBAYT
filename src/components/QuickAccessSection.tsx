import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Key, Bed, ArrowRight, ShieldCheck, CreditCard, Shield, Search, Calendar, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

// Workflow Diagram Components
const BuyWorkflowDiagram = () => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-2 p-4 bg-primary/5 rounded-lg">
    <div className="flex flex-col items-center text-center flex-1">
      <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-2" />
      <p className="font-semibold text-xs sm:text-sm text-foreground">Verify</p>
      <p className="text-[10px] sm:text-xs text-muted-foreground">Holibayt Verify™</p>
    </div>
    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-primary rotate-90 sm:rotate-0 flex-shrink-0" />
    <div className="flex flex-col items-center text-center flex-1">
      <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-2" />
      <p className="font-semibold text-xs sm:text-sm text-foreground">Pay</p>
      <p className="text-[10px] sm:text-xs text-muted-foreground">Escrow Protection</p>
    </div>
    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-primary rotate-90 sm:rotate-0 flex-shrink-0" />
    <div className="flex flex-col items-center text-center flex-1">
      <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-2" />
      <p className="font-semibold text-xs sm:text-sm text-foreground">Protect</p>
      <p className="text-[10px] sm:text-xs text-muted-foreground">Holibayt Protect™</p>
    </div>
  </div>
);

const RentWorkflowDiagram = () => (
  <div className="flex flex-col gap-2 p-4 bg-accent/5 rounded-lg">
    <div className="flex items-center gap-2 p-2 bg-accent/10 rounded">
      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-accent flex-shrink-0" />
      <div className="flex-1">
        <p className="font-semibold text-xs sm:text-sm text-foreground">Trust</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">Verified landlords</p>
      </div>
    </div>
    <div className="flex items-center gap-2 p-2 bg-accent/10 rounded">
      <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-accent flex-shrink-0" />
      <div className="flex-1">
        <p className="font-semibold text-xs sm:text-sm text-foreground">Security</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">Holibayt Pay™</p>
      </div>
    </div>
    <div className="flex items-center gap-2 p-2 bg-accent/10 rounded">
      <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-accent flex-shrink-0" />
      <div className="flex-1">
        <p className="font-semibold text-xs sm:text-sm text-foreground">Protection</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">Holibayt Insurance™</p>
      </div>
    </div>
    <div className="flex items-center gap-2 p-2 bg-accent/10 rounded">
      <Search className="h-5 w-5 sm:h-6 sm:w-6 text-accent flex-shrink-0" />
      <div className="flex-1">
        <p className="font-semibold text-xs sm:text-sm text-foreground">Transparency</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">Digital contracts</p>
      </div>
    </div>
  </div>
);

const ShortStayWorkflowDiagram = () => (
  <div className="relative p-4 bg-foreground/5 rounded-lg">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-2">
      <div className="flex flex-col items-center text-center flex-1">
        <Search className="h-8 w-8 sm:h-10 sm:w-10 text-foreground mb-2" />
        <p className="font-semibold text-xs sm:text-sm text-foreground">Find & Verify</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">Guest screening</p>
      </div>
      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-foreground rotate-90 sm:rotate-0 flex-shrink-0" />
      <div className="flex flex-col items-center text-center flex-1">
        <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 text-foreground mb-2" />
        <p className="font-semibold text-xs sm:text-sm text-foreground">Book & Pay</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">Holibayt Pay™</p>
      </div>
      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-foreground rotate-90 sm:rotate-0 flex-shrink-0" />
      <div className="flex flex-col items-center text-center flex-1">
        <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-foreground mb-2" />
        <p className="font-semibold text-xs sm:text-sm text-foreground">Stay Protected</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">Holibayt Insurance™</p>
      </div>
    </div>
  </div>
);

const QuickAccessSection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const quickActions = [
    {
      id: 'buy',
      icon: Home,
      title: t('buyPropertyTitle'),
      description: t('buyNewDescription') || 'Properties for sale with verified sellers and legal support.',
      subtitle: t('buyPropertySubtitle'),
      DiagramComponent: BuyWorkflowDiagram,
      color: 'bg-primary',
      hoverColor: 'group-hover:bg-primary',
      borderColor: 'border-primary/20 group-hover:border-primary/40',
    },
    {
      id: 'rent',
      icon: Key,
      title: t('rentPropertyTitle'),
      description: t('rentNewDescription') || 'Long-term rentals with verified landlords and guaranteed payments.',
      subtitle: t('rentPropertySubtitle'),
      DiagramComponent: RentWorkflowDiagram,
      color: 'bg-accent',
      hoverColor: 'group-hover:bg-accent',
      borderColor: 'border-accent/20 group-hover:border-accent/40',
    },
    {
      id: 'stay',
      icon: Bed,
      title: t('shortStayTitle2'),
      description: t('shortStayNewDescription') || 'Your Algerian Airbnb — safe, verified, and convenient.',
      subtitle: t('shortStaySubtitle'),
      DiagramComponent: ShortStayWorkflowDiagram,
      color: 'bg-foreground',
      hoverColor: 'group-hover:bg-foreground',
      borderColor: 'border-foreground/20 group-hover:border-foreground/40',
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-foreground mb-3 sm:mb-4">
            {t('howCanWeHelp')}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-inter font-light max-w-2xl mx-auto px-4">
            {t('quickEntriesDesc')}
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-4 sm:gap-6 lg:gap-8">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Card 
                key={action.id} 
                onClick={() => navigate(`/${action.id === 'stay' ? 'short-stay' : action.id}`)}
                className={`group relative overflow-hidden border-2 ${action.borderColor} hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 cursor-pointer bg-card/50 backdrop-blur-sm flex flex-col h-full`}
              >
                <CardContent className="p-4 sm:p-6 md:p-8 text-center flex flex-col h-full">
                  {/* Watermark Icon */}
                  <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
                    <IconComponent className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40" />
                  </div>
                  
                  {/* Icon Container */}
                  <div className="relative mb-4 sm:mb-6 z-10">
                    <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 ${action.color} text-primary-foreground rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-4 sm:mb-6 flex-grow">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-playfair font-semibold text-foreground mb-2">
                      {action.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-primary font-inter font-medium mb-2 sm:mb-3">
                      {action.subtitle}
                    </p>
                    <p className="text-muted-foreground font-inter text-xs sm:text-sm md:text-base leading-relaxed mb-3 sm:mb-4 px-2">
                      {action.description}
                    </p>

                    {/* Workflow Diagram Component */}
                    <div className="mt-4 sm:mt-6">
                      <action.DiagramComponent />
                    </div>
                  </div>

                  {/* CTA Button - Footer */}
                  <div className="mt-auto pt-4 sm:pt-6">
                    <Button 
                      variant="ghost" 
                      className={`group/btn font-inter font-medium text-foreground hover:text-primary-foreground ${action.hoverColor} transition-all duration-300 h-10 sm:h-11 px-4 sm:px-5 text-xs sm:text-sm whitespace-nowrap w-full`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/${action.id === 'stay' ? 'short-stay' : action.id}`);
                      }}
                    >
                      <span className="whitespace-nowrap">{t('start')}</span>
                      <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
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
        <div className="text-center mt-8 sm:mt-12">
          <p className="text-muted-foreground font-inter text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6 font-semibold animate-pulse px-4">
            {t('needHelp')}
          </p>
          <Button 
            variant="outline" 
            size="lg" 
            className="font-inter font-medium text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 hover:shadow-elegant hover:scale-105 transition-all duration-300 border-2 border-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto"
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
