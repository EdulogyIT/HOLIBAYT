import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Star, Plus, Edit, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Testimonial {
  id: string;
  client_name: string;
  client_location: string;
  review_text: string;
  rating: number;
  avatar_initials: string;
  approved: boolean;
  display_order: number;
  created_at: string;
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    client_name: '',
    client_location: '',
    review_text: '',
    rating: 5,
    avatar_initials: '',
    approved: false,
    display_order: 0,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('client_reviews')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTestimonial) {
        const { error } = await supabase
          .from('client_reviews')
          .update(formData)
          .eq('id', editingTestimonial.id);

        if (error) throw error;
        toast.success('Testimonial updated successfully');
      } else {
        const { error } = await supabase
          .from('client_reviews')
          .insert([formData]);

        if (error) throw error;
        toast.success('Testimonial created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Failed to save testimonial');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const { error } = await supabase
        .from('client_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Testimonial deleted successfully');
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = testimonials.findIndex(t => t.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === testimonials.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapWith = testimonials[newIndex];

    try {
      await Promise.all([
        supabase
          .from('client_reviews')
          .update({ display_order: swapWith.display_order })
          .eq('id', id),
        supabase
          .from('client_reviews')
          .update({ display_order: testimonials[currentIndex].display_order })
          .eq('id', swapWith.id),
      ]);

      fetchTestimonials();
    } catch (error) {
      console.error('Error reordering testimonials:', error);
      toast.error('Failed to reorder testimonials');
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      client_name: testimonial.client_name,
      client_location: testimonial.client_location,
      review_text: testimonial.review_text,
      rating: testimonial.rating,
      avatar_initials: testimonial.avatar_initials,
      approved: testimonial.approved,
      display_order: testimonial.display_order,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingTestimonial(null);
    setFormData({
      client_name: '',
      client_location: '',
      review_text: '',
      rating: 5,
      avatar_initials: '',
      approved: false,
      display_order: testimonials.length,
    });
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Testimonials</h1>
          <p className="text-muted-foreground">Control what clients say section displays</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? 'Edit Testimonial' : 'Create New Testimonial'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_name">Client Name</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="client_location">Location</Label>
                  <Input
                    id="client_location"
                    value={formData.client_location}
                    onChange={(e) => setFormData({ ...formData, client_location: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="review_text">Review Text</Label>
                <Textarea
                  id="review_text"
                  value={formData.review_text}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="avatar_initials">Avatar Initials</Label>
                  <Input
                    id="avatar_initials"
                    value={formData.avatar_initials}
                    onChange={(e) => setFormData({ ...formData, avatar_initials: e.target.value.toUpperCase() })}
                    maxLength={2}
                    placeholder="AB"
                  />
                </div>
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="approved"
                  checked={formData.approved}
                  onCheckedChange={(checked) => setFormData({ ...formData, approved: checked })}
                />
                <Label htmlFor="approved">Approved (Show on website)</Label>
              </div>

              <Button type="submit" className="w-full">
                {editingTestimonial ? 'Update' : 'Create'} Testimonial
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {testimonials.map((testimonial, index) => (
          <Card key={testimonial.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                      {testimonial.avatar_initials}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.client_name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.client_location}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    {testimonial.approved && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Approved
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{testimonial.review_text}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReorder(testimonial.id, 'up')}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReorder(testimonial.id, 'down')}
                    disabled={index === testimonials.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(testimonial)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(testimonial.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
