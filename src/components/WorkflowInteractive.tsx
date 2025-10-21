import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileCheck, 
  Lock, 
  Scale, 
  FileSignature, 
  Home, 
  ShieldCheck, 
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
  bgColor: string;
  textColor: string;
  iconColor: string;
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
        t('verifiedListingsSellers') || 'Verified listings, sellers & buyers',
        t('kycPropertyVerification') || 'ID (KYC) and property verification via Holibayt Verify™',
        t('propertiesInspected') || 'Properties inspected and documents validated'
      ],
      icon: FileCheck,
      bgColor: 'bg-teal-900',
      textColor: 'text-white',
      iconColor: 'text-white'
    },
    {
      number: 2,
      title: t('securityLayer') || 'Security Layer',
      subtitle: t('secureDepositHolibaytPay') || 'Secure Deposit via Holibayt Pay™',
      points: [
        t('paymentLockedEscrow') || 'Payment locked in secure escrow account',
        t('protectionBuyerSeller') || 'Protection for both buyer and seller during transaction',
        t('transparentMilestoneFlow') || 'Transparent, milestone-based transaction flow'
      ],
      icon: Lock,
      bgColor: 'bg-teal-900',
      textColor: 'text-white',
      iconColor: 'text-white'
    },
    {
      number: 3,
      title: t('protectionLayer') || 'Protection Layer',
      subtitle: t('legalSupportInsurance') || 'Legal Support & Insurance with Holibayt Protect™',
      points: [
        t('legalAssistanceNotaries') || 'Legal assistance provided by certified notaries',
        t('transactionBackedProtect') || 'Transaction backed by Holibayt Protect™ and Holibayt Insurance™',
        t('coversFraudDisputes') || 'Covers fraud, contract disputes, or documentation errors'
      ],
      icon: Scale,
      bgColor: 'bg-amber-400',
      textColor: 'text-black',
      iconColor: 'text-black'
    },
    {
      number: 4,
      title: t('transparencyLayer') || 'Transparency Layer',
      subtitle: t('transactionFinalized') || 'Transaction Finalized',
      points: [
        t('ownershipTransferred') || 'Ownership officially transferred and confirmed',
        t('fundsReleasedSeller') || 'Funds released to seller through Holibayt Pay™',
        t('finalDocumentsProvided') || 'Final documents and receipts provided to both parties'
      ],
      icon: FileSignature,
      bgColor: 'bg-slate-400',
      textColor: 'text-black',
      iconColor: 'text-black'
    }
  ];

  const getRentLayers = (): WorkflowLayer[] => [
    {
      number: 1,
      title: t('trustLayer') || 'Trust Layer',
      subtitle: t('findVerifiedRental') || 'Find a Verified Rental',
      points: [
        t('verifiedLandlordsOnly') || 'Verified landlords and tenants only',
        t('authenticPhotosDesc') || 'Authentic photos and accurate descriptions',
        t('transparentLeaseTerms') || 'Transparent lease terms and conditions'
      ],
      icon: Home,
      bgColor: 'bg-teal-900',
      textColor: 'text-white',
      iconColor: 'text-white'
    },
    {
      number: 2,
      title: t('securityLayer') || 'Security Layer',
      subtitle: t('digitalLeaseAgreement') || 'Digital Lease Agreement',
      points: [
        t('legallyBindingContract') || 'Legally-binding digital contract',
        t('clearRentalTerms') || 'Clear rental terms and responsibilities',
        t('bothPartiesProtected') || 'Protection for landlord and tenant'
      ],
      icon: FileSignature,
      bgColor: 'bg-teal-900',
      textColor: 'text-white',
      iconColor: 'text-white'
    },
    {
      number: 3,
      title: t('protectionLayer') || 'Protection Layer',
      subtitle: t('secureDepositPayment') || 'Secure Deposit & Payment',
      points: [
        t('depositInEscrow') || 'Security deposit held in escrow',
        t('monthlyRentProtected') || 'Monthly rent via Holibayt Pay™',
        t('autoRefundEligible') || 'Auto-refund when lease ends'
      ],
      icon: ShieldCheck,
      bgColor: 'bg-amber-400',
      textColor: 'text-black',
      iconColor: 'text-black'
    },
    {
      number: 4,
      title: t('transparencyLayer') || 'Transparency Layer',
      subtitle: t('moveInSupport') || 'Move-in & Ongoing Support',
      points: [
        t('digitalInspection') || 'Digital move-in inspection report',
        t('support247') || '24/7 tenant and landlord support',
        t('depositReturnGuaranteed') || 'Guaranteed deposit return process'
      ],
      icon: DollarSign,
      bgColor: 'bg-slate-400',
      textColor: 'text-black',
      iconColor: 'text-black'
    }
  ];

  const layers = mode === 'buy' ? getBuyLayers() : getRentLayers();

  return (
    <section className="py-16 md:py-20 bg-background">
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
          <div className="hidden lg:flex items-center justify-center gap-6">
            {layers.map((layer, index) => {
              const Icon = layer.icon;
              return (
                <div key={layer.number} className="flex items-center">
                  <Card className={`${layer.bgColor} border-none shadow-elegant hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 w-64`}>
                    <CardContent className="p-8">
                      {/* Icon - Large and Prominent */}
                      <div className="flex justify-center mb-6">
                        <Icon className={`w-16 h-16 ${layer.iconColor}`} />
                      </div>

                      {/* Layer Badge */}
                      <div className="text-center mb-4">
                        <Badge variant="outline" className={`font-mono text-xs ${layer.textColor} border-current`}>
                          Layer {layer.number}
                        </Badge>
                      </div>

                      {/* Layer Title */}
                      <h3 className={`text-xl font-playfair font-bold ${layer.textColor} mb-2 text-center`}>
                        {layer.title}
                      </h3>
                      <h4 className={`text-sm font-semibold ${layer.textColor} opacity-90 mb-6 text-center`}>
                        {layer.subtitle}
                      </h4>

                      {/* Layer Points */}
                      <ul className="space-y-3">
                        {layer.points.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs">
                            <CheckCircle2 className={`w-4 h-4 ${layer.iconColor} flex-shrink-0 mt-0.5`} />
                            <span className={layer.textColor}>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Arrow Connector */}
                  {index < layers.length - 1 && (
                    <ArrowRight className="w-12 h-12 text-primary mx-4 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Tablet View - 2 Columns */}
          <div className="hidden md:grid lg:hidden grid-cols-2 gap-8">
            {layers.map((layer) => {
              const Icon = layer.icon;
              return (
                <Card key={layer.number} className={`${layer.bgColor} border-none shadow-elegant`}>
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Badge variant="outline" className={`font-mono text-xs mb-2 ${layer.textColor} border-current`}>
                          Layer {layer.number}
                        </Badge>
                        <h3 className={`text-lg font-playfair font-bold ${layer.textColor} mb-1`}>
                          {layer.title}
                        </h3>
                        <h4 className={`text-sm font-semibold ${layer.textColor} opacity-90`}>
                          {layer.subtitle}
                        </h4>
                      </div>
                      <Icon className={`w-12 h-12 ${layer.iconColor} flex-shrink-0 ml-4`} />
                    </div>

                    {/* Points */}
                    <ul className="space-y-3 mt-4">
                      {layer.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className={`w-4 h-4 ${layer.iconColor} flex-shrink-0 mt-0.5`} />
                          <span className={layer.textColor}>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Mobile View - Vertical Stack */}
          <div className="md:hidden space-y-6">
            {layers.map((layer) => {
              const Icon = layer.icon;
              return (
                <Card key={layer.number} className={`${layer.bgColor} border-none shadow-elegant`}>
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Badge variant="outline" className={`font-mono text-xs mb-2 ${layer.textColor} border-current`}>
                          Layer {layer.number}
                        </Badge>
                        <h3 className={`text-xl font-playfair font-bold ${layer.textColor} mb-1`}>
                          {layer.title}
                        </h3>
                        <h4 className={`text-sm font-semibold ${layer.textColor} opacity-90`}>
                          {layer.subtitle}
                        </h4>
                      </div>
                      <Icon className={`w-12 h-12 ${layer.iconColor} flex-shrink-0 ml-4`} />
                    </div>

                    {/* Points */}
                    <ul className="space-y-3 mt-4">
                      {layer.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className={`w-5 h-5 ${layer.iconColor} flex-shrink-0 mt-0.5`} />
                          <span className={layer.textColor}>{point}</span>
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
