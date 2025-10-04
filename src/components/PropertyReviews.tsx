import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Star, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface PropertyReviewsProps {
  propertyId: string;
  hostUserId: string;
}

interface Review {
  id: string;
  rating: number;
  cleanliness_rating: number;
  accuracy_rating: number;
  checkin_rating: number;
  communication_rating: number;
  location_rating: number;
  value_rating: number;
  comment: string;
  created_at: string;
  user_id: string;
}

interface Profile {
  name: string;
  is_superhost: boolean;
  average_rating: number;
  total_reviews: number;
}

export const PropertyReviews = ({ propertyId, hostUserId }: PropertyReviewsProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hostProfile, setHostProfile] = useState<Profile | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    cleanliness_rating: 5,
    accuracy_rating: 5,
    checkin_rating: 5,
    communication_rating: 5,
    location_rating: 5,
    value_rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
    fetchHostProfile();
    checkCanReview();
  }, [propertyId, user]);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
      if (data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 100) / 100);
      }
    }
  };

  const fetchHostProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('name, is_superhost, average_rating, total_reviews')
      .eq('id', hostUserId)
      .single();

    if (!error && data) {
      setHostProfile(data);
    }
  };

  const checkCanReview = async () => {
    if (!user) return;

    // Check if user has completed booking for this property
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('property_id', propertyId)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .limit(1);

    if (!error && data && data.length > 0) {
      // Check if user hasn't already reviewed
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('property_id', propertyId)
        .eq('user_id', user.id)
        .limit(1);

      setCanReview(!existingReview || existingReview.length === 0);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }

    // Get completed booking
    const { data: booking } = await supabase
      .from('bookings')
      .select('id')
      .eq('property_id', propertyId)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .limit(1)
      .single();

    if (!booking) {
      toast.error('You must complete a booking before reviewing');
      return;
    }

    const { error } = await supabase
      .from('reviews')
      .insert({
        property_id: propertyId,
        user_id: user.id,
        booking_id: booking.id,
        ...newReview
      });

    if (error) {
      toast.error('Failed to submit review');
      console.error('Review error:', error);
    } else {
      toast.success('Review submitted successfully');
      setShowReviewForm(false);
      fetchReviews();
      setCanReview(false);
    }
  };

  const getRatingBreakdown = () => {
    if (reviews.length === 0) return null;

    return {
      cleanliness: reviews.reduce((s, r) => s + (r.cleanliness_rating || 0), 0) / reviews.length,
      accuracy: reviews.reduce((s, r) => s + (r.accuracy_rating || 0), 0) / reviews.length,
      checkin: reviews.reduce((s, r) => s + (r.checkin_rating || 0), 0) / reviews.length,
      communication: reviews.reduce((s, r) => s + (r.communication_rating || 0), 0) / reviews.length,
      location: reviews.reduce((s, r) => s + (r.location_rating || 0), 0) / reviews.length,
      value: reviews.reduce((s, r) => s + (r.value_rating || 0), 0) / reviews.length,
    };
  };

  const breakdown = getRatingBreakdown();

  return (
    <div className="space-y-6">
      {/* Host Info Section */}
      {hostProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Meet your host</span>
              {hostProfile.is_superhost && (
                <Trophy className="h-5 w-5 text-yellow-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>{hostProfile.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{hostProfile.name}</h3>
                {hostProfile.is_superhost && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    Superhost
                  </p>
                )}
                <div className="mt-2 flex gap-4 text-sm">
                  <div>
                    <span className="font-semibold">{hostProfile.total_reviews}</span>
                    <span className="text-muted-foreground"> Reviews</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{hostProfile.average_rating}</span>
                    <span className="text-muted-foreground"> Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Rating */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <span className="text-3xl font-bold">{averageRating}</span>
              <span className="text-muted-foreground">· {reviews.length} reviews</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {breakdown && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cleanliness</span>
                    <span className="font-semibold">{breakdown.cleanliness.toFixed(1)}</span>
                  </div>
                  <Progress value={(breakdown.cleanliness / 5) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Accuracy</span>
                    <span className="font-semibold">{breakdown.accuracy.toFixed(1)}</span>
                  </div>
                  <Progress value={(breakdown.accuracy / 5) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Check-in</span>
                    <span className="font-semibold">{breakdown.checkin.toFixed(1)}</span>
                  </div>
                  <Progress value={(breakdown.checkin / 5) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Communication</span>
                    <span className="font-semibold">{breakdown.communication.toFixed(1)}</span>
                  </div>
                  <Progress value={(breakdown.communication / 5) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Location</span>
                    <span className="font-semibold">{breakdown.location.toFixed(1)}</span>
                  </div>
                  <Progress value={(breakdown.location / 5) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Value</span>
                    <span className="font-semibold">{breakdown.value.toFixed(1)}</span>
                  </div>
                  <Progress value={(breakdown.value / 5) * 100} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review Form */}
      {canReview && user && (
        <Card>
          <CardHeader>
            <CardTitle>Leave a Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showReviewForm ? (
              <Button onClick={() => setShowReviewForm(true)}>Write a Review</Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Overall Rating</label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 cursor-pointer ${
                          star <= newReview.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                      />
                    ))}
                  </div>
                </div>
                <Textarea
                  placeholder="Share your experience..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSubmitReview}>Submit Review</Button>
                  <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Guest</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 text-sm">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                  <p className="mt-2 text-sm">{review.comment}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
