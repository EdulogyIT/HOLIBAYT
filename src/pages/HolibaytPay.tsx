import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, CreditCard, CheckCircle, Clock, RefreshCcw, Globe, Users, ArrowRight, AlertTriangle, BadgeCheck } from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Link } from "react-router-dom";

export default function HolibaytPay() {
  const { t } = useLanguage();
  useScrollToTop();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        {/* Hero Section - Redesigned */}
        <section className="bg-gradient-to-br from-primary/15 via-background to-accent/10 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-semibold text-primary">
                <Shield className="w-4 h-4" />
                {t('holibaytPayHero') || 'Escrow-Based Payment System'}
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-foreground font-playfair leading-tight">
                {t('holibaytPayMainTitle') || 'The first escrow-based payment system for real estate in Algeria.'}
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground font-inter">
                {t('holibaytPaySubhero') || 'Protecting buyers, tenants, and hosts by holding funds securely until confirmation.'}
              </p>

              {/* Trust Banner - 4 Icons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-border/50">
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
        </section>

        {/* Infographic Section - Payment Flow */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground font-playfair mb-4">
                {t('howItWorks') || 'How Holibayt Pay™ Works'}
              </h2>
              <p className="text-lg text-muted-foreground font-inter">
                {t('howItWorksSubtitle') || 'Simple, secure, and transparent — here\'s how we protect your transaction from start to finish.'}
              </p>
            </div>

            {/* Visual Flow Diagram */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center">
                <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  <Users className="w-10 h-10" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('buyerTenant') || 'Buyer / Tenant'}</h3>
                <p className="text-sm text-muted-foreground">{t('initiatesPayment') || 'Initiates payment'}</p>
              </div>

              <ArrowRight className="w-8 h-8 text-primary rotate-90 md:rotate-0" />

              <div className="flex-1 text-center">
                <div className="w-20 h-20 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  <Shield className="w-10 h-10" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('holibaytEscrow') || 'Holibayt Escrow'}</h3>
                <p className="text-sm text-muted-foreground">{t('holdsSecurely') || 'Holds funds securely'}</p>
              </div>

              <ArrowRight className="w-8 h-8 text-primary rotate-90 md:rotate-0" />

              <div className="flex-1 text-center">
                <div className="w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('sellerHost') || 'Seller / Host'}</h3>
                <p className="text-sm text-muted-foreground">{t('receivesAfterConfirmation') || 'Receives after confirmation'}</p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-lg text-center">
              <p className="text-sm text-foreground font-inter">
                <Lock className="w-4 h-4 inline mr-2 text-primary" />
                {t('escrowExplainer') || 'Your funds are held in our secure escrow system and only released to the host after you complete your stay or receive your property keys. This protects both parties throughout the transaction.'}
              </p>
            </div>
          </div>
        </section>

        {/* "Why Not Pay Directly?" Comparison Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground font-playfair mb-4">
                {t('whyNotPayDirectly') || 'Why Not Pay Directly?'}
              </h2>
              <p className="text-lg text-muted-foreground font-inter">
                {t('comparisonSubtitle') || 'See the difference between direct payments and Holibayt Pay™'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Direct Payment - Risks */}
              <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                  <div>
                    <CardTitle className="text-2xl">{t('directPayment') || 'Direct Payment'}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{t('directPaymentSubtitle') || 'Risks you take without protection'}</p>
                  </div>
                </div>
              </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                    <p className="text-sm text-muted-foreground">{t('riskFraud') || 'No protection against fraud or misrepresentation'}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                    <p className="text-sm text-muted-foreground">{t('riskNoRefund') || 'Difficult to get refunds if issues arise'}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                    <p className="text-sm text-muted-foreground">{t('riskNoVerification') || 'No verification of identity or property ownership'}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                    <p className="text-sm text-muted-foreground">{t('riskDisputes') || 'Disputes are hard to resolve without third-party mediation'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Holibayt Pay - Benefits */}
              <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">{t('holibaytPayBrand') || 'Holibayt Pay™'}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{t('holibaytPayBenefitsSubtitle') || 'Built-in protection at every step'}</p>
                  </div>
                </div>
              </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-foreground font-semibold">{t('benefitEscrow') || 'Funds held in secure escrow until confirmation'}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-foreground font-semibold">{t('benefitRefund') || 'Easy refund process if property doesn\'t match listing'}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-foreground font-semibold">{t('benefitVerified') || 'All users and properties verified before transactions'}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-foreground font-semibold">{t('benefitSupport') || '24/7 support for dispute resolution and mediation'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Key Features Grid */}
        <section className="py-20 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground font-playfair mb-4">
                {t('keyFeatures') || 'Why Choose Holibayt Pay™'}
              </h2>
              <p className="text-lg text-muted-foreground font-inter">
                {t('keyFeaturesSubtitle') || 'Trust, security, and peace of mind — built into every transaction'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <Shield className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>{t('bankLevelSecurity') || 'Bank-Level Security'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-inter">
                    {t('holibaytPaySecurityDesc') || 'Your payment information is encrypted and protected with industry-leading security standards. We never store your card details.'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <Lock className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>{t('secureTransactions') || 'Secure Transactions'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-inter">
                    {t('holibaytPayStripeDesc') || 'All transactions are processed through Stripe, a globally trusted payment platform used by millions of businesses worldwide.'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CreditCard className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>{t('multiplePaymentMethods') || 'Multiple Payment Methods'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-inter">
                    {t('holibaytPayPaymentMethodsDesc') || 'Accept payments via credit cards, debit cards, and other popular payment methods. Support for EUR, USD, and DZD currencies.'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CheckCircle className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>{t('instantConfirmation') || 'Instant Confirmation'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-inter">
                    {t('holibaytPayConfirmationDesc') || 'Get immediate booking confirmation once payment is processed. Both guests and hosts receive instant notifications.'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <Clock className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>{t('timelyPayouts') || 'Escrow Release & Payouts'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-inter">
                    {t('holibaytPayPayoutsDesc') || 'Funds are held in escrow until stay completion. For short-stays, payment is automatically released 24 hours after checkout. For purchases, payment is released upon key handover confirmation.'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <RefreshCcw className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>{t('easyRefundsTitle') || 'Easy Refunds'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-inter">
                    {t('holibaytPayRefundsDesc') || 'Simple refund process for cancellations. Security deposits are automatically refunded after checkout according to the policy.'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Credibility Bar - Partners */}
        <section className="py-16 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-foreground font-playfair mb-4">
                {t('trustedPartners') || 'Trusted Payment Partners'}
              </h3>
              <p className="text-muted-foreground font-inter">
                {t('trustedPartnersSubtitle') || 'Your payments are protected by global leaders in financial security'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-12 opacity-60">
              <div className="text-4xl font-bold text-foreground">Stripe</div>
              <div className="text-4xl font-bold text-foreground">VISA</div>
              <div className="text-4xl font-bold text-foreground">Mastercard</div>
              <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
                <Shield className="w-6 h-6" />
                PCI-DSS
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-16 max-w-3xl mx-auto">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <p className="text-lg italic text-foreground font-inter">
                      "{t('testimonialText') || 'Thanks to Holibayt Pay, I could rent safely from abroad. The escrow system gave me complete peace of mind.'}"
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('testimonialAuthor') || '— Sarah M., Property Renter from France'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Enhanced FAQ Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-16 font-playfair">
              {t('frequentlyAskedQuestions') || 'Frequently Asked Questions'}
            </h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('faqSafetyQuestion') || 'Is Holibayt Pay safe?'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-inter">
                    {t('faqSafetyAnswer') || 'Yes, absolutely! We use Stripe, one of the world\'s most trusted payment processors. Your payment information is encrypted and we never store your card details on our servers.'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('faqProtectionQuestion') || 'How is my money protected until I move in?'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-inter">
                    {t('faqProtectionAnswer') || 'Your funds are held in a secure escrow account managed by Holibayt. The money is only released to the host after you confirm check-in and that the property matches the listing.'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('faqMismatchQuestion') || 'What if the property doesn\'t match the listing?'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-inter">
                    {t('faqMismatchAnswer') || 'If the property doesn\'t match its description, you can report it immediately. We will investigate and issue a full refund if the listing was misrepresented. Your payment remains in escrow until resolution.'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('faqRefundQuestion') || 'Can I get a refund if there\'s a problem?'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-inter">
                    {t('faqRefundAnswer') || 'Yes. If there are issues with the property that weren\'t disclosed in the listing, you can request a refund through our resolution center. We review all cases fairly and process refunds within 5-7 business days.'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('faqPaymentMethodsQuestion') || 'What payment methods do you accept?'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-inter">
                    {t('faqPaymentMethodsAnswer') || 'We accept all major credit and debit cards (Visa, Mastercard, American Express) and support payments in EUR, USD, and DZD currencies.'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('faqHostPaymentQuestion') || 'When do hosts receive payment?'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-inter">
                    {t('faqHostPaymentAnswer') || 'Hosts receive their payment (minus commission) automatically after the guest confirms check-in and the property matches the listing. This typically happens within 24 hours of check-in.'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground font-playfair">
              {t('readyToSecureTransaction') || 'Ready to secure your next transaction?'}
            </h2>
            <p className="text-xl text-muted-foreground font-inter">
              {t('ctaSubtitle') || 'Join thousands of users who trust Holibayt Pay™ for their property transactions.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link to="/short-stay">
                  {t('browseProperties') || 'Browse Properties'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link to="/publish-property">
                  {t('listYourProperty') || 'List Your Property'}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
