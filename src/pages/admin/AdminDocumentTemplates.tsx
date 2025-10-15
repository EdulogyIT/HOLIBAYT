import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDocumentTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('rental-agreements')
        .list('templates');
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `templates/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('rental-agreements')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      toast.success('Template uploaded successfully!');
      fetchTemplates();
    } catch (error) {
      console.error('Error uploading template:', error);
      toast.error('Failed to upload template');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('rental-agreements')
        .download(`templates/${fileName}`);
      
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      const { error } = await supabase.storage
        .from('rental-agreements')
        .remove([`templates/${fileName}`]);
      
      if (error) throw error;

      toast.success('Template deleted successfully!');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage rental agreement and other document templates
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Upload New Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="template-upload" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
                  <Upload className="w-5 h-5" />
                  <span>Choose template file (.pdf, .doc, .docx)</span>
                </div>
              </Label>
              <Input
                id="template-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>
            {uploading && (
              <p className="text-sm text-muted-foreground">Uploading...</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading templates...</p>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No templates uploaded yet.</p>
              <p className="text-sm mt-2">Upload your first template to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.name}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{template.name.replace('templates/', '')}</p>
                      <p className="text-sm text-muted-foreground">
                        {(template.metadata?.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(template.name.replace('templates/', ''))}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this template?')) {
                          handleDelete(template.name.replace('templates/', ''));
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
