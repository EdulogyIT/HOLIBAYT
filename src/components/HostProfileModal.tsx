import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Shield, Star, PawPrint, Heart, MessageCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface HostProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onContactHost: () => void;
}

interface HostProfile {
  id: string;
  name: string;
  avatar_url?: string;
  average_rating?: number;
  total_reviews?: number;
  created_at: string;
  languages_spoken?: string[];
  is_superhost?: boolean;
  id_verified?: boolean;
}

export const HostProfileModal = ({ userId, isOpen, onClose, onContactHost }: HostProfileModalProps) => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchHostProfile();
    }
  }, [isOpen, userId]);

  const fetchHostProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching host profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile && !isLoading) return null;

  const yearsHosting = profile?.created_at 
    ? new Date().getFullYear() - new Date(profile.created_at).getFullYear()
    : 0;

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const hostBio = t('host.sampleBio') || "Passionate about hospitality and creating memorable experiences for my guests. I love sharing my knowledge of the local area and ensuring every stay is comfortable and enjoyable.";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-accent transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader>
          <DialogTitle className="sr-only">{t('host.profile')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Host Header */}
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={profile?.avatar_url} alt={profile?.name} />
                <AvatarFallback className="text-2xl font-semibold">
                  {getInitials(profile?.name)}
                </AvatarFallback>
              </Avatar>
              {profile?.id_verified && (
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5">
                  <Shield className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-bold mb-1">{profile?.name}</h2>
              <p className="text-muted-foreground mb-3">{t('host.host')}</p>
              
              <div className="flex flex-wrap gap-3 text-sm">
                {profile?.is_superhost && (
                  <Badge variant="default" className="gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    {t('host.superhost')}
                  </Badge>
                )}
                {profile?.id_verified && (
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    {t('host.verifiedIdentity')}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y">
            <div className="text-center">
              <div className="text-2xl font-bold">{profile?.total_reviews || 0}</div>
              <div className="text-sm text-muted-foreground">{t('host.reviews')}</div>
            </div>
            <div className="text-center border-x">
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                {profile?.average_rating?.toFixed(1) || '5.0'}
                <Star className="h-5 w-5 fill-primary text-primary" />
              </div>
              <div className="text-sm text-muted-foreground">{t('host.rating')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{yearsHosting}</div>
              <div className="text-sm text-muted-foreground">{t('host.yearsHosting')}</div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{t('host.about')}</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">{t('host.profession')}:</span> {t('host.sampleProfession')}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {showFullBio ? hostBio : `${hostBio.slice(0, 150)}...`}
              </p>
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-sm"
                onClick={() => setShowFullBio(!showFullBio)}
              >
                {showFullBio ? t('host.showLess') : t('host.showAll')} ›
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <PawPrint className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{t('host.pets')}:</span> {t('host.hasPets')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{t('host.hobbies')}:</span> {t('host.sampleHobbies')}
              </span>
            </div>
            {profile?.languages_spoken && profile.languages_spoken.length > 0 && (
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">{t('host.languages')}:</span>{' '}
                  {profile.languages_spoken.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Verified Identity */}
          {profile?.id_verified && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">{t('host.verifiedIdentity')}</h4>
                  <p className="text-xs text-muted-foreground">
                    {t('host.verifiedIdentityDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              onContactHost();
              onClose();
            }}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            {t('host.contactHost')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
