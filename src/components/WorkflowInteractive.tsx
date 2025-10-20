import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WorkflowStep {
  number: number;
  title: string;
  description: string;
  details: string;
  icon: string;
}

interface WorkflowInteractiveProps {
  mode: 'buy' | 'rent';
}

const WorkflowInteractive = ({ mode }: WorkflowInteractiveProps) => {
  const { t } = useLanguage();
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);

  const getBuySteps = (): WorkflowStep[] => [
    {
      number: 1,
      title: t('buy.layer1') || 'Layer 1: Find Your Dream Property',
      description: t('buy.layer1Desc') || 'Browse verified listings with virtual tours',
      details: t('buy.layer1Details') || 'Search through thousands of verified properties with detailed photos, virtual tours, and accurate descriptions. Filter by location, price, size, and amenities to find exactly what you need.',
      icon: '🏠'
    },
    {
      number: 2,
      title: t('buy.layer2') || 'Layer 2: Legal Due Diligence',
      description: t('buy.layer2Desc') || 'Property verification and legal support',
      details: t('buy.layer2Details') || 'Our legal team verifies property ownership, checks for liens, ensures all documentation is in order, and provides full legal support throughout the purchase process.',
      icon: '⚖️'
    },
    {
      number: 3,
      title: t('buy.layer3') || 'Layer 3: Secure Payment',
      description: t('buy.layer3Desc') || 'Escrow-protected transaction',
      details: t('buy.layer3Details') || 'Your payment is held securely in escrow until all conditions are met and you receive your property keys. Holibayt Pay™ protects both buyer and seller.',
      icon: '🔒'
    },
    {
      number: 4,
      title: t('buy.layer4') || 'Layer 4: Key Handover',
      description: t('buy.layer4Desc') || 'Complete the transaction safely',
      details: t('buy.layer4Details') || 'Meet at our verified location for key handover. Once confirmed, payment is released to the seller. You\'re now a proud property owner in Algeria!',
      icon: '🔑'
    }
  ];

  const getRentSteps = (): WorkflowStep[] => [
    {
      number: 1,
      title: t('rent.layer1') || 'Layer 1: Discover Rental Properties',
      description: t('rent.layer1Desc') || 'Find verified rental listings',
      details: t('rent.layer1Details') || 'Browse through verified rental properties with detailed information, photos, and rental terms. Filter by location, budget, size, and lease duration.',
      icon: '🏘️'
    },
    {
      number: 2,
      title: t('rent.layer2') || 'Layer 2: Digital Lease Agreement',
      description: t('rent.layer2Desc') || 'Sign secure digital contracts',
      details: t('rent.layer2Details') || 'Review and sign legally-binding digital lease agreements with clear terms. Our system ensures both parties are protected with transparent rental conditions.',
      icon: '📄'
    },
    {
      number: 3,
      title: t('rent.layer3') || 'Layer 3: Secure Deposit & Payment',
      description: t('rent.layer3Desc') || 'Protected deposit and rent payment',
      details: t('rent.layer3Details') || 'Your security deposit is held safely in escrow. Monthly rent payments are processed securely through Holibayt Pay™, ensuring timely payments and proper documentation.',
      icon: '💳'
    },
    {
      number: 4,
      title: t('rent.layer4') || 'Layer 4: Move In & Support',
      description: t('rent.layer4Desc') || 'Inspection and ongoing assistance',
      details: t('rent.layer4Details') || 'Complete move-in inspection with digital documentation. Access 24/7 support for any issues. Your deposit is returned automatically at lease end if no damages.',
      icon: '🏡'
    }
  ];

  const steps = mode === 'buy' ? getBuySteps() : getRentSteps();

  return (
    <section className="py-16 bg-gradient-to-br from-muted/30 via-background to-accent/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 text-sm font-semibold">
            {mode === 'buy' ? t('howToBuy') || 'How to Buy' : t('howToRent') || 'How to Rent'}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-4">
            {mode === 'buy' 
              ? t('buyWorkflowTitle') || 'Your Journey to Property Ownership'
              : t('rentWorkflowTitle') || 'Your Journey to Finding a Home'
            }
          </h2>
          <p className="text-lg text-muted-foreground font-inter max-w-2xl mx-auto">
            {mode === 'buy'
              ? t('buyWorkflowSubtitle') || 'Four simple layers that ensure a safe and transparent property purchase'
              : t('rentWorkflowSubtitle') || 'Four simple layers that ensure a safe and transparent rental experience'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card 
              key={step.number}
              className="group relative overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 cursor-pointer bg-card border-border/50"
              onClick={() => setSelectedStep(step)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-4xl mb-2">{step.icon}</div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {t('step')} {step.number}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-playfair leading-tight">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground font-inter mb-4">
                  {step.description}
                </p>
                <div className="flex items-center text-primary text-sm font-semibold group-hover:gap-2 transition-all duration-300">
                  <span>{t('learnMore') || 'Learn More'}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </CardContent>

              {/* Progress indicator line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-10" />
              )}
            </Card>
          ))}
        </div>

        {/* Dialog for expanded step details */}
        <Dialog open={!!selectedStep} onOpenChange={() => setSelectedStep(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="text-5xl">{selectedStep?.icon}</div>
                <Badge variant="outline" className="font-mono">
                  {t('step')} {selectedStep?.number}
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-playfair">
                {selectedStep?.title}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {selectedStep?.description}
              </DialogDescription>
            </DialogHeader>
            <div className="pt-4">
              <p className="text-base text-foreground font-inter leading-relaxed">
                {selectedStep?.details}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default WorkflowInteractive;
