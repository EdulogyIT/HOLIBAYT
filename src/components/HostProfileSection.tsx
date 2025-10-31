import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Shield, MessageCircle, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { HostProfileModal } from "./HostProfileModal";

interface HostProfileSectionProps {
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
}

export const HostProfileSection = ({ userId, onContactHost }: HostProfileSectionProps) => {
  const { t } = useLanguage();
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      const totalReviews = 0;
      const averageRating = 0;

      setHostProfile({
        id: profile?.id || userId,
        name: profile?.name || 'Host',
        avatar_url: profile?.avatar_url,
        created_at: profile?.created_at || new Date().toISOString(),
        is_superhost: profile?.is_superhost || false,
        total_reviews: totalReviews,
        average_rating: averageRating
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

  const memberSince = new Date(hostProfile.created_at).getFullYear();
  const initials = hostProfile.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'H';

  return (
    <>
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-playfair flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            {t("meetYourHost")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Host Header */}
          <div className="flex items-start gap-4">
            <Avatar 
              className="w-20 h-20 border-4 border-primary/20 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsModalOpen(true)}
            >
              <AvatarImage src={hostProfile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl font-semibold bg-gradient-primary text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-semibold font-playfair">
                  {hostProfile.name}
                </h3>
                {hostProfile.is_superhost && (
                  <Badge className="bg-gradient-primary">
                    <Star className="w-3 h-3 mr-1" />
                    {t("superhost")}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground font-inter">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="font-semibold">
                    {hostProfile.average_rating > 0 ? hostProfile.average_rating.toFixed(1) : 'New'}
                  </span>
                  {hostProfile.total_reviews > 0 && (
                    <span>({hostProfile.total_reviews} {t("reviews")})</span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{t("memberSince")} {memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Button */}
          <Button 
            onClick={onContactHost}
            className="w-full bg-gradient-primary hover:shadow-elegant"
            size="lg"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {t("contactHost")}
          </Button>

          {/* Safety Notice */}
          <div className="text-xs text-muted-foreground font-inter p-3 bg-muted/30 rounded-lg">
            <p>
              <strong>{t("paymentProtectionNotice")}</strong>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <HostProfileModal
        userId={userId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContactHost={onContactHost}
      />
    </>
  );
};
