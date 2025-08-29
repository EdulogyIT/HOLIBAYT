import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import PublishPropertySteps from "@/components/PublishPropertySteps";

const PublishProperty = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  useScrollToTop();

  const handleSubmit = (formData: any) => {
    toast({
      title: t('propertyPublished'),
      description: t('propertySubmittedSuccess'),
    });
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

          <PublishPropertySteps onSubmit={handleSubmit} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublishProperty;