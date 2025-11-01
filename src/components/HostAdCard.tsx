import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Award } from "lucide-react";

interface HostAdCardProps {
  hostId: string;
  name: string;
  avatarUrl?: string;
  averageRating: number;
  totalReviews: number;
  isSuperhost: boolean;
  yearsHosting: number;
  onClick: () => void;
}

export const HostAdCard = ({
  name,
  avatarUrl,
  averageRating,
  totalReviews,
  isSuperhost,
  yearsHosting,
  onClick,
}: HostAdCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      className="relative cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-muted/30 border-primary/10 overflow-hidden group"
      onClick={onClick}
    >
      <div className="p-6 space-y-4">
        {/* Avatar with Superhost Badge */}
        <div className="relative w-24 h-24 mx-auto">
          <Avatar className="w-24 h-24 border-4 border-primary/20">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="text-xl bg-gradient-primary text-primary-foreground">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          {isSuperhost && (
            <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-lg">
              <Award className="w-6 h-6 text-primary fill-primary" />
            </div>
          )}
        </div>

        {/* Host Info */}
        <div className="text-center space-y-2">
          <h3 className="font-bold text-lg line-clamp-1">{name}</h3>
          {isSuperhost && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Superhost
            </Badge>
          )}
          
          {/* Rating */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="font-semibold">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground">
              ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
            </span>
          </div>

          {/* Years Hosting */}
          <p className="text-sm text-muted-foreground">
            {yearsHosting} {yearsHosting === 1 ? "year" : "years"} hosting
          </p>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
      </div>
    </Card>
  );
};
