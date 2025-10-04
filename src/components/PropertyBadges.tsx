import { Badge } from './ui/badge';
import { Flame, ShieldCheck, Sparkles } from 'lucide-react';

interface PropertyBadgesProps {
  isHotDeal?: boolean;
  isVerified?: boolean;
  isNew?: boolean;
}

export const PropertyBadges = ({ isHotDeal, isVerified, isNew }: PropertyBadgesProps) => {
  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
      {isHotDeal && (
        <Badge className="bg-red-500 text-white hover:bg-red-600 flex items-center gap-1">
          <Flame className="h-3 w-3" />
          Hot Deal
        </Badge>
      )}
      {isVerified && (
        <Badge className="bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          Verified
        </Badge>
      )}
      {isNew && (
        <Badge className="bg-green-500 text-white hover:bg-green-600 flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          New
        </Badge>
      )}
    </div>
  );
};
