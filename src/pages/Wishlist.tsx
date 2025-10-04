import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WishlistButton } from '@/components/WishlistButton';
import { PropertyBadges } from '@/components/PropertyBadges';
import { useWishlist } from '@/hooks/useWishlist';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface WishlistProperty {
  id: string;
  title: string;
  location: string;
  city: string;
  price: string;
  price_type: string;
  property_type: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  images: string[];
  is_hot_deal?: boolean;
  is_verified?: boolean;
  is_new?: boolean;
}

const Wishlist = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { wishlistIds, toggleWishlist } = useWishlist(user?.id);
  const [properties, setProperties] = useState<WishlistProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlistProperties();
    }
  }, [user, wishlistIds]);

  const fetchWishlistProperties = async () => {
    try {
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('property_id')
        .eq('user_id', user?.id);

      if (wishlistError) throw wishlistError;

      if (!wishlistData || wishlistData.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      const propertyIds = wishlistData.map(w => w.property_id);

      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds)
        .eq('status', 'active');

      if (propertiesError) throw propertiesError;

      setProperties(propertiesData || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-3xl font-playfair font-bold mb-2">
            {t('loginToViewWishlist') || 'Please login to view your wishlist'}
          </h1>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <LoadingSpinner />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="mb-8">
          <h1 className="text-4xl font-playfair font-bold mb-2">
            {t('myWishlist') || 'My Wishlist'}
          </h1>
          <p className="text-muted-foreground">
            {properties.length} {properties.length === 1 ? t('property') || 'property' : t('properties') || 'properties'}
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-playfair font-bold mb-2">
              {t('wishlistEmpty') || 'Your wishlist is empty'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('startBrowsing') || 'Start browsing properties and add your favorites'}
            </p>
            <Link to="/short-stay" className="text-primary hover:underline">
              {t('browseProperties') || 'Browse Properties'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Link key={property.id} to={`/property/${property.id}`}>
                <Card className="overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-64">
                    <img
                      src={property.images[0] || '/placeholder.svg'}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    <PropertyBadges
                      isHotDeal={property.is_hot_deal}
                      isVerified={property.is_verified}
                      isNew={property.is_new}
                    />
                    <WishlistButton
                      isInWishlist={wishlistIds.has(property.id)}
                      onToggle={() => toggleWishlist(property.id)}
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-inter font-semibold text-lg line-clamp-1">
                        {property.title}
                      </h3>
                      <div className="text-primary font-bold whitespace-nowrap ml-2">
                        {formatPrice(property.price, property.price_type)}
                      </div>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{property.city}, {property.location}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {property.bedrooms && (
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Maximize className="h-4 w-4" />
                        <span>{property.area} {t('sqm') || 'm²'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
