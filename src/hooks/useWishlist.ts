import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Callback for showing auth modal when user is not logged in
let authModalCallback: (() => void) | null = null;

export const setAuthModalCallback = (callback: () => void) => {
  authModalCallback = callback;
};

export const useWishlist = (userId: string | undefined) => {
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchWishlist();
    } else {
      setWishlistIds(new Set());
      setLoading(false);
    }
  }, [userId]);

  const fetchWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('property_id')
        .eq('user_id', userId);

      if (error) throw error;

      const ids = new Set(data?.map(item => item.property_id) || []);
      setWishlistIds(ids);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (propertyId: string) => {
    if (!userId) {
      // Trigger auth modal if callback is set, otherwise show toast
      if (authModalCallback) {
        authModalCallback();
      } else {
        toast.error('Please login to add to wishlist');
      }
      return;
    }

    const isInWishlist = wishlistIds.has(propertyId);

    try {
      if (isInWishlist) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', userId)
          .eq('property_id', propertyId);

        if (error) throw error;

        setWishlistIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
        toast.success('Removed from wishlist');
      } else {
        const { error } = await supabase
          .from('wishlists')
          .insert({ user_id: userId, property_id: propertyId });

        if (error) throw error;

        setWishlistIds(prev => new Set(prev).add(propertyId));
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  return { wishlistIds, toggleWishlist, loading };
};
