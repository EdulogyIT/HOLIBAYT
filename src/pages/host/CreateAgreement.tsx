import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { HostLayout } from "@/components/layouts/HostLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FileText, Upload } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CreateAgreement = () => {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    lease_duration_months: 12,
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    monthly_rent: 0,
    deposit_amount: 0,
    special_clauses: '',
    payment_day: 1,
    late_fee_percentage: 5,
    grace_period_days: 3,
    payment_method: 'bank_transfer'
  });

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .eq('user_id', user?.id)
        .eq('category', 'rent')
        .single();

      if (error) throw error;
      setProperty(data);
      
      // Pre-fill rent amount
      setFormData(prev => ({
        ...prev,
        monthly_rent: parseFloat(data.price),
        deposit_amount: parseFloat(data.price) // Default to 1 month rent
      }));
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property');
      navigate('/host/listings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create rental agreement
      const { data: agreement, error: agreementError } = await supabase
        .from('rental_agreements')
        .insert({
          property_id: propertyId,
          host_user_id: user?.id,
          lease_duration_months: formData.lease_duration_months,
          start_date: format(formData.start_date, 'yyyy-MM-dd'),
          monthly_rent: formData.monthly_rent,
          deposit_amount: formData.deposit_amount,
          special_clauses: formData.special_clauses,
          payment_terms: {
            payment_day: formData.payment_day,
            late_fee_percentage: formData.late_fee_percentage,
            grace_period_days: formData.grace_period_days,
            payment_method: formData.payment_method
          },
          status: 'draft'
        })
        .select()
        .single();

      if (agreementError) throw agreementError;

      // Generate PDF
      const { error: pdfError } = await supabase.functions.invoke('generate-rental-agreement-pdf', {
        body: { agreement_id: agreement.id }
      });

      if (pdfError) console.error('PDF generation error:', pdfError);

      toast.success('Agreement created successfully!');
      navigate(`/host/listings`);

    } catch (error) {
      console.error('Error creating agreement:', error);
      toast.error('Failed to create agreement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${propertyId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('rental-agreements')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setUploadedFile(file);
      toast.success('Draft uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload draft');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <HostLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          </div>
        </HostLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HostLayout>
        <div className="max-w-3xl mx-auto py-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Create Rental Agreement</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {property?.title}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="create">Create from Template</TabsTrigger>
                  <TabsTrigger value="upload">{t('uploadDraft')}</TabsTrigger>
                </TabsList>

                <TabsContent value="create">
                  <form onSubmit={handleSubmit} className="space-y-6">
                {/* Lease Duration */}
                <div className="space-y-2">
                  <Label>Lease Duration (months)</Label>
                  <Select
                    value={formData.lease_duration_months.toString()}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      lease_duration_months: parseInt(value)
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months (1 year)</SelectItem>
                      <SelectItem value="24">24 months (2 years)</SelectItem>
                      <SelectItem value="36">36 months (3 years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label>Lease Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.start_date, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.start_date}
                        onSelect={(date) => date && setFormData(prev => ({ ...prev, start_date: date }))}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Monthly Rent */}
                <div className="space-y-2">
                  <Label>Monthly Rent (DZD)</Label>
                  <Input
                    type="number"
                    value={formData.monthly_rent}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      monthly_rent: parseFloat(e.target.value)
                    }))}
                    min="0"
                    step="1000"
                    required
                  />
                </div>

                {/* Security Deposit */}
                <div className="space-y-2">
                  <Label>Security Deposit (DZD)</Label>
                  <Input
                    type="number"
                    value={formData.deposit_amount}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      deposit_amount: parseFloat(e.target.value)
                    }))}
                    min="0"
                    step="1000"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Typically 1-2 months rent
                  </p>
                </div>

                {/* Payment Terms */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Day of Month</Label>
                    <Select
                      value={formData.payment_day.toString()}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        payment_day: parseInt(value)
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st</SelectItem>
                        <SelectItem value="5">5th</SelectItem>
                        <SelectItem value="10">10th</SelectItem>
                        <SelectItem value="15">15th</SelectItem>
                        <SelectItem value="20">20th</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Late Fee (%)</Label>
                    <Input
                      type="number"
                      value={formData.late_fee_percentage}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        late_fee_percentage: parseFloat(e.target.value)
                      }))}
                      min="0"
                      max="20"
                      step="0.5"
                    />
                  </div>
                </div>

                {/* Special Clauses */}
                <div className="space-y-2">
                  <Label>Special Clauses (Optional)</Label>
                  <Textarea
                    value={formData.special_clauses}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      special_clauses: e.target.value
                    }))}
                    rows={4}
                    placeholder="Any additional terms or conditions..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/host/listings')}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Creating...' : 'Create Agreement'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="upload">
              <div className="space-y-6">
                <div className="text-center p-8 border-2 border-dashed border-border rounded-lg">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">{t('uploadDraft')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('uploadDraftDesc')}
                  </p>
                  <Label htmlFor="draft-upload" className="cursor-pointer">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                      <Upload className="w-4 h-4" />
                      {t('chooseFile')}
                    </div>
                  </Label>
                  <Input
                    id="draft-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploadedFile && (
                    <p className="mt-4 text-sm text-green-600">
                      ✓ {uploadedFile.name} uploaded successfully
                    </p>
                  )}
                  {uploading && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Uploading...
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/host/listings')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      toast.success('Draft saved! You can now send it to your tenant.');
                      navigate('/host/agreements');
                    }}
                    disabled={!uploadedFile}
                    className="flex-1"
                  >
                    Save Draft
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
            </CardContent>
          </Card>
        </div>
      </HostLayout>
    </div>
  );
};

export default CreateAgreement;
