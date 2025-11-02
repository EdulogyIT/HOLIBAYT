import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SmartPricingSectionProps {
  propertyId: string;
  basePrice: number;
  currency: string;
}

export const SmartPricingSection = ({ propertyId, basePrice, currency }: SmartPricingSectionProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    is_enabled: false,
    min_price: basePrice * 0.7,
    max_price: basePrice * 1.5,
    aggressiveness_level: 'moderate' as 'conservative' | 'moderate' | 'aggressive',
    consider_occupancy: true,
    consider_events: true,
    consider_seasonality: true,
  });

  useEffect(() => {
    fetchSettings();
  }, [propertyId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('smart_pricing_settings')
        .select('*')
        .eq('property_id', propertyId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings({
          is_enabled: data.is_enabled,
          min_price: data.min_price,
          max_price: data.max_price,
          aggressiveness_level: data.aggressiveness_level as 'conservative' | 'moderate' | 'aggressive',
          consider_occupancy: data.consider_occupancy,
          consider_events: data.consider_events,
          consider_seasonality: data.consider_seasonality,
        });
      }
    } catch (error) {
      console.error('Error fetching smart pricing settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('smart_pricing_settings')
        .upsert({
          property_id: propertyId,
          ...settings,
        });

      if (error) throw error;
      toast.success('Smart pricing settings saved successfully!');
    } catch (error) {
      console.error('Error saving smart pricing settings:', error);
      toast.error('Failed to save smart pricing settings');
    } finally {
      setLoading(false);
    }
  };

  const aggressivenessLabels = {
    conservative: { label: 'Conservative', description: '±10% price adjustments' },
    moderate: { label: 'Moderate', description: '±20% price adjustments' },
    aggressive: { label: 'Aggressive', description: '±30% price adjustments' },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>Smart Pricing</CardTitle>
          </div>
          <Badge variant={settings.is_enabled ? 'default' : 'secondary'}>
            {settings.is_enabled ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <CardDescription>
          Let AI automatically adjust your prices based on demand, seasonality, and market conditions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Smart Pricing */}
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="space-y-0.5">
            <Label className="text-base font-semibold">Enable Smart Pricing</Label>
            <p className="text-sm text-muted-foreground">
              Automatically optimize your nightly rates
            </p>
          </div>
          <Switch
            checked={settings.is_enabled}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, is_enabled: checked })
            }
          />
        </div>

        {settings.is_enabled && (
          <>
            {/* Price Bounds */}
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-5 h-5 text-primary mt-1" />
                <div className="flex-1">
                  <Label className="text-base font-semibold">Price Range</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set minimum and maximum prices to keep control
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Price ({currency})</Label>
                  <Input
                    type="number"
                    value={settings.min_price}
                    onChange={(e) =>
                      setSettings({ ...settings, min_price: parseFloat(e.target.value) || 0 })
                    }
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Price ({currency})</Label>
                  <Input
                    type="number"
                    value={settings.max_price}
                    onChange={(e) =>
                      setSettings({ ...settings, max_price: parseFloat(e.target.value) || 0 })
                    }
                    min={settings.min_price}
                  />
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Base price: {currency} {basePrice} | Range: {Math.round((settings.min_price / basePrice - 1) * 100)}% to +
                  {Math.round((settings.max_price / basePrice - 1) * 100)}%
                </AlertDescription>
              </Alert>
            </div>

            {/* Aggressiveness Level */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Pricing Aggressiveness</Label>
              <div className="space-y-2">
                {Object.entries(aggressivenessLabels).map(([key, { label, description }]) => (
                  <div
                    key={key}
                    onClick={() =>
                      setSettings({
                        ...settings,
                        aggressiveness_level: key as 'conservative' | 'moderate' | 'aggressive',
                      })
                    }
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      settings.aggressiveness_level === key
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                      {settings.aggressiveness_level === key && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Factors to Consider */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Pricing Factors</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Occupancy Rate</Label>
                    <p className="text-xs text-muted-foreground">
                      Increase prices during high demand periods
                    </p>
                  </div>
                  <Switch
                    checked={settings.consider_occupancy}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, consider_occupancy: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Local Events</Label>
                    <p className="text-xs text-muted-foreground">
                      Adjust for holidays and special events
                    </p>
                  </div>
                  <Switch
                    checked={settings.consider_events}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, consider_events: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Seasonality</Label>
                    <p className="text-xs text-muted-foreground">
                      Weekend premiums and seasonal trends
                    </p>
                  </div>
                  <Switch
                    checked={settings.consider_seasonality}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, consider_seasonality: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <Button onClick={handleSave} disabled={loading} className="w-full" size="lg">
          {loading ? 'Saving...' : 'Save Smart Pricing Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};
