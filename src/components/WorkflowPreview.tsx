import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, FileCheck, Lock, Eye, Building2, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WorkflowPreviewProps {
  mode: "buy" | "rent";
}

interface WorkflowStep {
  icon: React.ElementType;
  title: string;
  bgColor: string;
  iconColor: string;
}

const WorkflowPreview = ({ mode }: WorkflowPreviewProps) => {
  const { t } = useLanguage();

  const getBuySteps = (): WorkflowStep[] => [
    {
      icon: Shield,
      title: t("trustVerification"),
      bgColor: "bg-teal-50 dark:bg-teal-950",
      iconColor: "text-teal-600 dark:text-teal-400",
    },
    {
      icon: FileCheck,
      title: t("securityChecks"),
      bgColor: "bg-teal-50 dark:bg-teal-950",
      iconColor: "text-teal-600 dark:text-teal-400",
    },
    {
      icon: Lock,
      title: t("paymentProtection"),
      bgColor: "bg-amber-50 dark:bg-amber-950",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      icon: Eye,
      title: t("fullTransparency"),
      bgColor: "bg-gray-50 dark:bg-gray-900",
      iconColor: "text-gray-600 dark:text-gray-400",
    },
  ];

  const getRentSteps = (): WorkflowStep[] => [
    {
      icon: Shield,
      title: t("trustVerification"),
      bgColor: "bg-teal-50 dark:bg-teal-950",
      iconColor: "text-teal-600 dark:text-teal-400",
    },
    {
      icon: FileCheck,
      title: t("securityChecks"),
      bgColor: "bg-teal-50 dark:bg-teal-950",
      iconColor: "text-teal-600 dark:text-teal-400",
    },
    {
      icon: Lock,
      title: t("paymentProtection"),
      bgColor: "bg-amber-50 dark:bg-amber-950",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      icon: Eye,
      title: t("fullTransparency"),
      bgColor: "bg-gray-50 dark:bg-gray-900",
      iconColor: "text-gray-600 dark:text-gray-400",
    },
  ];

  const steps = mode === "buy" ? getBuySteps() : getRentSteps();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <Card 
            key={index}
            className="border-2 hover:shadow-md transition-all duration-300"
          >
            <CardContent className="p-4 text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 ${step.bgColor} rounded-xl mb-3`}>
                <Icon className={`w-6 h-6 ${step.iconColor}`} />
              </div>
              <h4 className="text-sm font-semibold text-foreground leading-tight">
                {step.title}
              </h4>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default WorkflowPreview;
