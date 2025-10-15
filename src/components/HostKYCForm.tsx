import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Upload, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface KYCFormData {
  full_name: string;
  date_of_birth: string;
  nationality: string;
  phone_number: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  id_type: string;
  id_number: string;
  id_expiry_date: string;
  address_proof_type: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  iban: string;
  swift_code: string;
  bio: string;
  hosting_experience: string;
  languages_spoken: string[];
}

export const HostKYCForm = ({ onSubmitSuccess }: { onSubmitSuccess?: () => void }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<KYCFormData>({
    full_name: '',
    date_of_birth: '',
    nationality: 'Algeria',
    phone_number: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Algeria',
    id_type: 'national_id',
    id_number: '',
    id_expiry_date: '',
    address_proof_type: 'utility_bill',
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    iban: '',
    swift_code: '',
    bio: '',
    hosting_experience: 'beginner',
    languages_spoken: [],
  });

  const totalSteps = 5;

  const updateField = (field: keyof KYCFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Personal Info
        return !!(formData.full_name && formData.date_of_birth && formData.nationality && formData.phone_number);
      case 2: // Address
        return !!(formData.address_line_1 && formData.city && formData.state && formData.postal_code);
      case 3: // Identity
        return !!(formData.id_type && formData.id_number && formData.id_expiry_date);
      case 4: // Banking (optional)
        return true;
      case 5: // Bio
        return !!formData.bio;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('host_kyc_submissions')
        .insert({
          user_id: user?.id,
          ...formData,
          languages_spoken: ['French', 'Arabic'], // Default for Algeria
        });

      if (error) throw error;

      // Update profile kyc_submitted_at
      await supabase
        .from('profiles')
        .update({ kyc_submitted_at: new Date().toISOString() })
        .eq('id', user?.id);

      toast.success('KYC submission successful! Awaiting admin review.');
      onSubmitSuccess?.();
    } catch (error: any) {
      console.error('KYC submission error:', error);
      toast.error(error.message || 'Failed to submit KYC');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label>Date of Birth *</Label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => updateField('date_of_birth', e.target.value)}
                />
              </div>
              <div>
                <Label>Nationality *</Label>
                <Input
                  value={formData.nationality}
                  onChange={(e) => updateField('nationality', e.target.value)}
                />
              </div>
              <div>
                <Label>Phone Number *</Label>
                <Input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => updateField('phone_number', e.target.value)}
                  placeholder="+213 555 123 456"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Address Line 1 *</Label>
                <Input
                  value={formData.address_line_1}
                  onChange={(e) => updateField('address_line_1', e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div>
                <Label>Address Line 2</Label>
                <Input
                  value={formData.address_line_2}
                  onChange={(e) => updateField('address_line_2', e.target.value)}
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City *</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                  />
                </div>
                <div>
                  <Label>State/Province *</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Postal Code *</Label>
                  <Input
                    value={formData.postal_code}
                    onChange={(e) => updateField('postal_code', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Country *</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Identity Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>ID Type *</Label>
                <Select value={formData.id_type} onValueChange={(value) => updateField('id_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national_id">National ID</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ID Number *</Label>
                <Input
                  value={formData.id_number}
                  onChange={(e) => updateField('id_number', e.target.value)}
                  placeholder="Enter your ID number"
                />
              </div>
              <div>
                <Label>ID Expiry Date *</Label>
                <Input
                  type="date"
                  value={formData.id_expiry_date}
                  onChange={(e) => updateField('id_expiry_date', e.target.value)}
                />
              </div>
              <div>
                <Label>Proof of Address Type</Label>
                <Select
                  value={formData.address_proof_type}
                  onValueChange={(value) => updateField('address_proof_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utility_bill">Utility Bill</SelectItem>
                    <SelectItem value="bank_statement">Bank Statement</SelectItem>
                    <SelectItem value="lease_agreement">Lease Agreement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Document upload functionality will be available after submission. Admin will contact you for document verification.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Banking Information (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This information is optional but recommended for receiving payouts.
              </p>
              <div>
                <Label>Bank Name</Label>
                <Input
                  value={formData.bank_name}
                  onChange={(e) => updateField('bank_name', e.target.value)}
                />
              </div>
              <div>
                <Label>Account Holder Name</Label>
                <Input
                  value={formData.account_holder_name}
                  onChange={(e) => updateField('account_holder_name', e.target.value)}
                />
              </div>
              <div>
                <Label>Account Number</Label>
                <Input
                  value={formData.account_number}
                  onChange={(e) => updateField('account_number', e.target.value)}
                />
              </div>
              <div>
                <Label>IBAN</Label>
                <Input
                  value={formData.iban}
                  onChange={(e) => updateField('iban', e.target.value)}
                  placeholder="DZ59 0001 0000 0000 0000 0001"
                />
              </div>
              <div>
                <Label>SWIFT Code</Label>
                <Input
                  value={formData.swift_code}
                  onChange={(e) => updateField('swift_code', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>About You</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Bio *</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  placeholder="Tell us about yourself and your hosting experience..."
                  rows={5}
                />
              </div>
              <div>
                <Label>Hosting Experience *</Label>
                <Select
                  value={formData.hosting_experience}
                  onValueChange={(value) => updateField('hosting_experience', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (New to hosting)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (1-2 years)</SelectItem>
                    <SelectItem value="experienced">Experienced (3+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      {renderStep()}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {currentStep < totalSteps ? (
          <Button onClick={handleNext}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Check className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit KYC'}
          </Button>
        )}
      </div>
    </div>
  );
};
