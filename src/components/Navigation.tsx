import { Button } from "@/components/ui/button";
import { Menu, X, Globe, LogOut, Settings, User, Home, Calendar, MessageCircle, Heart } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/LoginModal";
import CurrencySelector from "@/components/CurrencySelector";
import { NotificationBell } from "@/components/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { currentLang, setCurrentLang, t } = useLanguage();
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const languages = [
    { code: "FR", name: "Français", flag: "🇫🇷" },
    { code: "EN", name: "English", flag: "🇺🇸" },
    { code: "AR", name: "العربية", flag: "🇩🇿" }
  ];


  const handleLanguageChange = (lang: 'FR' | 'EN' | 'AR') => {
    setCurrentLang(lang);
    setIsMenuOpen(false); // Close mobile menu when changing language
  };

  const handleLogout = async () => {
    console.log('[Navigation] Logout button clicked');
    await logout();
    console.log('[Navigation] Logout completed, navigating to home');
    navigate('/');
  };

  return (
    <nav key={currentLang} className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link 
              to="/"
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <img 
                src="/lovable-uploads/bd206675-bfd0-4aee-936b-479f6c1240ca.png" 
                alt="Holibayt Logo" 
                className="h-14 w-auto cursor-pointer mt-2 drop-shadow-lg hover:scale-105 transition-transform duration-300"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 103, 105, 0.3))' }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-inter text-sm lg:text-base">
              {t('home')}
            </Link>
            <Link to="/buy" className="text-foreground hover:text-primary transition-colors font-inter text-sm lg:text-base">
              {t('buy')}
            </Link>
            <Link to="/short-stay" className="text-foreground hover:text-primary transition-colors font-inter text-sm lg:text-base">
              {t('shortStay')}
            </Link>
            <Link to="/rent" className="text-foreground hover:text-primary transition-colors font-inter text-sm lg:text-base">
              {t('rent')}
            </Link>
            <Link to="/holibayt-pay" className="text-foreground hover:text-primary transition-colors font-inter text-sm lg:text-base">
              {t('holibaytPayBrand')}
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors font-inter text-sm lg:text-base">
              {t('about')}
            </Link>
            <Link to="/blog" className="text-foreground hover:text-primary transition-colors font-inter text-sm lg:text-base">
              {t('blog')}
            </Link>
          </div>

          {/* Language & Currency Switchers & CTA Buttons */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {/* Currency Selector */}
            <CurrencySelector />
            
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="font-inter h-9 w-9 lg:h-10 lg:w-10">
                  <Globe className="h-4 w-4 lg:h-5 lg:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border border-border z-[100000]">
                {languages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code as any)}
                    className="flex items-center space-x-2 min-h-[44px]"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                    {currentLang === lang.code && <span className="ml-auto text-primary">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {!isAuthenticated ? (
              <>
                <Button variant="ghost" className="font-inter font-medium text-sm lg:text-base px-3 lg:px-4" onClick={() => setIsLoginModalOpen(true)}>
                  {t('login')}
                </Button>
                <Button className="bg-gradient-primary font-inter font-medium hover:shadow-elegant text-sm lg:text-base px-3 lg:px-4" onClick={() => setIsLoginModalOpen(true)}>
                  {t('publishProperty')}
                </Button>
              </>
            ) : (
              <>
                {/* Become a Host CTA for logged-in non-hosts */}
                {!hasRole('host') && !hasRole('admin') && (
                  <Button 
                    className="bg-gradient-primary font-inter font-medium hover:shadow-elegant"
                    onClick={() => navigate('/host/onboarding')}
                  >
                    Become a Host
                  </Button>
                )}

                {/* Notification Bell */}
                <NotificationBell />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-1 lg:space-x-2 font-inter font-medium text-sm lg:text-base px-2 lg:px-3">
                      <Avatar className="w-7 h-7 lg:w-8 lg:h-8">
                        <AvatarImage src={user?.avatar_url} alt={user?.name || 'User'} />
                        <AvatarFallback>
                          {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:inline">{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 z-[100000]">
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="min-h-[44px]">
                      <User className="h-4 w-4 mr-2" />
                      {t('myProfile')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/messages')}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/tenant/agreements')}>
                      <Home className="h-4 w-4 mr-2" />
                      My Rentals
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                      <Heart className="h-4 w-4 mr-2" />
                      {t('wishlist')}
                    </DropdownMenuItem>
                    {hasRole('admin') ? (
                      <DropdownMenuItem onClick={() => navigate('/publish-property')}>
                        <Home className="h-4 w-4 mr-2" />
                        {t('publishProperty')}
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => navigate('/bookings')}>
                        <Calendar className="h-4 w-4 mr-2" />
                        {t('myBookings')}
                      </DropdownMenuItem>
                    )}
                    {hasRole('host') && (
                      <DropdownMenuItem onClick={() => navigate('/host/listings')}>
                        <Home className="h-4 w-4 mr-2" />
                        {t('publishProperty')}
                      </DropdownMenuItem>
                    )}
                    {hasRole('admin') && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    {hasRole('host') && (
                      <DropdownMenuItem onClick={() => navigate('/host')}>
                        <Settings className="h-4 w-4 mr-2" />
                        Host Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border max-h-[calc(100vh-80px)] overflow-y-auto">
            <div className="flex flex-col space-y-3">
                  <Link to="/" className="text-foreground hover:text-primary transition-colors font-inter font-medium py-2 min-h-[44px] flex items-center" onClick={() => setIsMenuOpen(false)}>
                    {t('home')}
                  </Link>
                  <Link to="/buy" className="text-foreground hover:text-primary transition-colors font-inter font-medium py-2 min-h-[44px] flex items-center" onClick={() => setIsMenuOpen(false)}>
                    {t('buy')}
                  </Link>
                  <Link to="/short-stay" className="text-foreground hover:text-primary transition-colors font-inter font-medium py-2 min-h-[44px] flex items-center" onClick={() => setIsMenuOpen(false)}>
                    {t('shortStay')}
                  </Link>
                  <Link to="/rent" className="text-foreground hover:text-primary transition-colors font-inter font-medium py-2 min-h-[44px] flex items-center" onClick={() => setIsMenuOpen(false)}>
                    {t('rent')}
                  </Link>
                  <Link to="/holibayt-pay" className="text-foreground hover:text-primary transition-colors font-inter font-medium py-2 min-h-[44px] flex items-center" onClick={() => setIsMenuOpen(false)}>
                    {t('holibaytPayBrand')}
                  </Link>
                  <Link to="/about" className="text-foreground hover:text-primary transition-colors font-inter font-medium py-2 min-h-[44px] flex items-center" onClick={() => setIsMenuOpen(false)}>
                    {t('about')}
                  </Link>
                  <Link to="/blog" className="text-foreground hover:text-primary transition-colors font-inter font-medium py-2 min-h-[44px] flex items-center" onClick={() => setIsMenuOpen(false)}>
                    {t('blog')}
                  </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                {/* Currency Selector Mobile */}
                <div className="flex items-center min-h-[44px]">
                  <CurrencySelector />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="font-inter font-medium justify-start min-h-[44px]">
                      <Globe className="h-4 w-4 mr-2" />
                      {languages.find(l => l.code === currentLang)?.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-background border border-border z-[100000]">
                    {languages.map((lang) => (
                      <DropdownMenuItem 
                        key={lang.code}
                        onClick={() => {
                          handleLanguageChange(lang.code as any);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 min-h-[44px]"
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                        {currentLang === lang.code && <span className="ml-auto text-primary">✓</span>}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>


                {!isAuthenticated ? (
                  <>
                    <Button variant="ghost" className="font-inter font-medium justify-start" onClick={() => {
                      setIsLoginModalOpen(true);
                      setIsMenuOpen(false);
                    }}>
                      {t('login')}
                    </Button>
                    <Button className="bg-gradient-primary font-inter font-medium hover:shadow-elegant justify-start" onClick={() => {
                      setIsLoginModalOpen(true);
                      setIsMenuOpen(false);
                    }}>
                      {t('publishProperty')}
                    </Button>
                  </>
                ) : (
                  <>
                    {!hasRole('host') && !hasRole('admin') && (
                      <Button 
                        className="bg-gradient-primary font-inter font-medium hover:shadow-elegant justify-start"
                        onClick={() => {
                          navigate('/host/onboarding');
                          setIsMenuOpen(false);
                        }}
                      >
                        Become a Host
                      </Button>
                    )}
                    <Button variant="ghost" className="font-inter font-medium justify-start" onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}>
                      <User className="h-4 w-4 mr-2" />
                      {t('myProfile')}
                    </Button>
                    <Button variant="ghost" className="font-inter font-medium justify-start" onClick={() => {
                      navigate('/messages');
                      setIsMenuOpen(false);
                    }}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </Button>
                    {hasRole('admin') ? (
                      <Button variant="ghost" className="font-inter font-medium justify-start" onClick={() => {
                        navigate('/publish-property');
                        setIsMenuOpen(false);
                      }}>
                        <Home className="h-4 w-4 mr-2" />
                        {t('publishProperty')}
                      </Button>
                    ) : (
                      <Button variant="ghost" className="font-inter font-medium justify-start" onClick={() => {
                        navigate('/bookings');
                        setIsMenuOpen(false);
                      }}>
                        <Calendar className="h-4 w-4 mr-2" />
                        {t('myBookings')}
                      </Button>
                    )}
                     {hasRole('host') && (
                       <Button variant="ghost" className="font-inter font-medium justify-start" onClick={() => {
                         navigate('/host/listings');
                         setIsMenuOpen(false);
                       }}>
                         <Home className="h-4 w-4 mr-2" />
                         {t('publishProperty')}
                       </Button>
                     )}
                    {hasRole('admin') && (
                      <Button variant="ghost" className="font-inter font-medium justify-start" onClick={() => {
                        navigate('/admin');
                        setIsMenuOpen(false);
                      }}>
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Button>
                    )}
                    {hasRole('host') && (
                      <Button variant="ghost" className="font-inter font-medium justify-start" onClick={() => {
                        navigate('/host');
                        setIsMenuOpen(false);
                      }}>
                        <Settings className="h-4 w-4 mr-2" />
                        Host Dashboard
                      </Button>
                    )}
                    <Button variant="ghost" className="font-inter font-medium justify-start" onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('logout')} ({user?.name})
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <LoginModal 
        open={isLoginModalOpen} 
        onOpenChange={setIsLoginModalOpen} 
      />
    </nav>
  );
};

export default Navigation;