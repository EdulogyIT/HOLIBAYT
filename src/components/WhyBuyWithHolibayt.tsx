import { Shield, DollarSign, Scale, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const WhyBuyWithHolibayt = () => {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: Shield,
      title: t("Verified Ownership"),
      description: t("Every property’s title and ownership are carefully verified by our team.")
    },
    {
      icon: DollarSign,
      title: t("Escrow Payment"),
      description: t("Your funds are securely held in escrow until all conditions are met.")
    },
    {
      icon: Scale,
      title: t("Legal Support"),
      description: t("Get complete legal guidance from trusted professionals")
    },
    {
      icon: AlertCircle,
      title: t("No Hidden Fees"),
      description: t("We provide fully transparent pricing with no surprises.")
    }
  ];

  return (
    <div className="bg-gradient-to-br from-primary/5 via-background to-background border border-border rounded-xl p-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
        {t("Why Buy With Holibayt")}
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
