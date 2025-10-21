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
import WorkflowInteractive from "@/components/WorkflowInteractive";

/* Animation (gentle) */
const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
};

/* Section wrapper (isolate avoids bleed/overlap) */
const Section = ({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section id={id} className={`relative isolate py-12 md:py-16 ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
  </section>
);

const StatCard = ({ icon: Icon, value, title, description, index }: any) => (
  <motion.div variants={fadeIn} custom={index}>
    <Card className="border border-border/60 rounded-2xl text-center shadow-sm hover:shadow-md transition-all">
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
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[28ch] mx-auto">
          {description}
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

const Step = ({ icon: Icon, title, subtitle, tone = "primary" }: any) => (
  <div className="flex-1 min-w-[220px] text-center">
    <div
      className={`w-20 h-20 rounded-2xl ${
        tone === "accent"
          ? "bg-accent text-accent-foreground"
          : tone === "success"
          ? "bg-green-600 text-white"
          : "bg-primary text-primary-foreground"
      } flex items-center justify-center mx-auto mb-4 shadow-sm`}
    >
      <Icon className="w-10 h-10" aria-hidden="true" />
    </div>
    <h4 className="font-semibold text-lg mb-1">{title}</h4>
    <p className="text-sm text-muted-foreground">{subtitle}</p>
  </div>
);

const About = () => {
  const { t } = useLanguage();
  useScrollToTop();

  // i18n fallback so raw keys never show
  const tx = (k: string, fallback: string) => {
    try {
      const v = t(k) as string;
      return v && v !== k ? v : fallback;
    } catch {
      return fallback;
    }
  };

  const stats = [
    { icon: Building, title: t("properties"), value: "10,000+", description: t("propertiesListed") },
    { icon: Users, title: t("clients"), value: "50,000+", description: t("satisfiedClients") },
    { icon: Award, title: t("experience"), value: "15 " + t("years"), description: t("realEstateExpertise") },
    { icon: Shield, title: t("security"), value: "100%", description: t("secureTransactions") },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Navigation />

      {/* HERO */}
      <header className="relative isolate overflow-hidden">
        {/* Decorative blobs behind content */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-16 -left-14 h-56 w-56 rounded-full bg-primary/15 blur-2xl md:h-72 md:w-72" />
          <div className="absolute -bottom-16 -right-14 h-56 w-56 rounded-full bg-accent/15 blur-2xl md:h-72 md:w-72" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <Section className="pt-24 pb-12">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              variants={fadeIn}
              initial="hidden"
              animate="show"
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              {tx("aboutBeitik", "About Holibayt")}
            </motion.h1>

            <motion.p
              variants={fadeIn}
              initial="hidden"
              animate="show"
              className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed"
            >
              {t("aboutDescription")}
            </motion.p>

            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="show"
              className="mt-8 flex items-center justify-center gap-3 flex-wrap"
            >
              <Button asChild size="lg">
                <Link to="/buy">{t("buyProperty")}</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/rent">{t("rentProperty")}</Link>
              </Button>
            </motion.div>
          </div>
        </Section>
      </header>

      <main className="relative isolate">
        {/* STATS */}
        <Section className="pt-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
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
            viewport={{ once: true, amount: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-center mb-10"
          >
            {tx("howWeHelpYou", "How we help you")}
          </motion.h2>

          {/* Service Overview Cards */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10">
            {[
              {
                icon: Building2,
                bgColor: "bg-blue-50 dark:bg-blue-950/40",
                color: "text-blue-600",
                title: t("buyProperty"),
                desc: t("buyPropertyDesc"),
                to: "/buy",
              },
              {
                icon: Home,
                bgColor: "bg-green-50 dark:bg-green-950/40",
                color: "text-green-600",
                title: t("rentProperty"),
                desc: t("rentPropertyDesc"),
                to: "/rent",
              },
              {
                icon: CalendarDays,
                bgColor: "bg-amber-50 dark:bg-amber-950/40",
                color: "text-amber-600",
                title: t("shortStay"),
                desc: t("shortStayDesc"),
                to: "/short-stay",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
              >
                <Card className="border border-border/60 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <CardHeader>
                    <div
                      className={`w-16 h-16 rounded-2xl ${item.bgColor} flex items-center justify-center mb-4`}
                    >
                      <item.icon className={`w-10 h-10 ${item.color}`} aria-hidden="true" />
                    </div>
                    <CardTitle className="text-2xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{item.desc}</p>
                    <Button variant="link" asChild className="p-0 h-auto">
                      <Link to={item.to} className="inline-flex items-center gap-2 text-base">
                        {t("learnMore")} <ArrowRight className="w-5 h-5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Workflows wrapped to avoid overflow.
             We also pass title/subtitle props; see WorkflowInteractive patch below. */}
          <div className="mt-12 space-y-12">
            <Card className="overflow-hidden">
              <CardHeader className="pb-0">
                <div className="mx-auto text-center space-y-2">
                  <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                    {tx("howToBuy", "How to Buy")}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold">{tx("buyWorkflowTitle", "Buying workflow")}</h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {tx("buyWorkflowSubtitle", "A simple, step-by-step path to purchasing")}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <WorkflowInteractive
                  mode="buy"
                  title={tx("buyWorkflowTitle", "Buying workflow")}
                  subtitle={tx("buyWorkflowSubtitle", "A simple, step-by-step path to purchasing")}
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-0">
                <div className="mx-auto text-center space-y-2">
                  <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                    {tx("howToRent", "How to Rent")}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold">{tx("rentWorkflowTitle", "Renting workflow")}</h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {tx("rentWorkflowSubtitle", "A clear checklist for secure renting")}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <WorkflowInteractive
                  mode="rent"
                  title={tx("rentWorkflowTitle", "Renting workflow")}
                  subtitle={tx("rentWorkflowSubtitle", "A clear checklist for secure renting")}
                />
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* OUR STORY */}
        <Section id="our-story">
          <div className="max-w-3xl mb-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{tx("ourStory", "Our Story")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("storyIntro")}</p>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              { v: "story-1", title: t("theBeginning"), body: t("storyParagraph1") },
              { v: "story-2", title: t("ourGrowth"), body: t("storyParagraph2") },
              { v: "story-3", title: t("innovation"), body: t("storyParagraph3") },
              { v: "story-4", title: t("today"), body: t("storyParagraph4") },
            ].map((row) => (
              <AccordionItem key={row.v} value={row.v} className="border rounded-2xl px-4 sm:px-6">
                <AccordionTrigger className="hover:no-underline text-left py-4">
                  <span className="text-lg font-semibold">{row.title}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                  {row.body}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>

        {/* VERIFY & PROTECT */}
        <Section className="grid md:grid-cols-2 gap-8 relative z-10 items-stretch">
          <Card className="flex flex-col justify-between border border-primary/40 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BadgeCheck className="w-10 h-10 text-primary" aria-hidden="true" />
                <div>
                  <CardTitle className="text-2xl">{tx("holibaytVerify", "Holibayt Verify")}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {tx("trustThroughVerification", "Trust through verification")}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: tx("identityVerification", "Identity verification"), sub: tx("governmentIdSelfie", "Government ID + selfie check") },
                { title: tx("propertyVerification", "Property verification"), sub: tx("documentCheckOnSite", "Documents & optional on-site") },
                { title: tx("ownershipVerification", "Ownership verification"), sub: tx("legalTitleCheck", "Legal title check") },
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

          <Card className="flex flex-col justify-between border border-green-500/40 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-10 h-10 text-green-600" aria-hidden="true" />
                <div>
                  <CardTitle className="text-2xl">{tx("holibaytProtect", "Holibayt Protect")}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {tx("insuranceProtection", "Insurance-style protection")}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: tx("transactionProtection", "Transaction protection"), sub: tx("coverageAmount", "Funds held until handover") },
                { title: tx("fraudProtection", "Fraud protection"), sub: tx("fraudCoverage", "Coverage for misrepresentation") },
                { title: tx("disputeResolution", "Dispute resolution"), sub: tx("mediationSupport", "Mediation support") },
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
        <Section className="grid gap-6 md:grid-cols-3 relative z-10">
          {[
            { title: tx("ourMission", "Our Mission"), body: t("missionDescription") },
            { title: tx("ourVision", "Our Vision"), body: t("visionDescription") },
            { title: tx("ourValues", "Our Values"), body: t("valuesDescription") },
          ].map((b, i) => (
            <Card key={i} className="border border-border/60 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle className="text-xl">{b.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed max-w-prose">{b.body}</p>
              </CardContent>
            </Card>
          ))}
        </Section>

        {/* HOLIBAYT PAY */}
        <Section id="holibayt-pay" className="relative z-0 mt-12">
          <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-2xl p-6 md:p-10 mb-12 border border-border/50 shadow-sm">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              <Badge className="mb-2 text-sm font-semibold inline-flex items-center">
                <Shield className="w-4 h-4 mr-1" aria-hidden="true" />
                {t("holibaytPayHero")}
              </Badge>

              <h2 className="text-3xl md:text-5xl font-bold">
                {tx("holibaytPayMainTitle", "Holibayt Pay™ – Secure Real Estate Payments in Algeria")}
              </h2>

              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {t("holibaytPaySubhero")}
              </p>

              {/* Trust Icons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-6 border-t border-border/50">
                {[
                  { Icon: Globe, label: t("designedForAlgeria"), wrap: "bg-primary/10", tone: "text-primary" },
                  { Icon: CreditCard, label: t("multiCurrency"), wrap: "bg-accent/10", tone: "text-accent" },
                  { Icon: BadgeCheck, label: t("verifiedUsersOnly"), wrap: "bg-green-500/10", tone: "text-green-600" },
                  { Icon: Shield, label: t("escrowProtected"), wrap: "bg-blue-500/10", tone: "text-blue-600" },
                ].map(({ Icon, label, wrap, tone }, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 text-center">
                    <div className={`w-12 h-12 rounded-full ${wrap} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${tone}`} aria-hidden="true" />
                    </div>
                    <span className="text-sm font-semibold">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              {tx("howItWorks", "How Holibayt Pay™ Works")}
            </h3>

            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mb-6">
              <Step icon={Users} title={t("buyerTenant")} subtitle={t("initiatesPayment")} />
              <ArrowRight className="w-8 h-8 text-primary rotate-90 md:rotate-0" aria-hidden="true" />
              <Step icon={Shield} title={t("holibaytEscrow")} subtitle={t("holdsSecurely")} tone="accent" />
              <ArrowRight className="w-8 h-8 text-primary rotate-90 md:rotate-0" aria-hidden="true" />
              <Step icon={CheckCircle} title={t("sellerHost")} subtitle={t("receivesAfterConfirmation")} tone="success" />
            </div>

            <div className="p-4 md:p-6 bg-primary/5 border border-primary/20 rounded-xl text-center">
              <p className="text-sm">
                <Lock className="w-4 h-4 inline mr-2 text-primary" aria-hidden="true" />
                {t("escrowExplainer")}
              </p>
            </div>
          </div>

          {/* Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <Card className="border border-destructive/50 bg-destructive/5 rounded-2xl shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-destructive" aria-hidden="true" />
                  <div>
                    <CardTitle className="text-xl">{t("directPayment")}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t("directPaymentSubtitle")}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[t("riskFraud"), t("riskNoRefund"), t("riskNoVerification")].map((txt, i) => (
                  <div className="flex items-start gap-2" key={i}>
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                    <p className="text-sm text-muted-foreground">{txt}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-primary/50 bg-primary/5 rounded-2xl shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" aria-hidden="true" />
                  <div>
                    <CardTitle className="text-xl">{t("holibaytPayBrand")}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t("holibaytPayBenefitsSubtitle")}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[t("benefitEscrow"), t("benefitRefund"), t("benefitVerified")].map((txt, i) => (
                  <div className="flex items-start gap-2" key={i}>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-semibold">{txt}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { Icon: Shield, title: t("bankLevelSecurity"), body: t("holibaytPaySecurityDesc") },
              { Icon: Lock, title: t("secureTransactions"), body: t("holibaytPayStripeDesc") },
              { Icon: CreditCard, title: t("multiplePaymentMethods"), body: t("holibaytPayPaymentMethodsDesc") },
              { Icon: CheckCircle, title: t("instantConfirmation"), body: t("holibaytPayConfirmationDesc") },
              { Icon: Clock, title: t("timelyPayouts"), body: t("holibaytPayPayoutsDesc") },
              { Icon: RefreshCcw, title: t("easyRefundsTitle"), body: t("holibaytPayRefundsDesc") },
            ].map(({ Icon, title, body }, i) => (
              <Card
                key={i}
                className="border border-border/60 rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
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
