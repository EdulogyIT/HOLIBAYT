import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scale, User, MapPin, Briefcase, Phone, Mail, Search, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { LawyerRequestDialog } from "@/components/LawyerRequestDialog";
import { toast } from "sonner";

interface Lawyer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  specializations: string[];
  city: string;
  experience_years: number;
  profile_photo_url: string | null;
  bio: string | null;
  consultation_fee: number;
}

const Lawyers = () => {
  const { user } = useAuth();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLawyerId, setSelectedLawyerId] = useState<string>("");

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      const { data, error } = await supabase
        .from("lawyers")
        .select("*")
        .eq("verified", true)
        .order("experience_years", { ascending: false });

      if (error) throw error;
      setLawyers(data || []);
    } catch (error) {
      console.error("Error fetching lawyers:", error);
      toast.error("Failed to load lawyers");
    } finally {
      setLoading(false);
    }
  };

  const filteredLawyers = lawyers.filter((lawyer) => {
    const matchesSearch =
      lawyer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lawyer.specializations.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCity = cityFilter === "all" || lawyer.city === cityFilter;
    const matchesSpecialization =
      specializationFilter === "all" ||
      lawyer.specializations.includes(specializationFilter);

    return matchesSearch && matchesCity && matchesSpecialization;
  });

  const cities = Array.from(new Set(lawyers.map((l) => l.city)));
  const allSpecializations = Array.from(
    new Set(lawyers.flatMap((l) => l.specializations))
  );

  const handleRequestContact = (lawyerId: string) => {
    if (!user) {
      toast.error("Please log in to request lawyer contact");
      return;
    }
    setSelectedLawyerId(lawyerId);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-2xl mb-4">
            <Scale className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-playfair font-bold text-foreground mb-4">
            Legal Professionals Directory
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with verified legal experts specializing in Algerian real estate law
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search lawyers or specializations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Specializations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {allSpecializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lawyers Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading lawyers...</p>
          </div>
        ) : filteredLawyers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLawyers.map((lawyer) => (
              <Card key={lawyer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {lawyer.profile_photo_url ? (
                        <img
                          src={lawyer.profile_photo_url}
                          alt={lawyer.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{lawyer.full_name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Briefcase className="h-3 w-3" />
                        {lawyer.experience_years}+ years
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{lawyer.city}</span>
                  </div>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-2">
                    {lawyer.specializations.map((spec, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>

                  {/* Bio */}
                  {lawyer.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {lawyer.bio}
                    </p>
                  )}

                  {/* Consultation Fee */}
                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">Consultation Fee</div>
                    <div className="text-lg font-semibold text-primary">
                      {lawyer.consultation_fee.toLocaleString()} DZD
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full"
                    onClick={() => handleRequestContact(lawyer.id)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Request Contact
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Scale className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Lawyers Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search filters
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />

      {selectedLawyerId && (
        <LawyerRequestDialog
          propertyId={selectedPropertyId}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </div>
  );
};

export default Lawyers;