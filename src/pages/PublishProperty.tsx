import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Upload, X } from "lucide-react";

const PublishProperty = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  useScrollToTop();
  const [formData, setFormData] = useState({
    // Property Type
    category: "", // For Sale, For Rent, Short Stay
    
    // Basic Information
    title: "",
    propertyCategory: "", // Villa, Apartment, etc.
    location: "",
    city: "",
    district: "",
    fullAddress: "",
    
    // Property Details
    bedrooms: "",
    bathrooms: "",
    area: "",
    floor: "",
    
    // Pricing
    price: "",
    priceType: "", // Per month, Per night, etc.
    
    // Features & Amenities
    features: {
      parking: false,
      swimmingPool: false,
      garden: false,
      balcony: false,
      elevator: false,
      security: false,
      furnished: false,
      airConditioning: false,
      gym: false,
    },
    
    // Description
    description: "",
    
    // Contact Information
    fullName: "",
    phoneNumber: "",
    email: "",
  });

  const [images, setImages] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t('propertyPublished'),
      description: t('propertySubmittedSuccess'),
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.startsWith('features.')) {
      const featureKey = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        features: {
          ...prev.features,
          [featureKey]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles].slice(0, 10)); // Max 10 images
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Property Type */}
            <Card>
              <CardHeader>
                <CardTitle>{t('propertyTypeTranslation')}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sale" id="sale" />
                    <Label htmlFor="sale">{t('forSale')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rent" id="rent" />
                    <Label htmlFor="rent">{t('forRent')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="short-stay" id="short-stay" />
                    <Label htmlFor="short-stay">{t('shortStayRent')}</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('basicInformation')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">{t('propertyTitleField')}</Label>
                  <Input
                    id="title"
                    placeholder={t('propertyTitlePlaceholder')}
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyCategory">{t('categoryField')}</Label>
                  <Select value={formData.propertyCategory} onValueChange={(value) => handleInputChange("propertyCategory", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="villa">{t('villa')}</SelectItem>
                      <SelectItem value="appartement">{t('apartment')}</SelectItem>
                      <SelectItem value="studio">{t('studio')}</SelectItem>
                      <SelectItem value="duplex">{t('duplex')}</SelectItem>
                      <SelectItem value="terrain">{t('land')}</SelectItem>
                      <SelectItem value="hotel">{t('hotel')}</SelectItem>
                      <SelectItem value="guesthouse">{t('guesthouse')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">{t('locationField')}</Label>
                    <Input
                      id="location"
                      placeholder="Ex: Alger"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{t('cityField')}</Label>
                    <Input
                      id="city"
                      placeholder="Ex: Alger"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">{t('district')}</Label>
                  <Input
                    id="district"
                    placeholder="Ex: Hydra"
                    value={formData.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullAddress">{t('fullAddress')}</Label>
                  <Textarea
                    id="fullAddress"
                    placeholder={t('fullAddress')}
                    value={formData.fullAddress}
                    onChange={(e) => handleInputChange("fullAddress", e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t('propertyDetailsTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">{t('chambers')}</Label>
                    <Select value={formData.bedrooms} onValueChange={(value) => handleInputChange("bedrooms", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('numberField')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5+">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">{t('bathrooms')}</Label>
                    <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange("bathrooms", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('numberField')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4+">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">{t('areaField')}</Label>
                    <Input
                      id="area"
                      placeholder="Ex: 120"
                      value={formData.area}
                      onChange={(e) => handleInputChange("area", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floor">{t('floorField')}</Label>
                    <Input
                      id="floor"
                      placeholder={t('floorExample')}
                      value={formData.floor}
                      onChange={(e) => handleInputChange("floor", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>{t('pricing')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">{t('priceDZD')}</Label>
                    <Input
                      id="price"
                      placeholder={t('priceExample')}
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priceType">{t('priceTypeField')}</Label>
                    <Select value={formData.priceType} onValueChange={(value) => handleInputChange("priceType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectCategory')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="total">{t('totalPrice')}</SelectItem>
                        <SelectItem value="monthly">{t('monthlyPrice')}</SelectItem>
                        <SelectItem value="daily">{t('dailyPrice')}</SelectItem>
                        <SelectItem value="weekly">{t('weeklyPrice')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features & Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>{t('featuresAmenities')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries({
                    parking: t('parkingFeature'),
                    swimmingPool: t('swimmingPoolFeature'),
                    garden: t('gardenFeature'),
                    balcony: t('balconyFeature'),
                    elevator: t('elevatorFeature'),
                    security: t('securityFeature'),
                    furnished: t('furnishedFeature'),
                    airConditioning: t('airConditioningFeature'),
                    gym: t('gymFeature')
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={formData.features[key as keyof typeof formData.features]}
                        onCheckedChange={(checked) => handleInputChange(`features.${key}`, checked)}
                      />
                      <Label htmlFor={key}>{label}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>{t('descriptionField')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="description">{t('detailedDescription')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('describeProperty')}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('contactInformationTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t('fullNameField')}</Label>
                    <Input
                      id="fullName"
                      placeholder={t('yourFullName')}
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">{t('phoneNumberField')}</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="+213 555 123 456"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>{t('propertyPhotos')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <div className="text-lg font-medium text-foreground mb-2">
                      {t('uploadPhotos')}
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {t('dragDropImages')}
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      {t('selectImages')}
                    </Button>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">{t('cancel')}</Button>
              <Button type="submit" className="bg-gradient-primary hover:shadow-elegant">
                {t('publishPropertyBtn')}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublishProperty;