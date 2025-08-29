import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle, 
  Users,
  Star
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const ContactAdvisor = () => {
  const { t } = useLanguage();
  useScrollToTop();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const contactMethods = [
    {
      icon: Phone,
      title: t('phoneSupport'),
      description: t('speakDirectly'),
      details: "+213 (0) 21 123 456",
      available: t('available247')
    },
    {
      icon: Mail,
      title: t('emailSupport'),
      description: t('getDetailedAssistance'),
      details: "support@holibayt.com",
      available: t('responseWithin2h')
    },
    {
      icon: MessageCircle,
      title: t('liveChat'),
      description: t('instantMessaging'),
      details: t('chatNow'),
      available: t('onlineNow')
    }
  ];

  const advisorStats = [
    { icon: Users, number: "150+", label: t('expertAdvisors') },
    { icon: Star, number: "4.9", label: t('averageRating') },
    { icon: Clock, number: "2min", label: t('averageResponseTime') }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-12 bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-primary-foreground mb-4">
            {t('speakToAdvisor')}
          </h1>
          <p className="text-xl text-primary-foreground/90 font-inter max-w-2xl mx-auto">
            Get personalized guidance from our property experts. We're here to help you make the right decision.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {advisorStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full mb-4">
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <div className="text-3xl font-playfair font-bold text-foreground mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground font-inter">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
              {t('chooseContactMethod')}
            </h2>
            <p className="text-lg text-muted-foreground font-inter max-w-2xl mx-auto">
              {t('multipleWaysConnect')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <Card key={index} className="hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary text-primary-foreground rounded-full mb-4">
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-playfair font-semibold text-foreground mb-2">
                      {method.title}
                    </h3>
                    <p className="text-muted-foreground font-inter mb-3">
                      {method.description}
                    </p>
                    <div className="text-primary font-inter font-semibold mb-2">
                      {method.details}
                    </div>
                    <div className="text-sm text-accent font-inter">
                      {method.available}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-playfair">{t('sendMessage')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t('fullName')}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder={t('yourFullName')}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t('email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder={t('emailPlaceholder')}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">{t('phoneNumber')}</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+213 XX XX XX XX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">{t('subject')}</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        placeholder={t('whatCanWeHelp')}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">{t('message')}</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder={t('tellUsMore')}
                      rows={5}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-primary font-inter font-medium">
                    <Send className="h-4 w-4 mr-2" />
                    {t('sendMessage')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-playfair font-semibold text-foreground mb-2">{t('ourOffice')}</h3>
                      <p className="text-muted-foreground font-inter">
                        123 Boulevard des Martyrs<br />
                        Alger Centre, 16000<br />
                        Algiers, Algeria
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-playfair font-semibold text-foreground mb-2">{t('businessHours')}</h3>
                      <div className="text-muted-foreground font-inter space-y-1">
                        <p>{t('mondayFriday')}</p>
                        <p>{t('saturday')}</p>
                        <p>{t('sunday')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-primary text-primary-foreground">
                <CardContent className="p-6 text-center">
                  <h3 className="font-playfair font-semibold text-xl mb-2">{t('needImmediateHelp')}</h3>
                  <p className="mb-4 opacity-90">{t('call247Hotline')}</p>
                  <Button variant="secondary" size="lg" className="font-inter font-semibold">
                    <Phone className="h-4 w-4 mr-2" />
                    +213 (0) 21 999 999
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactAdvisor;