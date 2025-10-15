import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, FileText } from 'lucide-react';

export default function CreateBlog() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [category, setCategory] = useState('general');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing blog data if editing
  useEffect(() => {
    if (editId) {
      loadBlogData();
    }
  }, [editId]);

  // Auto-save draft to localStorage every 30 seconds
  useEffect(() => {
    if (!editId && user) {
      const draftKey = `holibayt_blog_draft_${user.id}`;
      
      // Restore draft on mount
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setTitle(draft.title || '');
          setContent(draft.content || '');
          setAuthorName(draft.authorName || '');
          setCategory(draft.category || 'general');
          setImageUrl(draft.imageUrl || '');
          toast.info('Draft restored from auto-save');
        } catch (error) {
          console.error('Error restoring draft:', error);
        }
      }

      // Auto-save every 30 seconds
      const autoSaveInterval = setInterval(() => {
        if (title || content || authorName) {
          const draft = { title, content, authorName, category, imageUrl };
          localStorage.setItem(draftKey, JSON.stringify(draft));
          console.log('Blog auto-saved to draft');
        }
      }, 30000);

      return () => clearInterval(autoSaveInterval);
    }
  }, [title, content, authorName, category, imageUrl, user, editId]);

  const loadBlogData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', editId)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title);
        setContent(data.content);
        setAuthorName(data.author_name);
        setCategory(data.category || 'general');
        setStatus((data.status === 'published' ? 'published' : 'draft') as 'draft' | 'published');
        if (data.image_url) {
          setImageUrl(data.image_url);
        }
      }
    } catch (error) {
      console.error('Error loading blog:', error);
      toast.error('Failed to load blog post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create a blog post');
      return;
    }

    if (!title || !content || !authorName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editId) {
        // Update existing blog post
        const { error } = await supabase
          .from('blog_posts')
          .update({
            title,
            content,
            author_name: authorName,
            image_url: imageUrl,
            category,
            status
          })
          .eq('id', editId);

        if (error) throw error;
        toast.success(`Blog post updated successfully`);
      } else {
        // Create new blog post
        const { error } = await supabase
          .from('blog_posts')
          .insert({
            user_id: user.id,
            title,
            content,
            author_name: authorName,
            image_url: imageUrl,
            category,
            status
          });

        if (error) throw error;
        
        // Clear draft from localStorage after successful submission
        if (user) {
          localStorage.removeItem(`holibayt_blog_draft_${user.id}`);
        }
        
        toast.success(`Blog post ${status === 'published' ? 'published' : 'saved as draft'} successfully`);
      }

      navigate('/admin');
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast.error('Failed to save blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{editId ? 'Edit Blog Post' : 'Create your blog'}</h1>
        <p className="text-muted-foreground">
          {editId ? 'Update your blog post' : 'Share your insights and experiences with the community'}
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p>Loading blog post...</p>
          </CardContent>
        </Card>
      ) : (

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Blog Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog post title"
                required
              />
            </div>

            {/* Author Name */}
            <div className="space-y-2">
              <Label htmlFor="authorName">Author Name *</Label>
              <Input
                id="authorName"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your name or pen name"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="real-estate">Real Estate</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="tips">Tips & Advice</SelectItem>
                  <SelectItem value="market-trends">Market Trends</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Featured Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={handleImageUrlChange}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Enter the URL of your featured image
              </p>
              {imageUrl && (
                <div className="mt-4">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-w-md h-48 object-cover rounded-lg border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog post content here..."
                className="min-h-[300px]"
                required
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: 'draft' | 'published') => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Publish Now</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin')}
                disabled={isSubmitting}
              >
                {t('cancel') || 'Cancel'}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? 'Saving...' 
                  : editId
                    ? 'Update Blog Post'
                    : status === 'published' 
                      ? 'Publish Now' 
                      : 'Save as Draft'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
      )}
    </div>
  );
}