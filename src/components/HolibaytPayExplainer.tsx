import { Shield, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { formatTranslationKey } from "@/lib/utils";

interface HolibaytPayExplainerProps {
  category: "buy" | "rent" | "short-stay";
}

export const HolibaytPayExplainer = ({ category }: HolibaytPayExplainerProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const getTitleOrFormatted = (key: string) => {
    const translation = t(key);
    return translation === key ? formatTranslationKey(key) : translation;
  };

  const buyContent = {
    title: getTitleOrFormatted("Holibayt Pay Explainer"),
    description: getTitleOrFormatted("Funds Held Safely"),
    features: [
      getTitleOrFormatted("Escrow Protection Feature"),
      getTitleOrFormatted("Verified Documents Feature"),
      getTitleOrFormatted("Transaction Transparency Feature")
    ]
  };

  const rentContent = {
    title: getTitleOrFormatted("Holibayt Pay Protection"),
    description: getTitleOrFormatted("rentDepositHeldSecurely"),
    features: [
      getTitleOrFormatted("Refunds Available"),
      getTitleOrFormatted("No Hidden Fees"),
      getTitleOrFormatted("Secure Payment Processing Feature")
    ]
  };

  const content = category === "buy" ? buyContent : rentContent;

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-2 border-primary/20 rounded-xl p-4 sm:p-6 md:p-8 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center">
          <Shield className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-foreground" />
        </div>
        
        <div className="flex-1 space-y-3">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold">{content.title}</h3>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">{content.description}</p>
          
          <ul className="space-y-2">
            {content.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-1" />
                <span className="text-sm sm:text-base">{feature}</span>
              </li>
            ))}
          </ul>
          
          <Button
            onClick={() => navigate("/holibayt-pay")}
            className="mt-4 hover:-translate-y-0.5 transition-transform text-sm sm:text-base w-full sm:w-auto"
          >
            {t('learnMore')} about Holibayt Pay™
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
