import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Star, Trophy, Sparkles, CheckCircle, Key, MessageCircle, MapPin, DollarSign, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, differenceInYears } from 'date-fns';

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
  profiles?: {
    name: string;
    created_at: string;
    avatar_url: string | null;
  };
  bookings?: {
    check_in_date: string;
    check_out_date: string;
  };
}

interface Profile {
  name: string;
  is_superhost: boolean;
  average_rating: number;
  total_reviews: number;
  created_at: string;
  email: string;
  avatar_url: string | null;
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
      // Fetch profile data for each review
      const reviewsWithProfiles = await Promise.all(
        data.map(async (review) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, created_at, avatar_url')
            .eq('id', review.user_id)
            .single();
          
          const { data: booking } = await supabase
            .from('bookings')
            .select('check_in_date, check_out_date')
            .eq('id', review.booking_id)
            .maybeSingle();
          
          return {
            ...review,
            profiles: profile,
            bookings: booking
          };
        })
      );
      
      setReviews(reviewsWithProfiles as Review[]);
      if (reviewsWithProfiles.length > 0) {
        const avg = reviewsWithProfiles.reduce((sum, r) => sum + r.rating, 0) / reviewsWithProfiles.length;
        setAverageRating(Math.round(avg * 100) / 100);
      }
    }
  };

  const fetchHostProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('name, is_superhost, average_rating, total_reviews, created_at, email, avatar_url')
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
  const isGuestFavorite = averageRating >= 4.8 && reviews.length >= 5;
  const yearsHosting = hostProfile ? differenceInYears(new Date(), new Date(hostProfile.created_at)) : 0;

  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews(prev => ({ ...prev, [reviewId]: !prev[reviewId] }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cleanliness': return Sparkles;
      case 'accuracy': return CheckCircle;
      case 'checkin': return Key;
      case 'communication': return MessageCircle;
      case 'location': return MapPin;
      case 'value': return DollarSign;
      default: return Star;
    }
  };

  return (
    <div className="space-y-8">
      {/* Guest Favorite Badge */}
      {isGuestFavorite && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Award className="h-16 w-16 text-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{averageRating}</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary text-primary-foreground">Guest favorite</Badge>
                  <span className="text-sm text-muted-foreground">Top 5% of stays</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This home is in the top 5% of eligible listings based on ratings, reviews, and reliability
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Host Info Section */}
      {hostProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Meet your host</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-primary/10">
                  {hostProfile.avatar_url && <AvatarImage src={hostProfile.avatar_url} alt={hostProfile.name} />}
                  <AvatarFallback className="text-2xl bg-primary/10">{hostProfile.name?.[0]}</AvatarFallback>
                </Avatar>
                {hostProfile.is_superhost && (
                  <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2">
                    <Trophy className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{hostProfile.name}</h3>
                  {hostProfile.is_superhost && (
                    <Badge className="mt-1 bg-primary/10 text-primary border-primary/20">
                      <Trophy className="h-3 w-3 mr-1" />
                      Superhost
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{hostProfile.total_reviews}</div>
                    <div className="text-sm text-muted-foreground">Reviews</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      {hostProfile.average_rating?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{yearsHosting}+</div>
                    <div className="text-sm text-muted-foreground">Years hosting</div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => window.open(`mailto:${hostProfile.email}`, '_blank')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message host
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Rating with Category Breakdown */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{averageRating}</span>
                  <span className="text-xl text-muted-foreground">/ 5.0</span>
                </div>
                <p className="text-sm text-muted-foreground">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {breakdown && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries({
                  cleanliness: breakdown.cleanliness,
                  accuracy: breakdown.accuracy,
                  checkin: breakdown.checkin,
                  communication: breakdown.communication,
                  location: breakdown.location,
                  value: breakdown.value
                }).map(([key, value]) => {
                  const Icon = getCategoryIcon(key);
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium capitalize">{key}</span>
                        </div>
                        <span className="font-semibold">{value.toFixed(1)}</span>
                      </div>
                      <Progress value={(value / 5) * 100} className="h-2" />
                    </div>
                  );
                })}
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

      {/* Enhanced Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Reviews from guests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => {
              const guestName = review.profiles?.name || 'Guest';
              const guestInitial = guestName[0].toUpperCase();
              const reviewDate = format(new Date(review.created_at), 'MMMM yyyy');
              const yearsOnPlatform = review.profiles?.created_at 
                ? differenceInYears(new Date(), new Date(review.profiles.created_at))
                : 0;
              
              const isLongComment = review.comment && review.comment.length > 200;
              const isExpanded = expandedReviews[review.id];
              const displayComment = isLongComment && !isExpanded 
                ? review.comment.substring(0, 200) + '...'
                : review.comment;

              return (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        {review.profiles?.avatar_url && (
                          <AvatarImage src={review.profiles.avatar_url} alt={guestName} />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {guestInitial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <h4 className="font-semibold">{guestName}</h4>
                          <p className="text-xs text-muted-foreground">
                            {yearsOnPlatform > 0 ? `${yearsOnPlatform} ${yearsOnPlatform === 1 ? 'year' : 'years'} on Holibayt` : 'New to Holibayt'}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${
                                  i < Math.round(review.rating) 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">· {reviewDate}</span>
                        </div>
                        
                        {review.comment && (
                          <div className="space-y-2">
                            <p className="text-sm leading-relaxed">{displayComment}</p>
                            {isLongComment && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-sm font-semibold hover:bg-transparent"
                                onClick={() => toggleReviewExpansion(review.id)}
                              >
                                {isExpanded ? (
                                  <>Show less <ChevronUp className="h-4 w-4 ml-1" /></>
                                ) : (
                                  <>Show more <ChevronDown className="h-4 w-4 ml-1" /></>
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
