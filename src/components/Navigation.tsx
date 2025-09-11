import { Button } from "@/components/ui/button";
import { Menu, X, Globe, LogOut, Settings, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/LoginModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { currentLang, setCurrentLang, t } = useLanguage();
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const tt = (key: string, fallback: string) => (t(key) || fallback) as string;

  const languages: Array<{ code: Language; name: string; flag: string }> = [
    { code: "FR", name: "Français", flag: "🇫🇷" },
    { code: "EN", name: "English",  flag: "🇺🇸" },
    { code: "AR", name: "العربية",   flag: "🇩🇿" },
  ];

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Navigation: Logout error:', error);
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/">
              <img
                src="/lovable-uploads/bd206675-bfd0-4aee-936b-479f6c1240ca.png"
                alt="Holibayt Logo"
                className="h-16 w-auto cursor-pointer mt-2 drop-shadow-lg hover:scale-105 transition-transform duration-300"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 103, 105, 0.3))' }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-inter">
              {tt('home', 'Home')}
            </Link>
            <Link to="/buy" className="text-foreground hover:text-primary transition-colors font-inter">
              {tt('buy', 'Buy')}
            </Link>
            <Link to="/rent" className="text-foreground hover:text-primary transition-colors font-inter">
              {tt('rent', 'Rent')}
            </Link>
            <Link to="/short-stay" className="text-foreground hover:text-primary transition-colors font-inter">
              {tt('shortStay', 'Short Stay')}
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors font-inter">
              {tt('about', 'About')}
            </Link>
            <Link to="/blog" className="text-foreground hover:text-primary transition-colors font-inter">
              {tt('blog', 'Blog')}
            </Link>
          </div>

          {/* Language Switcher & CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Change language" className="font-inter">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="flex items-center space-x-2"
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
                <Button variant="ghost" className="font-inter font-medium" onClick={() => setIsLoginModalOpen(true)}>
                  {tt('login', 'Login')}
                </Button>
                <Button className="bg-gradient-primary font-inter font-medium hover:shadow-elegant" onClick={() => setIsLoginModalOpen(true)}>
                  {tt('publishProperty', 'Publish Property')}
                </Button>
              </>
            ) : (
              <>
                {!hasRole('host') && !hasRole('admin') && (
                  <Button
                    className="bg-gradient-primary font-inter font-medium hover:shadow-elegant"
                    onClick={() => navigate('/host/onboarding')}
                  >
                    {tt('becomeHost', 'Become a Host')}
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="font-inter font-medium">
                      <User className="h-4 w-4 mr-2" />
                      {user?.profile?.display_name || user?.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {hasRole('admin') && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Settings className="h-4 w-4 mr-2" />
                        {tt('adminDashboard', 'Admin Dashboard')}
                      </DropdownMenuItem>
                    )}
                    {hasRole('host') && (
                      <DropdownMenuItem onClick={() => navigate('/host')}>
                        <Settings className="h-4 w-4 mr-2" />
                        {tt('hostDashboard', 'Host Dashboard')}
                      </DropdownMenuItem>
                    )}
                    {hasRole('user') && (
                      <DropdownMenuItem onClick={() => navigate('/bookings')}>
                        {tt('myBookings', 'My Bookings')}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate('/publish-property')}>
                      {tt('publishProperty', 'Publish Property')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {tt('logout', 'Logout')}
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
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-foreground hover:text-primary transition-colors font-inter font-medium" onClick={() => setIsMenuOpen(false)}>
                {tt('home', 'Home')}
              </Link>
              <Link to="/buy" className="text-foreground hover:text-primary transition-colors font-inter font-medium" onClick={() => setIsMenuOpen(false)}>
                {tt('buy', 'Buy')}
              </Link>
              <Link to="/rent" className="text-foreground hover:text-primary transition-colors font-inter font-medium" onClick={() => setIsMenuOpen(false)}>
                {tt('rent', 'Rent')}
              </Link>
              <Link to="/short-stay" className="text-foreground hover:text-primary transition-colors font-inter font-medium" onClick={() => setIsMenuOpen(false)}>
                {tt('shortStay', 'Short Stay')}
              </Link}
              >
              <Link to="/about" className="text-foreground hover:text-primary transition-colors font-inter font-medium" onClick={() => setIsMenuOpen(false)}>
                {tt('about', 'About')}
              </Link>
              <Link to="/blog" className="text-foreground hover:text-primary transition-colors font-inter font-medium" onClick={() => setIsMenuOpen(false)}>
                {tt('blog', 'Blog')}
              </Link>

              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="font-inter font-medium justify-start">
                      <Globe className="h-4 w-4 mr-2" />
                      {languages.find(l => l.code === currentLang)?.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => {
                          handleLanguageChange(lang.code);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-2"
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
                      {tt('login', 'Login')}
                    </Button>
                    <Button className="bg-gradient-primary font-inter font-medium hover:shadow-elegant justify-start" onClick={() => {
                      setIsLoginModalOpen(true);
                      setIsMenuOpen(false);
                    }}>
                      {tt('publishProperty', 'Publish Property')}
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
                        {tt('becomeHost', 'Become a Host')}
                      </Button>
                    )}

                    {hasRole('admin') && (
                      <Button variant="ghost" className="font-inter font-medium justify-start" onClick={() => {
                        navigate('/admin');
                        setIsMenuOpen(false);
                      }}>
                        <Settings className="h-4 w-4 mr-2" />
                        {tt('adminDashboard', 'Admin Dashboard')}
                      </Button>
                    )}

                    {hasRole('host') && (
                      <Button variant="ghost" className="font-inter font-medium justify-start" onClick={() => {
                        navigate('/host');
                        setIsMenuOpen(false);
                      }}>
                        <Settings className="h-4 w-4 mr-2" />
                        {tt('hostDashboard', 'Host Dashboard')}
                      </Button>
                    )}

                    {hasRole('user') && (
                      <Button variant="ghost" className="font-inter font-medium justify-start" onClick={() => {
                        navigate('/bookings');
                        setIsMenuOpen(false);
                      }}>
                        {tt('myBookings', 'My Bookings')}
                      </Button>
                    )}

                    <Button variant="ghost" className="font-inter font-medium justify-start" onClick={() => {
                      navigate('/publish-property');
                      setIsMenuOpen(false);
                    }}>
                      {tt('publishProperty', 'Publish Property')}
                    </Button>

                    <Button variant="ghost" className="font-inter font-medium justify-start" onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {tt('logout', 'Logout')} ({user?.profile?.display_name || user?.email})
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
