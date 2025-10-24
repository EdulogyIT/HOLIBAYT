import { Shield, CheckCircle2, Scale, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const WhyRentWithHolibayt = () => {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: Shield,
      title: t("protectedPayments"),
      description: t("protectedPaymentsDesc")
    },
    {
      icon: CheckCircle2,
      title: t("verifiedOwners"),
      description: t("verifiedOwnersDesc")
    },
    {
      icon: Scale,
      title: t("legalSupport"),
      description: t("legalSupportRentDesc")
    },
    {
      icon: DollarSign,
      title: t("easyRefunds"),
      description: t("easyRefundsDesc")
    }
  ];

  return (
    <div className="bg-gradient-to-br from-primary/5 via-background to-background border border-border rounded-xl p-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
        {t("whyRentWithHolibayt")}
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
