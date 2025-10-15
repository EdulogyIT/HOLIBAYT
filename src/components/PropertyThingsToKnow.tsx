import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Shield, AlertCircle, CheckCircle2, XCircle, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PropertyThingsToKnowProps {
  category: "buy" | "rent" | "short-stay";
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy?: string;
  houseRules?: {
    smoking?: boolean;
    pets?: boolean;
    events?: boolean;
    quietHours?: string;
  };
  safetyFeatures?: {
    smokeAlarm?: boolean;
    coAlarm?: boolean;
    firstAidKit?: boolean;
    fireExtinguisher?: boolean;
    securityCameras?: boolean;
  };
}

export const PropertyThingsToKnow = ({ 
  category, 
  checkInTime = "3:00 PM",
  checkOutTime = "11:00 AM",
  cancellationPolicy = "flexible",
  houseRules,
  safetyFeatures
}: PropertyThingsToKnowProps) => {
  const { t } = useLanguage();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Build house rules from database or use defaults
  const houseRulesList = category === "short-stay" 
    ? [
        { icon: CheckCircle2, text: "Check-in: After " + checkInTime, allowed: true },
        { icon: CheckCircle2, text: "Check-out: Before " + checkOutTime, allowed: true },
        { icon: CheckCircle2, text: "Self check-in with keypad", allowed: true },
        { icon: houseRules?.smoking ? CheckCircle2 : XCircle, text: houseRules?.smoking ? "Smoking allowed" : "No smoking", allowed: houseRules?.smoking || false },
        { icon: houseRules?.pets ? CheckCircle2 : XCircle, text: houseRules?.pets ? "Pets allowed" : "No pets", allowed: houseRules?.pets || false },
        { icon: houseRules?.events ? CheckCircle2 : XCircle, text: houseRules?.events ? "Events allowed" : "No parties or events", allowed: houseRules?.events || false },
        ...(houseRules?.quietHours ? [{ icon: Info, text: "Quiet hours: " + houseRules.quietHours, allowed: null }] : []),
      ]
    : category === "rent"
    ? [
        { icon: CheckCircle2, text: "Long-term rental (6+ months)", allowed: true },
        { icon: CheckCircle2, text: "Proof of income required", allowed: true },
        { icon: CheckCircle2, text: "Security deposit required", allowed: true },
        { icon: XCircle, text: "No subletting", allowed: false },
        { icon: houseRules?.pets ? CheckCircle2 : Info, text: houseRules?.pets ? "Pets allowed" : "Pets negotiable with owner", allowed: houseRules?.pets || null },
        { icon: houseRules?.smoking ? CheckCircle2 : XCircle, text: houseRules?.smoking ? "Smoking allowed" : "No smoking", allowed: houseRules?.smoking || false },
      ]
    : [
        { icon: CheckCircle2, text: "Ownership documents verified", allowed: true },
        { icon: CheckCircle2, text: "Property inspection recommended", allowed: true },
        { icon: Info, text: "Financing options available", allowed: null },
        { icon: Info, text: "Legal assistance recommended", allowed: null },
      ];

  // Build safety features from database or use defaults
  const safetyPropertyList = category === "short-stay"
    ? [
        ...(safetyFeatures?.securityCameras !== false ? ["Security cameras on property exterior"] : []),
        ...(safetyFeatures?.smokeAlarm !== false ? ["Smoke alarm installed"] : []),
        ...(safetyFeatures?.coAlarm !== false ? ["Carbon monoxide alarm"] : []),
        ...(safetyFeatures?.firstAidKit !== false ? ["First aid kit available"] : []),
        ...(safetyFeatures?.fireExtinguisher !== false ? ["Fire extinguisher available"] : []),
        "Secure lockbox for keys"
      ]
    : category === "rent"
    ? [
        "24/7 building security (if applicable)",
        "Secure entry system",
        "Well-lit common areas",
        ...(safetyFeatures?.smokeAlarm !== false ? ["Smoke detectors in all rooms"] : []),
        "Emergency contact provided",
        "Regular maintenance checks"
      ]
    : [
        "Property verified by Holibayt team",
        "Ownership documents checked",
        "Legal status confirmed",
        "No outstanding debts or liens",
        "Property boundaries verified",
        "Safe neighborhood assessment"
      ];

  const cancellationPolicies = {
    flexible: {
      title: "Flexible Cancellation",
      description: "Full refund if cancelled 24 hours before check-in",
      details: [
        "Free cancellation before 24 hours of check-in",
        "50% refund if cancelled within 24 hours",
        "No refund for no-shows",
        "Cleaning fee is non-refundable"
      ]
    },
    moderate: {
      title: "Moderate Cancellation",
      description: "Full refund if cancelled 5 days before check-in",
      details: [
        "Free cancellation up to 5 days before check-in",
        "50% refund if cancelled within 5 days",
        "No refund within 48 hours of check-in",
        "Service fees are non-refundable"
      ]
    },
    strict: {
      title: "Strict Cancellation",
      description: "50% refund if cancelled 7+ days before check-in",
      details: [
        "50% refund up to 7 days before check-in",
        "No refund if cancelled within 7 days",
        "No refund for no-shows",
        "All fees are non-refundable"
      ]
    }
  };

  const currentPolicy = cancellationPolicies[cancellationPolicy as keyof typeof cancellationPolicies] || cancellationPolicies.flexible;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold">{t('thingsToKnow')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* House Rules */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">{t('houseRules')}</h3>
          </div>
          
          <div className="space-y-3">
            {houseRulesList.slice(0, expandedSection === "rules" ? undefined : 3).map((rule, index) => {
              const Icon = rule.icon;
              return (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    rule.allowed === true ? "text-green-600" : 
                    rule.allowed === false ? "text-red-600" : 
                    "text-blue-600"
                  }`} />
                  <span className="text-muted-foreground">{rule.text}</span>
                </div>
              );
            })}
          </div>

          {houseRulesList.length > 3 && (
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => toggleSection("rules")}
            >
              {expandedSection === "rules" ? t('showLess') : `${t('showMore')} >`}
            </Button>
          )}
        </Card>

        {/* Safety & Property */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">{t('safetyProperty')}</h3>
          </div>
          
          <div className="space-y-3">
            {safetyPropertyList.slice(0, expandedSection === "safety" ? undefined : 3).map((item, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>

          {safetyPropertyList.length > 3 && (
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => toggleSection("safety")}
            >
              {expandedSection === "safety" ? t('showLess') : `${t('showMore')} >`}
            </Button>
          )}
        </Card>

        {/* Cancellation Policy */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">{t('cancellationPolicy')}</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-sm">{currentPolicy.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{currentPolicy.description}</p>
            </div>
            
            {expandedSection === "cancellation" && (
              <ul className="space-y-2 text-sm text-muted-foreground">
                {currentPolicy.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button
            variant="link"
            className="p-0 h-auto font-semibold"
            onClick={() => toggleSection("cancellation")}
          >
            {expandedSection === "cancellation" ? t('showLess') : `${t('showMore')} >`}
          </Button>
        </Card>
      </div>
    </div>
  );
};
