import { useState } from 'react';
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
  DollarSign
} from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  type: string;
  location: string;
  status: 'active' | 'draft' | 'paused';
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  bookings: number;
  views: number;
  imageUrl: string;
  createdAt: string;
}

const mockListings: Listing[] = [
  {
    id: 'L001',
    title: 'Villa Moderne avec Piscine',
    type: 'Villa',
    location: 'Hydra, Alger',
    status: 'active',
    price: 15000,
    currency: 'DZD',
    rating: 4.8,
    reviewCount: 23,
    bookings: 45,
    views: 245,
    imageUrl: '/src/assets/property-villa-mediterranean.jpg',
    createdAt: '2024-01-15'
  },
  {
    id: 'L002',
    title: 'Appartement F4 Standing',
    type: 'Appartement',
    location: 'Ben Aknoun, Alger',
    status: 'active',
    price: 8000,
    currency: 'DZD',
    rating: 4.6,
    reviewCount: 18,
    bookings: 32,
    views: 187,
    imageUrl: '/src/assets/property-modern-apartment.jpg',
    createdAt: '2024-01-10'
  },
  {
    id: 'L003',
    title: 'Studio Meublé Centre Ville',
    type: 'Studio',
    location: 'Centre-ville, Alger',
    status: 'draft',
    price: 4500,
    currency: 'DZD',
    rating: 0,
    reviewCount: 0,
    bookings: 0,
    views: 92,
    imageUrl: '/src/assets/property-studio.jpg',
    createdAt: '2024-01-18'
  }
];

export default function HostListings() {
  const [listings] = useState<Listing[]>(mockListings);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const activeListings = listings.filter(l => l.status === 'active').length;
  const totalBookings = listings.reduce((sum, l) => sum + l.bookings, 0);
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0);
  const avgRating = listings.filter(l => l.rating > 0).reduce((sum, l, _, arr) => sum + l.rating / arr.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mes Annonces</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos propriétés et leurs performances
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Annonce
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annonces Actives</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeListings}</div>
            <p className="text-xs text-muted-foreground">sur {listings.length} total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Réservations</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">Toutes propriétés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vues</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Sur 5 étoiles</p>
          </CardContent>
        </Card>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img 
                src={listing.imageUrl}
                alt={listing.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <Badge 
                className={`absolute top-3 left-3 ${getStatusColor(listing.status)}`}
              >
                {listing.status}
              </Badge>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2">{listing.title}</h3>
                  <div className="flex items-center text-muted-foreground text-sm mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.location}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline">{listing.type}</Badge>
                  <div className="text-lg font-bold text-primary">
                    {formatPrice(listing.price, listing.currency)}/nuit
                  </div>
                </div>

                {listing.rating > 0 ? (
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {listing.rating} ({listing.reviewCount})
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {listing.bookings} réservations
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Nouveau - Aucune réservation encore
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {listing.views} vues
                  </div>
                  <div>Créé le {listing.createdAt}</div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
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

      {/* Empty State for new hosts */}
      {listings.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune annonce encore</h3>
            <p className="text-muted-foreground mb-6">
              Créez votre première annonce pour commencer à recevoir des réservations
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer ma première annonce
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}