import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Plus, Trash2, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import { PricingRulesSection } from '@/components/host/PricingRulesSection';
import { PricingFeesSection } from '@/components/host/PricingFeesSection';

interface SeasonalPrice {
  id?: string;
  start_date: string;
  end_date: string;
  price_per_night: number;
  season_name: string;
  weekend_multiplier?: number;
}

export const HostPricingManagement = () => {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [basePrice, setBasePrice] = useState('');
  const [seasonalPrices, setSeasonalPrices] = useState<SeasonalPrice[]>([]);
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekendMultiplier, setWeekendMultiplier] = useState(1.0);
  
  // New seasonal price form
  const [newSeason, setNewSeason] = useState<SeasonalPrice>({
    start_date: '',
    end_date: '',
    price_per_night: 0,
    season_name: '',
    weekend_multiplier: 1.0
  });
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  useEffect(() => {
    if (propertyId) {
      fetchPricingData();
    }
  }, [propertyId]);

  const fetchPricingData = async () => {
    try {
      // Fetch base price
      const { data: property, error: propError } = await supabase
        .from('properties')
        .select('price')
        .eq('id', propertyId)
        .single();

      if (propError) throw propError;
      setBasePrice(property?.price || '');

      // Fetch seasonal pricing
      const { data: seasonal, error: seasonError } = await supabase
        .from('property_seasonal_pricing')
        .select('*')
        .eq('property_id', propertyId)
        .order('start_date', { ascending: true });

      if (seasonError) throw seasonError;
      setSeasonalPrices(seasonal || []);

      // Fetch pricing rules
      const { data: rules, error: rulesError } = await supabase
        .from('pricing_rules')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (rulesError) throw rulesError;
      setPricingRules(rules || []);
    } catch (error) {
      console.error('Error fetching pricing:', error);
      toast({
        variant: 'destructive',
        title: t('error') || 'Error',
        description: 'Failed to load pricing data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBasePrice = async () => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ price: basePrice })
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: t('success') || 'Success',
        description: 'Base price updated successfully'
      });
    } catch (error) {
      console.error('Error updating base price:', error);
      toast({
        variant: 'destructive',
        title: t('error') || 'Error',
        description: 'Failed to update base price'
      });
    }
  };

  const handleAddSeasonalPrice = async () => {
    if (!dateRange.from || !dateRange.to || !newSeason.price_per_night || !newSeason.season_name) {
      toast({
        variant: 'destructive',
        title: t('error') || 'Error',
        description: 'Please fill in all fields'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('property_seasonal_pricing')
        .insert({
          property_id: propertyId,
          start_date: format(dateRange.from, 'yyyy-MM-dd'),
          end_date: format(dateRange.to, 'yyyy-MM-dd'),
          price_per_night: newSeason.price_per_night,
          season_name: newSeason.season_name,
          weekend_multiplier: newSeason.weekend_multiplier || 1.0
        });

      if (error) throw error;

      toast({
        title: t('success') || 'Success',
        description: 'Seasonal pricing added successfully'
      });

      // Reset form
      setNewSeason({
        start_date: '',
        end_date: '',
        price_per_night: 0,
        season_name: '',
        weekend_multiplier: 1.0
      });
      setDateRange({ from: undefined, to: undefined });

      // Refresh data
      fetchPricingData();
    } catch (error) {
      console.error('Error adding seasonal price:', error);
      toast({
        variant: 'destructive',
        title: t('error') || 'Error',
        description: 'Failed to add seasonal pricing'
      });
    }
  };

  const handleDeleteSeasonalPrice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('property_seasonal_pricing')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('success') || 'Success',
        description: 'Seasonal pricing deleted successfully'
      });

      fetchPricingData();
    } catch (error) {
      console.error('Error deleting seasonal price:', error);
      toast({
        variant: 'destructive',
        title: t('error') || 'Error',
        description: 'Failed to delete seasonal pricing'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t('basePricing') || 'Base Pricing'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="basePrice">{t('basePrice') || 'Base Price per Night'}</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="basePrice"
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="Enter base price"
              />
              <Button onClick={handleUpdateBasePrice}>
                {t('update') || 'Update'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {t('seasonalPricing') || 'Seasonal Pricing'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium">{t('addNewSeason') || 'Add New Season'}</h4>
            
            <div className="space-y-2">
              <Label>{t('seasonName') || 'Season Name'}</Label>
              <Input
                value={newSeason.season_name}
                onChange={(e) => setNewSeason({ ...newSeason, season_name: e.target.value })}
                placeholder="e.g., Summer, Weekend, Ramadan"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('dateRange') || 'Date Range'}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>{t('pickDateRange') || 'Pick a date range'}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      if (range) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>{t('pricePerNight') || 'Price per Night'}</Label>
              <Input
                type="number"
                value={newSeason.price_per_night || ''}
                onChange={(e) => setNewSeason({ ...newSeason, price_per_night: parseFloat(e.target.value) || 0 })}
                placeholder="Enter price"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('weekendMultiplier') || 'Weekend Multiplier'}</Label>
              <Input
                type="number"
                min="1"
                max="3"
                step="0.1"
                value={newSeason.weekend_multiplier || 1.0}
                onChange={(e) => setNewSeason({ ...newSeason, weekend_multiplier: parseFloat(e.target.value) || 1.0 })}
                placeholder="1.0"
              />
              <p className="text-xs text-muted-foreground">Multiply weekend rates (1.0 = no change, 1.5 = 50% more)</p>
            </div>

            <Button onClick={handleAddSeasonalPrice} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {t('addSeasonalPrice') || 'Add Seasonal Price'}
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">{t('currentSeasons') || 'Current Seasons'}</h4>
            {seasonalPrices.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noSeasonalPricing') || 'No seasonal pricing configured'}</p>
            ) : (
              <div className="space-y-2">
                {seasonalPrices.map((season) => (
                  <div
                    key={season.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{season.season_name}</Badge>
                        <span className="font-semibold text-primary">{season.price_per_night} / night</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(season.start_date), 'MMM dd, yyyy')} - {format(new Date(season.end_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => season.id && handleDeleteSeasonalPrice(season.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Rules - Discounts */}
      <PricingRulesSection
        propertyId={propertyId!}
        rules={pricingRules}
        onUpdate={fetchPricingData}
      />

      {/* Fees and Charges */}
      <PricingFeesSection propertyId={propertyId!} />

      <Card>
        <CardHeader>
          <CardTitle>{t('pricingTips') || 'Pricing Tips'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• {t('pricingTip1') || 'Set competitive base prices to attract more bookings'}</p>
          <p>• {t('pricingTip2') || 'Increase prices during peak seasons and holidays'}</p>
          <p>• {t('pricingTip3') || 'Offer discounts for longer stays (weekly/monthly)'}</p>
          <p>• {t('pricingTip4') || 'Consider local events when setting seasonal pricing'}</p>
          <p>• {t('pricingTip5') || 'Use weekend multipliers to optimize Friday-Sunday rates'}</p>
          <p>• {t('pricingTip6') || 'Early bird discounts encourage advance bookings'}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HostPricingManagement;
