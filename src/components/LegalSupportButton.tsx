import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { LawyerRequestDialog } from "./LawyerRequestDialog";

interface LegalSupportButtonProps {
  propertyId: string;
  className?: string;
}

export const LegalSupportButton = ({ propertyId, className = "" }: LegalSupportButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <>
      <Card className="border-2 border-border hover:border-primary/30 transition-all">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base text-foreground mb-1">
                {t('legalSupportTitle') || 'Request Legal Review'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('legalSupportDesc') || 'Get expert legal assistance throughout the process'}
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/legal-process')}
            variant="ghost"
            size="sm"
            className="w-full justify-center gap-2 text-primary hover:text-primary/90"
          >
            {t('learnMore')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Button
        onClick={() => setDialogOpen(true)}
        variant="outline"
        className={`w-full flex items-center justify-center gap-2 ${className}`}
      >
        <Scale className="h-5 w-5" />
        {t('legalSupport')}
      </Button>

      <LawyerRequestDialog
        propertyId={propertyId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};