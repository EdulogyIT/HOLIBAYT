import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import PublishPropertySteps from "@/components/PublishPropertySteps";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const PublishProperty = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useScrollToTop();

  const handleSubmit = async (formData: any, images: File[]) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to publish a property.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first
      const imageUrls: string[] = [];
      
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          continue;
        }

        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(uploadData.path);
          imageUrls.push(publicUrl);
        }
      }

      // Create property record
      const { error: insertError } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          category: formData.category,
          property_type: formData.propertyCategory,
          title: formData.title,
          location: formData.location,
          city: formData.city,
          district: formData.district || null,
          full_address: formData.fullAddress || null,
          bedrooms: formData.bedrooms || null,
          bathrooms: formData.bathrooms || null,
          area: formData.area,
          floor_number: formData.floor || null,
          price: formData.price,
          price_type: formData.priceType,
          features: formData.features,
          description: formData.description || null,
          contact_name: formData.fullName,
          contact_phone: formData.phoneNumber,
          contact_email: formData.email,
          images: imageUrls,
          status: 'active'
        });

      if (insertError) {
        console.error('Property insertion error:', insertError);
        toast({
          title: "Error",
          description: "Failed to publish property. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: t('propertyPublished'),
        description: t('propertySubmittedSuccess'),
      });

      // Navigate to the appropriate category page
      const categoryRoutes = {
        'sale': '/buy',
        'rent': '/rent',
        'short-stay': '/short-stay'
      };
      navigate(categoryRoutes[formData.category as keyof typeof categoryRoutes] || '/');

    } catch (error) {
      console.error('Property submission error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 font-playfair">{t('publishProperty')}</h1>
            <p className="text-lg text-muted-foreground font-inter">{t('addPropertyDetails')}</p>
          </div>

          <PublishPropertySteps onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublishProperty;