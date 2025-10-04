import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Flame, ShieldCheck, Sparkles } from 'lucide-react';

interface BadgeManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  currentBadges: {
    is_hot_deal: boolean;
    is_verified: boolean;
    is_new: boolean;
  };
  onUpdate: () => void;
}

export const BadgeManagementDialog = ({
  isOpen,
  onClose,
  propertyId,
  currentBadges,
  onUpdate,
}: BadgeManagementDialogProps) => {
  const [badges, setBadges] = useState(currentBadges);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          is_hot_deal: badges.is_hot_deal,
          is_verified: badges.is_verified,
          is_new: badges.is_new,
        })
        .eq('id', propertyId);

      if (error) throw error;

      toast.success('Badges updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating badges:', error);
      toast.error('Failed to update badges');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Property Badges</DialogTitle>
          <DialogDescription>
            Select which badges should be displayed on this property
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="hot-deal"
              checked={badges.is_hot_deal}
              onCheckedChange={(checked) =>
                setBadges({ ...badges, is_hot_deal: checked as boolean })
              }
            />
            <Label htmlFor="hot-deal" className="flex items-center gap-2 cursor-pointer">
              <Flame className="h-4 w-4 text-red-500" />
              <span>Hot Deal</span>
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="verified"
              checked={badges.is_verified}
              onCheckedChange={(checked) =>
                setBadges({ ...badges, is_verified: checked as boolean })
              }
            />
            <Label htmlFor="verified" className="flex items-center gap-2 cursor-pointer">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              <span>Verified</span>
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="new"
              checked={badges.is_new}
              onCheckedChange={(checked) =>
                setBadges({ ...badges, is_new: checked as boolean })
              }
            />
            <Label htmlFor="new" className="flex items-center gap-2 cursor-pointer">
              <Sparkles className="h-4 w-4 text-green-500" />
              <span>New</span>
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
