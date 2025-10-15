import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";
import { useState } from "react";
import { LawyerRequestDialog } from "./LawyerRequestDialog";

interface LegalSupportButtonProps {
  propertyId: string;
  className?: string;
}

export const LegalSupportButton = ({ propertyId, className = "" }: LegalSupportButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        variant="outline"
        className={`w-full flex items-center justify-center gap-2 ${className}`}
      >
        <Scale className="h-5 w-5" />
        Legal Support
      </Button>

      <LawyerRequestDialog
        propertyId={propertyId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};