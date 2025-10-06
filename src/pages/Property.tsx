import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Bed, Bath, Square, Phone, Mail, Calendar, User } from "lucide-react";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useEffect, useState } from "react";
import StaticPropertyMap from "@/components/StaticPropertyMap";
import AIChatBox from "@/components/AIChatBox";
import PropertyDatePicker from "@/components/PropertyDatePicker";
import { PaymentButton } from "@/components/PaymentButton";
import { BookingModal } from "@/components/BookingModal";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import ScheduleVisitModal from "@/components/ScheduleVisitModal";
import MessageOwnerModal from "@/components/MessageOwnerModal";
import { PropertyReviews } from "@/components/PropertyReviews";

interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  district?: string;
  full_address?: string;
  price: string;
  price_type: string;
  category: string;
  bedrooms?: string;
  bathrooms?: string;
  area: string;
  images: string[];
  property_type: string;
  features?: any;
  description?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  created_at: string;
  user_id?: string;
  commission_rate?: number;
  check_in_time?: string;
  check_out_time?: string;
}

const Property = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { formatPrice, currentCurrency } = useCurrency();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{ checkIn: Date | undefined; checkOut: Date | undefined }>({
    checkIn: undefined,
    checkOut: undefined
  });
  
  useScrollToTop();

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching property:', error);
        setError('Property not found');
        return;
      }

      if (!data) {
        setError('Property not found');
        return;
      }

      // Check if user owns this property to show contact info
      const { data: { user } } = await supabase.auth.getUser();
      const isOwner = user && user.id === data.user_id;
      
      // For security, only show contact info if user owns the property
      if (!isOwner) {
        setProperty({
          ...data,
          contact_name: undefined,
          contact_email: undefined,
          contact_phone: undefined
        });
      } else {
        setProperty(data);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      setError('Failed to load property');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove the old formatPrice function as we now use useCurrency hook

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">{t('loading')}</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">{t('propertyNotFound') || 'Property not found'}</h1>
            <p className="text-muted-foreground">{error || 'The requested property could not be found.'}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Images Gallery */}
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={property.images[0]} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {property.images.slice(1).map((image, index) => (
                    <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                      <img 
                        src={image} 
                        alt={`${property.title} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Property Info */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                     <div>
                       <CardTitle className="text-3xl mb-2 font-playfair">{property.title}</CardTitle>
                       <div className="flex items-center text-muted-foreground mb-2">
                         <MapPin className="w-5 h-5 mr-2" />
                         <span className="text-lg font-inter">{property.city}, {property.location}</span>
                       </div>
                     </div>
                     <Badge variant="secondary" className="text-lg px-3 py-1 font-inter">{t(`property${property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}`) || property.property_type}</Badge>
                   </div>
                   <div className="text-4xl font-bold text-primary font-playfair">{formatPrice(property.price, property.price_type)}</div>
                </CardHeader>
                <CardContent>
                   <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg mb-6">
                     {property.bedrooms && (
                       <>
                         <div className="flex items-center text-center">
                           <Bed className="w-6 h-6 mr-2 text-primary" />
                           <div>
                             <div className="font-semibold font-inter">{property.bedrooms}</div>
                             <div className="text-sm text-muted-foreground font-inter">{t('chambers')}</div>
                           </div>
                         </div>
                         <Separator orientation="vertical" className="h-12" />
                       </>
                     )}
                     {property.bathrooms && (
                       <>
                         <div className="flex items-center text-center">
                           <Bath className="w-6 h-6 mr-2 text-primary" />
                           <div>
                             <div className="font-semibold font-inter">{property.bathrooms}</div>
                             <div className="text-sm text-muted-foreground font-inter">{t('bathrooms')}</div>
                           </div>
                         </div>
                         <Separator orientation="vertical" className="h-12" />
                       </>
                     )}
                     <div className="flex items-center text-center">
                       <Square className="w-6 h-6 mr-2 text-primary" />
                       <div>
                         <div className="font-semibold font-inter">{property.area} {t('areaUnit')}</div>
                         <div className="text-sm text-muted-foreground font-inter">{t('areaField')}</div>
                       </div>
                     </div>
                   </div>

                   <div className="space-y-4">
                     <h3 className="text-xl font-semibold font-playfair">{t('descriptionField')}</h3>
                     <p className="text-muted-foreground leading-relaxed font-inter">{property.description}</p>
                     
                     {/* Check-in/Check-out times for short-stay */}
                     {property.category === 'short-stay' && (property.check_in_time || property.check_out_time) && (
                       <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                         <h4 className="text-lg font-semibold font-playfair mb-3">Check-in & Check-out</h4>
                         <div className="grid grid-cols-2 gap-4">
                           {property.check_in_time && (
                             <div>
                               <p className="text-sm text-muted-foreground font-inter">Check-in</p>
                               <p className="text-base font-semibold font-inter">
                                 {property.check_in_time.substring(0, 5)}
                               </p>
                             </div>
                           )}
                           {property.check_out_time && (
                             <div>
                               <p className="text-sm text-muted-foreground font-inter">Check-out</p>
                               <p className="text-base font-semibold font-inter">
                                 {property.check_out_time.substring(0, 5)}
                               </p>
                             </div>
                           )}
                         </div>
                       </div>
                     )}
                   </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">{t('characteristics')}</CardTitle>
                </CardHeader>
                 <CardContent>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                     {property.features && Object.entries(property.features).map(([key, value]) => (
                       value && (
                         <div key={key} className="flex items-center p-3 bg-muted/50 rounded-lg">
                           <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                           <span className="text-sm font-inter">{t(key) || key}</span>
                         </div>
                       )
                     ))}
                   </div>
                 </CardContent>
               </Card>
                 {/* Map */}
                 <StaticPropertyMap 
                   location={`${property.city}, ${property.location}`}
                   address={property.full_address || `${property.city}, ${property.location}`}
                 />
                
                {/* Reviews Section - Only for Short Stay */}
                {property.category === 'short-stay' && property.user_id && (
                  <PropertyReviews 
                    propertyId={property.id}
                    hostUserId={property.user_id}
                  />
                )}
             </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Booking/Visit Section */}
              {property.category === 'short-stay' ? (
                <div className="space-y-4">
                  <PropertyDatePicker 
                    propertyId={property.id}
                    onDateChange={(dates) => setSelectedDates(dates)}
                  />
                  
                  {/* Price Breakdown Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-playfair">Price details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(() => {
                        // Calculate pricing
                        const basePrice = Number(property.price) || 0;
                        let dailyPrice = basePrice;
                        
                        // Convert monthly/weekly price to nightly when short-stay
                        if (property.price_type === 'monthly') {
                          dailyPrice = basePrice / 30.44;
                        } else if (property.price_type === 'weekly') {
                          dailyPrice = basePrice / 7;
                        }
                        
                        // Calculate nights from selected dates, default to 2 for display
                        let nights = 2;
                        if (selectedDates.checkIn && selectedDates.checkOut) {
                          const timeDiff = selectedDates.checkOut.getTime() - selectedDates.checkIn.getTime();
                          nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        }
                        
                        const subtotal = dailyPrice * nights;
                        // Commission rate from property (stored as decimal, e.g., 0.12 for 12%)
                        const commissionRate = Number(property.commission_rate) || 0.15;
                        const taxes = Math.round(subtotal * commissionRate * 100) / 100;
                        const total = subtotal + taxes;
                        
                        return (
                          <>
                            <div className="flex justify-between text-sm font-inter">
                              <span className="text-muted-foreground">
                                {nights} nights × {formatPrice(dailyPrice)}
                              </span>
                              <span className="font-medium">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-inter">
                              <span className="text-muted-foreground">Taxes</span>
                              <span className="font-medium">{formatPrice(taxes)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold font-inter">
                              <span>Total</span>
                              <span>{formatPrice(total)}</span>
                            </div>
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-sm font-inter text-primary"
                              onClick={() => {/* Could open detailed breakdown modal */}}
                            >
                              Price breakdown
                            </Button>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <BookingModal 
                        property={{
                          id: property.id,
                          title: property.title,
                          price: property.price,
                          price_type: property.price_type,
                          category: property.category
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              ) : property.category === 'sale' ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-playfair">
                      {t('purchaseProperty') || 'Purchase Property'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {t('purchaseDescription') || 'Interested in purchasing this property? Pay earnest money to secure your offer.'}
                    </p>
                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-gradient-primary hover:shadow-elegant"
                        onClick={() => setIsScheduleModalOpen(true)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        {t('scheduleVisit') || 'Schedule Visit'}
                      </Button>
                      {(() => {
                        // Calculate earnest money as 5% of property price in EUR
                        const propertyPrice = parseFloat(property.price.replace(/[^0-9.-]+/g,"")) || 0;
                        const earnestMoneyAmount = Math.round(propertyPrice * 0.05 * 100) / 100; // 5% earnest money
                        
                        return (
                          <PaymentButton
                            propertyId={property.id}
                            paymentType="earnest_money"
                            amount={earnestMoneyAmount}
                            currency={currentCurrency}
                            description={`Earnest money for ${property.title}`}
                            className="w-full"
                          >
                            Pay Earnest Money ({formatPrice(earnestMoneyAmount)})
                          </PaymentButton>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-playfair">
                      {t('scheduleVisit') || 'Schedule Property Visit'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {t('scheduleVisitDescription') || 'Schedule a visit to see this property in person'}
                    </p>
                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-gradient-primary hover:shadow-elegant"
                        onClick={() => setIsScheduleModalOpen(true)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        {t('scheduleVisit') || 'Schedule Visit'}
                      </Button>
                      {(() => {
                        // Calculate security deposit as 20% of property price in EUR
                        const propertyPrice = parseFloat(property.price.replace(/[^0-9.-]+/g,"")) || 0;
                        const securityDepositAmount = Math.round(propertyPrice * 0.2 * 100) / 100; // 20% security deposit
                        
                        return (
                          <PaymentButton
                            propertyId={property.id}
                            paymentType="security_deposit"
                            amount={securityDepositAmount}
                            currency={currentCurrency}
                            description={`Security deposit for ${property.title}`}
                            className="w-full"
                          >
                            Pay Security Deposit ({formatPrice(securityDepositAmount)})
                          </PaymentButton>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Owner */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center font-playfair">
                    <User className="w-5 h-5 mr-2" />
                    {t('contactOwner')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.contact_name ? (
                    // Show contact details for property owners
                    <>
                      <div>
                        <h4 className="font-semibold mb-2 font-inter">{property.contact_name}</h4>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground font-inter">
                            <Phone className="w-4 h-4 mr-2" />
                            {property.contact_phone}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground font-inter">
                            <Mail className="w-4 h-4 mr-2" />
                            {property.contact_email}
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        <Button className="w-full bg-gradient-primary hover:shadow-elegant font-inter">
                          <Phone className="w-4 h-4 mr-2" />
                          {t('callBtn')}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full font-inter"
                          onClick={() => setIsMessageModalOpen(true)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          {t('sendMessageBtn')}
                        </Button>
                      </div>
                    </>
                  ) : (
                    // Secure contact interface for public users
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground font-inter">
                        {t('secureContactDescription') || 'Send a secure message to the property owner. Your contact information will only be shared if the owner responds.'}
                      </p>
                      <Button 
                        className="w-full bg-gradient-primary hover:shadow-elegant font-inter"
                        onClick={() => setIsMessageModalOpen(true)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        {t('contactOwnerSecure') || 'Contact Owner Securely'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Property Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">{t('listingDetails')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-inter">{t('reference')}</span>
                    <span className="font-medium font-inter">BK-{property.id}</span>
                  </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground font-inter">{t('typeField')}</span>
                     <span className="font-medium font-inter">{t(property.property_type) || property.property_type}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground font-inter">{t('publishedOn')}</span>
                     <span className="font-medium font-inter">{formatDate(property.created_at)}</span>
                   </div>
                  <Separator />
                  <div className="flex items-center text-sm text-muted-foreground font-inter">
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('lastUpdated')}: {t('daysAgo')}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <AIChatBox />
      
      {/* Modals */}
      {property && (
        <>
          <ScheduleVisitModal
            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            propertyTitle={property.title}
          />
          <MessageOwnerModal
            isOpen={isMessageModalOpen}
            onClose={() => setIsMessageModalOpen(false)}
            ownerName={property.contact_name || 'Property Owner'}
            ownerEmail={property.contact_email || ''}
            propertyTitle={property.title}
            propertyId={property.id}
            isSecureMode={!property.contact_name}
          />
        </>
      )}
    </div>
  );
};

export default Property;