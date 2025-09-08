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
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    title: '',
    type: '',
    capacity: '',
    address: '',
    city: '',
    nightly: '',
    cleaning: '',
    minNights: '',
    photos: [] as File[],
    houseRules: '',
    cancellation: '',
  });
  const { assignHostRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      assignHostRole();
      toast({
        title: 'Welcome to hosting!',
        description: 'Your host account has been activated successfully.',
      });
      navigate('/host');
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
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
            <div>
              <Label htmlFor="capacity">Guest Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="4"
              />
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
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="nightly">Nightly Rate (DA)</Label>
              <Input
                id="nightly"
                type="number"
                value={formData.nightly}
                onChange={(e) => setFormData({ ...formData, nightly: e.target.value })}
                placeholder="8000"
              />
            </div>
            <div>
              <Label htmlFor="cleaning">Cleaning Fee (DA)</Label>
              <Input
                id="cleaning"
                type="number"
                value={formData.cleaning}
                onChange={(e) => setFormData({ ...formData, cleaning: e.target.value })}
                placeholder="2000"
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
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label>Property Photos</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <p className="text-muted-foreground">
                  Upload high-quality photos of your property
                </p>
                <Button variant="outline" className="mt-2">
                  Choose Files
                </Button>
              </div>
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
                  <span>Nightly Rate:</span>
                  <span className="font-medium">DA {formData.nightly || '0'}</span>
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
          <Button 
            variant="outline" 
            onClick={handlePrev}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length ? 'Finish & Publish' : 'Next'}
            {currentStep < steps.length && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}