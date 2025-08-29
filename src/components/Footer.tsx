import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import footerBg from "@/assets/footer-background.jpg";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="relative overflow-hidden border-t border-border/50 mt-4">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={footerBg} 
          alt="Footer background" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/85 to-primary/10"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info - Enhanced */}
          <div className="space-y-6 md:col-span-1">
            <div className="space-y-4">
              <img 
                src="/lovable-uploads/b974fb79-9873-41fb-b3ad-9b4bf38b8a77.png" 
                alt="Holibayt Logo" 
                className="h-20 w-auto hover:scale-105 transition-transform duration-300"
              />
              <p className="text-muted-foreground font-inter text-sm leading-relaxed">
                {t('footerDescription')}
              </p>
            </div>
            
            {/* Social Media - Enhanced */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground font-playfair text-sm">{t('followUs')}</h4>
              <div className="flex space-x-3">
                <div className="p-2 rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all duration-300 cursor-pointer group">
                  <Facebook className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-2 rounded-lg bg-accent/10 hover:bg-accent hover:text-accent-foreground transition-all duration-300 cursor-pointer group">
                  <Twitter className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-2 rounded-lg bg-foreground/10 hover:bg-foreground hover:text-background transition-all duration-300 cursor-pointer group">
                  <Instagram className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links - Enhanced */}
          <div className="space-y-6">
            <h3 className="font-semibold text-foreground font-playfair text-lg">{t('quickLinks')}</h3>
            <ul className="space-y-3 font-inter text-sm">
              <li>
                <Link to="/buy" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block duration-300 py-1">
                  {t('buy')}
                </Link>
              </li>
              <li>
                <Link to="/rent" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block duration-300 py-1">
                  {t('rent')}
                </Link>
              </li>
              <li>
                <Link to="/short-stay" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block duration-300 py-1">
                  {t('shortStay')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block duration-300 py-1">
                  {t('about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services - Enhanced */}
          <div className="space-y-6">
            <h3 className="font-semibold text-foreground font-playfair text-lg">{t('services')}</h3>
            <ul className="space-y-3 font-inter text-sm">
              <li>
                <Link to="/publish-property" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block duration-300 py-1">
                  {t('publishProperty')}
                </Link>
              </li>
              <li className="text-muted-foreground hover:text-foreground transition-colors py-1 cursor-pointer">{t('propertyValuation')}</li>
              <li className="text-muted-foreground hover:text-foreground transition-colors py-1 cursor-pointer">{t('legalSupport')}</li>
              <li className="text-muted-foreground hover:text-foreground transition-colors py-1 cursor-pointer">{t('mortgageAdvice')}</li>
            </ul>
          </div>

          {/* Contact Info - Enhanced */}
          <div className="space-y-6">
            <h3 className="font-semibold text-foreground font-playfair text-lg">{t('contact')}</h3>
            <ul className="space-y-4 font-inter text-sm">
              <li className="group">
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors duration-300">
                  <div className="p-1 rounded bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">Alger, Algérie</span>
                </div>
              </li>
              <li className="group">
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors duration-300">
                  <div className="p-1 rounded bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">+213 21 123 456</span>
                </div>
              </li>
              <li className="group">
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors duration-300">
                  <div className="p-1 rounded bg-foreground/10 text-foreground group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">contact@holibayt.dz</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Enhanced */}
        <div className="border-t border-border/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground font-inter text-sm">
              © 2024 Holibayt. {t('allRightsReserved')}
            </p>
            <div className="flex items-center space-x-6 text-xs text-muted-foreground font-inter">
              <span className="hover:text-foreground cursor-pointer transition-colors duration-300">{t('privacyPolicy')}</span>
              <span className="hover:text-foreground cursor-pointer transition-colors duration-300">{t('termsOfUse')}</span>
              <span className="hover:text-foreground cursor-pointer transition-colors duration-300">{t('cookies')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;