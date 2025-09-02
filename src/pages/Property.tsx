import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Bed, Bath, Square, Phone, Mail, Calendar, User } from "lucide-react";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useEffect } from "react";
import MapboxMap from "@/components/MapboxMap";
import AIChatBox from "@/components/AIChatBox";
import PropertyDatePicker from "@/components/PropertyDatePicker";
import villaMediterranean from "@/assets/property-villa-mediterranean.jpg";
import luxuryApartment from "@/assets/property-luxury-apartment.jpg";
import penthouse from "@/assets/property-penthouse.jpg";
import studio from "@/assets/property-studio.jpg";

const Property = () => {
  const { id } = useParams();
  const { t, currentLang } = useLanguage();
  
  useScrollToTop();

  // Re-render when language changes
  useEffect(() => {
    // Component will re-render when currentLang changes
  }, [currentLang]);

  // Mock property data - in real app, this would come from API
  const getPropertyData = () => {
    const baseData = {
      id: id,
      beds: 4,
      baths: 3,
      area: "280 m²",
      images: [
        villaMediterranean,
        luxuryApartment,
        penthouse,
        studio
      ],
      owner: {
        name: "Ahmed Benali",
        phone: "+213 555 123 456",
        email: "ahmed.benali@email.com"
      }
    };

    const getLocalizedFeatures = () => {
      return [
        t('privatePool'),
        t('landscapedGarden'),
        t('garage2Cars'),
        t('alarmSystem'),
        t('airConditioning'),
        t('equippedKitchen')
      ];
    };

    switch (currentLang) {
      case 'EN':
        return {
          ...baseData,
          title: "Mediterranean Villa",
          location: "Algiers, Hydra",
          price: "2,500,000 DA",
          type: "Villa",
          description: "Magnificent Mediterranean villa located in the prestigious district of Hydra. This exceptional property offers a luxurious living environment with stunning views of Algiers Bay. The villa features a large bright living room, a modern equipped kitchen, 4 spacious bedrooms and 3 bathrooms. The landscaped garden with private pool completes this exceptional property.",
          features: getLocalizedFeatures(),
          publishedDate: "March 15, 2024"
        };
      case 'AR':
        return {
          ...baseData,
          title: "فيلا متوسطية",
          location: "الجزائر، الحيدرة",
          price: "2,500,000 دج",
          type: "فيلا",
          description: "فيلا متوسطية رائعة تقع في حي الحيدرة المرموق. تقدم هذه الممتلكات الاستثنائية بيئة معيشية فاخرة مع إطلالات خلابة على خليج الجزائر. تتميز الفيلا بصالون كبير مضيء ومطبخ حديث مجهز و4 غرف نوم واسعة و3 حمامات. تكتمل هذه الممتلكات الاستثنائية بحديقة منسقة مع مسبح خاص.",
          features: getLocalizedFeatures(),
          publishedDate: "15 مارس 2024"
        };
      default: // FR
        return {
          ...baseData,
          title: "Villa Méditerranéenne",
          location: "Alger, Hydra",
          price: "2,500,000 DA",
          type: "Villa",
          description: "Magnifique villa méditerranéenne située dans le quartier prestigieux d'Hydra. Cette propriété exceptionnelle offre un cadre de vie luxueux avec une vue imprenable sur la baie d'Alger. La villa dispose d'un grand salon lumineux, d'une cuisine moderne équipée, de 4 chambres spacieuses et de 3 salles de bain. Le jardin paysager avec piscine privée complète cette propriété d'exception.",
          features: getLocalizedFeatures(),
          publishedDate: "15 Mars 2024"
        };
    }
  };

  const property = getPropertyData();

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
                        <span className="text-lg font-inter">{property.location}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg px-3 py-1 font-inter">{property.type}</Badge>
                  </div>
                  <div className="text-4xl font-bold text-primary font-playfair">{property.price}</div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg mb-6">
                    <div className="flex items-center text-center">
                      <Bed className="w-6 h-6 mr-2 text-primary" />
                      <div>
                        <div className="font-semibold font-inter">{property.beds}</div>
                        <div className="text-sm text-muted-foreground font-inter">{t('chambers')}</div>
                      </div>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div className="flex items-center text-center">
                      <Bath className="w-6 h-6 mr-2 text-primary" />
                      <div>
                        <div className="font-semibold font-inter">{property.baths}</div>
                        <div className="text-sm text-muted-foreground font-inter">{t('bathrooms')}</div>
                      </div>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div className="flex items-center text-center">
                      <Square className="w-6 h-6 mr-2 text-primary" />
                      <div>
                        <div className="font-semibold font-inter">{property.area}</div>
                        <div className="text-sm text-muted-foreground font-inter">{t('areaField')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold font-playfair">{t('descriptionField')}</h3>
                    <p className="text-muted-foreground leading-relaxed font-inter">{property.description}</p>
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
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center p-3 bg-muted/50 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                        <span className="text-sm font-inter">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Map */}
              <MapboxMap 
                location={property.location}
                address="Quartier Hydra, proche des commodités et transports"
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Date Picker for Short Stay */}
              <PropertyDatePicker 
                onDateChange={(dates) => console.log("Selected dates:", dates)}
              />

              {/* Contact Owner */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center font-playfair">
                    <User className="w-5 h-5 mr-2" />
                    {t('contactOwner')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 font-inter">{property.owner.name}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground font-inter">
                        <Phone className="w-4 h-4 mr-2" />
                        {property.owner.phone}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground font-inter">
                        <Mail className="w-4 h-4 mr-2" />
                        {property.owner.email}
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <Button className="w-full bg-gradient-primary hover:shadow-elegant font-inter">
                      <Phone className="w-4 h-4 mr-2" />
                      {t('callBtn')}
                    </Button>
                    <Button variant="outline" className="w-full font-inter">
                      <Mail className="w-4 h-4 mr-2" />
                      {t('sendMessageBtn')}
                    </Button>
                  </div>
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
                    <span className="font-medium font-inter">{property.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-inter">{t('publishedOn')}</span>
                    <span className="font-medium font-inter">{property.publishedDate}</span>
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
    </div>
  );
};

export default Property;