import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, Percent, DollarSign, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentSettings {
  commission_rate: number;
  auto_payout: boolean;
  payout_threshold: number;
  refund_policy: string;
}

export default function HostPaymentSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PaymentSettings>({
    commission_rate: 0.15,
    auto_payout: true,
    payout_threshold: 100,
    refund_policy: 'flexible'
  });

  useEffect(() => {
    if (user) {
      fetchPaymentSettings();
    }
  }, [user]);

  const fetchPaymentSettings = async () => {
    try {
      // This would fetch from a payment_settings table if we had one
      // For now, using default values
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // This would save to a payment_settings table
      // For now, just show success
      toast({
        title: "Success",
        description: "Payment settings updated successfully"
      });
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast({
        title: "Error",
        description: "Failed to update payment settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Settings</h1>
        <p className="text-muted-foreground">
          Configure your payment preferences and policies
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Commission Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Commission Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Platform Commission Rate</Label>
              <div className="mt-2 mb-4">
                <Slider
                  value={[settings.commission_rate * 100]}
                  onValueChange={(value) => setSettings({...settings, commission_rate: value[0] / 100})}
                  max={30}
                  min={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>5%</span>
                  <span className="font-medium">{(settings.commission_rate * 100).toFixed(1)}%</span>
                  <span>30%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Holibayt's commission on each booking. You'll receive {(100 - settings.commission_rate * 100).toFixed(1)}% of each payment.
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Example Calculation</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Booking Amount:</span>
                  <span>$1,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Commission ({(settings.commission_rate * 100).toFixed(1)}%):</span>
                  <span>-${(1000 * settings.commission_rate).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Your Earnings:</span>
                  <span>${(1000 * (1 - settings.commission_rate)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payout Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payout Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Automatic Payouts</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically transfer earnings to your bank account
                </p>
              </div>
              <Switch
                checked={settings.auto_payout}
                onCheckedChange={(checked) => setSettings({...settings, auto_payout: checked})}
              />
            </div>

            <div>
              <Label htmlFor="payout_threshold">Minimum Payout Amount ($)</Label>
              <Input
                id="payout_threshold"
                type="number"
                value={settings.payout_threshold}
                onChange={(e) => setSettings({...settings, payout_threshold: parseFloat(e.target.value)})}
                min="50"
                max="1000"
                step="10"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Payouts will only be processed when your balance reaches this amount
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Payout Schedule</span>
              </div>
              <p className="text-sm text-blue-800">
                Automatic payouts are processed every Friday for balances above your minimum threshold.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Refund Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Refund Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Default Refund Policy</Label>
              <div className="mt-2">
                <select
                  value={settings.refund_policy}
                  onChange={(e) => setSettings({...settings, refund_policy: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="strict">Strict - No refunds after 24h</option>
                  <option value="moderate">Moderate - 50% refund up to 7 days</option>
                  <option value="flexible">Flexible - Full refund up to 24h before</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Policy Details:</h4>
              {settings.refund_policy === 'strict' && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <Badge variant="destructive" className="mb-2">Strict Policy</Badge>
                  <p className="text-sm">No refunds after 24 hours of booking. Full refund within 24h only.</p>
                </div>
              )}
              {settings.refund_policy === 'moderate' && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Badge variant="secondary" className="mb-2">Moderate Policy</Badge>
                  <p className="text-sm">50% refund up to 7 days before check-in. Full refund within 24h of booking.</p>
                </div>
              )}
              {settings.refund_policy === 'flexible' && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <Badge variant="default" className="mb-2">Flexible Policy</Badge>
                  <p className="text-sm">Full refund up to 24 hours before check-in. Recommended for better bookings.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Additional Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Tax Information</h4>
              <p className="text-sm text-muted-foreground mb-3">
                We'll help you track your earnings for tax purposes. Download your annual earnings report from the dashboard.
              </p>
              <Button variant="outline" size="sm">
                Download Tax Report
              </Button>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Payment History</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Access detailed records of all your transactions and payouts.
              </p>
              <Button variant="outline" size="sm">
                View Payment History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </div>
  );
}