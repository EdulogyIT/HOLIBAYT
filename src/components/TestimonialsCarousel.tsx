import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Testimonial {
  id: string;
  client_name: string;
  client_location: string;
  review_text: string;
  rating: number;
  avatar_initials: string;
}

// Fallback testimonials in French (default language)
const fallbackTestimonials: Testimonial[] = [
  {
    id: 'dummy-1',
    client_name: 'Amina Benali',
    client_location: 'Alger, Algérie',
    review_text: 'Service exceptionnel ! J\'ai trouvé mon appartement idéal en quelques jours. L\'équipe est très professionnelle et à l\'écoute.',
    rating: 5,
    avatar_initials: 'AB'
  },
  {
    id: 'dummy-2',
    client_name: 'Karim Meziane',
    client_location: 'Oran, Algérie',
    review_text: 'Plateforme très intuitive et moderne. La recherche par zone facilite vraiment les choses. Je recommande vivement !',
    rating: 5,
    avatar_initials: 'KM'
  },
  {
    id: 'dummy-3',
    client_name: 'Sarah Khaled',
    client_location: 'Constantine, Algérie',
    review_text: 'Excellente expérience pour notre location saisonnière. Paiement sécurisé et communication fluide avec le propriétaire.',
    rating: 5,
    avatar_initials: 'SK'
  },
  {
    id: 'dummy-4',
    client_name: 'Mohamed Amrani',
    client_location: 'Annaba, Algérie',
    review_text: 'J\'ai acheté ma première maison grâce à Holibayt. Les outils de recherche sont puissants et le support est top.',
    rating: 5,
    avatar_initials: 'MA'
  },
  {
    id: 'dummy-5',
    client_name: 'Lina Bouchama',
    client_location: 'Béjaïa, Algérie',
    review_text: 'En tant que propriétaire, je trouve la plateforme très pratique. La gestion des réservations est simple et efficace.',
    rating: 5,
    avatar_initials: 'LB'
  },
  {
    id: 'dummy-6',
    client_name: 'Yacine Boudiaf',
    client_location: 'Tizi Ouzou, Algérie',
    review_text: 'La transparence des prix et la variété des options disponibles font de Holibayt mon premier choix pour l\'immobilier.',
    rating: 5,
    avatar_initials: 'YB'
  }
];

const TestimonialsCarousel = () => {
  const { t } = useLanguage();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('client_reviews')
        .select('*')
        .eq('approved', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  // Use database testimonials if available, otherwise use fallback
  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials;

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
            {t('testimonialsTitle') || 'What Our Clients Say'}
          </h2>
          <p className="text-lg text-muted-foreground font-inter font-light max-w-2xl mx-auto">
            {t('testimonialsSubtitle') || 'Join thousands of satisfied users who trust Holibayt for their real estate needs'}
          </p>
        </div>

        {/* Testimonials Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent>
            {displayTestimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="h-full border-2 border-border hover:border-primary/30 hover:shadow-elegant transition-all duration-300">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Quote Icon */}
                      <Quote className="h-8 w-8 text-primary/20 mb-4" />
                      
                      {/* Rating */}
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>

                      {/* Testimonial Text */}
                      <p className="text-sm text-muted-foreground font-inter leading-relaxed mb-6 flex-grow">
                        "{testimonial.review_text}"
                      </p>

                      {/* Author Info */}
                      <div className="flex items-center gap-3 pt-4 border-t border-border">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-inter font-semibold">
                          {testimonial.avatar_initials}
                        </div>
                        <div>
                          <p className="font-inter font-semibold text-sm text-foreground">{testimonial.client_name}</p>
                          <p className="font-inter text-xs text-muted-foreground">{testimonial.client_location}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
