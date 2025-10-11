import { ShieldCheck, CreditCard, FileText, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";

interface TrustWidgetsProps {
  className?: string;
}

export const TrustWidgets = ({ className = '' }: TrustWidgetsProps) => {
  const { t } = useLanguage();

  const widgets = [
    {
      icon: ShieldCheck,
      title: t('verifiedHostIdProperty') || 'Verified Host',
      description: t('idAndPropertyVerified') || 'ID + property verified',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30'
    },
    {
      icon: CreditCard,
      title: t('securePaymentStripe') || 'Secure Payment',
      description: t('stripeEscrowProtection') || 'Stripe Escrow Protection',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: FileText,
      title: t('cancellationPolicy') || 'Cancellation Policy',
      description: t('refundClarity') || 'Clear refund terms',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30'
    },
    {
      icon: MessageSquare,
      title: t('reviewsRatings') || 'Reviews & Ratings',
      description: t('verifiedGuestReviews') || 'From verified guests',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    }
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {widgets.map((widget, index) => {
        const Icon = widget.icon;
        return (
          <Card key={index} className="border-border/50 hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
              <div className={`p-3 rounded-full ${widget.bgColor}`}>
                <Icon className={`h-6 w-6 ${widget.color}`} />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground mb-1">{widget.title}</h4>
                <p className="text-xs text-muted-foreground">{widget.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
