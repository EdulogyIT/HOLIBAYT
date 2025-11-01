import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Award, MapPin, ShieldCheck, MessageCircle, Briefcase, Heart, Smile, PawPrint } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";

interface HostProfile {
  id: string;
  name: string;
  avatar_url?: string;
  average_rating: number;
  total_reviews: number;
  is_superhost: boolean;
  hosting_since?: string;
  profession?: string;
  host_message?: string;
  pets_info?: string;
  passions?: string;
  languages_spoken?: string[];
  id_verified: boolean;
}

interface Property {
  id: string;
  title: string;
  images: string[];
  price: string;
  price_type: string;
  price_currency?: string;
  location: string;
  category: string;
}

interface HostAdModalProps {
  hostId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const HostAdModal = ({ hostId, isOpen, onClose }: HostAdModalProps) => {
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (isOpen && hostId) {
      fetchHostData();
    }
  }, [isOpen, hostId]);

  const fetchHostData = async () => {
    setIsLoading(true);
    try {
      // Fetch host profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", hostId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch host properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select("id, title, images, price, price_type, price_currency, location, category")
        .eq("user_id", hostId)
        .eq("status", "active")
        .limit(6);

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);
    } catch (error) {
      console.error("Error fetching host data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateYearsHosting = (hostingSince?: string) => {
    if (!hostingSince) return 0;
    const years = new Date().getFullYear() - new Date(hostingSince).getFullYear();
    return Math.max(0, years);
  };

  const handlePropertyClick = (propertyId: string) => {
    onClose();
    navigate(`/property/${propertyId}`);
  };

  const handleContactHost = () => {
    onClose();
    navigate(`/messages?host=${hostId}`);
  };

  if (!profile || isLoading) {
    return null;
  }

  const yearsHosting = calculateYearsHosting(profile.hosting_since);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start gap-4">
            {/* Avatar with Superhost Badge */}
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={profile.avatar_url} alt={profile.name} />
                <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                  {getInitials(profile.name || "")}
                </AvatarFallback>
              </Avatar>
              {profile.is_superhost && (
                <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-lg">
                  <Award className="w-6 h-6 text-primary fill-primary" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <SheetTitle className="text-3xl font-bold">{profile.name}</SheetTitle>
              <SheetDescription className="text-base">Host</SheetDescription>
              
              {profile.is_superhost && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Superhost
                </Badge>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <div className="flex items-center gap-1 text-2xl font-bold">
                <Star className="w-6 h-6 fill-primary text-primary" />
                {profile.average_rating.toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">Overall rating</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{profile.total_reviews}</div>
              <p className="text-sm text-muted-foreground">Reviews</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{yearsHosting}</div>
              <p className="text-sm text-muted-foreground">
                {yearsHosting === 1 ? "Year" : "Years"} hosting
              </p>
            </div>
            <div>
              <div className="text-2xl font-bold">{properties.length}</div>
              <p className="text-sm text-muted-foreground">Properties</p>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Profession */}
          {profile.profession && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <Briefcase className="w-5 h-5" />
                <h3>My profession</h3>
              </div>
              <p className="text-muted-foreground">{profile.profession}</p>
            </div>
          )}

          {/* Host Message */}
          {profile.host_message && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <Heart className="w-5 h-5" />
                <h3>For travelers</h3>
              </div>
              <p className="text-muted-foreground">{profile.host_message}</p>
            </div>
          )}

          {/* Pets */}
          {profile.pets_info && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <PawPrint className="w-5 h-5" />
                <h3>Pets</h3>
              </div>
              <p className="text-muted-foreground">{profile.pets_info}</p>
            </div>
          )}

          {/* Passions */}
          {profile.passions && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <Smile className="w-5 h-5" />
                <h3>My passions</h3>
              </div>
              <p className="text-muted-foreground">{profile.passions}</p>
            </div>
          )}

          {/* Languages */}
          {profile.languages_spoken && profile.languages_spoken.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {profile.languages_spoken.map((lang) => (
                  <Badge key={lang} variant="outline">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Verified Identity */}
          {profile.id_verified && (
            <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-semibold">Verified identity</h3>
                <p className="text-sm text-muted-foreground">
                  Identity document verified
                </p>
              </div>
            </div>
          )}

          {/* Host Properties */}
          {properties.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">
                {profile.name?.split(" ")[0]}'s listings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.map((property) => (
                  <Card
                    key={property.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                    onClick={() => handlePropertyClick(property.id)}
                  >
                    <img
                      src={property.images?.[0] || "/placeholder.svg"}
                      alt={property.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4 space-y-2">
                      <h4 className="font-semibold line-clamp-1">{property.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {property.location}
                      </div>
                      <p className="font-bold">{formatPrice(property.price, property.price_type, property.price_currency)}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Contact Button */}
          <Button
            onClick={handleContactHost}
            className="w-full"
            size="lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Contact Host
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
