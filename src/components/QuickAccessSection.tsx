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
 /** ---------------------------------------------------------
 *  Buy Workflow — desktop unchanged; mobile stacks bullets
 * -------------------------------------------------------- */
const BuyWorkflowDiagram = () => {
  const top = [
    { icon: FileCheck, title: "Find a Verified Property" },
    { icon: Lock, title: "Secure Deposit via Holibayt Pay*" },
    { icon: Scale, title: "Legal Support & Insurance with Holibayt Protect*" },
    { icon: FileSignature, title: "Transaction Finalized" },
  ];

  const bars = [
    { label: "Trust Layer", hex: "#0f766e", textClass: "text-white" },
    { label: "Security Layer", hex: "#115e59", textClass: "text-white" },
    { label: "Protection Layer", hex: "#f59e0b", textClass: "text-slate-900" },
    { label: "Transparency Layer", hex: "#94a3b8", textClass: "text-slate-900" },
  ];

  const bullets = [
    ["Every property and seller verified through Holibayt Verify™"],
    [
      "Buyer’s deposit locked in Holibayt Pay™ escrow",
      "Release only after due diligence and document validation",
      "Transparent, milestone-based transaction flow",
    ],
    [
      "Legal assistance provided by certified notaries",
      "Transaction backed by Holibayt Protect™ and Holibayt Insurance™",
      "Covers fraud, contract disputes, or documentation errors",
    ],
    [
      "Ownership officially transferred and confirmed",
      "Funds released to seller through Holibayt Pay™",
    ],
  ];

  return (
    <div className="space-y-8 md:space-y-10 mx-auto max-w-[34rem] md:max-w-none">
      <div className="text-center px-2">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-foreground leading-tight">
          Buy — Verified. Secured. Guaranteed.
        </h3>
      </div>

      {/* ===== Mobile (stacked) ===== */}
      <div className="md:hidden space-y-6">
        {top.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-col items-center text-center gap-3">
                <Icon className="w-9 h-9 text-slate-800" />
                <h4 className="font-playfair font-semibold text-base text-slate-900">
                  {c.title}
                </h4>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 list-disc pl-5">
                {bullets[i].map((line, j) => (
                  <li key={j}>{line}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* ===== Desktop (unchanged layout) ===== */}
      {/* Top row: icons + titles */}
      <div className="hidden md:grid grid-cols-4 gap-8 px-2">
        {top.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="flex flex-col items-center gap-3 text-center">
              <Icon className="w-12 h-12 text-slate-800" />
              <h4 className="font-playfair font-semibold text-lg text-slate-900">
                {c.title}
              </h4>
            </div>
          );
        })}
      </div>

      {/* Colored arrow bars */}
      <div className="hidden md:grid grid-cols-4 gap-6 items-center px-2">
        {bars.map((b, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`px-4 py-2 rounded-md font-semibold ${b.textClass}`}
              style={{ backgroundColor: b.hex }}
            >
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
      <div className="hidden md:grid grid-cols-4 gap-8 px-2">
        {bullets.map((list, i) => (
          <ul key={i} className="space-y-2 text-sm text-slate-700 list-none">
            {list.map((line, j) => (
              <li key={j}>{line}</li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
};

/** ---------------------------------------------------------
 *  Rent Workflow — desktop unchanged; mobile stacks bullets
 * -------------------------------------------------------- */
const RentWorkflowDiagram = () => {
  const top = [
    { icon: Home, title: "Find a Verified Property" },
    { icon: FileSignature, title: "Sign & Secure with Holibayt Pay™ (Escrow)" },
    { icon: ShieldCheck, title: "Move in Protected with Holibayt Protect™" },
    { icon: DollarSign, title: "Monthly Payouts Released" },
  ];

  const bars = [
    { label: "Trust Layer", hex: "#0f766e", textClass: "text-white" },
    { label: "Security Layer", hex: "#115e59", textClass: "text-white" },
    { label: "Protection Layer", hex: "#f59e0b", textClass: "text-slate-900" },
    { label: "Transparency Layer", hex: "#94a3b8", textClass: "text-slate-900" },
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
    <div className="space-y-8 md:space-y-10 mx-auto max-w-[34rem] md:max-w-none">
      <div className="text-center px-2">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-foreground leading-tight">
          Rent — Secure Long-Term Rentals, Simplified.
        </h3>
      </div>

      {/* Mobile (stacked) */}
      <div className="md:hidden space-y-6">
        {top.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-col items-center text-center gap-3">
                <Icon className="w-9 h-9 text-slate-800" />
                <h4 className="font-playfair font-semibold text-base text-slate-900">
                  {c.title}
                </h4>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 list-disc pl-5">
                {bullets[i].map((line, j) => (
                  <li key={j}>{line}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Desktop (unchanged) */}
      <div className="hidden md:grid grid-cols-4 gap-8 px-2">
        {top.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="flex flex-col items-center gap-3 text-center">
              <Icon className="w-12 h-12 text-slate-800" />
              <h4 className="font-playfair font-semibold text-lg text-slate-900">
                {c.title}
              </h4>
            </div>
          );
        })}
      </div>

      <div className="hidden md:grid grid-cols-4 gap-6 items-center px-2">
        {bars.map((b, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`px-4 py-2 rounded-md font-semibold ${b.textClass}`}
              style={{ backgroundColor: b.hex }}
            >
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

      <div className="hidden md:grid grid-cols-4 gap-8 px-2">
        {bullets.map((list, i) => (
          <ul key={i} className="space-y-2 text-sm text-slate-700 list-none">
            {list.map((line, j) => (
              <li key={j}>{line}</li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
};

/** ---------------------------------------------------------
 *  Short Stay Workflow — desktop unchanged; mobile stacks bullets
 * -------------------------------------------------------- */
const ShortStayWorkflowDiagram = () => {
  const top = [
    { icon: Search, title: "Find a Verified Stay" },
    { icon: CreditCard, title: "Book Safely via Holibayt Pay™" },
    { icon: ShieldCheck, title: "Stay Protected with Holibayt Protect™" },
    { icon: HandCoins, title: "Payout Released" },
  ];

  const bars = [
    { label: "Trust Layer", hex: "#0f766e", textClass: "text-white" },
    { label: "Security Layer", hex: "#115e59", textClass: "text-white" },
    { label: "Protection Layer", hex: "#f59e0b", textClass: "text-slate-900" },
    { label: "Transparency Layer", hex: "#94a3b8", textClass: "text-slate-900" },
  ];

  const bullets = [
    [
      "All listings, hosts, and guests verified through Holibayt Verify™",
      "Identity & property validation (KYC + ownership check)",
    ],
    [
      "Guest payment locked in Holibayt Pay™ escrow until check-in",
      "Owner commitment secured—no last-minute cancellations",
      "Flexible or strict cancellation policies applied automatically",
    ],
    [
      "Guest deposit and property covered under Holibayt Protect™",
      "Assistance and mediation available 24/7",
      "Holibayt Insurance™ covers damages or unforeseen events",
    ],
    [
      "Payment released to host after successful stay confirmation",
      "Both parties rated and verified again for future stays",
    ],
  ];

  return (
    <div className="space-y-8 md:space-y-10 mx-auto max-w-[34rem] md:max-w-none">
      <div className="text-center px-2">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-foreground leading-tight">
          Short Stay — Verified. Secured. Protected.
        </h3>
      </div>

      {/* Mobile (stacked) */}
      <div className="md:hidden space-y-6">
        {top.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-col items-center text-center gap-3">
                <Icon className="w-9 h-9 text-slate-800" />
                <h4 className="font-playfair font-semibold text-base text-slate-900">
                  {c.title}
                </h4>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 list-disc pl-5">
                {bullets[i].map((line, j) => (
                  <li key={j}>{line}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Desktop (unchanged) */}
      <div className="hidden md:grid grid-cols-4 gap-8 px-2">
        {top.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="flex flex-col items-center gap-3 text-center">
              <Icon className="w-12 h-12 text-slate-800" />
              <h4 className="font-playfair font-semibold text-lg text-slate-900">
                {c.title}
              </h4>
            </div>
          );
        })}
      </div>

      <div className="hidden md:grid grid-cols-4 gap-6 items-center px-2">
        {bars.map((b, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`px-4 py-2 rounded-md font-semibold ${b.textClass}`}
              style={{ backgroundColor: b.hex }}
            >
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

      <div className="hidden md:grid grid-cols-4 gap-8 px-2">
        {bullets.map((list, i) => (
          <ul key={i} className="space-y-2 text-sm text-slate-700 list-none">
            {list.map((line, j) => (
              <li key={j}>{line}</li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
};



/** ---------------------------------------------------------
 *  QuickAccessSection Tabs wrapper
 * -------------------------------------------------------- */
const QuickAccessSection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="py-10 md:py-16 bg-background">
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
    {/* Subtitle removed */}
  </div>

  <ShortStayWorkflowDiagram />

  <div className="flex justify-center">
    <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate("/short-stay")}>
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
