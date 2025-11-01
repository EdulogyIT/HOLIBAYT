import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Trash2, Percent, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface PricingRule {
  id?: string;
  rule_type: 'length_discount' | 'early_bird' | 'last_minute' | 'promotion';
  conditions: any;
  discount_percent: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

interface PricingRulesSectionProps {
  propertyId: string;
  rules: PricingRule[];
  onUpdate: () => void;
}

export const PricingRulesSection = ({ propertyId, rules, onUpdate }: PricingRulesSectionProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [newRule, setNewRule] = useState<Partial<PricingRule>>({
    rule_type: 'length_discount',
    discount_percent: 10,
    conditions: {},
    is_active: true,
  });
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const handleAddRule = async () => {
    if (!newRule.rule_type || !newRule.discount_percent) {
      toast({
        variant: 'destructive',
        title: t('error') || 'Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    try {
      const ruleData: any = {
        property_id: propertyId,
        rule_type: newRule.rule_type,
        discount_percent: newRule.discount_percent,
        conditions: newRule.conditions,
        is_active: true,
      };

      // Add dates for promotional discounts
      if (newRule.rule_type === 'promotion' && dateRange.from && dateRange.to) {
        ruleData.start_date = format(dateRange.from, 'yyyy-MM-dd');
        ruleData.end_date = format(dateRange.to, 'yyyy-MM-dd');
      }

      const { error } = await supabase.from('pricing_rules').insert(ruleData);

      if (error) throw error;

      toast({
        title: t('success') || 'Success',
        description: 'Pricing rule added successfully',
      });

      // Reset form
      setNewRule({
        rule_type: 'length_discount',
        discount_percent: 10,
        conditions: {},
        is_active: true,
      });
      setDateRange({ from: undefined, to: undefined });
      onUpdate();
    } catch (error) {
      console.error('Error adding rule:', error);
      toast({
        variant: 'destructive',
        title: t('error') || 'Error',
        description: 'Failed to add pricing rule',
      });
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const { error } = await supabase.from('pricing_rules').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: t('success') || 'Success',
        description: 'Pricing rule deleted successfully',
      });

      onUpdate();
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast({
        variant: 'destructive',
        title: t('error') || 'Error',
        description: 'Failed to delete pricing rule',
      });
    }
  };

  const getRuleLabel = (rule: PricingRule) => {
    switch (rule.rule_type) {
      case 'length_discount':
        return `${rule.discount_percent}% off for ${rule.conditions?.min_nights}+ nights`;
      case 'early_bird':
        return `${rule.discount_percent}% off - Book ${rule.conditions?.days_in_advance}+ days in advance`;
      case 'last_minute':
        return `${rule.discount_percent}% off - Book within ${rule.conditions?.days_before_checkin} days`;
      case 'promotion':
        return `${rule.discount_percent}% promotional discount`;
      default:
        return 'Unknown rule';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5" />
          {t('discountsAndPromotions') || 'Discounts & Promotions'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Rule */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium">{t('addDiscount') || 'Add Discount'}</h4>

          <div className="space-y-2">
            <Label>{t('discountType') || 'Discount Type'}</Label>
            <Select
              value={newRule.rule_type}
              onValueChange={(value: any) =>
                setNewRule({ ...newRule, rule_type: value, conditions: {} })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="length_discount">Length of Stay Discount</SelectItem>
                <SelectItem value="early_bird">Early Bird Discount</SelectItem>
                <SelectItem value="last_minute">Last Minute Discount</SelectItem>
                <SelectItem value="promotion">Promotional Discount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('discountPercent') || 'Discount Percentage'}</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={newRule.discount_percent}
              onChange={(e) =>
                setNewRule({ ...newRule, discount_percent: parseInt(e.target.value) || 0 })
              }
              placeholder="10"
            />
          </div>

          {/* Conditional fields based on rule type */}
          {newRule.rule_type === 'length_discount' && (
            <div className="space-y-2">
              <Label>{t('minimumNights') || 'Minimum Nights'}</Label>
              <Input
                type="number"
                min="1"
                value={newRule.conditions?.min_nights || ''}
                onChange={(e) =>
                  setNewRule({
                    ...newRule,
                    conditions: { ...newRule.conditions, min_nights: parseInt(e.target.value) || 0 },
                  })
                }
                placeholder="7"
              />
            </div>
          )}

          {newRule.rule_type === 'early_bird' && (
            <div className="space-y-2">
              <Label>{t('daysInAdvance') || 'Days in Advance'}</Label>
              <Input
                type="number"
                min="1"
                value={newRule.conditions?.days_in_advance || ''}
                onChange={(e) =>
                  setNewRule({
                    ...newRule,
                    conditions: {
                      ...newRule.conditions,
                      days_in_advance: parseInt(e.target.value) || 0,
                    },
                  })
                }
                placeholder="30"
              />
            </div>
          )}

          {newRule.rule_type === 'last_minute' && (
            <div className="space-y-2">
              <Label>{t('daysBeforeCheckIn') || 'Days Before Check-in'}</Label>
              <Input
                type="number"
                min="1"
                value={newRule.conditions?.days_before_checkin || ''}
                onChange={(e) =>
                  setNewRule({
                    ...newRule,
                    conditions: {
                      ...newRule.conditions,
                      days_before_checkin: parseInt(e.target.value) || 0,
                    },
                  })
                }
                placeholder="3"
              />
            </div>
          )}

          {newRule.rule_type === 'promotion' && (
            <div className="space-y-2">
              <Label>{t('promotionPeriod') || 'Promotion Period'}</Label>
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
          )}

          <Button onClick={handleAddRule} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {t('addRule') || 'Add Rule'}
          </Button>
        </div>

        {/* Existing Rules */}
        <div className="space-y-3">
          <h4 className="font-medium">{t('activeDiscounts') || 'Active Discounts'}</h4>
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('noDiscounts') || 'No discounts configured'}
            </p>
          ) : (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="font-medium">{getRuleLabel(rule)}</span>
                    </div>
                    {rule.start_date && rule.end_date && (
                      <p className="text-sm text-muted-foreground">
                        Valid: {format(new Date(rule.start_date), 'MMM dd, yyyy')} -{' '}
                        {format(new Date(rule.end_date), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => rule.id && handleDeleteRule(rule.id)}
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
  );
};
