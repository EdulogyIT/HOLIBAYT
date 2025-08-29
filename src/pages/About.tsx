import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Award, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const About = () => {
  const { t } = useLanguage();
  useScrollToTop();

  const stats = [
    { icon: Building, title: t('properties'), value: "10,000+", description: t('propertiesListed') },
    { icon: Users, title: t('clients'), value: "50,000+", description: t('satisfiedClients') },
    { icon: Award, title: t('experience'), value: "15 " + t('years'), description: t('realEstateExpertise') },
    { icon: Shield, title: t('security'), value: "100%", description: t('secureTransactions') }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-6 font-playfair">{t('aboutBeitik')}</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
              {t('aboutDescription')}
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-primary font-playfair">{stat.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold mb-2 font-playfair">{stat.title}</h3>
                    <p className="text-sm text-muted-foreground font-inter">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Company Story */}
          <div className="bg-muted/50 rounded-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6 font-playfair">{t('ourStory')}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-muted-foreground mb-4 font-inter">
                  {t('storyParagraph1')}
                </p>
                <p className="text-muted-foreground mb-4 font-inter">
                  {t('storyParagraph2')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-4 font-inter">
                  {t('storyParagraph3')}
                </p>
                <p className="text-muted-foreground font-inter">
                  {t('storyParagraph4')}
                </p>
              </div>
            </div>
          </div>

          {/* Mission & Values */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-playfair">{t('ourMission')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-inter">
                  {t('missionDescription')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-playfair">{t('ourVision')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-inter">
                  {t('visionDescription')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-playfair">{t('ourValues')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-inter">
                  {t('valuesDescription')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;