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
    <div className="flex items-start gap-4">
      <Avatar className="w-16 h-16 border-2 border-primary">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
          {name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
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

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
          {averageRating && averageRating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="font-semibold text-foreground">{averageRating.toFixed(1)}</span>
              {transactionCount > 0 && (
                <span>({transactionCount})</span>
              )}
            </div>
          )}
          
          {city && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{city}</span>
            </div>
          )}
          
          {languages && languages.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{languages.join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
