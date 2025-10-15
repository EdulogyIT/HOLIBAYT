import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Upload, X, Check, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FormData {
  // Property Type
  category: string;
  
  // Basic Information
  title: string;
  propertyCategory: string;
  location: string;
  city: string;
  district: string;
  fullAddress: string;
  
  // Property Details
  bedrooms: string;
  bathrooms: string;
  area: string;
  floor: string;
  price: string;
  priceType: string;
  priceCurrency: string;
  checkInTime: string;
  checkOutTime: string;
  features: {
    parking: boolean;
    swimmingPool: boolean;
    garden: boolean;
    balcony: boolean;
    elevator: boolean;
    security: boolean;
    furnishedStatus: string;
    airConditioning: boolean;
    gym: boolean;
    petsAllowed: boolean;
  };
  description: string;
  
  // Fees Configuration
  fees: {
    cleaningFee: {enabled: boolean; amount: number};
    serviceFee: {enabled: boolean; amount: number};
  };
  
  // Contact Information
  fullName: string;
  phoneNumber: string;
  email: string;
  
  // Policies & Rules (Step 5)
  cancellationPolicy: string;
  houseRules: {
    smokingAllowed: boolean;
    petsAllowed: boolean;
    eventsAllowed: boolean;
    quietHours: string;
  };
  safetyFeatures: {
    smokeAlarm: boolean;
    carbonMonoxideAlarm: boolean;
    firstAidKit: boolean;
    fireExtinguisher: boolean;
    securityCameras: boolean;
  };
}

interface PublishPropertyStepsProps {
  onSubmit: (data: FormData, images: File[]) => void;
  isSubmitting?: boolean;
}

const PublishPropertySteps = ({ onSubmit, isSubmitting = false }: PublishPropertyStepsProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    category: "",
    title: "",
    propertyCategory: "",
    location: "",
    city: "",
    district: "",
    fullAddress: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    floor: "",
    price: "",
    priceType: "",
    priceCurrency: "EUR",
    checkInTime: "15:00",
    checkOutTime: "11:00",
    features: {
      parking: false,
      swimmingPool: false,
      garden: false,
      balcony: false,
      elevator: false,
      security: false,
      furnishedStatus: "unfurnished",
      airConditioning: false,
      gym: false,
      petsAllowed: false,
    },
    description: "",
    fees: {
      cleaningFee: { enabled: false, amount: 0 },
      serviceFee: { enabled: false, amount: 0 },
    },
    fullName: "",
    phoneNumber: "",
    email: "",
    cancellationPolicy: "moderate",
    houseRules: {
      smokingAllowed: false,
      petsAllowed: false,
      eventsAllowed: false,
      quietHours: "22:00-08:00",
    },
    safetyFeatures: {
      smokeAlarm: false,
      carbonMonoxideAlarm: false,
      firstAidKit: false,
      fireExtinguisher: false,
      securityCameras: false,
    },
  });
  
  // Auto-save to localStorage every 30 seconds
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    const draftKey = `holibayt_property_draft_${userId}`;
    
    // Restore draft on mount
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(draft.formData);
        setCurrentStep(draft.currentStep || 1);
        toast({ title: "Draft restored", description: "Your previous progress was restored" });
      } catch (error) {
        console.error('Error restoring draft:', error);
      }
    }

    // Auto-save interval
    const interval = setInterval(() => {
      if (formData.category || formData.title) {
        localStorage.setItem(draftKey, JSON.stringify({ formData, currentStep }));
        console.log('Property draft auto-saved');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, currentStep, toast]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    if (field.startsWith('features.')) {
      const featureKey = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        features: {
          ...prev.features,
          [featureKey]: value
        }
      }));
    } else if (field.startsWith('fees.')) {
      const parts = field.split('.');
      const feeType = parts[1]; // cleaningFee or serviceFee
      const prop = parts[2]; // enabled or amount
      setFormData(prev => ({
        ...prev,
        fees: {
          ...prev.fees,
          [feeType]: {
            ...prev.fees[feeType as keyof typeof prev.fees],
            [prop]: value
          }
        }
      }));
    } else if (field.startsWith('houseRules.')) {
      const ruleKey = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        houseRules: {
          ...prev.houseRules,
          [ruleKey]: value
        }
      }));
    } else if (field.startsWith('safetyFeatures.')) {
      const featureKey = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        safetyFeatures: {
          ...prev.safetyFeatures,
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
      setImages(prev => [...prev, ...newFiles].slice(0, 10));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Validation functions for each step
  const isStep1Valid = () => formData.category !== "";
  
  const isStep2Valid = () => 
    formData.title !== "" && 
    formData.propertyCategory !== "" && 
    formData.location !== "" && 
    formData.city !== "";
  
  const isStep3Valid = () => 
    formData.area !== "" && 
    formData.price !== "" && 
    formData.priceType !== "";
  
  const isStep4Valid = () => 
    formData.fullName !== "" && 
    formData.phoneNumber !== "" && 
    formData.email !== "";
  
  const isStep5Valid = () => true; // Step 5 has no required fields

  const handleNext = () => {
    const validations = [isStep1Valid, isStep2Valid, isStep3Valid, isStep4Valid, isStep5Valid];
    if (validations[currentStep - 1]()) {
      setCurrentStep(currentStep + 1);
    } else {
      toast({
        title: t('incompleteStep'),
        description: t('completeRequiredFields'),
        variant: "destructive"
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (isStep5Valid()) {
      // Clear draft after successful submission
      const userId = localStorage.getItem('userId');
      if (userId) {
        localStorage.removeItem(`holibayt_property_draft_${userId}`);
      }
      onSubmit(formData, images);
    }
  };

  const steps = [
    { number: 1, title: t('propertyTypeTranslation'), completed: isStep1Valid() },
    { number: 2, title: t('basicInformation'), completed: isStep2Valid() },
    { number: 3, title: t('propertyDetailsTitle'), completed: isStep3Valid() },
    { number: 4, title: t('contactInformationTitle'), completed: isStep4Valid() },
    { number: 5, title: 'Policies & Rules', completed: isStep5Valid() },
  ];

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step.number === currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.completed
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.completed && step.number < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <div className="ml-3 hidden md:block">
                <div className="text-sm font-medium">{step.title}</div>
                {step.completed && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {t('completed')}
                  </Badge>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="w-5 h-5 mx-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-playfair">
            {steps[currentStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Property Type */}
          {currentStep === 1 && (
            <RadioGroup
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
              className="flex flex-col space-y-4"
            >
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="sale" id="sale" />
                <Label htmlFor="sale" className="font-medium">{t('forSale')}</Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="rent" id="rent" />
                <Label htmlFor="rent" className="font-medium">{t('forRent')}</Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="short-stay" id="short-stay" />
                <Label htmlFor="short-stay" className="font-medium">{t('shortStayRent')}</Label>
              </div>
            </RadioGroup>
          )}

          {/* Step 2: Basic Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">{t('propertyTitleField')} *</Label>
                <Input
                  id="title"
                  placeholder={t('propertyTitlePlaceholder')}
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyCategory">{t('categoryField')} *</Label>
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
                  <Label htmlFor="location">{t('locationField')} *</Label>
                  <Input
                    id="location"
                    placeholder="Ex: Alger"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">{t('cityField')} *</Label>
                  <Input
                    id="city"
                    placeholder="Ex: Alger"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
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
            </div>
          )}

          {/* Step 3: Property Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
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
                  <Label htmlFor="area">{t('areaField')} *</Label>
                  <Input
                    id="area"
                    placeholder="Ex: 120"
                    value={formData.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">{t('priceField')} *</Label>
                  <Input
                    id="price"
                    placeholder="e.g., 150000"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceCurrency">Currency *</Label>
                  <Select value={formData.priceCurrency} onValueChange={(value) => handleInputChange("priceCurrency", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="DZD">DZD (DA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceType">{t('priceTypeField')} *</Label>
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

              {/* Check-in and Check-out times for short-stay properties */}
              {formData.category === 'short-stay' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="checkInTime">Check-in Time *</Label>
                    <Input
                      id="checkInTime"
                      type="time"
                      value={formData.checkInTime}
                      onChange={(e) => handleInputChange("checkInTime", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkOutTime">Check-out Time *</Label>
                    <Input
                      id="checkOutTime"
                      type="time"
                      value={formData.checkOutTime}
                      onChange={(e) => handleInputChange("checkOutTime", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Features & Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold font-playfair">{t('featuresAmenities')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries({
                    parking: t('parkingFeature'),
                    swimmingPool: t('swimmingPoolFeature'),
                    garden: t('gardenFeature'),
                    balcony: t('balconyFeature'),
                    elevator: t('elevatorFeature'),
                    security: t('securityFeature'),
                    airConditioning: t('airConditioningFeature'),
                    gym: t('gymFeature'),
                    petsAllowed: t('petsAllowed')
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={formData.features[key as keyof typeof formData.features] as boolean}
                        onCheckedChange={(checked) => handleInputChange(`features.${key}`, checked)}
                      />
                      <Label htmlFor={key}>{label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Furnished Status (for rent and short-stay) */}
              {(formData.category === 'rent' || formData.category === 'short-stay') && (
                <div className="space-y-2">
                  <Label htmlFor="furnishedStatus">{t('furnished_status') || 'Furnished Status'}</Label>
                  <Select value={formData.features.furnishedStatus} onValueChange={(value) => handleInputChange("features.furnishedStatus", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="furnished">{t('furnished') || 'Furnished'}</SelectItem>
                      <SelectItem value="semi-furnished">{t('semi_furnished') || 'Semi-Furnished'}</SelectItem>
                      <SelectItem value="unfurnished">{t('unfurnished') || 'Unfurnished'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('descriptionField')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('describeProperty')}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                />
              </div>

              {/* Fees Configuration (for short-stay properties) */}
              {formData.category === 'short-stay' && (
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Optional Fees</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="cleaningFeeEnabled"
                          checked={formData.fees.cleaningFee.enabled}
                          onCheckedChange={(checked) => handleInputChange("fees.cleaningFee.enabled", checked)}
                        />
                        <Label htmlFor="cleaningFeeEnabled" className="cursor-pointer">Cleaning Fee</Label>
                      </div>
                      {formData.fees.cleaningFee.enabled && (
                        <Input
                          type="number"
                          placeholder="Amount"
                          className="w-32"
                          value={formData.fees.cleaningFee.amount}
                          onChange={(e) => handleInputChange("fees.cleaningFee.amount", Number(e.target.value))}
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="serviceFeeEnabled"
                          checked={formData.fees.serviceFee.enabled}
                          onCheckedChange={(checked) => handleInputChange("fees.serviceFee.enabled", checked)}
                        />
                        <Label htmlFor="serviceFeeEnabled" className="cursor-pointer">Service Fee</Label>
                      </div>
                      {formData.fees.serviceFee.enabled && (
                        <Input
                          type="number"
                          placeholder="Amount"
                          className="w-32"
                          value={formData.fees.serviceFee.amount}
                          onChange={(e) => handleInputChange("fees.serviceFee.amount", Number(e.target.value))}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Image Upload */}
              <div className="space-y-4">
                <Label>{t('propertyPhotos')}</Label>
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
            </div>
          )}

          {/* Step 4: Contact Information */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('fullNameField')} *</Label>
                <Input
                  id="fullName"
                  placeholder={t('yourFullName')}
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{t('phoneNumberField')} *</Label>
                <Input
                  id="phoneNumber"
                  placeholder="+213 555 123 456"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')} *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 5: Policies & Rules */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Cancellation Policy */}
              <div className="space-y-2">
                <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                <Select 
                  value={formData.cancellationPolicy} 
                  onValueChange={(value) => handleInputChange("cancellationPolicy", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cancellation policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flexible">Flexible - Full refund up to 24 hours before check-in</SelectItem>
                    <SelectItem value="moderate">Moderate - Full refund up to 5 days before check-in</SelectItem>
                    <SelectItem value="strict">Strict - Full refund up to 14 days before check-in</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* House Rules */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold font-playfair">House Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smokingAllowed"
                      checked={formData.houseRules.smokingAllowed}
                      onCheckedChange={(checked) => handleInputChange("houseRules.smokingAllowed", checked)}
                    />
                    <Label htmlFor="smokingAllowed">Smoking Allowed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="petsAllowedRule"
                      checked={formData.houseRules.petsAllowed}
                      onCheckedChange={(checked) => handleInputChange("houseRules.petsAllowed", checked)}
                    />
                    <Label htmlFor="petsAllowedRule">Pets Allowed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="eventsAllowed"
                      checked={formData.houseRules.eventsAllowed}
                      onCheckedChange={(checked) => handleInputChange("houseRules.eventsAllowed", checked)}
                    />
                    <Label htmlFor="eventsAllowed">Events/Parties Allowed</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quietHours">Quiet Hours</Label>
                    <Input
                      id="quietHours"
                      placeholder="e.g., 22:00-08:00"
                      value={formData.houseRules.quietHours}
                      onChange={(e) => handleInputChange("houseRules.quietHours", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Safety Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold font-playfair">Safety Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smokeAlarm"
                      checked={formData.safetyFeatures.smokeAlarm}
                      onCheckedChange={(checked) => handleInputChange("safetyFeatures.smokeAlarm", checked)}
                    />
                    <Label htmlFor="smokeAlarm">Smoke Alarm</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="carbonMonoxideAlarm"
                      checked={formData.safetyFeatures.carbonMonoxideAlarm}
                      onCheckedChange={(checked) => handleInputChange("safetyFeatures.carbonMonoxideAlarm", checked)}
                    />
                    <Label htmlFor="carbonMonoxideAlarm">CO Alarm</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="firstAidKit"
                      checked={formData.safetyFeatures.firstAidKit}
                      onCheckedChange={(checked) => handleInputChange("safetyFeatures.firstAidKit", checked)}
                    />
                    <Label htmlFor="firstAidKit">First Aid Kit</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fireExtinguisher"
                      checked={formData.safetyFeatures.fireExtinguisher}
                      onCheckedChange={(checked) => handleInputChange("safetyFeatures.fireExtinguisher", checked)}
                    />
                    <Label htmlFor="fireExtinguisher">Fire Extinguisher</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="securityCameras"
                      checked={formData.safetyFeatures.securityCameras}
                      onCheckedChange={(checked) => handleInputChange("safetyFeatures.securityCameras", checked)}
                    />
                    <Label htmlFor="securityCameras">Security Cameras</Label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          {t('previous')}
        </Button>
        
        <div className="flex space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            {t('cancel')}
          </Button>
          
          {currentStep < 5 ? (
            <Button 
              type="button" 
              onClick={handleNext}
              className="bg-gradient-primary hover:shadow-elegant"
            >
              {t('next')} <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={handleSubmit}
              className="bg-gradient-primary hover:shadow-elegant"
              disabled={!isStep5Valid() || isSubmitting}
            >
              {isSubmitting ? t('publishing') : t('publishPropertyBtn')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublishPropertySteps;