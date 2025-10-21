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

/** ---------------------------------------------------------
 *  Buy Workflow — matches: “Buy — Verified. Secured. Guaranteed.”
 *  4 horizontal columns with icons, arrows between, labels on top
 * -------------------------------------------------------- */
// Buy Workflow - 4 Horizontal Layers (matches the screenshot)
const BuyWorkflowDiagram = () => {
  // keep your i18n hook if you need it elsewhere, but we use fixed copy to match design
  // const { t } = useLanguage();

  const cols = [
    {
      icon: FileCheck,
      title: "Find a Verified Property",
      bullets: [
        "Every property and seller verified through Holibayt Verify™",
      ],
    },
    {
      icon: Lock,
      title: "Secure Deposit via Holibayt Pay*",
      bullets: [
        "Buyer’s deposit locked in Holibayt Pay™ escrow",
        "Release only after due diligence and document validation",
        "Transparent, milestone-based transaction flow",
      ],
    },
    {
      icon: Scale,
      title: "Legal Support & insurance with Holibayt Protect*",
      bullets: [
        "Legal assistance provided by certified notaries",
        "Transaction backed by Holibayt Protect™ and Holibayt Insurance™",
        "Covers fraud, contract disputes, or documentation errors",
      ],
    },
    {
      icon: FileSignature,
      title: "Transaction Finalized",
      bullets: [
        "Ownership officially transferred and confirmed",
        "Funds released to seller through Holibayt Pay™",
      ],
    },
  ];

  const layerLabels = [
    "Trust Layer",
    "Security Layer",
    "Protection Layer",
    "Transparency Layer",
  ];

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="text-center">
        <h3 className="text-3xl md:text-4xl font-playfair font-bold text-foreground">
          Buy — Verified. Secured. Guaranteed.
        </h3>
      </div>

      {/* Layer labels (desktop like screenshot) */}
      <div className="hidden lg:grid grid-cols-4 gap-6 text-center">
        {layerLabels.map((txt) => (
          <div key={txt} className="text-sm font-semibold text-slate-600">
            {txt}
          </div>
        ))}
      </div>

      {/* Desktop flow with circle icons and arrows */}
      <div className="hidden lg:flex items-stretch justify-between gap-6">
        {cols.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="flex items-center">
              <div className="flex flex-col items-center">
                {/* circular icon like screenshot */}
                <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-slate-800" />
                </div>

                {/* title + bullets */}
                <div className="mt-5 text-center">
                  <h4 className="font-playfair font-bold text-lg text-slate-900 mb-2">
                    {c.title}
                  </h4>
                  <ul className="text-sm text-slate-700 space-y-2 max-w-[260px] mx-auto">
                    {c.bullets.map((b, i) => (
                      <li key={i} className="leading-snug">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* arrow between steps */}
              {idx < cols.length - 1 && (
                <ArrowRight className="w-10 h-10 text-primary mx-4" />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile/Tablet stacked with vertical arrows */}
      <div className="lg:hidden space-y-8">
        {cols.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="space-y-3">
              <div className="text-xs font-semibold text-slate-600">
                {layerLabels[i]}
              </div>
              <Card className="border border-slate-200">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-slate-800" />
                    </div>
                    <div>
                      <h4 className="font-playfair font-bold text-base text-slate-900 mb-1">
                        {c.title}
                      </h4>
                      <ul className="text-sm text-slate-700 space-y-2">
                        {c.bullets.map((b, j) => (
                          <li key={j}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {i < cols.length - 1 && (
                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-primary rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** ---------------------------------------------------------
 *  Rent Workflow — matches: “Rent — Secure Long-Term Rentals, Simplified.”
 *  4 icons & headings across the top, colored arrow bars beneath,
 *  then bullet rows under each column (exact flow from screenshot)
 * -------------------------------------------------------- */
// Rent Workflow - matches screenshot with top icons, colored arrow bars, and bullets
const RentWorkflowDiagram = () => {
  // const { t } = useLanguage();

  const top = [
    { icon: Home, title: "Find a Verified Property" },
    { icon: FileSignature, title: "Sign & Secure with Holibayt Pay™ (Escrow)" },
    { icon: ShieldCheck, title: "Move in Protected with Holibayt Protect™" },
    { icon: DollarSign, title: "Monthly Payouts Released" },
  ];

  // colors use hex so we can fill the arrow tip triangles exactly
  const bars = [
    { label: "Trust Layer", hex: "#0f766e", textClass: "text-white" }, // teal-700
    { label: "Security Layer", hex: "#115e59", textClass: "text-white" }, // teal-800
    { label: "Protection Layer", hex: "#f59e0b", textClass: "text-slate-900" }, // amber-500
    { label: "Transparency Layer", hex: "#94a3b8", textClass: "text-slate-900" }, // slate-400
  ];

  const bullets = [
    [
      "Verified listings, landlords & tenants",
      "ID (KYC) and property verification via Holibayt Verify™",
    ],
    [
      "Tenant pays first month’s rent + deposit into Holibayt Pay™ escrow account",
      "Owner’s listing commitment secured (property availability guaranteed)",
    ],
    [
      "Deposit and contract secured by Holibayt Protect™",
      "Damage or dispute coverage with Holibayt Insurance™",
      "24/7 mediation and assistance for both parties",
    ],
    [
      "Owner receives payment each month automatically after verification",
      "Holibayt Pay™ manages all transactions securely",
    ],
  ];

  return (
    <div className="space-y-10">
      {/* Heading */}
      <div className="text-center">
        <h3 className="text-3xl md:text-4xl font-playfair font-bold text-foreground">
          Rent — Secure Long-Term Rentals, Simplified.
        </h3>
      </div>

      {/* Top row: 4 icons + titles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
        {top.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="flex flex-col items-center gap-4">
              <Icon className="w-12 h-12 text-slate-800" />
              <h4 className="font-playfair font-bold text-lg text-slate-900">
                {c.title}
              </h4>
            </div>
          );
        })}
      </div>

      {/* Colored arrow bars like screenshot (desktop only) */}
      <div className="hidden md:grid grid-cols-4 gap-6 items-center">
        {bars.map((b, i) => (
          <div key={i} className="flex items-center">
            {/* label bar */}
            <div
              className={`px-4 py-2 rounded-md font-semibold ${b.textClass}`}
              style={{ backgroundColor: b.hex }}
            >
              {b.label}
            </div>
            {/* right-pointing triangle tip */}
            {i < bars.length - 1 && (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                style={{ color: b.hex }}
                className="-ml-1"
              >
                <path d="M0 0 L20 12 L0 24 Z" fill="currentColor" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Bullet rows under each column */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {bullets.map((list, i) => (
          <ul key={i} className="space-y-2 text-sm text-slate-700">
            {list.map((line, j) => (
              <li key={j} className="leading-snug">
                {line}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
};


/** ---------------------------------------------------------
 *  Short Stay — left as simpler tiles (optional to restyle)
 * -------------------------------------------------------- */
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


/** ---------------------------------------------------------
 *  QuickAccessSection — Tabs wrapper around the three flows
 * -------------------------------------------------------- */
const QuickAccessSection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="py-10 md:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground">
            {t("howCanWeHelp") || "How can we help?"}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mt-2">
            {t("quickEntriesDesc") ||
              "Pick a flow to see the exact steps and protection layers."}
          </p>
        </div>

        {/* Tabs */}
        <Card className="border-2 border-primary/20">
          <CardContent className="p-4 md:p-8">
            <Tabs defaultValue="buy" className="w-full">
              <TabsList className="grid grid-cols-3 h-auto">
                <TabsTrigger value="buy" className="gap-2 py-3">
                  <Home className="w-4 h-4" />
                  {t("workflow.buy.tab") || "Buy"}
                </TabsTrigger>
                <TabsTrigger value="rent" className="gap-2 py-3">
                  <Key className="w-4 h-4" />
                  {t("workflow.rent.tab") || "Rent"}
                </TabsTrigger>
                <TabsTrigger value="short-stay" className="gap-2 py-3">
                  <Bed className="w-4 h-4" />
                  {t("workflow.shortStay.tab") || "Short Stay"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="space-y-8 pt-6">
                <BuyWorkflowDiagram />
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={() => navigate("/buy")}
                  >
                    {t("start") || "Start"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="rent" className="space-y-8 pt-6">
                <RentWorkflowDiagram />
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={() => navigate("/rent")}
                  >
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
                    {t("workflow.shortStay.subtitle") ||
                      "Verified hosts, escrow payments, protected payouts"}
                  </p>
                </div>
                <ShortStayWorkflowTiles />
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
            </Tabs>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
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
