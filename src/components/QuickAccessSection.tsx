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
  const { t } = useLanguage();
  
  const top = [
    { icon: FileCheck, title: t("buyStep1Title") },
    { icon: Lock, title: t("buyStep2Title") },
    { icon: Scale, title: t("buyStep3Title") },
    { icon: FileSignature, title: t("buyStep4Title") },
  ];

  const bars = [
    { label: t("trustLayer"), hex: "#0f766e", textClass: "text-white" },
    { label: t("securityLayer"), hex: "#115e59", textClass: "text-white" },
    { label: t("protectionLayer"), hex: "#f59e0b", textClass: "text-slate-900" },
    { label: t("transparencyLayer"), hex: "#94a3b8", textClass: "text-slate-900" },
  ];

  const bullets = [
    [t("buyStep1Detail1")],
    [
      t("buyStep2Detail1"),
      t("buyStep2Detail2"),
      t("buyStep2Detail3"),
    ],
    [
      t("buyStep3Detail1"),
      t("buyStep3Detail2"),
      t("buyStep3Detail3"),
    ],
    [
      t("buyStep4Detail1"),
      t("buyStep4Detail2"),
    ],
  ];

  return (
    <div className="space-y-8 md:space-y-10 mx-auto max-w-[34rem] md:max-w-none">
      <div className="text-center px-2">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-foreground leading-tight">
          {t("buyWorkflowTitle")}
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
  const { t } = useLanguage();
  
  const top = [
    { icon: Home, title: t("rentStep1Title") },
    { icon: FileSignature, title: t("rentStep2Title") },
    { icon: ShieldCheck, title: t("rentStep3Title") },
    { icon: DollarSign, title: t("rentStep4Title") },
  ];

  const bars = [
    { label: t("trustLayer"), hex: "#0f766e", textClass: "text-white" },
    { label: t("securityLayer"), hex: "#115e59", textClass: "text-white" },
    { label: t("protectionLayer"), hex: "#f59e0b", textClass: "text-slate-900" },
    { label: t("transparencyLayer"), hex: "#94a3b8", textClass: "text-slate-900" },
  ];

  const bullets = [
    [
      t("rentStep1Detail1"),
      t("rentStep1Detail2"),
    ],
    [
      t("rentStep2Detail1"),
      t("rentStep2Detail2"),
    ],
    [
      t("rentStep3Detail1"),
      t("rentStep3Detail2"),
      t("rentStep3Detail3"),
    ],
    [
      t("rentStep4Detail1"),
      t("rentStep4Detail2"),
    ],
  ];

  return (
    <div className="space-y-8 md:space-y-10 mx-auto max-w-[34rem] md:max-w-none">
      <div className="text-center px-2">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-foreground leading-tight">
          {t("rentWorkflowTitle")}
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
  const { t } = useLanguage();

  const top = [
    { icon: Search, title: t("shortStayStep1Title") },
    { icon: CreditCard, title: t("shortStayStep2Title") },
    { icon: ShieldCheck, title: t("shortStayStep3Title") },
    { icon: HandCoins, title: t("shortStayStep4Title") },
  ];

  const bars = [
    { label: t("trustLayer"), hex: "#0f766e", textClass: "text-white" },
    { label: t("securityLayer"), hex: "#115e59", textClass: "text-white" },
    { label: t("protectionLayer"), hex: "#f59e0b", textClass: "text-slate-900" },
    { label: t("transparencyLayer"), hex: "#94a3b8", textClass: "text-slate-900" },
  ];

  const bullets = [
    [
      t("shortStayStep1Detail1"),
      t("shortStayStep1Detail2"),
    ],
    [
      t("shortStayStep2Detail1"),
      t("shortStayStep2Detail2"),
      t("shortStayStep2Detail3"),
    ],
    [
      t("shortStayStep3Detail1"),
      t("shortStayStep3Detail2"),
      t("shortStayStep3Detail3"),
    ],
    [
      t("shortStayStep4Detail1"),
      t("shortStayStep4Detail2"),
    ],
  ];

  return (
    <div className="space-y-8 md:space-y-10 mx-auto max-w-[34rem] md:max-w-none">
      <div className="text-center px-2">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-foreground leading-tight">
          {t("shortStayWorkflowTitle")}
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
  {/* Title + subtitle removed */}
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
