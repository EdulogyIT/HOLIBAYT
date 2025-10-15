import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Languages } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HostLanguageSelectorProps {
  userId: string | undefined;
}

const AVAILABLE_LANGUAGES = [
  'English',
  'French',
  'Arabic',
  'Spanish',
  'German',
  'Italian',
  'Portuguese',
  'Chinese',
  'Japanese',
  'Russian',
  'Turkish',
  'Dutch',
  'Korean',
  'Polish'
];

export const HostLanguageSelector = ({ userId }: HostLanguageSelectorProps) => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Arabic']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchLanguages();
    }
  }, [userId]);

  const fetchLanguages = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('languages_spoken')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data?.languages_spoken) {
        setSelectedLanguages(data.languages_spoken);
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const handleSave = async () => {
    if (!userId) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ languages_spoken: selectedLanguages })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Languages updated successfully');
    } catch (error) {
      console.error('Error updating languages:', error);
      toast.error('Failed to update languages');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-primary" />
          <CardTitle>Languages You Speak</CardTitle>
        </div>
        <CardDescription>
          Select the languages you can communicate in with guests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {AVAILABLE_LANGUAGES.map(language => (
            <div key={language} className="flex items-center space-x-2">
              <Checkbox
                id={language}
                checked={selectedLanguages.includes(language)}
                onCheckedChange={() => handleLanguageToggle(language)}
              />
              <label
                htmlFor={language}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {language}
              </label>
            </div>
          ))}
        </div>
        <Button onClick={handleSave} disabled={saving || selectedLanguages.length === 0}>
          {saving ? 'Saving...' : 'Save Languages'}
        </Button>
      </CardContent>
    </Card>
  );
};
