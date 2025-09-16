import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  MapPin,
  Star,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Property {
  id: string;
  title: string;
  property_type: string;
  city: string;
  district: string;
  price: string;
  price_type: string;
  status: string;
  created_at: string;
  category: string;
  images: string[];
}

export default function HostListings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHostProperties();
  }, [user]);

  const fetchHostProperties = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
      } else {
        setProperties(data || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string, priceType: string) => {
    const formattedPrice = new Intl.NumberFormat('fr-DZ').format(parseInt(price));
    if (priceType === 'monthly') return `${formattedPrice} DA/mois`;
    if (priceType === 'daily') return `${formattedPrice} DA/jour`;
    return `${formattedPrice} DA`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeProperties = properties.filter(p => p.status === 'active').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement de vos annonces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mes Annonces</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos propriétés et leurs performances
          </p>
        </div>
        <Button onClick={() => navigate('/publish-property')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Annonce
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annonces Actives</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProperties}</div>
            <p className="text-xs text-muted-foreground">sur {properties.length} total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Messages reçus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vues</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>
      </div>

      {/* Properties Grid */}
      {properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img 
                  src={property.images?.[0] || '/placeholder.svg'}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <Badge 
                  className={`absolute top-3 left-3 ${getStatusColor(property.status)}`}
                >
                  {property.status === 'active' ? 'Actif' : property.status}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2">{property.title}</h3>
                    <div className="flex items-center text-muted-foreground text-sm mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.city}, {property.district}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{property.property_type}</Badge>
                    <div className="text-lg font-bold text-primary">
                      {formatPrice(property.price, property.price_type)}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <Badge variant="outline">
                      {property.category === 'sale' ? 'Vente' : 
                       property.category === 'rent' ? 'Location' : 'Séjour Court'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>Créé le {formatDate(property.created_at)}</div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1"
                      onClick={() => navigate(`/property/${property.id}`)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune annonce encore</h3>
            <p className="text-muted-foreground mb-6">
              Créez votre première annonce pour commencer à recevoir des demandes
            </p>
            <Button onClick={() => navigate('/publish-property')}>
              <Plus className="h-4 w-4 mr-2" />
              Créer ma première annonce
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}