import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  isInWishlist: boolean;
  onToggle: () => void;
  className?: string;
}

export const WishlistButton = ({ isInWishlist, onToggle, className }: WishlistButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "absolute top-3 right-3 z-10 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full h-9 w-9",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-all",
          isInWishlist 
            ? "fill-red-500 text-red-500" 
            : "text-gray-600 hover:text-red-500"
        )}
      />
    </Button>
  );
};
