import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft, ArrowRight, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const steps = [
  { id: 1, title: 'Property Basics', description: 'Tell us about your property' },
  { id: 2, title: 'Location', description: 'Where is your property located?' },
  { id: 3, title: 'Pricing & Fees', description: 'Set your pricing structure' },
  { id: 4, title: 'Photos', description: 'Upload property photos' },
  { id: 5, title: 'Policies', description: 'House rules and policies' },
  { id: 6, title: 'Review & Publish', description: 'Review and go live' },
];

export default function HostOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    type: '',
    capacity: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    floor: '',
    address: '',
    city: '',
    district: '',
    price: '',
    priceType: '',
    cleaning: '',
    minNights: '',
    houseRules: '',
    cancellation: '',
    description: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { assignHostRole, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const progress = (currentStep / steps.length) * 100;

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Upload images first
      const imageUrls: string[] = [];
      
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          continue;
        }

        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(uploadData.path);
          imageUrls.push(publicUrl);
        }
      }

      // Map form price type to database values
      const mapPriceType = (category: string, priceType: string) => {
        if (category === 'sale') return 'total';
        if (category === 'rent') return 'monthly';
        if (category === 'short-stay') return 'monthly';
        return priceType;
      };

      // Create property record
      const { error: insertError } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          category: formData.category,
          property_type: formData.type,
          title: formData.title,
          location: formData.address,
          city: formData.city,
          district: formData.district || null,
          full_address: formData.address,
          bedrooms: formData.bedrooms || null,
          bathrooms: formData.bathrooms || null,
          area: formData.area,
          floor_number: formData.floor || null,
          price: formData.price,
          price_type: mapPriceType(formData.category, formData.priceType),
          features: {},
          description: formData.description || null,
          contact_name: user.name || '',
          contact_phone: '',
          contact_email: user.email,
          images: imageUrls,
          status: 'active'
        });

      if (insertError) {
        console.error('Property insertion error:', insertError);
        toast({
          title: "Error",
          description: "Failed to publish property. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Assign host role
      await assignHostRole();
      
      toast({
        title: 'Welcome to hosting!',
        description: 'Your property has been published successfully!',
      });

      // Navigate to the appropriate category page
      const categoryRoutes = {
        'sale': '/buy',
        'rent': '/rent',
        'short-stay': '/short-stay'
      };
      navigate(categoryRoutes[formData.category as keyof typeof categoryRoutes] || '/host');

    } catch (error) {
      console.error('Property submission error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Property Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                  <SelectItem value="short-stay">Short Stay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Property Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Beautiful villa with sea view"
              />
            </div>
            <div>
              <Label htmlFor="type">Property Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  placeholder="3"
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  placeholder="2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area">Area (m²)</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="120"
                />
              </div>
              <div>
                <Label htmlFor="floor">Floor Number</Label>
                <Input
                  id="floor"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="2"
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Full Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="algiers">Algiers</SelectItem>
                  <SelectItem value="oran">Oran</SelectItem>
                  <SelectItem value="constantine">Constantine</SelectItem>
                  <SelectItem value="annaba">Annaba</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="district">District (Optional)</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="Hydra, Sidi Bel Abbès, etc."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="price">
                {formData.category === 'sale' ? 'Sale Price (EUR)' : 
                 formData.category === 'rent' ? 'Monthly Rent (EUR)' : 
                 'Nightly Rate (EUR)'}
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder={formData.category === 'sale' ? '350000' : 
                           formData.category === 'rent' ? '800' : '80'}
              />
            </div>
            <div>
              <Label htmlFor="priceType">Price Type</Label>
              <Select value={formData.priceType} onValueChange={(value) => setFormData({ ...formData, priceType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select price type" />
                </SelectTrigger>
                <SelectContent>
                  {formData.category === 'sale' && <SelectItem value="fixed">Fixed Price</SelectItem>}
                  {formData.category === 'sale' && <SelectItem value="negotiable">Negotiable</SelectItem>}
                  {formData.category === 'rent' && <SelectItem value="monthly">Monthly</SelectItem>}
                  {formData.category === 'short-stay' && <SelectItem value="per-night">Per Night</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            {formData.category === 'short-stay' && (
              <>
                <div>
                  <Label htmlFor="cleaning">Cleaning Fee (EUR)</Label>
                  <Input
                    id="cleaning"
                    type="number"
                    value={formData.cleaning}
                    onChange={(e) => setFormData({ ...formData, cleaning: e.target.value })}
                    placeholder="20"
                  />
                </div>
                <div>
                  <Label htmlFor="minNights">Minimum Nights</Label>
                  <Input
                    id="minNights"
                    type="number"
                    value={formData.minNights}
                    onChange={(e) => setFormData({ ...formData, minNights: e.target.value })}
                    placeholder="2"
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your property..."
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label>Property Photos</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Upload high-quality photos of your property
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
                  Choose Files
                </Button>
              </div>
              
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
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
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="houseRules">House Rules</Label>
              <Textarea
                id="houseRules"
                value={formData.houseRules}
                onChange={(e) => setFormData({ ...formData, houseRules: e.target.value })}
                placeholder="No smoking, No parties, Check-in after 3 PM..."
              />
            </div>
            <div>
              <Label htmlFor="cancellation">Cancellation Policy</Label>
              <Select value={formData.cancellation} onValueChange={(value) => setFormData({ ...formData, cancellation: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flexible">Flexible</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="strict">Strict</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Ready to Publish!</h3>
              <p className="text-muted-foreground">
                Your property listing is complete. Click finish to activate your host account and publish your first listing.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Property Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Title:</span>
                  <span className="font-medium">{formData.title || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium">{formData.type || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-medium">{formData.city || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="font-medium capitalize">{formData.category || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-medium">DA {formData.price || '0'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/bd206675-bfd0-4aee-936b-479f6c1240ca.png" 
            alt="Holibayt" 
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold mb-2">Become a Host</h1>
          <p className="text-muted-foreground">
            Let's get your property ready for guests
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="mb-4" />
          <div className="flex justify-between text-sm">
            <span>Step {currentStep} of {steps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        {/* Steps Overview */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {steps.map((step) => (
            <Badge 
              key={step.id} 
              variant={step.id === currentStep ? 'default' : step.id < currentStep ? 'secondary' : 'outline'}
              className="text-xs"
            >
              {step.id < currentStep && <CheckCircle className="h-3 w-3 mr-1" />}
              {step.title}
            </Badge>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {currentStep === 1 ? (
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={handlePrev}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
          <Button onClick={handleNext} disabled={isSubmitting}>
            {isSubmitting ? 'Publishing...' : currentStep === steps.length ? 'Finish & Publish' : 'Next'}
            {currentStep < steps.length && !isSubmitting && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}