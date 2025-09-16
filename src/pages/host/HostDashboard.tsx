import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MessageSquare, Phone, CheckCircle, Building2, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
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
}

export default function HostDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement de vos propriétés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Bienvenue dans votre espace hôte
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propriétés actives</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.filter(p => p.status === 'active').length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages reçus</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Consultez vos messages</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus ce mois</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 DA</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/publish-property')}>
              <Plus className="h-4 w-4 mr-2" />
              Publier une propriété
            </Button>
            <Button variant="outline" onClick={() => navigate('/host/listings')}>
              <Building2 className="h-4 w-4 mr-2" />
              Voir mes annonces
            </Button>
            <Button variant="outline" onClick={() => navigate('/host/messages')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {properties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dernières propriétés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {properties.slice(0, 3).map((property) => (
                <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{property.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {property.city} • Publié le {formatDate(property.created_at)}
                    </p>
                  </div>
                  <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                    {property.status === 'active' ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}