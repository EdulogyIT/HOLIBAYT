import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { Sparkles, CheckCircle, Key, MessageCircle, MapPin, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  propertyId: string;
  propertyTitle: string;
  onReviewSubmitted?: () => void;
}

export const ReviewDialog = ({ 
  open, 
  onOpenChange, 
  bookingId, 
  propertyId, 
  propertyTitle,
  onReviewSubmitted 
}: ReviewDialogProps) => {
  const [review, setReview] = useState({
    cleanliness_rating: 5,
    accuracy_rating: 5,
    checkin_rating: 5,
    communication_rating: 5,
    location_rating: 5,
    value_rating: 5,
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const overallRating = (
      review.cleanliness_rating +
      review.accuracy_rating +
      review.checkin_rating +
      review.communication_rating +
      review.location_rating +
      review.value_rating
    ) / 6;

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to submit a review');
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from('reviews')
      .insert({
        property_id: propertyId,
        user_id: user.id,
        booking_id: bookingId,
        rating: overallRating,
        ...review
      });

    setIsSubmitting(false);

    if (error) {
      toast.error('Failed to submit review');
      console.error('Review error:', error);
    } else {
      toast.success('Review submitted successfully!');
      onOpenChange(false);
      onReviewSubmitted?.();
    }
  };

  const categories = [
    { key: 'cleanliness_rating', label: 'Cleanliness', icon: Sparkles, description: 'How clean was the property?' },
    { key: 'accuracy_rating', label: 'Accuracy', icon: CheckCircle, description: 'Did it match the listing?' },
    { key: 'checkin_rating', label: 'Check-in', icon: Key, description: 'How smooth was check-in?' },
    { key: 'communication_rating', label: 'Communication', icon: MessageCircle, description: 'How responsive was the host?' },
    { key: 'location_rating', label: 'Location', icon: MapPin, description: 'Was the location convenient?' },
    { key: 'value_rating', label: 'Value', icon: DollarSign, description: 'Was it worth the price?' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">How was your stay?</DialogTitle>
          <DialogDescription>
            Share your experience at {propertyTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {categories.map(({ key, label, icon: Icon, description }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{label}</span>
                    <span className="text-lg font-semibold">{review[key as keyof typeof review]}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              <Slider
                value={[review[key as keyof typeof review] as number]}
                onValueChange={(value) => setReview({ ...review, [key]: value[0] })}
                min={1}
                max={5}
                step={0.1}
                className="w-full"
              />
            </div>
          ))}

          <div className="space-y-2">
            <label className="text-sm font-medium">Share more about your experience</label>
            <Textarea
              placeholder="What did you love about your stay? What could be improved?"
              value={review.comment}
              onChange={(e) => setReview({ ...review, comment: e.target.value })}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
