import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { CalendarDays, Building2 } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  created_at: string;
  status: string;
  category: string;
}

export default function PropertyCalendar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, [user]);

  const fetchProperties = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, created_at, status, category')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
      } else {
        setProperties(data || []);
        if (data && data.length > 0) {
          setSelectedProperty(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentProperty = () => {
    return properties.find(p => p.id === selectedProperty);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {t('host.calendar')} 
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (properties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {t('host.calendar') || 'Booking Calendar'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No properties available</p>
            <p className="text-sm text-muted-foreground">Publish a property to see booking calendar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentProperty = getCurrentProperty();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          {t('host.calendar') || 'Booking Calendar'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {properties.length > 1 && (
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger>
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
          fromDate={new Date()}
        />
        
        {currentProperty && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium text-sm mb-2">{currentProperty.title}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Available for booking
              </Badge>
              <Badge variant={currentProperty.category === 'rent' ? 'default' : currentProperty.category === 'buy' ? 'secondary' : 'destructive'} className="text-xs">
                {currentProperty.category}
              </Badge>
            </div>
          </div>
        )}
        
        {selectedDate && (
          <div className="text-center p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {selectedDate.toLocaleDateString()} - Available
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              No bookings yet for this date
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}