import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DraftCard } from '@/components/DraftCard';
import { FileText, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Draft {
  type: 'property' | 'blog';
  title: string;
  savedAt: string;
  data: any;
}

export const DraftManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    loadDrafts();
  }, [user]);

  const loadDrafts = () => {
    if (!user) return;

    const allDrafts: Draft[] = [];

    // Load property draft
    const propertyDraftKey = `holibayt_property_draft_${user.id}`;
    const propertyDraft = localStorage.getItem(propertyDraftKey);
    if (propertyDraft) {
      try {
        const data = JSON.parse(propertyDraft);
        // Handle both old and new property draft structures
        const title = data.title || data.formData?.title || 'Untitled Property';
        const savedAt = data.savedAt || new Date().toISOString();
        allDrafts.push({
          type: 'property',
          title,
          savedAt,
          data
        });
      } catch (error) {
        console.error('Error parsing property draft:', error);
      }
    }

    // Load blog draft
    const blogDraftKey = `holibayt_blog_draft_${user.id}`;
    const blogDraft = localStorage.getItem(blogDraftKey);
    if (blogDraft) {
      try {
        const data = JSON.parse(blogDraft);
        allDrafts.push({
          type: 'blog',
          title: data.title || 'Untitled Blog',
          savedAt: data.savedAt || new Date().toISOString(),
          data
        });
      } catch (error) {
        console.error('Error parsing blog draft:', error);
      }
    }

    setDrafts(allDrafts);
  };

  const handleResumeDraft = (draft: Draft) => {
    if (draft.type === 'property') {
      navigate('/publish-property');
    } else {
      navigate('/host/create-blog');
    }
    toast.success('Draft restored');
  };

  const handleDeleteDraft = (draft: Draft) => {
    if (!user) return;

    const draftKey = draft.type === 'property' 
      ? `holibayt_property_draft_${user.id}`
      : `holibayt_blog_draft_${user.id}`;
    
    localStorage.removeItem(draftKey);
    loadDrafts();
    toast.success('Draft deleted');
  };

  if (drafts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Saved Drafts ({drafts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {drafts.map((draft, index) => (
          <DraftCard
            key={index}
            type={draft.type}
            title={draft.title}
            savedAt={draft.savedAt}
            onResume={() => handleResumeDraft(draft)}
            onDelete={() => handleDeleteDraft(draft)}
          />
        ))}
      </CardContent>
    </Card>
  );
};
