import { useEffect, useState } from "react";
import { HostAdCard } from "./HostAdCard";
import { HostAdModal } from "./HostAdModal";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Host {
  id: string;
  name: string;
  avatar_url?: string;
  average_rating: number;
  total_reviews: number;
  is_superhost: boolean;
  hosting_since?: string;
}

export const HostAdsCarousel = () => {
  const { t } = useLanguage();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchHostAds();
  }, []);

  const fetchHostAds = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, average_rating, total_reviews, is_superhost, hosting_since")
        .eq("has_host_ad", true)
        .order("is_superhost", { ascending: false })
        .order("average_rating", { ascending: false })
        .limit(10);

      if (error) throw error;
      setHosts(data || []);
    } catch (error) {
      console.error("Error fetching host ads:", error);
    }
  };

  const calculateYearsHosting = (hostingSince?: string) => {
    if (!hostingSince) return 0;
    const years = new Date().getFullYear() - new Date(hostingSince).getFullYear();
    return Math.max(0, years);
  };

  const handleHostClick = (hostId: string) => {
    setSelectedHostId(hostId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHostId(null);
  };

  if (hosts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 md:px-8 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            {t("Meet Our Featured Hosts") || "Meet Our Featured Hosts"}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("Discover properties from verified and experienced hosts") ||
              "Discover properties from verified and experienced hosts"}
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {hosts.map((host) => (
              <CarouselItem key={host.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <HostAdCard
                  hostId={host.id}
                  name={host.name || "Host"}
                  avatarUrl={host.avatar_url}
                  averageRating={host.average_rating || 0}
                  totalReviews={host.total_reviews || 0}
                  isSuperhost={host.is_superhost || false}
                  yearsHosting={calculateYearsHosting(host.hosting_since)}
                  onClick={() => handleHostClick(host.id)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>

      {selectedHostId && (
        <HostAdModal
          hostId={selectedHostId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
};
