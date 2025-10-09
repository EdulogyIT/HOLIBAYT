import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';

interface PropertyData {
  id: string;
  title: string;
  description: string;
  property_type: string;
  category: string;
  location: string;
  city: string;
  district: string;
  full_address: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  floor_number: string;
  price: string;
  price_type: string;
  price_currency: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  images: string[];
  features: any;
  status: string;
}

export default function EditProperty() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [property, setProperty] = useState<PropertyData | null>(null);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    if (!id || !user) return;

    try {
      // Build query - admins can edit any property, others can only edit their own
      let query = supabase
        .from('properties')
        .select('*')
        .eq('id', id);
      
      // Non-admin users can only edit their own properties
      if (user.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query.single();

      if (error) {
        console.error('Error fetching property:', error);
        toast({
          title: "Error",
          description: "Property not found or access denied",
          variant: "destructive"
        });
        navigate('/host/listings');
        return;
      }

      setProperty({
        ...data,
        price_currency: data.price_currency || 'EUR'
      });
    } catch (error) {
      console.error('Error fetching property:', error);
      toast({
        title: "Error",
        description: "Failed to load property",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!property || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          title: property.title,
          description: property.description,
          property_type: property.property_type,
          category: property.category,
          location: property.location,
          city: property.city,
          district: property.district,
          full_address: property.full_address,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area,
          floor_number: property.floor_number,
          price: property.price,
          price_type: property.price_type,
          price_currency: property.price_currency,
          contact_name: property.contact_name,
          contact_phone: property.contact_phone,
          contact_email: property.contact_email,
          features: property.features,
          status: property.status,
        })
        .eq('id', property.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating property:', error);
        toast({
          title: "Error",
          description: "Failed to update property",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Property updated successfully",
      });
      
      navigate('/host/listings');
    } catch (error) {
      console.error('Error updating property:', error);
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof PropertyData, value: any) => {
    if (!property) return;
    setProperty({ ...property, [field]: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !property || !user) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${property.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        const updatedImages = [...(property.images || []), ...uploadedUrls];
        setProperty({ ...property, images: updatedImages });
        
        // Save to database immediately
        const { error } = await supabase
          .from('properties')
          .update({ images: updatedImages })
          .eq('id', property.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating images:', error);
          toast({
            title: "Error",
            description: "Failed to save images",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Success",
          description: `${uploadedUrls.length} image(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    if (!property || !user) return;

    try {
      const updatedImages = property.images.filter(img => img !== imageUrl);
      setProperty({ ...property, images: updatedImages });

      const { error } = await supabase
        .from('properties')
        .update({ images: updatedImages })
        .eq('id', property.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing image:', error);
        toast({
          title: "Error",
          description: "Failed to remove image",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Image removed successfully",
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading property...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Property not found</h1>
            <Button onClick={() => navigate('/host/listings')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Listings
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/host/listings')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Listings
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Edit Property</h1>
                <p className="text-muted-foreground">Update your property details</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Property Title</Label>
                    <Input
                      id="title"
                      value={property.title}
                      onChange={(e) => updateField('title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={property.category} 
                      onValueChange={(value) => updateField('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="short-stay">Short Stay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={property.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={property.city}
                      onChange={(e) => updateField('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={property.district || ''}
                      onChange={(e) => updateField('district', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={property.location}
                      onChange={(e) => updateField('location', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_address">Full Address</Label>
                  <Input
                    id="full_address"
                    value={property.full_address || ''}
                    onChange={(e) => updateField('full_address', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      value={property.bedrooms || ''}
                      onChange={(e) => updateField('bedrooms', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      value={property.bathrooms || ''}
                      onChange={(e) => updateField('bathrooms', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area (m²)</Label>
                    <Input
                      id="area"
                      value={property.area}
                      onChange={(e) => updateField('area', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor_number">Floor</Label>
                    <Input
                      id="floor_number"
                      value={property.floor_number || ''}
                      onChange={(e) => updateField('floor_number', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      value={property.price}
                      onChange={(e) => updateField('price', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_currency">Currency</Label>
                    <Select 
                      value={property.price_currency} 
                      onValueChange={(value) => updateField('price_currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="DZD">DZD (DA)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_type">Price Type</Label>
                    <Select 
                      value={property.price_type} 
                      onValueChange={(value) => updateField('price_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="total">Total Price</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_name">Contact Name</Label>
                    <Input
                      id="contact_name"
                      value={property.contact_name}
                      onChange={(e) => updateField('contact_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      value={property.contact_phone}
                      onChange={(e) => updateField('contact_phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={property.contact_email}
                      onChange={(e) => updateField('contact_email', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="images">Upload Images</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="flex-1"
                    />
                    <Button type="button" disabled={uploading}>
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {property.images && property.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Property ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(imageUrl)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="status">Property Status</Label>
                  <Select 
                    value={property.status} 
                    onValueChange={(value) => updateField('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}