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
        { icon: CheckCircle2, text: t("checkInAfter") + " " + checkInTime, allowed: true },
        { icon: CheckCircle2, text: t("checkOutBefore") + " " + checkOutTime, allowed: true },
        { icon: CheckCircle2, text: t("selfCheckInKeypad"), allowed: true },
        { icon: houseRules?.smoking ? CheckCircle2 : XCircle, text: houseRules?.smoking ? t("smokingAllowed") : t("noSmoking"), allowed: houseRules?.smoking || false },
        { icon: houseRules?.pets ? CheckCircle2 : XCircle, text: houseRules?.pets ? t("petsAllowed") : t("noPets"), allowed: houseRules?.pets || false },
        { icon: houseRules?.events ? CheckCircle2 : XCircle, text: houseRules?.events ? t("eventsAllowed") : t("noPartiesOrEvents"), allowed: houseRules?.events || false },
        ...(houseRules?.quietHours ? [{ icon: Info, text: t("quietHours") + " " + houseRules.quietHours, allowed: null }] : []),
      ]
    : category === "rent"
    ? [
        { icon: CheckCircle2, text: t("longTermRental"), allowed: true },
        { icon: CheckCircle2, text: t("proofOfIncomeRequired"), allowed: true },
        { icon: CheckCircle2, text: t("securityDepositRequired"), allowed: true },
        { icon: XCircle, text: t("noSubletting"), allowed: false },
        { icon: houseRules?.pets ? CheckCircle2 : Info, text: houseRules?.pets ? t("petsAllowed") : t("petsNegotiable"), allowed: houseRules?.pets || null },
        { icon: houseRules?.smoking ? CheckCircle2 : XCircle, text: houseRules?.smoking ? t("smokingAllowed") : t("noSmoking"), allowed: houseRules?.smoking || false },
      ]
    : [
        { icon: CheckCircle2, text: t("ownershipDocsVerified"), allowed: true },
        { icon: CheckCircle2, text: t("propertyInspectionRecommended"), allowed: true },
        { icon: Info, text: t("financingOptionsAvailable"), allowed: null },
        { icon: Info, text: t("legalAssistanceRecommended"), allowed: null },
      ];

  // Build safety features from database or use defaults
  const safetyPropertyList = category === "short-stay"
    ? [
        ...(safetyFeatures?.securityCameras !== false ? [t("securityCamerasExterior")] : []),
        ...(safetyFeatures?.smokeAlarm !== false ? [t("smokeAlarmInstalled")] : []),
        ...(safetyFeatures?.coAlarm !== false ? [t("carbonMonoxideAlarm")] : []),
        ...(safetyFeatures?.firstAidKit !== false ? [t("firstAidKitAvailable")] : []),
        ...(safetyFeatures?.fireExtinguisher !== false ? [t("fireExtinguisherAvailable")] : []),
        t("secureLockboxForKeys")
      ]
    : category === "rent"
    ? [
        t("buildingSecurity247"),
        t("secureEntrySystem"),
        t("wellLitCommonAreas"),
        ...(safetyFeatures?.smokeAlarm !== false ? [t("smokeDetectorsAllRooms")] : []),
        t("emergencyContactProvided"),
        t("regularMaintenanceChecks")
      ]
    : [
        t("propertyVerifiedByHolibayt"),
        t("ownershipDocsChecked"),
        t("legalStatusConfirmed"),
        t("noOutstandingDebts"),
        t("propertyBoundariesVerified"),
        t("safeNeighborhoodAssessment")
      ];

  const cancellationPolicies = {
    flexible: {
      title: t("flexibleCancellation"),
      description: t("flexibleCancellationDesc"),
      details: [
        t("flexibleDetail1"),
        t("flexibleDetail2"),
        t("flexibleDetail3"),
        t("flexibleDetail4")
      ]
    },
    moderate: {
      title: t("moderateCancellation"),
      description: t("moderateCancellationDesc"),
      details: [
        t("moderateDetail1"),
        t("moderateDetail2"),
        t("moderateDetail3"),
        t("moderateDetail4")
      ]
    },
    strict: {
      title: t("strictCancellation"),
      description: t("strictCancellationDesc"),
      details: [
        t("strictDetail1"),
        t("strictDetail2"),
        t("strictDetail3"),
        t("strictDetail4")
      ]
    }
  };

  const currentPolicy = cancellationPolicies[cancellationPolicy as keyof typeof cancellationPolicies] || cancellationPolicies.flexible;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold">{t('thingsToKnow')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* House Rules */}
        <Card className="p-4 sm:p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h3 className="text-base sm:text-lg font-semibold">{t('houseRules')}</h3>
          </div>
          
          <div className="space-y-3">
            {houseRulesList.slice(0, expandedSection === "rules" ? undefined : 3).map((rule, index) => {
              const Icon = rule.icon;
              return (
                <div key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                  <Icon className={`w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 ${
                    rule.allowed === true ? "text-green-600" : 
                    rule.allowed === false ? "text-red-600" : 
                    "text-blue-600"
                  }`} />
                  <span className="text-muted-foreground break-words">{rule.text}</span>
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
        <Card className="p-4 sm:p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h3 className="text-base sm:text-lg font-semibold">{t('safetyProperty')}</h3>
          </div>
          
          <div className="space-y-3">
            {safetyPropertyList.slice(0, expandedSection === "safety" ? undefined : 3).map((item, index) => (
              <div key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground break-words">{item}</span>
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
        <Card className="p-4 sm:p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h3 className="text-base sm:text-lg font-semibold">{t('cancellationPolicy')}</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-xs sm:text-sm">{currentPolicy.title}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{currentPolicy.description}</p>
            </div>
            
            {expandedSection === "cancellation" && (
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                {currentPolicy.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span className="break-words">{detail}</span>
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
