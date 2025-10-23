// src/components/sections/QuickAccessSection.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home,
  Key,
  Bed,
  ArrowRight,
  FileCheck,
  Lock,
  Scale,
  FileSignature,
  ShieldCheck,
  DollarSign,
  CreditCard,
  Shield,
  Search,
  HandCoins,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

/* -------------------------
   Shared layer labels (i18n)
-------------------------- */
const useLayerLabels = () => {
  const { t } = useLanguage();
  return [
    { label: t("layers.trust") || "Trust Layer", hex: "#0f766e", textClass: "text-white" },
    { label: t("layers.security") || "Security Layer", hex: "#115e59", textClass: "text-white" },
    { label: t("layers.protection") || "Protection Layer", hex: "#f59e0b", textClass: "text-slate-900" },
    { label: t("layers.transparency") || "Transparency Layer", hex: "#94a3b8", textClass: "text-slate-900" },
  ];
};

/* ---------------------------------------------------------
 * Buy Workflow — same format as Rent (icon → layer → bullets)
 * -------------------------------------------------------- */
const BuyWorkflowDiagram = () => {
  const { t } = useLanguage();
  const bars = useLayerLabels();

  const top = [
    { icon: FileCheck, title: t("workflow.buy.steps.0.title") || "Find a Verified Property" },
    { icon: Lock, title: t("workflow.buy.steps.1.title") || "Secure Deposit via Holibayt Pay*" },
    { icon: Scale, title: t("workflow.buy.steps.2.title") || "Legal Support & Insurance with Holibayt Protect*" },
    { icon: FileSignature, title: t("workflow.buy.steps.3.title") || "Transaction Finalized" },
  ];

  const bullets = [
    [t("workflow.buy.steps.0.bullets.0") || "Every property and seller verified through Holibayt Verify™"],
    [
      t("workflow.buy.steps.1.bullets.0") || "Buyer’s deposit locked in Holibayt Pay™ escrow",
      t("workflow.buy.steps.1.bullets.1") || "Release only after due diligence and document validation",
      t("workflow.buy.steps.1.bullets.2") || "Transparent, milestone-based transaction flow",
    ],
    [
      t("workflow.buy.steps.2.bullets.0") || "Legal assistance provided by certified notaries",
      t("workflow.buy.steps.2.bullets.1") || "Backed by Holibayt Protect™ & Holibayt Insurance™",
      t("workflow.buy.steps.2.bullets.2") || "Covers fraud, disputes, or documentation errors",
    ],
    [
      t("workflow.buy.steps.3.bullets.0") || "Ownership officially transferred and confirmed",
      t("workflow.buy.steps.3.bullets.1") || "Funds released to seller through Holibayt Pay™",
    ],
  ];

  return (
    <div className="space-y-8 md:space-y-10 mx-auto max-w-[34rem] md:max-w-none">
      <div className="text-center px-2">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-foreground leading-tight">
          {t("workflow.buy.title") || "Buy — Verified. Secured. Guaranteed."}
        </h3>
      </div>

      {/* Top row: icons + titles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 px-2">
        {top.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="flex flex-col items-center gap-3 text-center">
              <Icon className="w-9 h-9 md:w-12 md:h-12 text-slate-800" />
              <h4 className="font-playfair font-semibold text-sm md:text-lg text-slate-900">{c.title}</h4>
            </div>
          );
        })}
      </div>

      {/* Colored arrow bars */}
      <div className="hidden md:grid grid-cols-4 gap-6 items-center px-2">
        {bars.map((b, i) => (
          <div key={i} className="flex items-center">
            <div className={`px-4 py-2 rounded-md font-semibold ${b.textClass}`} style={{ backgroundColor: b.hex }}>
              {b.label}
            </div>
            {i < bars.length - 1 && (
              <svg width="22" height="22" viewBox="0 0 24 24" style={{ color: b.hex }} className="-ml-1">
                <path d="M0 0 L20 12 L0 24 Z" fill="currentColor" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Bullet rows */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 px-2">
        {bullets.map((list, i) => (
          <ul key={i} className="space-y-2 text-[0.95rem] md:text-sm text-slate-700 list-disc pl-5 md:pl-0 md:list-none">
            {list.map((line, j) => (
              <li key={j}>{line}</li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------
 * Rent Workflow — matches screenshot (icon → layer → bullets)
 * -------------------------------------------------------- */
const RentWorkflowDiagram = () => {
  const { t } = useLanguage();
  const bars = useLayerLabels();

  const top = [
    { icon: Home, title: t("workflow.rent.steps.0.title") || "Find a Verified Property" },
    { icon: FileSignature, title: t("workflow.rent.steps.1.title") || "Sign & Secure with Holibayt Pay™ (Escrow)" },
    { icon: ShieldCheck, title: t("workflow.rent.steps.2.title") || "Move in Protected with Holibayt Protect™" },
    { icon: DollarSign, title: t("workflow.rent.steps.3.title") || "Monthly Payouts Released" },
  ];

  const bullets = [
    [
      t("workflow.rent.steps.0.bullets.0") || "Verified listings, landlords & tenants",
      t("workflow.rent.steps.0.bullets.1") || "ID (KYC) & property verification via Holibayt Verify™",
    ],
    [
      t("workflow.rent.steps.1.bullets.0") || "Tenant pays first month’s rent + deposit into Holibayt Pay™ escrow",
      t("workflow.rent.steps.1.bullets.1") || "Owner’s listing commitment secured (availability guaranteed)",
    ],
    [
      t("workflow.rent.steps.2.bullets.0") || "Deposit & contract secured by Holibayt Protect™",
      t("workflow.rent.steps.2.bullets.1") || "Damage/dispute coverage with Holibayt Insurance™",
      t("workflow.rent.steps.2.bullets.2") || "24/7 mediation & assistance for both parties",
    ],
    [
      t("workflow.rent.steps.3.bullets.0") || "Owner receives payment each month after verification",
      t("workflow.rent.steps.3.bullets.1") || "Holibayt Pay™ manages all transactions securely",
    ],
  ];

  return (
    <div className="space-y-8 md:space-y-10 mx-auto max-w-[34rem] md:max-w-none">
      <div className="text-center px-2">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-foreground leading-tight">
          {t("workflow.rent.title") || "Rent — Secure Long-Term Rentals, Simplified."}
        </h3>
      </div>

      {/* Icons + titles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 px-2">
        {top.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="flex flex-col items-center gap-3 text-center">
              <Icon className="w-9 h-9 md:w-12 md:h-12 text-slate-800" />
              <h4 className="font-playfair font-semibold text-sm md:text-lg text-slate-900">{c.title}</h4>
            </div>
          );
        })}
      </div>

      {/* Layer bars */}
      <div className="hidden md:grid grid-cols-4 gap-6 items-center px-2">
        {bars.map((b, i) => (
          <div key={i} className="flex items-center">
            <div className={`px-4 py-2 rounded-md font-semibold ${b.textClass}`} style={{ backgroundColor: b.hex }}>
              {b.label}
            </div>
            {i < bars.length - 1 && (
              <svg width="22" height="22" viewBox="0 0 24 24" style={{ color: b.hex }} className="-ml-1">
                <path d="M0 0 L20 12 L0 24 Z" fill="currentColor" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Bullets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 px-2">
        {bullets.map((list, i) => (
          <ul key={i} className="space-y-2 text-[0.95rem] md:text-sm text-slate-700 list-disc pl-5 md:pl-0 md:list-none">
            {list.map((line, j) => (
              <li key={j}>{line}</li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------
 * Short Stay Workflow (kept as tiles; texts i18n-enabled)
 * -------------------------------------------------------- */
const ShortStayWorkflowDiagram = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-4 rounded-lg text-center">
          <Search className="h-10 w-10 text-primary mx-auto mb-2" />
          <h4 className="font-semibold text-sm mb-1">
            {t("workflow.shortStay.step1.title") || "Search & Verify"}
          </h4>
          <p className="text-xs text-muted-foreground">
            {t("workflow.shortStay.step1.detail") || "Browse verified hosts & safe stays"}
          </p>
        </div>

        <div className="bg-[#1a5f5f] text-white p-4 rounded-lg text-center border-2 border-[#1a5f5f]">
          <CreditCard className="h-10 w-10 mx-auto mb-2" />
          <h4 className="font-semibold text-sm mb-2">
            {t("workflow.shortStay.step2.title") || "Book Securely with Escrow"}
          </h4>
          <div className="space-y-2 text-xs">
            <p>{t("workflow.shortStay.step2.detail1") || "Pay via Holibayt Pay™ escrow"}</p>
            <Plus className="h-4 w-4 mx-auto" />
            <p>{t("workflow.shortStay.step2.detail2") || "Host payout after check-in verification"}</p>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-lg text-center">
          <HandCoins className="h-10 w-10 text-primary mx-auto mb-2" />
          <h4 className="font-semibold text-sm mb-1">
            {t("workflow.shortStay.step3.title") || "Protected Payouts"}
          </h4>
          <p className="text-xs text-muted-foreground">
            {t("workflow.shortStay.step3.detail") || "Automatic, secure payouts to hosts"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-accent/10 border border-accent p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-sm mb-1">
                {t("workflow.shortStay.protect1.title") || "Guest Protection"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {t("workflow.shortStay.protect1.detail") || "Dispute mediation & coverage"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-accent/10 border border-accent p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-sm mb-1">
                {t("workflow.shortStay.protect2.title") || "Host Protection"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {t("workflow.shortStay.protect2.detail") || "Damage & non-payment safeguards"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------
 * QuickAccessSection — Tabs wrapper
 * -------------------------------------------------------- */
const QuickAccessSection = () => {
  const navigate = useNavigate();
  const { t, currentLang } = useLanguage();

  return (
    <section
      className="py-10 md:py-16 bg-background"
      dir={currentLang === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground">
            {t("howCanWeHelp") || "How can we help?"}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mt-2">
            {t("quickEntriesDesc") || "Pick a flow to see the exact steps and protection layers."}
          </p>
        </div>

        <Card className="border-2 border-primary/20">
          <CardContent className="p-4 md:p-8">
            <Tabs defaultValue="buy" className="w-full">
              {/* Short Stay centered */}
              <TabsList className="grid grid-cols-3 h-auto">
                <TabsTrigger value="buy" className="gap-2 py-3">
                  <Home className="w-4 h-4" />
                  {t("workflow.buy.tab") || "Buy"}
                </TabsTrigger>
                <TabsTrigger value="short-stay" className="gap-2 py-3">
                  <Bed className="w-4 h-4" />
                  {t("workflow.shortStay.tab") || "Short Stay"}
                </TabsTrigger>
                <TabsTrigger value="rent" className="gap-2 py-3">
                  <Key className="w-4 h-4" />
                  {t("workflow.rent.tab") || "Rent"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="space-y-8 pt-6">
                <BuyWorkflowDiagram />
                <div className="flex justify-center">
                  <Button size="lg" className="gap-2" onClick={() => navigate("/buy")}>
                    {t("start") || "Start"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="short-stay" className="space-y-8 pt-6">
                <div className="text-center">
                  <h3 className="text-2xl md:text-3xl font-playfair font-bold text-foreground">
                    {t("workflow.shortStay.title") || "Short Stay — Safe & Simple"}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    {t("workflow.shortStay.subtitle") || "Verified hosts, escrow payments, protected payouts"}
                  </p>
                </div>
                <ShortStayWorkflowDiagram />
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2"
                    onClick={() => navigate("/short-stay")}
                  >
                    {t("explore") || "Explore stays"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="rent" className="space-y-8 pt-6">
                <RentWorkflowDiagram />
                <div className="flex justify-center">
                  <Button size="lg" className="gap-2" onClick={() => navigate("/rent")}>
                    {t("start") || "Start"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-10">
          <p className="text-muted-foreground text-lg md:text-xl font-semibold">
            {t("needHelp") || "Not sure where to start? We can help."}
          </p>
          <Button
            variant="outline"
            size="lg"
            className="mt-4 gap-2 border-2 border-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => navigate("/contact-advisor")}
          >
            {t("speakToAdvisor") || "Speak to an advisor"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default QuickAccessSection;
