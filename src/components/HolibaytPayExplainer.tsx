import { Shield, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface HolibaytPayExplainerProps {
  category: "buy" | "rent" | "short-stay";
}

export const HolibaytPayExplainer = ({ category }: HolibaytPayExplainerProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const buyContent = {
    title: t("holibaytPayExplainer"),
    description: t("fundsHeldSafely"),
    features: [
      "Escrow protection until ownership transfer",
      "No payment without verified documents",
      "Full transaction transparency"
    ]
  };

  const rentContent = {
    title: t("holibaytPayProtection"),
    description: t("rentDepositHeldSecurely"),
    features: [
      t("refundsAvailable"),
      t("noHiddenFees"),
      "Secure payment processing"
    ]
  };

  const content = category === "buy" ? buyContent : rentContent;

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-2 border-primary/20 rounded-xl p-8 shadow-lg">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary flex items-center justify-center">
          <Shield className="w-8 h-8 text-primary-foreground" />
        </div>
        
        <div className="flex-1 space-y-4">
          <h3 className="text-2xl font-bold">{content.title}</h3>
          <p className="text-muted-foreground text-lg">{content.description}</p>
          
          <ul className="space-y-2">
            {content.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <Button
            onClick={() => navigate("/holibayt-pay")}
            className="mt-4 hover:-translate-y-0.5 transition-transform"
          >
            Learn More about Holibayt Pay™
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
