import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { DollarSign } from 'lucide-react';

interface PricingFees {
  cleaning_fee: number;
  extra_guest_fee: number;
  extra_guest_threshold: number;
  pet_fee: number;
  security_deposit: number;
  tax_rate: number;
}

interface PricingFeesSectionProps {
  propertyId: string;
}

export const PricingFeesSection = ({ propertyId }: PricingFeesSectionProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [fees, setFees] = useState<PricingFees>({
    cleaning_fee: 0,
    extra_guest_fee: 0,
    extra_guest_threshold: 2,
    pet_fee: 0,
    security_deposit: 0,
    tax_rate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFees();
  }, [propertyId]);

  const fetchFees = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_fees')
        .select('*')
        .eq('property_id', propertyId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFees({
          cleaning_fee: parseFloat(data.cleaning_fee?.toString() || '0'),
          extra_guest_fee: parseFloat(data.extra_guest_fee?.toString() || '0'),
          extra_guest_threshold: data.extra_guest_threshold || 2,
          pet_fee: parseFloat(data.pet_fee?.toString() || '0'),
          security_deposit: parseFloat(data.security_deposit?.toString() || '0'),
          tax_rate: parseFloat(data.tax_rate?.toString() || '0'),
        });
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase.from('pricing_fees').upsert(
        {
          property_id: propertyId,
          ...fees,
        },
        { onConflict: 'property_id' }
      );

      if (error) throw error;

      toast({
        title: t('success') || 'Success',
        description: 'Fees and charges updated successfully',
      });
    } catch (error) {
      console.error('Error saving fees:', error);
      toast({
        variant: 'destructive',
        title: t('error') || 'Error',
        description: 'Failed to update fees',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {t('feesAndCharges') || 'Fees & Charges'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cleaning_fee">{t('cleaningFee') || 'Cleaning Fee'}</Label>
            <Input
              id="cleaning_fee"
              type="number"
              min="0"
              step="0.01"
              value={fees.cleaning_fee}
              onChange={(e) => setFees({ ...fees, cleaning_fee: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">One-time fee per stay</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="security_deposit">{t('securityDeposit') || 'Security Deposit'}</Label>
            <Input
              id="security_deposit"
              type="number"
              min="0"
              step="0.01"
              value={fees.security_deposit}
              onChange={(e) =>
                setFees({ ...fees, security_deposit: parseFloat(e.target.value) || 0 })
              }
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">Refundable, held in escrow</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra_guest_fee">{t('extraGuestFee') || 'Extra Guest Fee'}</Label>
            <Input
              id="extra_guest_fee"
              type="number"
              min="0"
              step="0.01"
              value={fees.extra_guest_fee}
              onChange={(e) =>
                setFees({ ...fees, extra_guest_fee: parseFloat(e.target.value) || 0 })
              }
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">Per guest per night</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra_guest_threshold">
              {t('extraGuestThreshold') || 'Extra Guest Threshold'}
            </Label>
            <Input
              id="extra_guest_threshold"
              type="number"
              min="0"
              value={fees.extra_guest_threshold}
              onChange={(e) =>
                setFees({ ...fees, extra_guest_threshold: parseInt(e.target.value) || 0 })
              }
              placeholder="2"
            />
            <p className="text-xs text-muted-foreground">Base number of guests included</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pet_fee">{t('petFee') || 'Pet Fee'}</Label>
            <Input
              id="pet_fee"
              type="number"
              min="0"
              step="0.01"
              value={fees.pet_fee}
              onChange={(e) => setFees({ ...fees, pet_fee: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">Per pet per stay</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax_rate">{t('taxRate') || 'Tax Rate (%)'}</Label>
            <Input
              id="tax_rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={fees.tax_rate}
              onChange={(e) => setFees({ ...fees, tax_rate: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">Tourism/occupancy tax</p>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          {t('saveFees') || 'Save Fees & Charges'}
        </Button>
      </CardContent>
    </Card>
  );
};
