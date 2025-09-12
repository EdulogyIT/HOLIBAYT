import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Star, MessageCircle } from "lucide-react";

const Bookings = () => {
  useScrollToTop();

  // Mock booking data - replace with actual data later
  const upcomingBookings = [
    {
      id: 1,
      property: "Luxury Villa in Sidi Fredj",
      host: "Ahmed Benali",
      checkIn: "2024-03-15",
      checkOut: "2024-03-20",
      guests: 4,
      status: "confirmed",
      image: "/src/assets/property-villa-mediterranean.jpg",
      location: "Algiers, Algeria"
    },
    {
      id: 2,
      property: "Modern Apartment Downtown",
      host: "Fatima Zerrouki", 
      checkIn: "2024-04-01",
      checkOut: "2024-04-05",
      guests: 2,
      status: "pending",
      image: "/src/assets/property-modern-apartment.jpg",
      location: "Oran, Algeria"
    }
  ];

  const pastBookings = [
    {
      id: 3,
      property: "Seaside Studio",
      host: "Karim Mokhtar",
      checkIn: "2024-01-10", 
      checkOut: "2024-01-15",
      guests: 2,
      status: "completed",
      rating: 5,
      image: "/src/assets/property-studio.jpg",
      location: "Annaba, Algeria"
    },
    {
      id: 4,
      property: "Traditional House",
      host: "Amina Bouazza",
      checkIn: "2023-12-20",
      checkOut: "2023-12-25", 
      guests: 6,
      status: "completed",
      rating: 4,
      image: "/src/assets/property-traditional-house.jpg",
      location: "Constantine, Algeria"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const BookingCard = ({ booking, isPast = false }: { booking: any; isPast?: boolean }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="md:flex">
        <div className="md:w-1/3">
          <img 
            src={booking.image} 
            alt={booking.property}
            className="w-full h-48 md:h-full object-cover"
          />
        </div>
        <div className="md:w-2/3 p-6">
          <CardHeader className="p-0 mb-4">
            <div className="flex justify-between items-start mb-2">
              <CardTitle className="text-lg font-semibold">{booking.property}</CardTitle>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>
            <CardDescription className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {booking.location}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0 space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              {booking.checkIn} - {booking.checkOut}
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Host: </span>
              <span className="font-medium">{booking.host}</span>
            </div>

            {isPast && booking.rating && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm font-medium">{booking.rating}/5</span>
                <span className="text-sm text-muted-foreground ml-2">Your rating</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {!isPast && (
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              )}
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-1" />
                Message Host
              </Button>
              {isPast && !booking.rating && (
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4 mr-1" />
                  Rate Stay
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 font-playfair">My Bookings</h1>
            <p className="text-lg text-muted-foreground font-inter">
              Manage your reservations and past stays
            </p>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
              <TabsTrigger value="past">Past Stays ({pastBookings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No upcoming trips</h3>
                    <p className="text-muted-foreground mb-4">
                      Ready to start planning your next adventure?
                    </p>
                    <Button>Browse Properties</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastBookings.length > 0 ? (
                pastBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} isPast />
                ))
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No past stays yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Your completed bookings will appear here
                    </p>
                    <Button>Start Exploring</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Bookings;