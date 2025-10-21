import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Key, Bed, ArrowRight, ShieldCheck, CreditCard, Shield, DollarSign, Search, Calendar, HandCoins, Plus, FileCheck, Lock, Scale, FileSignature } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

// Buy Workflow - 4 Horizontal Layers
const BuyWorkflowDiagram = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      {/* Layer Labels - Desktop Only */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-4 text-center font-semibold text-sm text-muted-foreground">
        <div>{t('workflow.buy.layer1.label')}</div>
        <div>{t('workflow.buy.layer2.label')}</div>
        <div>{t('workflow.buy.layer3.label')}</div>
        <div>{t('workflow.buy.layer4.label')}</div>
      </div>

      {/* Workflow Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {/* Layer 1: Trust */}
        <div className="relative bg-[#0d4d4d] text-white p-6 rounded-lg flex flex-col items-center text-center space-y-4">
          <div className="lg:hidden text-xs font-semibold text-gray-300 uppercase tracking-wide">{t('workflow.buy.layer1.label')}</div>
          <FileCheck className="h-12 w-12 flex-shrink-0" />
          <div className="space-y-3">
            <h4 className="font-semibold text-base">{t('workflow.buy.layer1.title')}</h4>
            <ul className="space-y-2 text-xs text-left">
              <li>• {t('workflow.buy.layer1.detail1')}</li>
              <li>• {t('workflow.buy.layer1.detail2')}</li>
              <li>• {t('workflow.buy.layer1.detail3')}</li>
            </ul>
          </div>
          {/* Arrow - Vertical on mobile, Horizontal on desktop */}
          <ArrowRight className="lg:hidden absolute -bottom-3 left-1/2 transform -translate-x-1/2 h-6 w-6 text-[#0d4d4d] rotate-90" />
        </div>

        {/* Arrow between 1-2 - Desktop Only */}
        <ArrowRight className="hidden lg:block absolute top-1/2 left-[23.5%] transform -translate-y-1/2 h-8 w-8 text-muted-foreground z-10" />

        {/* Layer 2: Security */}
        <div className="relative bg-[#0d4d4d] text-white p-6 rounded-lg flex flex-col items-center text-center space-y-4">
          <div className="lg:hidden text-xs font-semibold text-gray-300 uppercase tracking-wide">{t('workflow.buy.layer2.label')}</div>
          <Lock className="h-12 w-12 flex-shrink-0" />
          <div className="space-y-3">
            <h4 className="font-semibold text-base">{t('workflow.buy.layer2.title')}</h4>
            <ul className="space-y-2 text-xs text-left">
              <li>• {t('workflow.buy.layer2.detail1')}</li>
              <li>• {t('workflow.buy.layer2.detail2')}</li>
              <li>• {t('workflow.buy.layer2.detail3')}</li>
            </ul>
          </div>
          {/* Arrow - Vertical on mobile, Horizontal on desktop */}
          <ArrowRight className="lg:hidden absolute -bottom-3 left-1/2 transform -translate-x-1/2 h-6 w-6 text-[#0d4d4d] rotate-90" />
        </div>

        {/* Arrow between 2-3 - Desktop Only */}
        <ArrowRight className="hidden lg:block absolute top-1/2 left-[48.5%] transform -translate-y-1/2 h-8 w-8 text-muted-foreground z-10" />

        {/* Layer 3: Protection */}
        <div className="relative bg-[#f5b942] text-gray-900 p-6 rounded-lg flex flex-col items-center text-center space-y-4">
          <div className="lg:hidden text-xs font-semibold uppercase tracking-wide">{t('workflow.buy.layer3.label')}</div>
          <Scale className="h-12 w-12 flex-shrink-0" />
          <div className="space-y-3">
            <h4 className="font-semibold text-base">{t('workflow.buy.layer3.title')}</h4>
            <ul className="space-y-2 text-xs text-left">
              <li>• {t('workflow.buy.layer3.detail1')}</li>
              <li>• {t('workflow.buy.layer3.detail2')}</li>
              <li>• {t('workflow.buy.layer3.detail3')}</li>
            </ul>
          </div>
          {/* Arrow - Vertical on mobile, Horizontal on desktop */}
          <ArrowRight className="lg:hidden absolute -bottom-3 left-1/2 transform -translate-x-1/2 h-6 w-6 text-[#f5b942] rotate-90" />
        </div>

        {/* Arrow between 3-4 - Desktop Only */}
        <ArrowRight className="hidden lg:block absolute top-1/2 left-[73.5%] transform -translate-y-1/2 h-8 w-8 text-muted-foreground z-10" />

        {/* Layer 4: Transparency */}
        <div className="bg-gray-400 text-gray-900 p-6 rounded-lg flex flex-col items-center text-center space-y-4">
          <div className="lg:hidden text-xs font-semibold uppercase tracking-wide">{t('workflow.buy.layer4.label')}</div>
          <FileSignature className="h-12 w-12 flex-shrink-0" />
          <div className="space-y-3">
            <h4 className="font-semibold text-base">{t('workflow.buy.layer4.title')}</h4>
            <ul className="space-y-2 text-xs text-left">
              <li>• {t('workflow.buy.layer4.detail1')}</li>
              <li>• {t('workflow.buy.layer4.detail2')}</li>
              <li>• {t('workflow.buy.layer4.detail3')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Rent Workflow - 4 Horizontal Layers
const RentWorkflowDiagram = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Layer Labels - Desktop Only */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-4 text-center">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t("workflow.rent.layer1.label")}
        </div>
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t("workflow.rent.layer2.label")}
        </div>
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t("workflow.rent.layer3.label")}
        </div>
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t("workflow.rent.layer4.label")}
        </div>
      </div>

      {/* Workflow Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {/* Layer 1: Trust & Verification */}
        <div className="bg-[#1a5f5f] text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow relative">
          <div className="lg:hidden mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
              {t("workflow.rent.layer1.label")}
            </span>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <ShieldCheck className="h-12 w-12" />
            <h4 className="font-semibold text-lg">{t("workflow.rent.layer1.title")}</h4>
            <ul className="text-sm space-y-2 text-left w-full">
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{t("workflow.rent.layer1.detail1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{t("workflow.rent.layer1.detail2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{t("workflow.rent.layer1.detail3")}</span>
              </li>
            </ul>
          </div>
          {/* Arrow - Desktop Only */}
          <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground z-10" />
          {/* Arrow - Mobile Only */}
          <div className="lg:hidden flex justify-center mt-4">
            <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
          </div>
        </div>

        {/* Layer 2: Secure Booking */}
        <div className="bg-[#1a5f5f] text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow relative">
          <div className="lg:hidden mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
              {t("workflow.rent.layer2.label")}
            </span>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <CreditCard className="h-12 w-12" />
            <h4 className="font-semibold text-lg">{t("workflow.rent.layer2.title")}</h4>
            <ul className="text-sm space-y-2 text-left w-full">
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{t("workflow.rent.layer2.detail1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{t("workflow.rent.layer2.detail2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{t("workflow.rent.layer2.detail3")}</span>
              </li>
            </ul>
          </div>
          {/* Arrow - Desktop Only */}
          <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground z-10" />
          {/* Arrow - Mobile Only */}
          <div className="lg:hidden flex justify-center mt-4">
            <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
          </div>
        </div>

        {/* Layer 3: Protection & Insurance */}
        <div className="bg-[#f5b942] text-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow relative">
          <div className="lg:hidden mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
              {t("workflow.rent.layer3.label")}
            </span>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <Shield className="h-12 w-12" />
            <h4 className="font-semibold text-lg">{t("workflow.rent.layer3.title")}</h4>
            <ul className="text-sm space-y-2 text-left w-full">
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{t("workflow.rent.layer3.detail1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{t("workflow.rent.layer3.detail2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{t("workflow.rent.layer3.detail3")}</span>
              </li>
            </ul>
          </div>
          {/* Arrow - Desktop Only */}
          <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground z-10" />
          {/* Arrow - Mobile Only */}
          <div className="lg:hidden flex justify-center mt-4">
            <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
          </div>
        </div>

        {/* Layer 4: Monthly Payout */}
        <div className="bg-gray-400 text-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow relative">
          <div className="lg:hidden mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
              {t("workflow.rent.layer4.label")}
            </span>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <DollarSign className="h-12 w-12" />
            <h4 className="font-semibold text-lg">{t("workflow.rent.layer4.title")}</h4>
            <ul className="text-sm space-y-2 text-left w-full">
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{t("workflow.rent.layer4.detail1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{t("workflow.rent.layer4.detail2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{t("workflow.rent.layer4.detail3")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Short Stay Workflow - Circular Flow
const ShortStayWorkflowDiagram = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4">
      {/* Top Row - 3 Main Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Find */}
        <div className="bg-card border border-border p-4 rounded-lg text-center">
          <Search className="h-10 w-10 text-primary mx-auto mb-2" />
          <h4 className="font-semibold text-sm mb-1">{t('workflow.shortStay.step1.title')}</h4>
          <p className="text-xs text-muted-foreground">{t('workflow.shortStay.step1.detail')}</p>
        </div>

        {/* Step 2: Book Safely - Central with emphasis */}
        <div className="bg-[#1a5f5f] text-white p-4 rounded-lg text-center border-2 border-[#1a5f5f]">
          <CreditCard className="h-10 w-10 mx-auto mb-2" />
          <h4 className="font-semibold text-sm mb-2">{t('workflow.shortStay.step2.title')}</h4>
          <div className="space-y-2 text-xs">
            <p>{t('workflow.shortStay.step2.detail1')}</p>
            <Plus className="h-4 w-4 mx-auto" />
            <p>{t('workflow.shortStay.step2.detail2')}</p>
          </div>
        </div>

        {/* Step 3: Payout */}
        <div className="bg-card border border-border p-4 rounded-lg text-center">
          <HandCoins className="h-10 w-10 text-primary mx-auto mb-2" />
          <h4 className="font-semibold text-sm mb-1">{t('workflow.shortStay.step3.title')}</h4>
          <p className="text-xs text-muted-foreground">{t('workflow.shortStay.step3.detail')}</p>
        </div>
      </div>

      {/* Bottom Row - Protection Loop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Left Protection */}
        <div className="bg-accent/10 border border-accent p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-sm mb-1">{t('workflow.shortStay.protect1.title')}</h4>
              <p className="text-xs text-muted-foreground">{t('workflow.shortStay.protect1.detail')}</p>
            </div>
          </div>
        </div>

        {/* Right Protection */}
        <div className="bg-accent/10 border border-accent p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-sm mb-1">{t('workflow.shortStay.protect2.title')}</h4>
              <p className="text-xs text-muted-foreground">{t('workflow.shortStay.protect2.detail')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickAccessSection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
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
        <Card className="border-2 border-primary/20 shadow-elegant">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <Tabs defaultValue="buy" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8 h-auto">
                <TabsTrigger value="buy" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base py-2 sm:py-3">
                  <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t('workflow.buy.tab')}</span>
                  <span className="sm:hidden">{t('Buy')}</span>
                </TabsTrigger>
                <TabsTrigger value="rent" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base py-2 sm:py-3">
                  <Key className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t('workflow.rent.tab')}</span>
                  <span className="sm:hidden">{t('Rent')}</span>
                </TabsTrigger>
                <TabsTrigger value="short-stay" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base py-2 sm:py-3">
                  <Bed className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t('workflow.shortStay.tab')}</span>
                  <span className="sm:hidden">{t('Stay')}</span>
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
                <BuyWorkflowDiagram />
                <div className="flex justify-center pt-2 sm:pt-4">
                  <Button 
                    onClick={() => navigate('/buy')}
                    className="gap-2 w-full sm:w-auto"
                    size="lg"
                  >
                    {t('start')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
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
                <RentWorkflowDiagram />
                <div className="flex justify-center pt-2 sm:pt-4">
                  <Button 
                    onClick={() => navigate('/rent')}
                    className="gap-2 w-full sm:w-auto"
                    size="lg"
                  >
                    {t('start')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
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
                <ShortStayWorkflowDiagram />
                <div className="flex justify-center pt-2 sm:pt-4">
                  <Button 
                    onClick={() => navigate('/short-stay')}
                    className="gap-2 w-full sm:w-auto"
                    size="lg"
                  >
                    {t('start')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        <div className="text-center mt-6 sm:mt-8 md:mt-12">
          <p className="text-muted-foreground font-inter text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 sm:mb-4 md:mb-6 font-semibold animate-pulse px-4">
            {t('needHelp')}
          </p>
          <Button 
            variant="outline" 
            size="lg" 
            className="font-inter font-medium text-sm sm:text-base md:text-lg px-6 sm:px-8 py-2 sm:py-3 hover:shadow-elegant hover:scale-105 transition-all duration-300 border-2 border-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto"
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
