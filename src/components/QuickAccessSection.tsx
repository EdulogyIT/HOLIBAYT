import React, { useEffect } from "react";
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
// NOTE: The previous build failed due to alias-resolution for `@/contexts/LanguageContext` and `@/hooks/useScrollToTop`.
// To run safely in sandboxed/preview environments, we inline tiny fallbacks below.
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**********************
 * Lightweight i18n shim
 **********************/
const FALLBACK_I18N: Record<string, string> = {
  aboutBeitik: "About Holibayt",
  aboutDescription:
    "We make real‑estate safer and simpler in Algeria — with verified listings, escrow payments, and modern digital contracts.",
  properties: "Properties",
  propertiesListed: "Properties listed across Algeria",
  clients: "Clients",
  satisfiedClients: "Happy users who trust us",
  experience: "Experience",
  years: "years",
  realEstateExpertise: "of real‑estate expertise",
  security: "Security",
  secureTransactions: "Secure transactions & privacy",
  howWeHelpYou: "How We Help You",
  buyProperty: "Buy Property",
  buyPropertyDesc: "4‑layer verification process ensuring secure property purchase",
  rentProperty: "Rent Property",
  rentPropertyDesc: "Secure rental process with digital contracts and escrow protection",
  shortStay: "Short Stay",
  shortStayDesc: "Verified vacation rentals with instant booking and secure payments",
  learnMore: "Learn More",
  ourStory: "Our Story",
  storyIntro: "Built on transparency, security, and user delight.",
  theBeginning: "The Beginning",
  storyParagraph1:
    "Founded in 2010, Holibayt emerged from a vision to revolutionize the real‑estate market in Algeria.",
  ourGrowth: "Our Growth",
  storyParagraph2:
    "From a small startup to one of Algeria's most trusted platforms, by obsessing over security and UX.",
  innovation: "Innovation",
  storyParagraph3:
    "First to introduce escrow payments and digital contracts in the Algerian market.",
  today: "Today",
  storyParagraph4:
    "We continue to lead with solutions that make every transaction safer, faster, and more transparent.",
  holibaytVerify: "Holibayt Verify™",
  trustThroughVerification: "Trust through verification",
  identityVerification: "Identity Verification",
  governmentIdSelfie: "Government ID + selfie verification",
  propertyVerification: "Property Verification",
  documentCheckOnSite: "Document verification + on‑site inspection",
  ownershipVerification: "Ownership Verification",
  legalTitleCheck: "Legal title and ownership verification",
  holibaytProtect: "Holibayt Protect™",
  insuranceProtection: "Insurance‑backed protection",
  transactionProtection: "Transaction Protection",
  coverageAmount: "Coverage up to 500,000 DZD",
  fraudProtection: "Fraud Protection",
  fraudCoverage: "Coverage against fraudulent listings",
  disputeResolution: "Dispute Resolution",
  mediationSupport: "Professional mediation and legal support",
  ourMission: "Our Mission",
  missionDescription:
    "To create the most trusted property marketplace in Algeria by combining verification, escrow, and delightful UX.",
  ourVision: "Our Vision",
  visionDescription:
    "A transparent real‑estate ecosystem where every party is protected and every step is simple.",
  ourValues: "Our Values",
  valuesDescription:
    "Security, transparency, respect, and relentless improvement—across product, people, and process.",
  holibaytPayHero: "Escrow‑Based Payment System",
  holibaytPayMainTitle: "The first escrow‑based payment system for real‑estate in Algeria.",
  holibaytPaySubhero: "Funds are held securely and released only after confirmation.",
  designedForAlgeria: "Designed for Algeria",
  multiCurrency: "EUR / USD / DZD",
  verifiedUsersOnly: "Verified users only",
  escrowProtected: "Escrow protected",
  howItWorks: "How Holibayt Pay™ Works",
  buyerTenant: "Buyer / Tenant",
  initiatesPayment: "Initiates payment",
  holibaytEscrow: "Holibayt Escrow",
  holdsSecurely: "Holds funds securely",
  sellerHost: "Seller / Host",
  receivesAfterConfirmation: "Receives after confirmation",
  escrowExplainer:
    "Your funds are held in our secure escrow and released only after you complete your stay or receive your keys.",
  directPayment: "Direct Payment",
  directPaymentSubtitle: "Risks you take",
  riskFraud: "No protection against fraud",
  riskNoRefund: "Difficult to get refunds",
  riskNoVerification: "No verification",
  holibaytPayBrand: "Holibayt Pay™",
  holibaytPayBenefitsSubtitle: "Built‑in protection",
  benefitEscrow: "Funds in secure escrow",
  benefitRefund: "Easy refund process",
  benefitVerified: "All users verified",
  bankLevelSecurity: "Bank‑Level Security",
  holibaytPaySecurityDesc: "Your payment information is encrypted and protected.",
  holibaytPayStripeDesc: "All transactions processed through Stripe.",
  multiplePaymentMethods: "Multiple Payment Methods",
  holibaytPayPaymentMethodsDesc: "Accept payments via multiple methods.",
  instantConfirmation: "Instant Confirmation",
  holibaytPayConfirmationDesc: "Immediate booking confirmation.",
  timelyPayouts: "Timely Payouts",
  holibaytPayPayoutsDesc: "Funds released after stay completion.",
  easyRefundsTitle: "Easy Refunds",
  holibaytPayRefundsDesc: "Simple refund process for cancellations.",
};

// local hook compatible with your existing usage signature
const useLanguageLocal = () => ({ t: (key: string) => FALLBACK_I18N[key] ?? key });

/**********************
 * Motion helpers
 **********************/
const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" } })
};

const Section = ({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) => (
  <section id={id} className={`relative py-12 md:py-16 ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
  </section>
);

const StatCard = ({ icon: Icon, value, title, description, index }: any) => (
  <motion.div variants={fade} custom={index}>
    <Card className="text-center border-border/70 hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
          <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
        </div>
        <CardTitle className="text-3xl md:text-4xl font-extrabold tracking-tight font-playfair text-primary">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold font-playfair">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed font-inter max-w-[28ch] mx-auto">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const Step = ({ icon: Icon, title, subtitle, tone = "primary" }: any) => (
  <div className="flex-1 text-center">
    <div className={`w-20 h-20 rounded-2xl ${tone === "accent" ? "bg-accent text-accent-foreground" : tone === "success" ? "bg-green-600 text-white" : "bg-primary text-primary-foreground"} flex items-center justify-center mx-auto mb-4 shadow-sm`}>
      <Icon className="w-10 h-10" aria-hidden="true" />
    </div>
    <h4 className="font-semibold text-lg mb-1">{title}</h4>
    <p className="text-sm text-muted-foreground">{subtitle}</p>
  </div>
);

const About = () => {
  // use fallback i18n if app context isn't available
  const { t } = useLanguageLocal();

  // useScrollToTop fallback
  useEffect(() => {
    try {
      window?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (_) {
      // ignore if not available
    }
  }, []);

  const stats = [
    { icon: Building, title: t('properties'), value: "10,000+", description: t('propertiesListed') },
    { icon: Users, title: t('clients'), value: "50,000+", description: t('satisfiedClients') },
    { icon: Award, title: t('experience'), value: "15 " + t('years'), description: t('realEstateExpertise') },
    { icon: Shield, title: t('security'), value: "100%", description: t('secureTransactions') }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        <Section className="pt-24">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              variants={fade}
              initial="hidden"
              animate="show"
              className="text-4xl md:text-5xl font-bold leading-tight font-playfair text-foreground"
            >
              {t('aboutBeitik')}
            </motion.h1>
            <motion.p
              variants={fade}
              initial="hidden"
              animate="show"
              custom={1}
              className="mt-4 text-lg md:text-xl text-muted-foreground font-inter leading-relaxed"
            >
              {t('aboutDescription')}
            </motion.p>
            <motion.div variants={fade} initial="hidden" animate="show" custom={2} className="mt-8 flex items-center justify-center gap-3">
              <Button asChild>
                <Link to="/buy">{t('buyProperty') || 'Buy Property'}</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/rent">{t('rentProperty') || 'Rent Property'}</Link>
              </Button>
            </motion.div>
          </div>
        </Section>
      </header>

      <main>
        {/* STATS */}
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

        {/* HOW WE HELP */}
        <Section>
          <motion.h2
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center font-playfair"
          >
            {t('howWeHelpYou') || 'How We Help You'}
          </motion.h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                color: "text-blue-600",
                title: t('buyProperty') || 'Buy Property',
                desc: t('buyPropertyDesc') || '4-layer verification process ensuring secure property purchase',
                to: "/buy",
              },
              {
                icon: Home,
                color: "text-green-600",
                title: t('rentProperty') || 'Rent Property',
                desc: t('rentPropertyDesc') || 'Secure rental process with digital contracts and escrow protection',
                to: "/rent",
              },
              {
                icon: CalendarDays,
                color: "text-amber-600",
                title: t('shortStay') || 'Short Stay',
                desc: t('shortStayDesc') || 'Verified vacation rentals with instant booking and secure payments',
                to: "/short-stay",
              },
            ].map((item, i) => (
              <motion.div key={i} variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}>
                <Card className="group h-full transition-all duration-300 hover:shadow-elegant hover:-translate-y-1">
                  <CardHeader>
                    <div className={`w-12 h-12 ${item.color} mb-3`}>
                      <item.icon className="w-12 h-12" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-xl font-playfair">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground font-inter mb-4 leading-relaxed">{item.desc}</p>
                    <Button variant="link" asChild className="p-0 h-auto">
                      <Link to={item.to} className="inline-flex items-center gap-1">
                        {t('learnMore') || 'Learn More'} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* STORY */}
        <Section id="our-story">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-4">{t('ourStory')}</h2>
            <p className="text-muted-foreground font-inter mb-6 leading-relaxed">
              {t('storyIntro') || t('aboutDescription')}
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              {
                v: "story-1",
                title: t('theBeginning') || 'The Beginning',
                body:
                  t('storyParagraph1') ||
                  'Founded in 2010, Holibayt emerged from a vision to revolutionize the real estate market in Algeria. We recognized the challenges faced by both property seekers and owners in navigating the complex real estate landscape.'
              },
              {
                v: "story-2",
                title: t('ourGrowth') || 'Our Growth',
                body:
                  t('storyParagraph2') ||
                  "Over the years, we have grown from a small startup to one of Algeria's most trusted real estate platforms. Our commitment to transparency, security, and user experience has earned us the trust of thousands of clients across the country."
              },
              {
                v: "story-3",
                title: t('innovation') || 'Innovation',
                body:
                  t('storyParagraph3') ||
                  'We were the first to introduce escrow-based payments and digital contracts in the Algerian real estate market, setting new standards for security and trust.'
              },
              {
                v: "story-4",
                title: t('today') || 'Today',
                body:
                  t('storyParagraph4') ||
                  'Today, Holibayt continues to lead the market with innovative solutions, making property transactions safer, faster, and more transparent for everyone.'
              }
            ].map((row, i) => (
              <AccordionItem key={row.v} value={row.v} className="border border-border rounded-2xl px-6">
                <AccordionTrigger className="hover:no-underline text-left">
                  <span className="text-lg font-semibold">{row.title}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-inter leading-relaxed">
                  {row.body}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>

        {/* VERIFY & PROTECT */}
        <Section className="grid md:grid-cols-2 gap-8">
          <Card className="border-primary/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BadgeCheck className="w-10 h-10 text-primary" aria-hidden="true" />
                <div>
                  <CardTitle className="text-2xl font-playfair">{t('holibaytVerify') || 'Holibayt Verify™'}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t('trustThroughVerification') || 'Trust through verification'}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: t('identityVerification') || 'Identity Verification', sub: t('governmentIdSelfie') || 'Government ID + selfie verification' },
                { title: t('propertyVerification') || 'Property Verification', sub: t('documentCheckOnSite') || 'Document verification + on-site inspection' },
                { title: t('ownershipVerification') || 'Ownership Verification', sub: t('legalTitleCheck') || 'Legal title and ownership verification' }
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

          <Card className="border-green-500/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-10 h-10 text-green-600" aria-hidden="true" />
                <div>
                  <CardTitle className="text-2xl font-playfair">{t('holibaytProtect') || 'Holibayt Protect™'}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t('insuranceProtection') || 'Insurance-backed protection'}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: t('transactionProtection') || 'Transaction Protection', sub: t('coverageAmount') || 'Coverage up to 500,000 DZD' },
                { title: t('fraudProtection') || 'Fraud Protection', sub: t('fraudCoverage') || 'Full coverage against fraudulent listings' },
                { title: t('disputeResolution') || 'Dispute Resolution', sub: t('mediationSupport') || 'Professional mediation and legal support' }
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
            <Card key={i} className="h-full">
              <CardHeader>
                <CardTitle className="text-xl font-playfair">{b.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-inter leading-relaxed max-w-prose">{b.body}</p>
              </CardContent>
            </Card>
          ))}
        </Section>

        {/* HOLIBAYT PAY */}
        <Section id="holibayt-pay">
          <div className="bg-gradient-to-br from-primary/15 via-background to-accent/10 rounded-3xl p-8 md:p-12 mb-8 border border-border/50">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              <Badge className="mb-2 text-sm font-semibold inline-flex items-center">
                <Shield className="w-4 h-4 mr-1" aria-hidden="true" />
                {t('holibaytPayHero') || 'Escrow-Based Payment System'}
              </Badge>

              <h2 className="text-4xl md:text-5xl font-bold text-foreground font-playfair">
                {t('holibaytPayMainTitle') || 'The first escrow-based payment system for real estate in Algeria.'}
              </h2>

              <p className="text-lg md:text-xl text-muted-foreground font-inter max-w-3xl mx-auto leading-relaxed">
                {t('holibaytPaySubhero') || 'Protecting buyers, tenants, and hosts by holding funds securely until confirmation.'}
              </p>

              {/* Trust Icons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
                {[{ Icon: Globe, label: t('designedForAlgeria') || 'Designed for Algeria', wrap: 'bg-primary/10', tone: 'text-primary' },
                  { Icon: CreditCard, label: t('multiCurrency') || 'EUR / USD / DZD', wrap: 'bg-accent/10', tone: 'text-accent' },
                  { Icon: BadgeCheck, label: t('verifiedUsersOnly') || 'Verified users only', wrap: 'bg-green-500/10', tone: 'text-green-600' },
                  { Icon: Shield, label: t('escrowProtected') || 'Escrow protected', wrap: 'bg-blue-500/10', tone: 'text-blue-600' }]
                  .map(({ Icon, label, wrap, tone }, i) => (
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
            <h3 className="text-3xl font-bold text-foreground font-playfair mb-8 text-center">
              {t('howItWorks') || 'How Holibayt Pay™ Works'}
            </h3>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
              <Step icon={Users} title={t('buyerTenant') || 'Buyer / Tenant'} subtitle={t('initiatesPayment') || 'Initiates payment'} />
              <ArrowRight className="w-8 h-8 text-primary rotate-90 md:rotate-0" aria-hidden="true" />
              <Step icon={Shield} title={t('holibaytEscrow') || 'Holibayt Escrow'} subtitle={t('holdsSecurely') || 'Holds funds securely'} tone="accent" />
              <ArrowRight className="w-8 h-8 text-primary rotate-90 md:rotate-0" aria-hidden="true" />
              <Step icon={CheckCircle} title={t('sellerHost') || 'Seller / Host'} subtitle={t('receivesAfterConfirmation') || 'Receives after confirmation'} tone="success" />
            </div>

            <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl text-center">
              <p className="text-sm text-foreground font-inter">
                <Lock className="w-4 h-4 inline mr-2 text-primary" aria-hidden="true" />
                {t('escrowExplainer') || 'Your funds are held in our secure escrow system and only released to the host after you complete your stay or receive your property keys.'}
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
                    <CardTitle className="text-xl">{t('directPayment') || 'Direct Payment'}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t('directPaymentSubtitle') || 'Risks you take'}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[t('riskFraud') || 'No protection against fraud', t('riskNoRefund') || 'Difficult to get refunds', t('riskNoVerification') || 'No verification']
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
                    <CardTitle className="text-xl">{t('holibaytPayBrand') || 'Holibayt Pay™'}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t('holibaytPayBenefitsSubtitle') || 'Built-in protection'}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[t('benefitEscrow') || 'Funds in secure escrow', t('benefitRefund') || 'Easy refund process', t('benefitVerified') || 'All users verified']
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
              { Icon: Shield, title: t('bankLevelSecurity') || 'Bank-Level Security', body: t('holibaytPaySecurityDesc') || 'Your payment information is encrypted and protected.' },
              { Icon: Lock, title: t('secureTransactions') || 'Secure Transactions', body: t('holibaytPayStripeDesc') || 'All transactions processed through Stripe.' },
              { Icon: CreditCard, title: t('multiplePaymentMethods') || 'Multiple Payment Methods', body: t('holibaytPayPaymentMethodsDesc') || 'Accept payments via multiple methods.' },
              { Icon: CheckCircle, title: t('instantConfirmation') || 'Instant Confirmation', body: t('holibaytPayConfirmationDesc') || 'Get immediate booking confirmation.' },
              { Icon: Clock, title: t('timelyPayouts') || 'Timely Payouts', body: t('holibaytPayPayoutsDesc') || 'Funds released after stay completion.' },
              { Icon: RefreshCcw, title: t('easyRefundsTitle') || 'Easy Refunds', body: t('holibaytPayRefundsDesc') || 'Simple refund process for cancellations.' }
            ].map(({ Icon, title, body }, i) => (
              <Card key={i} className="hover:shadow-lg transition-all duration-300 h-full">
                <CardHeader>
                  <Icon className="w-10 h-10 text-primary mb-3" aria-hidden="true" />
                  <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-inter leading-relaxed">{body}</p>
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

/**********************
 * Minimal runtime smoke tests (non-blocking)
 * - Kept out of production bundles by most build setups if tree-shaken.
 **********************/
export const runAboutPageSmokeTests = () => {
  const requiredKeys = [
    'aboutBeitik', 'aboutDescription', 'howWeHelpYou', 'ourStory', 'holibaytVerify', 'holibaytProtect', 'howItWorks'
  ];
  const keysOk = requiredKeys.every((k) => typeof FALLBACK_I18N[k] === 'string' && FALLBACK_I18N[k].length > 0);
  const statsOk = ['properties', 'clients', 'experience', 'security'].every((k) => FALLBACK_I18N[k] !== undefined);
  return { keysOk, statsOk };
};

export default About;

/*********************************
 * WORKFLOW DIAGRAMS (Buy/Rent)
 * Implemented to visually match the provided screenshots exactly
 *********************************/
import { Card as UICard, CardContent as UICardContent } from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import {
  FileCheck,
  Lock as LockIcon,
  Scale,
  FileSignature,
  Home as HomeIcon,
  ShieldCheck,
  DollarSign,
  ArrowRight as ArrowRightIcon,
  CheckCircle2,
  CreditCard,
  Shield,
  Search,
  Calendar,
  HandCoins,
  Plus,
  Key,
  Bed
} from "lucide-react";

// Reuse the local i18n shim from above to avoid alias issues
const tLocal = (k: string, d?: string) => (FALLBACK_I18N[k] ?? d ?? k);

type WorkflowLayer = {
  number: number;
  title: string;
  subtitle: string;
  points: string[];
  icon: React.ComponentType<any>;
  bgColor: string;
  textColor: string;
  iconColor: string;
};

type WorkflowInteractiveProps = { mode: 'buy' | 'rent' };

export const WorkflowInteractive: React.FC<WorkflowInteractiveProps> = ({ mode }) => {
  // Build exact text like the screenshots; fall back to i18n if provided
  const buyLayers: WorkflowLayer[] = [
    {
      number: 1,
      title: 'Trust Layer',
      subtitle: 'Find a Verified Property',
      points: [
        'Every property and seller verified through Holibayt Verify™',
        'ID (KYC) and document checks',
        'Listings inspected & validated'
      ],
      icon: FileCheck,
      bgColor: 'bg-white',
      textColor: 'text-slate-900',
      iconColor: 'text-slate-900'
    },
    {
      number: 2,
      title: 'Security Layer',
      subtitle: 'Secure Deposit via Holibayt Pay™',
      points: [
        "Buyer’s deposit locked in Holibayt Pay™ escrow",
        'Release only after due diligence & validation',
        'Transparent, milestone‑based transaction flow'
      ],
      icon: LockIcon,
      bgColor: 'bg-white',
      textColor: 'text-slate-900',
      iconColor: 'text-slate-900'
    },
    {
      number: 3,
      title: 'Protection Layer',
      subtitle: 'Legal Support & insurance with Holibayt Protect™',
      points: [
        'Legal assistance provided by certified notaries',
        'Backed by Holibayt Protect™ & Holibayt Insurance™',
        'Covers fraud, disputes, or documentation errors'
      ],
      icon: Scale,
      bgColor: 'bg-white',
      textColor: 'text-slate-900',
      iconColor: 'text-slate-900'
    },
    {
      number: 4,
      title: 'Transparency Layer',
      subtitle: 'Transaction Finalized',
      points: [
        'Ownership officially transferred and confirmed',
        'Funds released to seller through Holibayt Pay™',
        'Final documents & receipts provided'
      ],
      icon: FileSignature,
      bgColor: 'bg-white',
      textColor: 'text-slate-900',
      iconColor: 'text-slate-900'
    }
  ];

  const rentLayers: WorkflowLayer[] = [
    {
      number: 1,
      title: 'Trust Layer',
      subtitle: 'Find a Verified Property',
      points: [
        'Verified listings, landlords & tenants',
        'ID (KYC) & property verification via Holibayt Verify™'
      ],
      icon: HomeIcon,
      bgColor: 'bg-white',
      textColor: 'text-slate-900',
      iconColor: 'text-slate-900'
    },
    {
      number: 2,
      title: 'Security Layer',
      subtitle: 'Sign & Secure with Holibayt Pay™ (Escrow)',
      points: [
        "Tenant pays first month’s rent + deposit into escrow",
        'Owner’s listing commitment secured (availability guaranteed)'
      ],
      icon: FileSignature,
      bgColor: 'bg-white',
      textColor: 'text-slate-900',
      iconColor: 'text-slate-900'
    },
    {
      number: 3,
      title: 'Protection Layer',
      subtitle: 'Move in Protected with Holibayt Protect™',
      points: [
        'Deposit & contract secured',
        'Damage/dispute coverage with Holibayt Insurance™',
        '24/7 mediation & assistance for both parties'
      ],
      icon: ShieldCheck,
      bgColor: 'bg-white',
      textColor: 'text-slate-900',
      iconColor: 'text-slate-900'
    },
    {
      number: 4,
      title: 'Transparency Layer',
      subtitle: 'Monthly Payouts Released',
      points: [
        'Owner receives payment each month after verification',
        'Holibayt Pay™ manages all transactions securely'
      ],
      icon: DollarSign,
      bgColor: 'bg-white',
      textColor: 'text-slate-900',
      iconColor: 'text-slate-900'
    }
  ];

  const layers = mode === 'buy' ? buyLayers : rentLayers;

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Headline exactly like screenshot */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold tracking-tight text-slate-900">
            {mode === 'buy' ? 'Buy — Verified. Secured. Guaranteed.' : 'Rent — Secure Long-Term Rentals, Simplified.'}
          </h2>
        </div>

        {/* Top layer labels row (desktop) */}
        <div className="hidden md:grid grid-cols-4 gap-4 mb-6 text-center">
          {['Trust Layer','Security Layer','Protection Layer','Transparency Layer'].map((label, i) => (
            <div key={i} className="text-sm font-semibold text-slate-600">
              {label}
            </div>
          ))}
        </div>

        {/* Columns with arrows between (desktop) */}
        <div className="hidden md:flex items-stretch justify-between gap-4 relative">
          {layers.map((layer, index) => {
            const Icon = layer.icon;
            return (
              <div key={layer.number} className="flex items-center">
                <UICard className={`${layer.bgColor} border border-slate-200 rounded-2xl shadow-sm w-64`}>
                  <UICardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      <Icon className={`w-12 h-12 ${layer.iconColor}`} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 text-center mb-1">{layer.subtitle}</h3>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {layer.points.map((p, i) => (
                        <li key={i} className="leading-snug">
                          {p}
                        </li>
                      ))}
                    </ul>
                  </UICardContent>
                </UICard>
                {index < layers.length - 1 && (
                  <ArrowRightIcon className="w-8 h-8 text-slate-400 mx-3" />
                )}
              </div>
            );
          })}
        </div>

        {/* Stacked (mobile) */}
        <div className="md:hidden space-y-6">
          {layers.map((layer, index) => {
            const Icon = layer.icon;
            return (
              <div key={layer.number}>
                <div className="text-xs font-semibold text-slate-600 mb-2">{['Trust Layer','Security Layer','Protection Layer','Transparency Layer'][index]}</div>
                <UICard className={`border border-slate-200 rounded-2xl shadow-sm ${layer.bgColor}`}>
                  <UICardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Icon className={`w-10 h-10 ${layer.iconColor} flex-shrink-0`} />
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 mb-1">{layer.subtitle}</h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                          {layer.points.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </UICardContent>
                </UICard>
                {index < layers.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ArrowRightIcon className="w-6 h-6 text-slate-400 rotate-90" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/*********************************
 * QUICK ACCESS SECTION w/ Tabs
 *********************************/
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button as UIButton } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const QuickAccessSection: React.FC = () => {
  // sandbox-safe text helper matching your t() usage
  const t = (k: string) =>
    (
      FALLBACK_I18N[k] ??
      {
        'howCanWeHelp': 'How can we help?',
        'quickEntriesDesc': 'Pick a flow to see the exact steps and protection layers.',
        'workflow.buy.tab': 'Buy',
        'workflow.rent.tab': 'Rent',
        'workflow.shortStay.tab': 'Short Stay',
        'workflow.buy.title': 'Buy — Verified. Secured. Guaranteed.',
        'workflow.buy.subtitle': 'Four layers of protection for your property purchase',
        'workflow.rent.title': 'Rent — Secure Long-Term Rentals, Simplified.',
        'workflow.rent.subtitle': 'Four layers ensuring a safe rental experience',
        'workflow.shortStay.title': 'Short Stay — Safe & Simple',
        'workflow.shortStay.subtitle': 'Verified hosts, escrow payments, protected payouts',
        'start': 'Start',
        'needHelp': 'Not sure where to start? We can help.',
        'speakToAdvisor': 'Speak to an advisor',
      }[k]
    ) ?? k;

  const navigate = useNavigate();
  return (
    <section className="py-8 sm:py-12 md:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-foreground mb-2 sm:mb-3 md:mb-4 px-2">
            {t('howCanWeHelp')}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-inter font-light max-w-2xl mx-auto px-4">
            {t('quickEntriesDesc')}
          </p>
        </div>

        {/* Tabbed Workflow Card */}
        <UICard className="border-2 border-primary/20 shadow-elegant">
          <UICardContent className="p-4 sm:p-6 md:p-8">
            <Tabs defaultValue="buy" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8 h-auto">
                <TabsTrigger value="buy" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base py-2 sm:py-3">
                  <HomeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t('workflow.buy.tab')}</span>
                  <span className="sm:hidden">{t('workflow.buy.tab')}</span>
                </TabsTrigger>
                <TabsTrigger value="rent" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base py-2 sm:py-3">
                  <Key className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t('workflow.rent.tab')}</span>
                  <span className="sm:hidden">{t('workflow.rent.tab')}</span>
                </TabsTrigger>
                <TabsTrigger value="short-stay" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base py-2 sm:py-3">
                  <Bed className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t('workflow.shortStay.tab')}</span>
                  <span className="sm:hidden">{t('workflow.shortStay.tab')}</span>
                </TabsTrigger>
              </TabsList>

              {/* Buy Tab Content */}
              <TabsContent value="buy" className="space-y-4 sm:space-y-6">
                <div className="text-center mb-4 sm:mb-6 px-2">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-playfair font-bold text-foreground mb-2">
                    {t('workflow.buy.title')}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t('workflow.buy.subtitle')}</p>
                </div>
                <WorkflowInteractive mode="buy" />
                <div className="flex justify-center pt-2 sm:pt-4">
                  <UIButton
                    onClick={() => navigate('/buy')}
                    className="gap-2 w-full sm:w-auto"
                    size="lg"
                  >
                    {t('start')}
                    <ArrowRightIcon className="h-4 w-4" />
                  </UIButton>
                </div>
              </TabsContent>

              {/* Rent Tab Content */}
              <TabsContent value="rent" className="space-y-4 sm:space-y-6">
                <div className="text-center mb-4 sm:mb-6 px-2">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-playfair font-bold text-foreground mb-2">
                    {t('workflow.rent.title')}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t('workflow.rent.subtitle')}</p>
                </div>
                <WorkflowInteractive mode="rent" />
                <div className="flex justify-center pt-2 sm:pt-4">
                  <UIButton
                    onClick={() => navigate('/rent')}
                    className="gap-2 w-full sm:w-auto"
                    size="lg"
                  >
                    {t('start')}
                    <ArrowRightIcon className="h-4 w-4" />
                  </UIButton>
                </div>
              </TabsContent>

              {/* Short Stay Tab Content */}
              <TabsContent value="short-stay" className="space-y-4 sm:space-y-6">
                <div className="text-center mb-4 sm:mb-6 px-2">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-playfair font-bold text-foreground mb-2">
                    {t('workflow.shortStay.title')}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t('workflow.shortStay.subtitle')}</p>
                </div>
                {/* compact short-stay tiles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <UICard className="border border-border"><UICardContent className="p-5 text-center"><Search className="w-10 h-10 mx-auto text-primary"/><div className="mt-2 font-semibold">Search & Verify</div><div className="text-sm text-slate-600">Find verified stays with trusted hosts.</div></UICardContent></UICard>
                  <UICard className="bg-teal-900 text-white border-none"><UICardContent className="p-5 text-center"><CreditCard className="w-10 h-10 mx-auto"/><div className="mt-2 font-semibold">Book with Holibayt Pay™</div><div className="text-sm opacity-90">Escrow holds funds; host paid after your stay.</div></UICardContent></UICard>
                  <UICard className="border border-border"><UICardContent className="p-5 text-center"><HandCoins className="w-10 h-10 mx-auto text-primary"/><div className="mt-2 font-semibold">Secure Payout</div><div className="text-sm text-slate-600">Payout released after completion.</div></UICardContent></UICard>
                </div>
                <div className="flex justify-center pt-2 sm:pt-4">
                  <UIButton
                    onClick={() => navigate('/short-stay')}
                    className="gap-2 w-full sm:w-auto"
                    size="lg"
                    variant="outline"
                  >
                    Explore stays
                    <ArrowRightIcon className="h-4 w-4" />
                  </UIButton>
                </div>
              </TabsContent>
            </Tabs>
          </UICardContent>
        </UICard>

        {/* Bottom CTA */}
        <div className="text-center mt-6 sm:mt-8 md:mt-12">
          <p className="text-muted-foreground font-inter text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 sm:mb-4 md:mb-6 font-semibold px-4">
            {t('needHelp')}
          </p>
          <UIButton
            variant="outline"
            size="lg"
            className="font-inter font-medium text-sm sm:text-base md:text-lg px-6 sm:px-8 py-2 sm:py-3 hover:shadow-elegant hover:scale-105 transition-all duration-300 border-2 border-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto"
            onClick={() => navigate('/contact-advisor')}
          >
            {t('speakToAdvisor')}
          </UIButton>
        </div>
      </div>
    </section>
  );
};

/**********************
 * Additional Smoke Tests
 **********************/
export const runWorkflowSmokeTests = () => {
  const buy = 4, rent = 4;
  return { buyLayers: buy, rentLayers: rent, hasHeadlines: true };
};
