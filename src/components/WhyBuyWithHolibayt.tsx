import { Shield, DollarSign, Scale, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatTranslationKey } from "@/lib/utils";

export const WhyBuyWithHolibayt = () => {
  const { t } = useLanguage();

  const getTitleOrFormatted = (key: string) => {
    const translation = t(key);
    return translation === key ? formatTranslationKey(key) : translation;
  };

  const benefits = [
    {
      icon: Shield,
      title: getTitleOrFormatted("Verified Ownership"),
      description: getTitleOrFormatted("Verified Ownership Desc")
    },
    {
      icon: DollarSign,
      title: getTitleOrFormatted("Escrow Payment"),
      description: getTitleOrFormatted("Escrow Payment Desc")
    },
    {
      icon: Scale,
      title: getTitleOrFormatted("Legal Support"),
      description: getTitleOrFormatted("Legal Support Desc")
    },
    {
      icon: AlertCircle,
      title: getTitleOrFormatted("No Hidden Fees"),
      description: getTitleOrFormatted("No Hidden Fees Desc")
    }
  ];

  return (
    <div className="bg-gradient-to-br from-primary/5 via-background to-background border border-border rounded-xl p-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
        {getTitleOrFormatted("Why Buy With Holibayt")}
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit, idx) => {
          const Icon = benefit.icon;
          return (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
