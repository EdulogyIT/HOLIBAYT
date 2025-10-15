import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, FileCheck, UserCheck, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEOHead } from "@/components/SEOHead";

const LegalProcess = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const steps = [
    {
      icon: UserCheck,
      title: t('legalStep1Title') || 'Request Legal Support',
      description: t('legalStep1Desc') || 'Submit a request from any property listing specifying your needs - verification, contract review, or consultation.',
    },
    {
      icon: Scale,
      title: t('legalStep2Title') || 'Lawyer Assignment',
      description: t('legalStep2Desc') || 'Our admin team reviews your request and assigns a verified, licensed lawyer specialized in your area.',
    },
    {
      icon: FileCheck,
      title: t('legalStep3Title') || 'Legal Review & Guidance',
      description: t('legalStep3Desc') || 'Your assigned lawyer reviews documents, provides expert advice, and ensures legal compliance.',
    },
    {
      icon: Shield,
      title: t('legalStep4Title') || 'Protected Transaction',
      description: t('legalStep4Desc') || 'Complete your transaction with confidence knowing all legal aspects are verified and protected.',
    },
  ];

  const services = [
    {
      title: t('legalService1') || 'Property Verification',
      description: t('legalService1Desc') || 'Verify ownership documents, title deeds, and property registration.',
    },
    {
      title: t('legalService2') || 'Contract Review',
      description: t('legalService2Desc') || 'Expert review of rental agreements, purchase contracts, and terms.',
    },
    {
      title: t('legalService3') || 'Legal Consultation',
      description: t('legalService3Desc') || 'Get advice on property laws, regulations, and your rights.',
    },
    {
      title: t('legalService4') || 'Document Preparation',
      description: t('legalService4Desc') || 'Professional preparation of legally binding rental and sale agreements.',
    },
  ];

  return (
    <>
      <SEOHead 
        title={t('legalProcessTitle') || 'Legal Support Process - Holibayt'}
        description={t('legalProcessSubtitle') || 'Learn how Holibayt provides comprehensive legal support for secure real estate transactions in Algeria.'}
        keywords="legal support, property law, Algeria real estate, contract review, property verification"
      />
      
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-2xl mb-6 shadow-lg">
                  <Scale className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-6">
                  {t('legalProcessTitle') || 'Legal Support Process'}
                </h1>
                <p className="text-xl text-muted-foreground font-inter mb-8">
                  {t('legalProcessIntro') || 'Holibayt provides comprehensive legal support to secure your real estate transactions in Algeria.'}
                </p>
                <Button 
                  size="lg"
                  onClick={() => navigate('/lawyers')}
                  className="gap-2"
                >
                  {t('viewLawyers') || 'View Available Lawyers'}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-16 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
                  {t('howItWorks') || 'How It Works'}
                </h2>
                <p className="text-lg text-muted-foreground font-inter max-w-2xl mx-auto">
                  {t('legalProcessStepsIntro') || 'Four simple steps to get expert legal assistance for your property transaction'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="relative">
                      <Card className="border-2 border-border hover:border-primary/30 transition-all h-full">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mb-4 shadow-lg">
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm mb-4">
                              {index + 1}
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-3">
                              {step.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      {/* Connector Line */}
                      {index < steps.length - 1 && (
                        <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
                  {t('legalServicesTitle') || 'Legal Services We Offer'}
                </h2>
                <p className="text-lg text-muted-foreground font-inter max-w-2xl mx-auto">
                  {t('legalServicesSubtitle') || 'Comprehensive legal support for all your real estate needs'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service, index) => (
                  <Card key={index} className="border-2 border-border hover:border-primary/30 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {service.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 md:py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12 border-2 border-primary/20">
                <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
                  {t('readyForLegalSupport') || 'Ready to Get Legal Support?'}
                </h2>
                <p className="text-lg text-muted-foreground font-inter mb-8 max-w-2xl mx-auto">
                  {t('legalSupportCTA') || 'Browse properties and request legal assistance on any listing, or contact our verified lawyers directly.'}
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button 
                    size="lg"
                    onClick={() => navigate('/lawyers')}
                    className="gap-2"
                  >
                    <Scale className="h-5 w-5" />
                    {t('viewLawyers') || 'View Available Lawyers'}
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/buy')}
                    className="gap-2"
                  >
                    {t('browseProperties') || 'Browse Properties'}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default LegalProcess;