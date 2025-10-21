import React from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Building, Users, Award, Shield, Lock, CreditCard, CheckCircle, Clock, RefreshCcw, Globe, ArrowRight,
  AlertTriangle, BadgeCheck, Home, Building2, CalendarDays
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5
    }
  }
};

const staggerChildren = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Section = ({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) => (
  <section id={id} className={`relative py-12 md:py-16 ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
  </section>
);

const StatCard = ({ icon: Icon, value, title, description, index }: any) => (
  <motion.div variants={fadeIn} custom={index}>
    <Card className="text-center border-border/70 hover:border-primary/50 transition-all duration-300 hover-lift h-full">
      <CardHeader>
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
          <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
        </div>
        <CardTitle className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[28ch] mx-auto">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const Step = ({ icon: Icon, title, subtitle, tone = "primary" }: any) => (
  <div className="flex-1 text-center">
    <div className={`w-20 h-20 rounded-2xl ${
      tone === "accent" 
        ? "bg-accent text-accent-foreground" 
        : tone === "success" 
        ? "bg-green-600 text-white" 
        : "bg-primary text-primary-foreground"
    } flex items-center justify-center mx-auto mb-4 shadow-sm`}>
      <Icon className="w-10 h-10" aria-hidden="true" />
    </div>
    <h4 className="font-semibold text-lg mb-1">{title}</h4>
    <p className="text-sm text-muted-foreground">{subtitle}</p>
  </div>
);

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

      {/* HERO SECTION */}
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        <Section className="pt-24 pb-12">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              variants={fadeIn}
              initial="hidden"
              animate="show"
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-6"
            >
              {t('aboutBeitik')}
            </motion.h1>
            <motion.p
              variants={fadeIn}
              initial="hidden"
              animate="show"
              className="mt-4 text-lg md:text-xl text-muted-foreground leading-relaxed"
            >
              {t('aboutDescription')}
            </motion.p>
            <motion.div 
              variants={fadeIn} 
              initial="hidden" 
              animate="show" 
              className="mt-8 flex items-center justify-center gap-3 flex-wrap"
            >
              <Button asChild size="lg">
                <Link to="/buy">{t('buyProperty')}</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/rent">{t('rentProperty')}</Link>
              </Button>
            </motion.div>
          </div>
        </Section>
      </header>

      <main>
        {/* STATS SECTION */}
        <Section className="pt-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((s, i) => (
              <StatCard key={i} {...s} index={i} />
            ))}
          </motion.div>
        </Section>

        {/* HOW WE HELP YOU */}
        <Section>
          <motion.h2
            variants={fadeIn}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          >
            {t('howWeHelpYou')}
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                color: "text-blue-600",
                title: t('buyProperty'),
                desc: t('buyPropertyDesc'),
                to: "/buy",
              },
              {
                icon: Home,
                color: "text-green-600",
                title: t('rentProperty'),
                desc: t('rentPropertyDesc'),
                to: "/rent",
              },
              {
                icon: CalendarDays,
                color: "text-amber-600",
                title: t('shortStay'),
                desc: t('shortStayDesc'),
                to: "/short-stay",
              },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                variants={fadeIn} 
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true }}
              >
                <Card className="group h-full transition-all duration-300 hover:shadow-elegant hover:-translate-y-1">
                  <CardHeader>
                    <div className={`w-12 h-12 ${item.color} mb-3`}>
                      <item.icon className="w-12 h-12" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{item.desc}</p>
                    <Button variant="link" asChild className="p-0 h-auto">
                      <Link to={item.to} className="inline-flex items-center gap-1">
                        {t('learnMore')} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* OUR STORY */}
        <Section id="our-story">
          <div className="max-w-3xl mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('ourStory')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('storyIntro')}
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              {
                v: "story-1",
                title: t('theBeginning'),
                body: t('storyParagraph1')
              },
              {
                v: "story-2",
                title: t('ourGrowth'),
                body: t('storyParagraph2')
              },
              {
                v: "story-3",
                title: t('innovation'),
                body: t('storyParagraph3')
              },
              {
                v: "story-4",
                title: t('today'),
                body: t('storyParagraph4')
              }
            ].map((row) => (
              <AccordionItem key={row.v} value={row.v} className="border border-border rounded-2xl px-6">
                <AccordionTrigger className="hover:no-underline text-left">
                  <span className="text-lg font-semibold">{row.title}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {row.body}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>

        {/* VERIFY & PROTECT */}
        <Section className="grid md:grid-cols-2 gap-8">
          <Card className="border-primary/50 hover:shadow-elegant transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BadgeCheck className="w-10 h-10 text-primary" aria-hidden="true" />
                <div>
                  <CardTitle className="text-2xl">{t('holibaytVerify')}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t('trustThroughVerification')}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: t('identityVerification'), sub: t('governmentIdSelfie') },
                { title: t('propertyVerification'), sub: t('documentCheckOnSite') },
                { title: t('ownershipVerification'), sub: t('legalTitleCheck') }
              ].map((i, idx) => (
                <div className="flex items-start gap-3" key={idx}>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{i.title}</h4>
                    <p className="text-xs text-muted-foreground">{i.sub}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-green-500/50 hover:shadow-elegant transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-10 h-10 text-green-600" aria-hidden="true" />
                <div>
                  <CardTitle className="text-2xl">{t('holibaytProtect')}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t('insuranceProtection')}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: t('transactionProtection'), sub: t('coverageAmount') },
                { title: t('fraudProtection'), sub: t('fraudCoverage') },
                { title: t('disputeResolution'), sub: t('mediationSupport') }
              ].map((i, idx) => (
                <div className="flex items-start gap-3" key={idx}>
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{i.title}</h4>
                    <p className="text-xs text-muted-foreground">{i.sub}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Section>

        {/* MISSION / VISION / VALUES */}
        <Section className="grid md:grid-cols-3 gap-6">
          {[
            { title: t('ourMission'), body: t('missionDescription') },
            { title: t('ourVision'), body: t('visionDescription') },
            { title: t('ourValues'), body: t('valuesDescription') }
          ].map((b, i) => (
            <Card key={i} className="h-full hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl">{b.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed max-w-prose">{b.body}</p>
              </CardContent>
            </Card>
          ))}
        </Section>

        {/* HOLIBAYT PAY SECTION */}
        <Section id="holibayt-pay">
          <div className="bg-gradient-to-br from-primary/15 via-background to-accent/10 rounded-3xl p-8 md:p-12 mb-8 border border-border/50">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              <Badge className="mb-2 text-sm font-semibold inline-flex items-center">
                <Shield className="w-4 h-4 mr-1" aria-hidden="true" />
                {t('holibaytPayHero')}
              </Badge>

              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                {t('holibaytPayMainTitle')}
              </h2>

              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {t('holibaytPaySubhero')}
              </p>

              {/* Trust Icons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
                {[
                  { Icon: Globe, label: t('designedForAlgeria'), wrap: 'bg-primary/10', tone: 'text-primary' },
                  { Icon: CreditCard, label: t('multiCurrency'), wrap: 'bg-accent/10', tone: 'text-accent' },
                  { Icon: BadgeCheck, label: t('verifiedUsersOnly'), wrap: 'bg-green-500/10', tone: 'text-green-600' },
                  { Icon: Shield, label: t('escrowProtected'), wrap: 'bg-blue-500/10', tone: 'text-blue-600' }
                ].map(({ Icon, label, wrap, tone }, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 text-center">
                    <div className={`w-12 h-12 rounded-full ${wrap} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${tone}`} aria-hidden="true" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-8 text-center">
              {t('howItWorks')}
            </h3>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
              <Step icon={Users} title={t('buyerTenant')} subtitle={t('initiatesPayment')} />
              <ArrowRight className="w-8 h-8 text-primary rotate-90 md:rotate-0" aria-hidden="true" />
              <Step icon={Shield} title={t('holibaytEscrow')} subtitle={t('holdsSecurely')} tone="accent" />
              <ArrowRight className="w-8 h-8 text-primary rotate-90 md:rotate-0" aria-hidden="true" />
              <Step icon={CheckCircle} title={t('sellerHost')} subtitle={t('receivesAfterConfirmation')} tone="success" />
            </div>

            <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl text-center">
              <p className="text-sm text-foreground">
                <Lock className="w-4 h-4 inline mr-2 text-primary" aria-hidden="true" />
                {t('escrowExplainer')}
              </p>
            </div>
          </div>

          {/* Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-destructive" aria-hidden="true" />
                  <div>
                    <CardTitle className="text-xl">{t('directPayment')}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t('directPaymentSubtitle')}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[t('riskFraud'), t('riskNoRefund'), t('riskNoVerification')]
                  .map((txt, i) => (
                    <div className="flex items-start gap-2" key={i}>
                      <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                      <p className="text-sm text-muted-foreground">{txt}</p>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" aria-hidden="true" />
                  <div>
                    <CardTitle className="text-xl">{t('holibaytPayBrand')}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t('holibaytPayBenefitsSubtitle')}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[t('benefitEscrow'), t('benefitRefund'), t('benefitVerified')]
                  .map((txt, i) => (
                    <div className="flex items-start gap-2" key={i}>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-foreground font-semibold">{txt}</p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { Icon: Shield, title: t('bankLevelSecurity'), body: t('holibaytPaySecurityDesc') },
              { Icon: Lock, title: t('secureTransactions'), body: t('holibaytPayStripeDesc') },
              { Icon: CreditCard, title: t('multiplePaymentMethods'), body: t('holibaytPayPaymentMethodsDesc') },
              { Icon: CheckCircle, title: t('instantConfirmation'), body: t('holibaytPayConfirmationDesc') },
              { Icon: Clock, title: t('timelyPayouts'), body: t('holibaytPayPayoutsDesc') },
              { Icon: RefreshCcw, title: t('easyRefundsTitle'), body: t('holibaytPayRefundsDesc') }
            ].map(({ Icon, title, body }, i) => (
              <Card key={i} className="hover:shadow-lg transition-all duration-300 h-full hover-lift">
                <CardHeader>
                  <Icon className="w-10 h-10 text-primary mb-3" aria-hidden="true" />
                  <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
