import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star } from "lucide-react";

interface ReviewNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewerName: string;
  propertyTitle: string;
  rating: number;
  comment?: string;
}

export const ReviewNotificationDialog = ({
  open,
  onOpenChange,
  reviewerName,
  propertyTitle,
  rating,
  comment,
}: ReviewNotificationDialogProps) => {
  const [animatedStars, setAnimatedStars] = useState(0);
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  useEffect(() => {
    if (open) {
      setAnimatedStars(0);
      const timer = setTimeout(() => {
        let count = 0;
        const interval = setInterval(() => {
          count++;
          setAnimatedStars(count);
          if (count >= 5) {
            clearInterval(interval);
          }
        }, 150);
        return () => clearInterval(interval);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">New Review Received! 🎉</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="text-center">
            <p className="text-lg font-medium">{reviewerName}</p>
            <p className="text-sm text-muted-foreground">reviewed</p>
            <p className="text-base font-semibold mt-1">{propertyTitle}</p>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isAnimated = animatedStars >= star;
              const isFilled = star <= fullStars;
              const isHalf = star === fullStars + 1 && hasHalfStar;

              return (
                <div
                  key={star}
                  className={`transform transition-all duration-300 ${
                    isAnimated ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`}
                  style={{ transitionDelay: `${star * 150}ms` }}
                >
                  <Star
                    className={`h-8 w-8 ${
                      isFilled 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : isHalf 
                        ? 'fill-yellow-400/50 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          <div className="text-3xl font-bold text-primary animate-fade-in">
            {rating.toFixed(1)} Stars
          </div>

          {comment && (
            <div className="w-full bg-muted/50 p-4 rounded-lg animate-fade-in">
              <p className="text-sm text-muted-foreground italic">"{comment}"</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
