import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, Download } from "lucide-react";
import { toast } from "sonner";

export default function AgreementTemplate() {
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      // TODO: Uncomment when document_templates table is created
      // const { data, error } = await supabase
      //   .from("document_templates")
      //   .select("*")
      //   .eq("template_type", "rental_agreement")
      //   .eq("is_active", true)
      //   .order("created_at", { ascending: false })
      //   .limit(1)
      //   .maybeSingle();
      // if (error) throw error;
      // setTemplate(data);
      
      setTemplate(null); // Temporarily disabled until migration approved
    } catch (error) {
      console.error("Error fetching template:", error);
      toast.error("Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Rental Agreement Template</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Standard rental agreement template used on Holibayt
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {template ? (
                <div className="space-y-6">
                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{template.template_name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Version: {template.version}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date(template.updated_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1">
                      <a
                        href={template.template_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Template
                      </a>
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                      <a href={template.template_file_url} download>
                        <Download className="w-4 h-4 mr-2" />
                        Download Template
                      </a>
                    </Button>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">About This Template</h4>
                    <p className="text-sm text-muted-foreground">
                      This is the standard rental agreement template used on Holibayt platform.
                      All rental agreements created through Holibayt are based on this template,
                      which complies with Algerian rental laws and regulations.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Template Available</h3>
                  <p className="text-muted-foreground mb-6">
                    The rental agreement template is currently not available. Please contact
                    support for assistance.
                  </p>
                  <Button variant="outline" asChild>
                    <a href="mailto:contact@holibayt.com">Contact Support</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
