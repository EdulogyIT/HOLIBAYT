import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { CalendarDays } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  created_at: string;
  status: string;
}

export default function PropertyCalendar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
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
        .select('id, title, created_at, status')
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

  const getPropertiesForDate = (date: Date) => {
    return properties.filter(property => {
      const propertyDate = new Date(property.created_at);
      return (
        propertyDate.getDate() === date.getDate() &&
        propertyDate.getMonth() === date.getMonth() &&
        propertyDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const selectedDateProperties = selectedDate ? getPropertiesForDate(selectedDate) : [];

  const getDatesWithProperties = () => {
    return properties.map(property => new Date(property.created_at));
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          {t('host.calendar') || 'Property Calendar'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
          modifiers={{
            hasProperty: getDatesWithProperties()
          }}
          modifiersStyles={{
            hasProperty: { 
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              fontWeight: 'bold'
            }
          }}
        />
        
        {selectedDate && selectedDateProperties.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">
              {selectedDate.toLocaleDateString()} - {selectedDateProperties.length} {selectedDateProperties.length === 1 ? 'property' : 'properties'}
            </h4>
            <div className="space-y-1">
              {selectedDateProperties.map(property => (
                <div key={property.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <span className="text-sm">{property.title}</span>
                  <Badge variant={property.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {property.status === 'active' ? t('host.active') : property.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {selectedDate && selectedDateProperties.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No properties published on this date
          </p>
        )}
      </CardContent>
    </Card>
  );
}