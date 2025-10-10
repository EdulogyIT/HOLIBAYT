import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PropertyFeesDialogProps {
  property: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

interface OtherFee {
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
  enabled: boolean;
  description?: string;
}

export const PropertyFeesDialog = ({ property, open, onOpenChange, onUpdate }: PropertyFeesDialogProps) => {
  const [fees, setFees] = useState({
    cleaning_fee: { enabled: false, amount: 0 },
    service_fee: { enabled: false, amount: 0, type: 'percentage' as 'fixed' | 'percentage' },
    security_deposit: { enabled: false, amount: 0, refundable: true },
    other_fees: [] as OtherFee[],
  });

  useEffect(() => {
    if (property?.fees) {
      setFees({
        cleaning_fee: property.fees.cleaning_fee || { enabled: false, amount: 0 },
        service_fee: property.fees.service_fee || { enabled: false, amount: 0, type: 'percentage' },
        security_deposit: property.fees.security_deposit || { enabled: false, amount: 0, refundable: true },
        other_fees: property.fees.other_fees || [],
      });
    }
  }, [property]);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ fees: fees as any })
        .eq('id', property.id);

      if (error) throw error;

      toast.success('Fees updated successfully');
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating fees:', error);
      toast.error('Failed to update fees');
    }
  };

  const addOtherFee = () => {
    setFees({
      ...fees,
      other_fees: [...fees.other_fees, { name: '', amount: 0, type: 'fixed', enabled: true }],
    });
  };

  const removeOtherFee = (index: number) => {
    setFees({
      ...fees,
      other_fees: fees.other_fees.filter((_, i) => i !== index),
    });
  };

  const updateOtherFee = (index: number, field: string, value: any) => {
    const updated = [...fees.other_fees];
    updated[index] = { ...updated[index], [field]: value };
    setFees({ ...fees, other_fees: updated });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Property Fees - {property?.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cleaning Fee */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Cleaning Fee</Label>
                  <p className="text-sm text-muted-foreground">One-time cleaning charge</p>
                </div>
                <Switch
                  checked={fees.cleaning_fee.enabled}
                  onCheckedChange={(checked) =>
                    setFees({ ...fees, cleaning_fee: { ...fees.cleaning_fee, enabled: checked } })
                  }
                />
              </div>
              {fees.cleaning_fee.enabled && (
                <div>
                  <Label>Amount ({property.price_currency || 'EUR'})</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={fees.cleaning_fee.amount}
                    onChange={(e) =>
                      setFees({
                        ...fees,
                        cleaning_fee: { ...fees.cleaning_fee, amount: parseFloat(e.target.value) || 0 },
                      })
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Fee */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Service Fee</Label>
                  <p className="text-sm text-muted-foreground">Platform service charge</p>
                </div>
                <Switch
                  checked={fees.service_fee.enabled}
                  onCheckedChange={(checked) =>
                    setFees({ ...fees, service_fee: { ...fees.service_fee, enabled: checked } })
                  }
                />
              </div>
              {fees.service_fee.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={fees.service_fee.type}
                      onValueChange={(value: 'fixed' | 'percentage') =>
                        setFees({ ...fees, service_fee: { ...fees.service_fee, type: value } })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>
                      {fees.service_fee.type === 'percentage' ? 'Percentage (%)' : `Amount (${property.price_currency || 'EUR'})`}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      max={fees.service_fee.type === 'percentage' ? 100 : undefined}
                      value={fees.service_fee.amount}
                      onChange={(e) =>
                        setFees({
                          ...fees,
                          service_fee: { ...fees.service_fee, amount: parseFloat(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Deposit */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Security Deposit</Label>
                  <p className="text-sm text-muted-foreground">Refundable deposit</p>
                </div>
                <Switch
                  checked={fees.security_deposit.enabled}
                  onCheckedChange={(checked) =>
                    setFees({ ...fees, security_deposit: { ...fees.security_deposit, enabled: checked } })
                  }
                />
              </div>
              {fees.security_deposit.enabled && (
                <div className="space-y-4">
                  <div>
                    <Label>Amount ({property.price_currency || 'EUR'})</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={fees.security_deposit.amount}
                      onChange={(e) =>
                        setFees({
                          ...fees,
                          security_deposit: { ...fees.security_deposit, amount: parseFloat(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={fees.security_deposit.refundable}
                      onCheckedChange={(checked) =>
                        setFees({
                          ...fees,
                          security_deposit: { ...fees.security_deposit, refundable: checked },
                        })
                      }
                    />
                    <Label>Refundable</Label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Other Fees */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Other Fees</Label>
                  <p className="text-sm text-muted-foreground">Custom additional charges</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addOtherFee}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Fee
                </Button>
              </div>

              {fees.other_fees.map((fee, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Fee #{index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOtherFee(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={fee.name}
                          onChange={(e) => updateOtherFee(index, 'name', e.target.value)}
                          placeholder="e.g., Pet Fee"
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={fee.type}
                          onValueChange={(value) => updateOtherFee(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>
                        {fee.type === 'percentage' ? 'Percentage (%)' : `Amount (${property.price_currency || 'EUR'})`}
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={fee.amount}
                        onChange={(e) => updateOtherFee(index, 'amount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Description (Optional)</Label>
                      <Input
                        value={fee.description || ''}
                        onChange={(e) => updateOtherFee(index, 'description', e.target.value)}
                        placeholder="Brief description"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={fee.enabled}
                        onCheckedChange={(checked) => updateOtherFee(index, 'enabled', checked)}
                      />
                      <Label>Enabled</Label>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Fees</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
