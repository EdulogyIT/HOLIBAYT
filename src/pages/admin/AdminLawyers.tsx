import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Scale, Plus, Edit, Trash2, Check, X, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Lawyer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  license_number: string;
  specializations: string[];
  city: string;
  address: string | null;
  experience_years: number | null;
  profile_photo_url: string | null;
  bio: string | null;
  consultation_fee: number | null;
  availability_status: string;
  verified: boolean;
  created_at: string;
}

const AdminLawyers = () => {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLawyer, setEditingLawyer] = useState<Lawyer | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    license_number: '',
    specializations: '',
    city: '',
    address: '',
    experience_years: 0,
    bio: '',
    consultation_fee: 0,
    availability_status: 'available',
    verified: true,
  });

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      const { data, error } = await supabase
        .from('lawyers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLawyers(data || []);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
      toast.error('Failed to load lawyers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (lawyer?: Lawyer) => {
    if (lawyer) {
      setEditingLawyer(lawyer);
      setFormData({
        full_name: lawyer.full_name,
        email: lawyer.email,
        phone: lawyer.phone,
        license_number: lawyer.license_number,
        specializations: lawyer.specializations.join(', '),
        city: lawyer.city,
        address: lawyer.address || '',
        experience_years: lawyer.experience_years || 0,
        bio: lawyer.bio || '',
        consultation_fee: lawyer.consultation_fee || 0,
        availability_status: lawyer.availability_status,
        verified: lawyer.verified,
      });
    } else {
      setEditingLawyer(null);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        license_number: '',
        specializations: '',
        city: '',
        address: '',
        experience_years: 0,
        bio: '',
        consultation_fee: 0,
        availability_status: 'available',
        verified: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const lawyerData = {
        ...formData,
        specializations: formData.specializations.split(',').map(s => s.trim()).filter(s => s),
        experience_years: parseInt(formData.experience_years.toString()) || 0,
        consultation_fee: parseFloat(formData.consultation_fee.toString()) || 0,
      };

      if (editingLawyer) {
        const { error } = await supabase
          .from('lawyers')
          .update(lawyerData)
          .eq('id', editingLawyer.id);

        if (error) throw error;
        toast.success('Lawyer updated successfully');
      } else {
        const { error } = await supabase
          .from('lawyers')
          .insert(lawyerData);

        if (error) throw error;
        toast.success('Lawyer added successfully');
      }

      setDialogOpen(false);
      fetchLawyers();
    } catch (error: any) {
      console.error('Error saving lawyer:', error);
      toast.error(error.message || 'Failed to save lawyer');
    }
  };

  const handleDelete = async (lawyerId: string) => {
    if (!confirm('Are you sure you want to delete this lawyer?')) return;

    try {
      const { error } = await supabase
        .from('lawyers')
        .delete()
        .eq('id', lawyerId);

      if (error) throw error;
      toast.success('Lawyer deleted successfully');
      fetchLawyers();
    } catch (error) {
      console.error('Error deleting lawyer:', error);
      toast.error('Failed to delete lawyer');
    }
  };

  const handleToggleVerified = async (lawyerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('lawyers')
        .update({
          verified: !currentStatus,
          verified_at: !currentStatus ? new Date().toISOString() : null,
        })
        .eq('id', lawyerId);

      if (error) throw error;
      toast.success(`Lawyer ${!currentStatus ? 'verified' : 'unverified'} successfully`);
      fetchLawyers();
    } catch (error) {
      console.error('Error updating lawyer:', error);
      toast.error('Failed to update lawyer');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Scale className="h-8 w-8 text-primary" />
            Manage Lawyers
          </h1>
          <p className="text-muted-foreground mt-2">
            Add and manage legal professionals for the platform
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lawyer
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lawyers</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lawyers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lawyers.filter(l => l.verified).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lawyers.filter(l => l.availability_status === 'available').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lawyers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Lawyers ({lawyers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specializations</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Fee (DZD)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lawyers.map((lawyer) => (
                  <TableRow key={lawyer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{lawyer.full_name}</div>
                        <div className="text-sm text-muted-foreground">{lawyer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {lawyer.specializations.slice(0, 2).map((spec, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {lawyer.specializations.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{lawyer.specializations.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{lawyer.city}</TableCell>
                    <TableCell>{lawyer.experience_years}+ yrs</TableCell>
                    <TableCell>{lawyer.consultation_fee?.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={lawyer.verified ? "default" : "secondary"}
                          className="w-fit"
                        >
                          {lawyer.verified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            lawyer.availability_status === 'available'
                              ? "text-green-600"
                              : "text-yellow-600"
                          }
                        >
                          {lawyer.availability_status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleVerified(lawyer.id, lawyer.verified)}
                        >
                          {lawyer.verified ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(lawyer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => handleDelete(lawyer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLawyer ? 'Edit Lawyer' : 'Add New Lawyer'}
            </DialogTitle>
            <DialogDescription>
              {editingLawyer
                ? 'Update lawyer information'
                : 'Add a new legal professional to the platform'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>License Number *</Label>
              <Input
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Specializations * (comma-separated)</Label>
              <Input
                placeholder="Real Estate Law, Contract Law, Property Law"
                value={formData.specializations}
                onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>City *</Label>
              <Select
                value={formData.city}
                onValueChange={(value) => setFormData({ ...formData, city: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alger">Alger</SelectItem>
                  <SelectItem value="Oran">Oran</SelectItem>
                  <SelectItem value="Constantine">Constantine</SelectItem>
                  <SelectItem value="Annaba">Annaba</SelectItem>
                  <SelectItem value="Blida">Blida</SelectItem>
                  <SelectItem value="Batna">Batna</SelectItem>
                  <SelectItem value="Sétif">Sétif</SelectItem>
                  <SelectItem value="Tlemcen">Tlemcen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Experience (years)</Label>
              <Input
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Consultation Fee (DZD)</Label>
              <Input
                type="number"
                value={formData.consultation_fee}
                onChange={(e) => setFormData({ ...formData, consultation_fee: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Availability Status</Label>
              <Select
                value={formData.availability_status}
                onValueChange={(value) => setFormData({ ...formData, availability_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="verified" className="cursor-pointer">
                  Verified Lawyer
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingLawyer ? 'Update' : 'Add'} Lawyer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLawyers;