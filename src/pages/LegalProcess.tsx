import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Scale, CheckCircle, ArrowRight, AlertTriangle, BadgeCheck, Users, FileText, Clock, Phone } from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

export default function LegalProcess() {
  const { t } = useLanguage();
  useScrollToTop();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Legal Support Process - Expert Real Estate Legal Services | Holibayt"
        description="Get expert legal support for your real estate transaction in Algeria. Verified lawyers, secure processes, and comprehensive legal reviews."
      />
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/15 via-background to-accent/10 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-semibold text-primary">
                <Scale className="w-4 h-4" />
                {t('legalSupport') || 'Legal Support'}
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-foreground font-playfair leading-tight">
                Expert Legal Support for Every Transaction
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground font-inter">
                Navigate real estate transactions with confidence. Get professional legal review and support throughout your journey.
              </p>

              {/* Trust Banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-border/50">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <BadgeCheck className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Verified Lawyers</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-accent" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Contract Review</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Protected Process</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Fast Response</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/lawyers">
                  <Button size="lg" className="w-full sm:w-auto">
                    View Available Lawyers
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/buy">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Browse Properties
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How Legal Support Works */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground font-playfair mb-4">
                How Legal Support Works
              </h2>
              <p className="text-lg text-muted-foreground font-inter">
                Simple, secure, and transparent — here's how we support your transaction legally
              </p>
            </div>

            {/* Visual Flow Diagram */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center">
                <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  <Users className="w-10 h-10" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Submit Request</h3>
                <p className="text-sm text-muted-foreground">Request legal review for your property transaction</p>
              </div>

              <ArrowRight className="w-8 h-8 text-primary rotate-90 md:rotate-0" />

              <div className="flex-1 text-center">
                <div className="w-20 h-20 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  <BadgeCheck className="w-10 h-10" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Lawyer Assignment</h3>
                <p className="text-sm text-muted-foreground">We connect you with a verified legal expert</p>
              </div>

              <ArrowRight className="w-8 h-8 text-primary rotate-90 md:rotate-0" />

              <div className="flex-1 text-center">
                <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  <FileText className="w-10 h-10" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Legal Review</h3>
                <p className="text-sm text-muted-foreground">Expert reviews your documents and contract</p>
              </div>

              <ArrowRight className="w-8 h-8 text-primary rotate-90 md:rotate-0" />

              <div className="flex-1 text-center">
                <div className="w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Protected Transaction</h3>
                <p className="text-sm text-muted-foreground">Proceed safely with legal confidence</p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-lg text-center">
              <p className="text-sm text-foreground font-inter">
                <Shield className="w-4 h-4 inline mr-2 text-primary" />
                Our legal support ensures all documentation is properly reviewed and validated before you commit to any transaction. This protects your interests and provides peace of mind.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground font-playfair mb-4">
                Why Legal Support Matters
              </h2>
              <p className="text-lg text-muted-foreground font-inter">
                See the difference between transactions with and without legal review
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Without Legal Support */}
              <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                    <div>
                      <CardTitle className="text-2xl">Without Legal Review</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Risks you take</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                    <p className="text-sm text-muted-foreground">Hidden clauses that could cost you money</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                    <p className="text-sm text-muted-foreground">Unclear ownership or property rights</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                    <p className="text-sm text-muted-foreground">Disputes without legal protection</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                    <p className="text-sm text-muted-foreground">Non-compliant contracts that may be invalid</p>
                  </div>
                </CardContent>
              </Card>

              {/* With Legal Support */}
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-primary" />
                    <div>
                      <CardTitle className="text-2xl">With Holibayt Legal Support</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Complete protection</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-foreground font-semibold">Full contract review by qualified lawyers</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-foreground font-semibold">Verified property ownership and rights</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-foreground font-semibold">Legal mediation for disputes</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-foreground font-semibold">Compliant, enforceable documentation</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Legal Services Offered */}
        <section className="py-20 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground font-playfair mb-4">
                Legal Services We Offer
              </h2>
              <p className="text-lg text-muted-foreground font-inter">
                Comprehensive legal support for every type of real estate transaction
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <FileText className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Contract Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-inter">
                    Thorough review of purchase agreements, rental contracts, and lease agreements to ensure all terms are fair and legal.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <BadgeCheck className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Title Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-inter">
                    Verification of property ownership, land titles, and legal rights to ensure clean transfer of property.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <Scale className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Dispute Resolution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-inter">
                    Legal mediation and representation for disputes between buyers, sellers, landlords, and tenants.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <Shield className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Due Diligence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-inter">
                    Comprehensive property inspections, legal checks, and background verification for secure transactions.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <Users className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Notary Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-inter">
                    Connection with certified notaries for official document authentication and legal registration.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <Clock className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Ongoing Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-inter">
                    Continued legal advice throughout the transaction process and after closing for peace of mind.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Lawyer Availability Notice */}
        <section className="py-16 bg-primary/5 border-y border-primary/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-semibold text-primary">
                <Phone className="w-4 h-4" />
                Contact Information
              </div>
              
              <h3 className="text-3xl font-bold text-foreground font-playfair">
                Need Legal Assistance?
              </h3>
              
              <p className="text-lg text-muted-foreground font-inter">
                If lawyers are available in our network for your region, you can request them directly through the platform. For direct legal inquiries or if no lawyers are currently available, please contact us at:
              </p>
              
              <div className="inline-flex items-center gap-2 bg-background px-6 py-3 rounded-lg border border-border">
                <Phone className="w-5 h-5 text-primary" />
                <a href="mailto:contact@holibayt.com" className="text-xl font-semibold text-primary hover:underline">
                  contact@holibayt.com
                </a>
              </div>

              <p className="text-sm text-muted-foreground">
                Our team will connect you with qualified legal professionals who can assist with your real estate transaction.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <h2 className="text-4xl font-bold text-foreground font-playfair">
              Ready to Get Legal Support?
            </h2>
            <p className="text-xl text-muted-foreground font-inter">
              Browse available lawyers or explore properties with built-in legal protection
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/lawyers">
                <Button size="lg" className="w-full sm:w-auto">
                  View Available Lawyers
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/buy">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
