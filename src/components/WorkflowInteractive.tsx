import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileCheck, 
  Lock, 
  Scale, 
  ShieldCheck, 
  Home, 
  FileSignature, 
  DollarSign,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WorkflowLayer {
  number: number;
  title: string;
  subtitle: string;
  points: string[];
  icon: React.ComponentType<any>;
  color: string;
  borderColor: string;
  bgColor: string;
}

interface WorkflowInteractiveProps {
  mode: 'buy' | 'rent';
}

const WorkflowInteractive = ({ mode }: WorkflowInteractiveProps) => {
  const { t } = useLanguage();

  const getBuyLayers = (): WorkflowLayer[] => [
    {
      number: 1,
      title: t('trustLayer') || 'Trust Layer',
      subtitle: t('findVerifiedProperty') || 'Find a Verified Property',
      points: [
        t('everyPropertyVerified') || 'Every property and seller verified',
        t('holibaytVerifyCert') || 'Holibayt Verify™ certification',
        t('transparentListings') || 'Transparent, detailed listings'
      ],
      icon: FileCheck,
      color: 'text-blue-600',
      borderColor: 'border-blue-500/50',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      number: 2,
      title: t('securityLayer') || 'Security Layer',
      subtitle: t('secureDepositHolibaytPay') || 'Secure Deposit via Holibayt Pay™',
      points: [
        t('buyerDepositLocked') || "Buyer's deposit locked in escrow",
        t('releaseAfterDueDiligence') || 'Release only after due diligence',
        t('transparentMilestones') || 'Transparent milestone-based flow'
      ],
      icon: Lock,
      color: 'text-green-600',
      borderColor: 'border-green-500/50',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    },
    {
      number: 3,
      title: t('protectionLayer') || 'Protection Layer',
      subtitle: t('legalDueDiligence') || 'Legal Due Diligence',
      points: [
        t('propertyTitleCheck') || 'Property title verification',
        t('lawyerAssistance') || 'Holibayt lawyer assistance',
        t('contractReview') || 'Contract review and notary support'
      ],
      icon: Scale,
      color: 'text-amber-600',
      borderColor: 'border-amber-500/50',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20'
    },
    {
      number: 4,
      title: t('transparencyLayer') || 'Transparency Layer',
      subtitle: t('keysAndCompletion') || 'Key Handover & Completion',
      points: [
        t('verifiedKeyHandover') || 'Verified key handover',
        t('fundsReleasedToSeller') || 'Funds released to seller',
        t('digitalProofOfOwnership') || 'Digital proof of ownership'
      ],
      icon: ShieldCheck,
      color: 'text-pink-600',
      borderColor: 'border-pink-500/50',
      bgColor: 'bg-pink-50 dark:bg-pink-950/20'
    }
  ];

  const getRentLayers = (): WorkflowLayer[] => [
    {
      number: 1,
      title: t('trustLayer') || 'Trust Layer',
      subtitle: t('findVerifiedRental') || 'Find a Verified Rental',
      points: [
        t('verifiedLandlords') || 'Verified landlords only',
        t('authenticPhotos') || 'Authentic photos and descriptions',
        t('transparentTerms') || 'Transparent lease terms'
      ],
      icon: Home,
      color: 'text-blue-600',
      borderColor: 'border-blue-500/50',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      number: 2,
      title: t('securityLayer') || 'Security Layer',
      subtitle: t('digitalLeaseAgreement') || 'Digital Lease Agreement',
      points: [
        t('legallyBindingContract') || 'Legally-binding digital contract',
        t('clearRentalTerms') || 'Clear rental terms and conditions',
        t('bothPartiesProtected') || 'Protection for both parties'
      ],
      icon: FileSignature,
      color: 'text-green-600',
      borderColor: 'border-green-500/50',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    },
    {
      number: 3,
      title: t('protectionLayer') || 'Protection Layer',
      subtitle: t('secureDepositPayment') || 'Secure Deposit & Payment',
      points: [
        t('depositInEscrow') || 'Security deposit held in escrow',
        t('monthlyRentProtected') || 'Monthly rent via Holibayt Pay™',
        t('autoRefundEligible') || 'Auto-refund when eligible'
      ],
      icon: ShieldCheck,
      color: 'text-amber-600',
      borderColor: 'border-amber-500/50',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20'
    },
    {
      number: 4,
      title: t('transparencyLayer') || 'Transparency Layer',
      subtitle: t('moveInSupport') || 'Move-in & Ongoing Support',
      points: [
        t('digitalInspection') || 'Digital move-in inspection',
        t('support247') || '24/7 tenant support',
        t('depositReturnGuaranteed') || 'Guaranteed deposit return process'
      ],
      icon: DollarSign,
      color: 'text-pink-600',
      borderColor: 'border-pink-500/50',
      bgColor: 'bg-pink-50 dark:bg-pink-950/20'
    }
  ];

  const layers = mode === 'buy' ? getBuyLayers() : getRentLayers();

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-muted/30 via-background to-accent/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 text-sm font-semibold">
            {mode === 'buy' ? (t('howToBuy') || 'How to Buy') : (t('howToRent') || 'How to Rent')}
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-foreground mb-4">
            {mode === 'buy' 
              ? (t('buyWorkflowTitle') || 'Buy - Verified. Secured. Guaranteed.')
              : (t('rentWorkflowTitle') || 'Rent - Trusted. Protected. Simple.')
            }
          </h2>
          <p className="text-lg text-muted-foreground font-inter max-w-2xl mx-auto">
            {mode === 'buy'
              ? (t('buyWorkflowSubtitle') || 'Four layers of protection for your property purchase')
              : (t('rentWorkflowSubtitle') || 'Four layers ensuring a safe rental experience')
            }
          </p>
        </div>

        {/* Workflow Layers - Horizontal Flow */}
        <div className="relative">
          {/* Desktop View - Horizontal */}
          <div className="hidden lg:flex items-stretch justify-between gap-4">
            {layers.map((layer, index) => {
              const Icon = layer.icon;
              return (
                <div key={layer.number} className="flex items-center">
                  <Card className={`flex-1 ${layer.borderColor} border-2 hover:shadow-elegant transition-all duration-300 ${layer.bgColor}`}>
                    <CardContent className="p-6">
                      {/* Layer Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="font-mono text-xs">
                          Layer {layer.number}
                        </Badge>
                        <Icon className={`w-8 h-8 ${layer.color}`} />
                      </div>

                      {/* Layer Title */}
                      <h3 className="text-lg font-playfair font-bold text-foreground mb-2">
                        {layer.title}
                      </h3>
                      <h4 className="text-sm font-semibold text-foreground/80 mb-4">
                        {layer.subtitle}
                      </h4>

                      {/* Layer Points */}
                      <ul className="space-y-2">
                        {layer.points.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className={`w-4 h-4 ${layer.color} flex-shrink-0 mt-0.5`} />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Arrow Connector */}
                  {index < layers.length - 1 && (
                    <ArrowRight className="w-8 h-8 text-primary mx-2 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile/Tablet View - Vertical Stack */}
          <div className="lg:hidden space-y-6">
            {layers.map((layer) => {
              const Icon = layer.icon;
              return (
                <Card key={layer.number} className={`${layer.borderColor} border-2 ${layer.bgColor}`}>
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Badge variant="outline" className="font-mono text-xs mb-2">
                          Layer {layer.number}
                        </Badge>
                        <h3 className="text-xl font-playfair font-bold text-foreground mb-1">
                          {layer.title}
                        </h3>
                        <h4 className="text-sm font-semibold text-foreground/80">
                          {layer.subtitle}
                        </h4>
                      </div>
                      <Icon className={`w-12 h-12 ${layer.color} flex-shrink-0 ml-4`} />
                    </div>

                    {/* Points */}
                    <ul className="space-y-3 mt-4">
                      {layer.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className={`w-5 h-5 ${layer.color} flex-shrink-0 mt-0.5`} />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowInteractive;