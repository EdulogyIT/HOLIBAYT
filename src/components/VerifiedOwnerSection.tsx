import { Shield, MapPin, MessageCircle, Star, CheckCircle2, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

interface VerifiedOwnerSectionProps {
  name: string;
  avatarUrl?: string;
  verifiedSince?: string;
  city?: string;
  languages?: string[];
  transactionCount?: number;
  responseRate?: number;
  averageRating?: number;
  isVerified?: boolean;
  category: "buy" | "rent" | "short-stay";
}

export const VerifiedOwnerSection = ({
  name,
  avatarUrl,
  verifiedSince,
  city,
  languages = ["Arabic", "French"],
  transactionCount = 0,
  responseRate = 100,
  averageRating,
  isVerified = true,
  category
}: VerifiedOwnerSectionProps) => {
  const { t } = useLanguage();
  
  const sectionTitle = category === "buy" ? t("aboutTheSeller") : t("aboutTheOwner");
  const verificationText = category === "buy" 
    ? t("ownershipDocumentsVerified") 
    : t("ownerIdentityVerified");

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Avatar className="w-16 h-16 border-2 border-primary">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-semibold">{name}</h3>
            {isVerified && (
              <Badge variant="secondary" className="gap-1">
                <Shield className="w-3 h-3" />
                {t("verifiedOwner")}
              </Badge>
            )}
          </div>
          
          {verifiedSince && !isNaN(Number(verifiedSince)) && Number(verifiedSince) > 2000 && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              {t("verifiedOwnerSince").replace("{{year}}", verifiedSince)}
            </p>
          )}
        </div>
      </div>

      {/* Verification Details */}
      {isVerified && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <Shield className="w-4 h-4 text-primary mt-0.5" />
            <span className="text-muted-foreground">{verificationText}</span>
          </div>
          
          {city && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {t("basedIn")} <span className="font-medium text-foreground">{city}</span>
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t("speaks")} <span className="font-medium text-foreground">{languages.join(", ")}</span>
            </span>
          </div>
        </div>
      )}

      {/* Meet Your Host - Simple Description */}
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("meetYourHostDescription")}
        </p>
      </div>

      {/* Rating Block - Only show if there's actual data */}
      {((transactionCount && transactionCount > 0) || (averageRating && Number(averageRating) > 0)) && (
        <div className="flex items-center gap-6 pt-4 border-t border-border">
          {averageRating && averageRating > 0 && (
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-primary text-primary" />
              <span className="font-semibold">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({transactionCount} {t("transactions")})
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">{responseRate}%</span>
            <span className="text-sm text-muted-foreground">{t("responseRate")}</span>
          </div>
          
          {isVerified && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{t("verifiedDocuments")}</span>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      {category === "buy" && (
        <p className="text-xs text-muted-foreground pt-4 border-t border-border">
          {t("allVerifiedSellersDisclaimer")}
        </p>
      )}
    </div>
  );
};
