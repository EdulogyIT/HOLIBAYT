import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { CalendarDays, Building2 } from 'lucide-react';
import { eachDayOfInterval, parseISO, format } from 'date-fns';

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
  const [bookedDates, setBookedDates] = useState<Date[]>([]);

  useEffect(() => {
    fetchProperties();
  }, [user]);

  useEffect(() => {
    if (selectedProperty) {
      fetchBookedDates();
    }
  }, [selectedProperty]);

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

  const fetchBookedDates = async () => {
    if (!selectedProperty) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('check_in_date, check_out_date')
        .eq('property_id', selectedProperty)
        .eq('status', 'confirmed');

      if (error) {
        console.error('Error fetching booked dates:', error);
        return;
      }

      const dates: Date[] = [];
      data?.forEach(booking => {
        const checkIn = parseISO(booking.check_in_date);
        const checkOut = parseISO(booking.check_out_date);
        const interval = eachDayOfInterval({ start: checkIn, end: checkOut });
        dates.push(...interval);
      });

      setBookedDates(dates);
    } catch (error) {
      console.error('Error fetching booked dates:', error);
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
          disabled={(date) => {
            return bookedDates.some(bookedDate => 
              format(bookedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            );
          }}
          modifiers={{
            booked: bookedDates
          }}
          modifiersStyles={{
            booked: { backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }
          }}
        />
        
        {currentProperty && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium text-sm mb-2">{currentProperty.title}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {bookedDates.length > 0 ? `${bookedDates.length} days booked` : 'Available for booking'}
              </Badge>
              <Badge variant={currentProperty.category === 'rent' ? 'default' : currentProperty.category === 'buy' ? 'secondary' : 'destructive'} className="text-xs">
                {currentProperty.category}
              </Badge>
            </div>
          </div>
        )}
        
        {selectedDate && (
          <div className="text-center p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg">
            {bookedDates.some(bookedDate => 
              format(bookedDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
            ) ? (
              <>
                <p className="text-sm text-destructive font-medium">
                  {selectedDate.toLocaleDateString()} - Booked
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This date is not available
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {selectedDate.toLocaleDateString()} - Available
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  No bookings for this date
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}