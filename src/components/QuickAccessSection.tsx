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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

/** ---------------------------------------------------------
 *  Buy Workflow — matches: “Buy — Verified. Secured. Guaranteed.”
 *  4 horizontal columns with icons, arrows between, labels on top
 * -------------------------------------------------------- */
const BuyWorkflowDiagram = () => {
  const { t } = useLanguage();

  const cols = [
    {
      icon: FileCheck,
      title: t("buy.step1.title") || "Find a Verified Property",
      bullets: [
        t("buy.step1.b1") ||
          "Every property and seller verified through Holibayt Verify™",
      ],
    },
    {
      icon: Lock,
      title: t("buy.step2.title") || "Secure Deposit via Holibayt Pay™",
      bullets: [
        t("buy.step2.b1") ||
          "Buyer’s deposit locked in Holibayt Pay™ escrow",
        t("buy.step2.b2") ||
          "Release only after due diligence and document validation",
        t("buy.step2.b3") ||
          "Transparent, milestone-based transaction flow",
      ],
    },
    {
      icon: Scale,
      title:
        t("buy.step3.title") ||
        "Legal Support & insurance with Holibayt Protect™",
      bullets: [
        t("buy.step3.b1") || "Legal assistance provided by certified notaries",
        t("buy.step3.b2") ||
          "Transaction backed by Holibayt Protect™ and Holibayt Insurance™",
        t("buy.step3.b3") ||
          "Covers fraud, contract disputes, or documentation errors",
      ],
    },
    {
      icon: FileSignature,
      title: t("buy.step4.title") || "Transaction Finalized",
      bullets: [
        t("buy.step4.b1") ||
          "Ownership officially transferred and confirmed",
        t("buy.step4.b2") ||
          "Funds released to seller through Holibayt Pay™",
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="text-center">
        <h3 className="text-3xl md:text-4xl font-playfair font-bold text-foreground">
          {t("buy.heading") || "Buy — Verified. Secured. Guaranteed."}
        </h3>
      </div>

      {/* Top Layer Labels (Trust / Security / Protection / Transparency) */}
      <div className="hidden lg:grid grid-cols-4 gap-6 text-center">
        {[
          t("layer.trust") || "Trust Layer",
          t("layer.security") || "Security Layer",
          t("layer.protection") || "Protection Layer",
          t("layer.transparency") || "Transparency Layer",
        ].map((txt, i) => (
          <div key={i} className="text-sm font-semibold text-slate-600">
            {txt}
          </div>
        ))}
      </div>

      {/* Columns with arrows between (desktop) */}
      <div className="hidden lg:flex items-stretch justify-between gap-6">
        {cols.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="flex items-center">
              <div className="flex flex-col items-center">
                {/* Icon circle (like screenshot) */}
                <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-slate-800" />
                </div>

                {/* Title + bullets */}
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

              {/* Right arrow between steps */}
              {idx < cols.length - 1 && (
                <ArrowRight className="w-10 h-10 text-primary mx-4" />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile/Tablet stacked */}
      <div className="lg:hidden space-y-8">
        {[
          t("layer.trust") || "Trust Layer",
          t("layer.security") || "Security Layer",
          t("layer.protection") || "Protection Layer",
          t("layer.transparency") || "Transparency Layer",
        ].map((label, i) => {
          const c = cols[i];
          const Icon = c.icon;
          return (
            <div key={i} className="space-y-3">
              <div className="text-xs font-semibold text-slate-600">
                {label}
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
const RentWorkflowDiagram = () => {
  const { t } = useLanguage();

  const top = [
    {
      icon: Home,
      title: t("rent.top1.title") || "Find a Verified Property",
    },
    {
      icon: FileSignature,
      title:
        t("rent.top2.title") || "Sign & Secure with Holibayt Pay™ (Escrow)",
    },
    {
      icon: ShieldCheck,
      title:
        t("rent.top3.title") ||
        "Move in Protected with Holibayt Protect™",
    },
    { icon: DollarSign, title: t("rent.top4.title") || "Monthly Payouts Released" },
  ];

  const bars = [
    { label: t("layer.trust") || "Trust Layer", color: "bg-teal-800" },
    { label: t("layer.security") || "Security Layer", color: "bg-teal-700" },
    { label: t("layer.protection") || "Protection Layer", color: "bg-amber-400", text: "text-slate-900" },
    { label: t("layer.transparency") || "Transparency Layer", color: "bg-slate-400", text: "text-slate-900" },
  ];

  const bullets = [
    [
      t("rent.b1.1") || "Verified listings, landlords & tenants",
      t("rent.b1.2") ||
        "ID (KYC) and property verification via Holibayt Verify™",
    ],
    [
      t("rent.b2.1") ||
        "Tenant pays first month’s rent + deposit into Holibayt Pay™ escrow account",
      t("rent.b2.2") ||
        "Owner’s listing commitment secured (property availability guaranteed)",
    ],
    [
      t("rent.b3.1") || "Deposit and contract secured by Holibayt Protect™",
      t("rent.b3.2") ||
        "Damage or dispute coverage with Holibayt Insurance™",
      t("rent.b3.3") || "24/7 mediation and assistance for both parties",
    ],
    [
      t("rent.b4.1") ||
        "Owner receives payment each month automatically after verification",
      t("rent.b4.2") || "Holibayt Pay™ manages all transactions securely",
    ],
  ];

  return (
    <div className="space-y-10">
      {/* Heading */}
      <div className="text-center">
        <h3 className="text-3xl md:text-4xl font-playfair font-bold text-foreground">
          {t("rent.heading") || "Rent — Secure Long-Term Rentals, Simplified."}
        </h3>
      </div>

      {/* Top row: 4 icons + headings */}
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

      {/* Colored arrow bars (exact look) */}
      <div className="hidden md:grid grid-cols-4 gap-6">
        {bars.map((b, i) => (
          <div key={i} className="flex items-center">
            {/* Label bar */}
            <div
              className={`px-4 py-2 rounded-md font-semibold text-white ${b.color} ${b.text || ""} inline-flex items-center`}
            >
              {b.label}
            </div>
            {/* right arrow tip */}
            {i < bars.length - 1 && (
              <svg
                className="-ml-1"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M0 0 L20 12 L0 24 Z" className={b.color} />
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
const ShortStayWorkflowTiles = () => {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border border-border">
        <CardContent className="p-5 text-center">
          <Search className="w-10 h-10 mx-auto text-primary" />
          <div className="mt-2 font-semibold">
            {t("stay.tile1.title") || "Search & Verify"}
          </div>
          <div className="text-sm text-slate-600">
            {t("stay.tile1.desc") || "Find verified stays with trusted hosts."}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-teal-900 text-white border-none">
        <CardContent className="p-5 text-center">
          <CreditCard className="w-10 h-10 mx-auto" />
          <div className="mt-2 font-semibold">
            {t("stay.tile2.title") || "Book with Holibayt Pay™"}
          </div>
          <div className="text-sm opacity-90">
            {t("stay.tile2.desc") ||
              "Escrow holds funds; host is paid after your stay."}
          </div>
        </CardContent>
      </Card>
      <Card className="border border-border">
        <CardContent className="p-5 text-center">
          <HandCoins className="w-10 h-10 mx-auto text-primary" />
          <div className="mt-2 font-semibold">
            {t("stay.tile3.title") || "Secure Payout"}
          </div>
          <div className="text-sm text-slate-600">
            {t("stay.tile3.desc") || "Payout released after completion."}
          </div>
        </CardContent>
      </Card>
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
