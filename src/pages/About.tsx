import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Building, Users, Award, Shield, Lock, CreditCard, CheckCircle, Clock, RefreshCcw, Globe, ArrowRight, AlertTriangle, BadgeCheck, Home, Building2, CalendarDays } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Link } from "react-router-dom";

const About = () => {
  const { t } = useLanguage();
  useScrollToTop();

  const stats = [
    { icon: Building, title: t('properties'), value: "10,000+", description: t('propertiesListed') },
    { icon: Users, title: t('clients'), value: "50,000+", description: t('satisfiedClients') },
    { icon: Award, title: t('experience'), value: "15 " + t('years'), description: t('realEstateExpertise') },
    { icon: Shield, title: t('security'), value: "100%", description: t('secureTransactions') }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-6 font-playfair">{t('aboutBeitik')}</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
              {t('aboutDescription')}
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-primary font-playfair">{stat.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold mb-2 font-playfair">{stat.title}</h3>
                    <p className="text-sm text-muted-foreground font-inter">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Services Overview */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6 font-playfair text-center">
              {t('howWeHelpYou') || 'How We Help You'}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-elegant hover:-translate-y-1 transition-all duration-300">
                <CardHeader>
                  <Building2 className="w-12 h-12 text-blue-600 mb-3" />
                  <CardTitle className="text-xl font-playfair">{t('buyProperty') || 'Buy Property'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-inter mb-4">
                    {t('buyPropertyDesc') || '4-layer verification process ensuring secure property purchase'}
                  </p>
                  <Button variant="link" asChild className="p-0 h-auto">
                    <Link to="/buy">{t('learnMore') || 'Learn More'} →</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-elegant hover:-translate-y-1 transition-all duration-300">
                <CardHeader>
                  <Home className="w-12 h-12 text-green-600 mb-3" />
                  <CardTitle className="text-xl font-playfair">{t('rentProperty') || 'Rent Property'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-inter mb-4">
                    {t('rentPropertyDesc') || 'Secure rental process with digital contracts and escrow protection'}
                  </p>
                  <Button variant="link" asChild className="p-0 h-auto">
                    <Link to="/rent">{t('learnMore') || 'Learn More'} →</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-elegant hover:-translate-y-1 transition-all duration-300">
                <CardHeader>
                  <CalendarDays className="w-12 h-12 text-amber-600 mb-3" />
                  <CardTitle className="text-xl font-playfair">{t('shortStay') || 'Short Stay'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-inter mb-4">
                    {t('shortStayDesc') || 'Verified vacation rentals with instant booking and secure payments'}
                  </p>
                  <Button variant="link" asChild className="p-0 h-auto">
                    <Link to="/short-stay">{t('learnMore') || 'Learn More'} →</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Company Story - Accordion */}
          <div id="our-story" className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6 font-playfair">{t('ourStory')}</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="story-1" className="border border-border rounded-lg px-6">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-lg font-semibold">{t('theBeginning') || 'The Beginning'}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-inter">
                  {t('storyParagraph1') || 'Founded in 2010, Holibayt emerged from a vision to revolutionize the real estate market in Algeria. We recognized the challenges faced by both property seekers and owners in navigating the complex real estate landscape.'}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="story-2" className="border border-border rounded-lg px-6">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-lg font-semibold">{t('ourGrowth') || 'Our Growth'}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-inter">
                  {t('storyParagraph2') || 'Over the years, we have grown from a small startup to one of Algeria\'s most trusted real estate platforms. Our commitment to transparency, security, and user experience has earned us the trust of thousands of clients across the country.'}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="story-3" className="border border-border rounded-lg px-6">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-lg font-semibold">{t('innovation') || 'Innovation'}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-inter">
                  {t('storyParagraph3') || 'We were the first to introduce escrow-based payments and digital contracts in the Algerian real estate market, setting new standards for security and trust.'}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="story-4" className="border border-border rounded-lg px-6">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-lg font-semibold">{t('today') || 'Today'}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-inter">
                  {t('storyParagraph4') || 'Today, Holibayt continues to lead the market with innovative solutions, making property transactions safer, faster, and more transparent for everyone.'}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Verification & Protection */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="border-primary/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BadgeCheck className="w-10 h-10 text-primary" />
                  <div>
                    <CardTitle className="text-2xl font-playfair">{t('holibaytVerify') || 'Holibayt Verify™'}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t('trustThroughVerification') || 'Trust through verification'}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{t('identityVerification') || 'Identity Verification'}</h4>
                    <p className="text-xs text-muted-foreground">{t('governmentIdSelfie') || 'Government ID + selfie verification'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{t('propertyVerification') || 'Property Verification'}</h4>
                    <p className="text-xs text-muted-foreground">{t('documentCheckOnSite') || 'Document verification + on-site inspection'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{t('ownershipVerification') || 'Ownership Verification'}</h4>
                    <p className="text-xs text-muted-foreground">{t('legalTitleCheck') || 'Legal title and ownership verification'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-10 h-10 text-green-600" />
                  <div>
                    <CardTitle className="text-2xl font-playfair">{t('holibaytProtect') || 'Holibayt Protect™'}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t('insuranceProtection') || 'Insurance-backed protection'}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{t('transactionProtection') || 'Transaction Protection'}</h4>
                    <p className="text-xs text-muted-foreground">{t('coverageAmount') || 'Coverage up to 500,000 DZD'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{t('fraudProtection') || 'Fraud Protection'}</h4>
                    <p className="text-xs text-muted-foreground">{t('fraudCoverage') || 'Full coverage against fraudulent listings'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{t('disputeResolution') || 'Dispute Resolution'}</h4>
                    <p className="text-xs text-muted-foreground">{t('mediationSupport') || 'Professional mediation and legal support'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mission & Values */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-playfair">{t('ourMission')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-inter">
                  {t('missionDescription')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-playfair">{t('ourVision')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-inter">
                  {t('visionDescription')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-playfair">{t('ourValues')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-inter">
                  {t('valuesDescription')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Holibayt Pay Section */}
          <div id="holibayt-pay" className="mb-16">
            <div className="bg-gradient-to-br from-primary/15 via-background to-accent/10 rounded-3xl p-8 md:p-12 mb-8">
              <div className="text-center max-w-4xl mx-auto space-y-6">
                <Badge className="mb-2 text-sm font-semibold">
                  <Shield className="w-4 h-4 mr-1" />
                  {t('holibaytPayHero') || 'Escrow-Based Payment System'}
                </Badge>
                
                <h2 className="text-4xl md:text-5xl font-bold text-foreground font-playfair">
                  {t('holibaytPayMainTitle') || 'The first escrow-based payment system for real estate in Algeria.'}
                </h2>
                
                <p className="text-xl text-muted-foreground font-inter">
                  {t('holibaytPaySubhero') || 'Protecting buyers, tenants, and hosts by holding funds securely until confirmation.'}
                </p>

                {/* Trust Icons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border/50">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{t('designedForAlgeria') || 'Designed for Algeria'}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-accent" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{t('multiCurrency') || 'EUR / USD / DZD'}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <BadgeCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{t('verifiedUsersOnly') || 'Verified users only'}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{t('escrowProtected') || 'Escrow protected'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="mb-12">
              <h3 className="text-3xl font-bold text-foreground font-playfair mb-6 text-center">
                {t('howItWorks') || 'How Holibayt Pay™ Works'}
              </h3>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                <div className="flex-1 text-center">
                  <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    <Users className="w-10 h-10" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{t('buyerTenant') || 'Buyer / Tenant'}</h4>
                  <p className="text-sm text-muted-foreground">{t('initiatesPayment') || 'Initiates payment'}</p>
                </div>

                <ArrowRight className="w-8 h-8 text-primary rotate-90 md:rotate-0" />

                <div className="flex-1 text-center">
                  <div className="w-20 h-20 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    <Shield className="w-10 h-10" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{t('holibaytEscrow') || 'Holibayt Escrow'}</h4>
                  <p className="text-sm text-muted-foreground">{t('holdsSecurely') || 'Holds funds securely'}</p>
                </div>

                <ArrowRight className="w-8 h-8 text-primary rotate-90 md:rotate-0" />

                <div className="flex-1 text-center">
                  <div className="w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{t('sellerHost') || 'Seller / Host'}</h4>
                  <p className="text-sm text-muted-foreground">{t('receivesAfterConfirmation') || 'Receives after confirmation'}</p>
                </div>
              </div>

              <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg text-center">
                <p className="text-sm text-foreground font-inter">
                  <Lock className="w-4 h-4 inline mr-2 text-primary" />
                  {t('escrowExplainer') || 'Your funds are held in our secure escrow system and only released to the host after you complete your stay or receive your property keys.'}
                </p>
              </div>
            </div>

            {/* Comparison */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                    <div>
                      <CardTitle className="text-xl">{t('directPayment') || 'Direct Payment'}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t('directPaymentSubtitle') || 'Risks you take'}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                    <p className="text-sm text-muted-foreground">{t('riskFraud') || 'No protection against fraud'}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                    <p className="text-sm text-muted-foreground">{t('riskNoRefund') || 'Difficult to get refunds'}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                    <p className="text-sm text-muted-foreground">{t('riskNoVerification') || 'No verification'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-primary" />
                    <div>
                      <CardTitle className="text-xl">{t('holibaytPayBrand') || 'Holibayt Pay™'}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t('holibaytPayBenefitsSubtitle') || 'Built-in protection'}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-foreground font-semibold">{t('benefitEscrow') || 'Funds in secure escrow'}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-foreground font-semibold">{t('benefitRefund') || 'Easy refund process'}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-foreground font-semibold">{t('benefitVerified') || 'All users verified'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <Shield className="w-10 h-10 text-primary mb-3" />
                  <CardTitle className="text-lg">{t('bankLevelSecurity') || 'Bank-Level Security'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-inter">
                    {t('holibaytPaySecurityDesc') || 'Your payment information is encrypted and protected.'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <Lock className="w-10 h-10 text-primary mb-3" />
                  <CardTitle className="text-lg">{t('secureTransactions') || 'Secure Transactions'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-inter">
                    {t('holibaytPayStripeDesc') || 'All transactions processed through Stripe.'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CreditCard className="w-10 h-10 text-primary mb-3" />
                  <CardTitle className="text-lg">{t('multiplePaymentMethods') || 'Multiple Payment Methods'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-inter">
                    {t('holibaytPayPaymentMethodsDesc') || 'Accept payments via multiple methods.'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CheckCircle className="w-10 h-10 text-primary mb-3" />
                  <CardTitle className="text-lg">{t('instantConfirmation') || 'Instant Confirmation'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-inter">
                    {t('holibaytPayConfirmationDesc') || 'Get immediate booking confirmation.'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <Clock className="w-10 h-10 text-primary mb-3" />
                  <CardTitle className="text-lg">{t('timelyPayouts') || 'Timely Payouts'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-inter">
                    {t('holibaytPayPayoutsDesc') || 'Funds released after stay completion.'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <RefreshCcw className="w-10 h-10 text-primary mb-3" />
                  <CardTitle className="text-lg">{t('easyRefundsTitle') || 'Easy Refunds'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-inter">
                    {t('holibaytPayRefundsDesc') || 'Simple refund process for cancellations.'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;