import { useLanguage } from "@/contexts/LanguageContext";

interface KeyDetailsTableProps {
  propertyType: string;
  condition?: string;
  ownership?: string;
  availability?: string;
  minimumTerm?: string;
  furnished?: boolean;
  category: string;
}

export const KeyDetailsTable = ({
  propertyType,
  condition,
  ownership,
  availability,
  minimumTerm,
  furnished,
  category
}: KeyDetailsTableProps) => {
  const { t } = useLanguage();

  const details = [
    { label: t("propertyType"), value: propertyType },
    condition && { label: t("condition"), value: condition },
    ownership && { label: t("ownership"), value: ownership },
    availability && { label: t("availability"), value: availability },
    category === "rent" && minimumTerm && { label: t("minimumTerm"), value: minimumTerm },
    category === "rent" && furnished !== undefined && {
      label: t("furnished"),
      value: furnished ? t("yes") : t("no")
    }
  ].filter(Boolean);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="bg-muted px-6 py-3">
        <h3 className="font-semibold">{t("keyDetails")}</h3>
      </div>
      <div className="divide-y divide-border">
        {details.map((detail, idx) => {
          if (!detail) return null;
          return (
            <div key={idx} className="grid grid-cols-2 px-6 py-3 hover:bg-muted/50 transition-colors">
              <span className="text-muted-foreground">{detail.label}</span>
              <span className="font-medium">{detail.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
