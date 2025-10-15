import { Shield, Clock, Scale, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface PropertyTrustInfoBlocksProps {
  isVerified?: boolean;
  holibaytPayEligible?: boolean;
  category: "sale" | "rent" | "short-stay";
}

export const PropertyTrustInfoBlocks = ({ 
  isVerified, 
  holibaytPayEligible,
  category 
}: PropertyTrustInfoBlocksProps) => {
  const { t } = useLanguage();
  
  const blocks = [
    {
      icon: Shield,
      title: t('transactionSecured'),
      description: t('transactionSecuredDesc'),
      show: holibaytPayEligible,
      color: "text-green-600 bg-green-50 dark:bg-green-950/20",
    },
    {
      icon: CheckCircle,
      title: t('verifiedListing'),
      description: t('verifiedListingDesc'),
      show: isVerified,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20",
    },
    {
      icon: Clock,
      title: t('estimatedTimeToClose'),
      description: category === 'sale' 
        ? t('estimatedTimeDesc7to10') 
        : category === 'rent' 
        ? t('estimatedTimeDesc3to5')
        : t('estimatedTimeDescInstant'),
      show: true,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20",
    },
    {
      icon: Scale,
      title: t('requestLegalReview'),
      description: t('legalReviewDesc'),
      show: category === 'sale' || category === 'rent',
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/20",
      isAction: true,
    }
  ];
  
  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
      {blocks.filter(block => block.show).map((block, idx) => {
        const Icon = block.icon;
        return (
          <Card key={idx} className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-2.5">
              <div className="flex items-start gap-2">
                <div className={`inline-flex p-1.5 rounded-lg ${block.color} flex-shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs mb-0.5 leading-tight break-words">{block.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-snug whitespace-normal break-words">{block.description}</p>
                  {block.isAction && (
                    <Button variant="link" size="sm" className="px-0 h-auto mt-1 text-[10px] text-purple-600">
                      {t('learnMore')} →
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
