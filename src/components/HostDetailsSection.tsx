import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Shield, MessageCircle, Clock, Globe, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface HostDetailsSectionProps {
  userId: string;
  onContactHost: () => void;
}

interface HostProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  is_superhost: boolean;
  total_reviews: number;
  average_rating: number;
  response_rate: number;
  response_time: string;
  languages: string[];
  location: string;
}

export const HostDetailsSection = ({ userId, onContactHost }: HostDetailsSectionProps) => {
  const { t } = useLanguage();
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHostProfile();
  }, [userId]);

  const fetchHostProfile = async () => {
    try {
      const profileResult = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const profile: any = profileResult.data;

      // Calculate months hosting
      const createdDate = new Date(profile?.created_at || new Date());
      const now = new Date();
      const monthsHosting = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

      setHostProfile({
        id: profile?.id || userId,
        name: profile?.name || 'Host',
        avatar_url: profile?.avatar_url,
        created_at: profile?.created_at || new Date().toISOString(),
        is_superhost: profile?.is_superhost || false,
        total_reviews: profile?.total_reviews || 0,
        average_rating: profile?.average_rating || 5.0,
        response_rate: 100,
        response_time: 'within an hour',
        languages: ['English', 'French', 'Arabic'],
        location: 'Algeria'
      });
    } catch (error) {
      console.error('Error fetching host profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !hostProfile) {
    return null;
  }

  const monthsHosting = Math.floor(
    (new Date().getTime() - new Date(hostProfile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  
  const initials = hostProfile.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'H';

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-playfair">About the Host</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Host Header with Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="w-24 h-24 border-4 border-primary/20">
            <AvatarImage src={hostProfile.avatar_url || undefined} />
            <AvatarFallback className="text-3xl font-semibold bg-gradient-primary text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-2xl font-semibold font-playfair mb-1">
              {hostProfile.name}
            </h3>
            {hostProfile.is_superhost && (
              <Badge className="bg-gradient-primary">
                <Star className="w-3 h-3 mr-1 fill-white" />
                Superhost
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 py-6 border-y">
          <div className="text-center">
            <div className="text-3xl font-bold font-playfair">
              {hostProfile.total_reviews || 0}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Reviews</div>
          </div>
          <div className="text-center border-x">
            <div className="text-3xl font-bold font-playfair flex items-center justify-center gap-1">
              {hostProfile.average_rating.toFixed(1)}
              <Star className="w-5 h-5 fill-primary text-primary" />
            </div>
            <div className="text-sm text-muted-foreground mt-1">Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold font-playfair">
              {monthsHosting}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Months hosting</div>
          </div>
        </div>

        {/* Superhost Description */}
        {hostProfile.is_superhost && (
          <div className="bg-primary/5 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-2">{hostProfile.name} is a Superhost</h4>
                <p className="text-sm text-muted-foreground">
                  Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Host Details */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Host Details</h4>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Response rate: {hostProfile.response_rate}%</div>
                <div className="text-sm text-muted-foreground">
                  Responds {hostProfile.response_time}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Languages</div>
                <div className="text-sm text-muted-foreground">
                  {hostProfile.languages.join(', ')}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Lives in {hostProfile.location}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Host Button */}
        <Button 
          onClick={onContactHost}
          className="w-full bg-gradient-primary hover:shadow-elegant"
          size="lg"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Message Host
        </Button>

        {/* Safety Notice */}
        <div className="text-xs text-muted-foreground font-inter p-4 bg-muted/30 rounded-lg border">
          <p className="font-semibold mb-2">
            <Shield className="w-4 h-4 inline mr-1" />
            To protect your payment
          </p>
          <p>
            Never transfer money or communicate outside of the Holibayt website or app. 
            Keep all communications and transactions on our platform for your safety.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
