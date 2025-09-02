import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Key, Bed, Shield, Star, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import luxuryApartment from "@/assets/property-luxury-apartment.jpg";
import villaMediterranean from "@/assets/property-villa-mediterranean.jpg";
import shortStay from "@/assets/property-short-stay.jpg";
import modernApartment from "@/assets/property-modern-apartment.jpg";
import traditionalHouse from "@/assets/property-traditional-house.jpg";
import penthouse from "@/assets/property-penthouse.jpg";
import studio from "@/assets/property-studio.jpg";

const ServicesSection = () => {
  const { t, currentLang } = useLanguage();
  const navigate = useNavigate();

  // Localized metrics formatting
  const locale = currentLang === "AR" ? "ar" : currentLang.toLowerCase();
  const int1 = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const int0 = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });

  // Actual numbers
  const verifiedPercent = 100;
  const rating = 4.8;
  const responseHours = 2;

  const statVerified = `${int0.format(verifiedPercent)}% ${t("verifiedLabel")}`;
  const statRating = `${int1.format(rating)}/5 ${t("ratingLabel")}`;
  const statResponse = `< ${int0.format(responseHours)}${t("hoursAbbrev")} ${t("responseLabel")}`;
  
  const services = [
    {
      id: "buy",
      icon: Home,
      title: t('buyTitle'),
      subtitle: t('buySubtitle'),
      description: t('buyDescription'),
      features: [t('buy_feat_verified'), t('buy_feat_virtualTour'), t('buy_feat_legal'), t('buy_feat_financing')],
      color: "bg-primary",
      gradient: "from-primary to-primary/80",
      image: villaMediterranean,
      ctaKey: 'exploreBuy'
    },
    {
      id: "rent",
      icon: Key,
      title: t('rentTitle'),
      subtitle: t('rentSubtitle'),
      description: t('rentDescription'),
      features: [t('rent_feat_paymentGuarantee'), t('rent_feat_secureContracts'), t('rent_feat_dedicatedTeam'), t('rent_feat_digitalInspection')],
      color: "bg-accent",
      gradient: "from-accent to-accent/80",
      image: modernApartment,
      ctaKey: 'exploreRent'
    },
    {
      id: "stay",
      icon: Bed,
      title: t('stayTitle'),
      subtitle: t('staySubtitle'),
      description: t('stayDescription'),
      features: [t('stay_feat_instantBooking'), t('stay_feat_verifiedHosts'), t('stay_feat_travelInsurance'), t('stay_feat_localExperiences')],
      color: "bg-foreground",
      gradient: "from-foreground to-foreground/80",
      image: shortStay,
      ctaKey: 'exploreShortStay'
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-6">
            {t('threeWaysToLive')} <span className="text-primary">{t('liveAlgeria')}</span>
          </h2>
          <p className="text-xl text-muted-foreground font-inter font-light max-w-3xl mx-auto">
            {t('platformDesc')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-6 mb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={service.id} className="group relative overflow-hidden border-border/50 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-card flex flex-col h-full min-h-[420px]">
                {/* Hero Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={`${service.title} - ${service.subtitle}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  
                  {/* Icon overlay */}
                  <div className={`absolute top-4 right-4 inline-flex items-center justify-center w-12 h-12 ${service.color} text-primary-foreground rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>

                <CardContent className="relative p-6 flex flex-col flex-grow">
                  {/* Content */}
                  <div className="mb-6">
                    <h3 className="text-xl font-playfair font-semibold text-foreground mb-1">{service.title}</h3>
                    <p className="text-primary font-inter font-medium text-sm mb-3">{service.subtitle}</p>
                    <p className="text-muted-foreground font-inter text-sm leading-relaxed">{service.description}</p>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-2">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                          <span className="text-xs font-inter text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button - Anchored to bottom */}
                  <div className="mt-auto pt-6">
                    <Button 
                      className="h-11 px-5 text-sm font-medium whitespace-nowrap w-full bg-gradient-primary font-inter group-hover:shadow-elegant transition-all duration-300"
                      onClick={() => navigate(`/${service.id === 'stay' ? 'short-stay' : service.id}`)}
                    >
                      <span className="whitespace-nowrap">{t(service.ctaKey)}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust Indicators - Enhanced */}
        <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/20 rounded-3xl p-8 md:p-12 shadow-elegant border border-primary/20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 text-primary rounded-2xl mb-6 animate-pulse">
              <Star className="h-8 w-8" />
            </div>
            <h3 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
              {t('whyChooseHolibayt')}
            </h3>
            <p className="text-lg text-muted-foreground font-inter max-w-2xl mx-auto">
              {t('whyChooseDesc')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-playfair font-bold text-foreground mb-3">{t('securityGuaranteed')}</h4>
              <p className="text-muted-foreground font-inter">{t('securityDesc')}</p>
              <div className="mt-4 text-primary font-semibold font-inter text-sm">{t('verifiedLabel')}</div>
            </div>
            
            <div className="group text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent text-accent-foreground rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Star className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-playfair font-bold text-foreground mb-3">{t('premiumQuality')}</h4>
              <p className="text-muted-foreground font-inter">{t('qualityDesc')}</p>
              <div className="mt-4 text-accent font-semibold font-inter text-sm">{t('ratingLabel')}</div>
            </div>
            
            <div className="group text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-foreground text-background rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Clock className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-playfair font-bold text-foreground mb-3">{t('support247')}</h4>
              <p className="text-muted-foreground font-inter">{t('supportDesc')}</p>
              <div className="mt-4 text-foreground font-semibold font-inter text-sm">{t('responseTimeLabel')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;