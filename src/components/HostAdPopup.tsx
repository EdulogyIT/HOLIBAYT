import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Award, Shield, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface HostProfile {
  id: string;
  name: string;
  avatar_url?: string;
  is_superhost: boolean;
  hosting_since?: string;
  profession?: string;
  languages_spoken?: string[];
  average_rating: number;
  total_reviews: number;
  id_verified: boolean;
  has_host_ad: boolean;
}

export const HostAdPopup = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState<HostProfile | null>(null);

  useEffect(() => {
    // Check if user has already seen the popup today
    const lastShown = localStorage.getItem('hostAdLastShown');
    const today = new Date().toDateString();
    
    if (lastShown === today) {
      return;
    }

    // Fetch a featured host
    fetchFeaturedHost();
  }, []);

  const fetchFeaturedHost = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('has_host_ad', true)
        .eq('is_superhost', true)
        .order('average_rating', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      
      if (data) {
        setHost(data);
        // Show popup after 3 seconds
        setTimeout(() => {
          setOpen(true);
          localStorage.setItem('hostAdLastShown', new Date().toDateString());
        }, 3000);
      }
    } catch (error) {
      console.error('Error fetching featured host:', error);
    }
  };

  const handleViewProfile = () => {
    if (host) {
      navigate(`/host-profile/${host.id}`);
      setOpen(false);
    }
  };

  if (!host) return null;

  const initials = host.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'H';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage src={host.avatar_url} alt={host.name} />
              <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            {host.is_superhost && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5">
                  <Award className="h-3 w-3 mr-1" />
                  Superhost
                </Badge>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-1">{host.name}</h3>
            {host.profession && (
              <p className="text-sm text-muted-foreground">{host.profession}</p>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm">
            {host.average_rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="font-semibold">{host.average_rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({host.total_reviews})</span>
              </div>
            )}
            {host.id_verified && (
              <div className="flex items-center gap-1 text-green-600">
                <Shield className="h-4 w-4" />
                <span>{t('verified') || 'Verified'}</span>
              </div>
            )}
          </div>

          {host.hosting_since && (
            <p className="text-sm text-muted-foreground">
              {t('hostingSince') || 'Hosting since'} {new Date(host.hosting_since).getFullYear()}
            </p>
          )}

          {host.languages_spoken && host.languages_spoken.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {host.languages_spoken.map((lang, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
          )}

          <Button onClick={handleViewProfile} className="w-full" size="lg">
            {t('viewProfile') || 'View Profile'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
