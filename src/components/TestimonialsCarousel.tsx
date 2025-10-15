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

  if (testimonials.length === 0) {
    return null;
  }

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
            {testimonials.map((testimonial, index) => (
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
