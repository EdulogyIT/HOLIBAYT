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
}

export const PropertyThingsToKnow = ({ 
  category, 
  checkInTime = "3:00 PM",
  checkOutTime = "11:00 AM",
  cancellationPolicy = "flexible"
}: PropertyThingsToKnowProps) => {
  const { t } = useLanguage();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const houseRules = category === "short-stay" 
    ? [
        { icon: CheckCircle2, text: "Check-in: After " + checkInTime, allowed: true },
        { icon: CheckCircle2, text: "Check-out: Before " + checkOutTime, allowed: true },
        { icon: CheckCircle2, text: "Self check-in with keypad", allowed: true },
        { icon: XCircle, text: "No smoking", allowed: false },
        { icon: XCircle, text: "No pets", allowed: false },
        { icon: XCircle, text: "No parties or events", allowed: false },
      ]
    : category === "rent"
    ? [
        { icon: CheckCircle2, text: "Long-term rental (6+ months)", allowed: true },
        { icon: CheckCircle2, text: "Proof of income required", allowed: true },
        { icon: CheckCircle2, text: "Security deposit required", allowed: true },
        { icon: XCircle, text: "No subletting", allowed: false },
        { icon: Info, text: "Pets negotiable with owner", allowed: null },
      ]
    : [
        { icon: CheckCircle2, text: "Ownership documents verified", allowed: true },
        { icon: CheckCircle2, text: "Property inspection recommended", allowed: true },
        { icon: Info, text: "Financing options available", allowed: null },
        { icon: Info, text: "Legal assistance recommended", allowed: null },
      ];

  const safetyProperty = category === "short-stay"
    ? [
        "Security cameras on property exterior",
        "Smoke alarm installed",
        "Carbon monoxide alarm",
        "First aid kit available",
        "Fire extinguisher available",
        "Secure lockbox for keys"
      ]
    : category === "rent"
    ? [
        "24/7 building security (if applicable)",
        "Secure entry system",
        "Well-lit common areas",
        "Smoke detectors in all rooms",
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
      <h2 className="text-2xl md:text-3xl font-bold">Things to know</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* House Rules */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">House rules</h3>
          </div>
          
          <div className="space-y-3">
            {houseRules.slice(0, expandedSection === "rules" ? undefined : 3).map((rule, index) => {
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

          {houseRules.length > 3 && (
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => toggleSection("rules")}
            >
              {expandedSection === "rules" ? "Show less" : `Show more >`}
            </Button>
          )}
        </Card>

        {/* Safety & Property */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Safety & property</h3>
          </div>
          
          <div className="space-y-3">
            {safetyProperty.slice(0, expandedSection === "safety" ? undefined : 3).map((item, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>

          {safetyProperty.length > 3 && (
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => toggleSection("safety")}
            >
              {expandedSection === "safety" ? "Show less" : `Show more >`}
            </Button>
          )}
        </Card>

        {/* Cancellation Policy */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Cancellation policy</h3>
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
            {expandedSection === "cancellation" ? "Show less" : "Learn more >"}
          </Button>
        </Card>
      </div>
    </div>
  );
};
