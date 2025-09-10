import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { login, signup } = useAuth();
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('LoginModal: Form submitted, isSignupMode:', isSignupMode);

    if (isSignupMode) {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: 'Password Mismatch',
          description: 'Passwords do not match. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      console.log('LoginModal: Calling signup');
      const { success, error } = await signup(
        formData.email, 
        formData.password, 
        formData.displayName || formData.email
      );
      console.log('LoginModal: Signup result:', { success, error });

      if (success) {
        toast({
          title: 'Account Created',
          description: 'Your account has been created successfully. Please check your email for confirmation.',
        });
        onOpenChange(false);
        resetForm();
      } else {
        toast({
          title: 'Signup Failed',
          description: error || 'Failed to create account. Please try again.',
          variant: 'destructive',
        });
      }
    } else {
      console.log('LoginModal: Calling login for:', formData.email);
      const { success, error } = await login(formData.email, formData.password);
      console.log('LoginModal: Login result:', { success, error });

      if (success) {
        console.log('LoginModal: Login successful, closing modal');
        toast({
          title: t('loginSuccess'),
          description: t('loginSuccessDesc'),
        });
        onOpenChange(false);
        resetForm();
      } else {
        console.log('LoginModal: Login failed:', error);
        toast({
          title: 'Login Failed',
          description: error || 'Invalid credentials. Please check your email and password.',
          variant: 'destructive',
        });
      }
    }

    console.log('LoginModal: Setting loading to false');
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({ email: "", password: "", confirmPassword: "", displayName: "" });
  };

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode);
    resetForm();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {isSignupMode ? 'Create Account' : t('login')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-center">
            {isSignupMode 
              ? 'Join Holibayt to start your real estate journey'
              : t('loginDescription')
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignupMode && (
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Enter your full name"
                value={formData.displayName}
                onChange={(e) => handleInputChange("displayName", e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
              minLength={6}
            />
          </div>

          {isSignupMode && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
                minLength={6}
              />
            </div>
          )}

          {!isSignupMode && (
            <div className="flex items-center justify-between">
              <button 
                type="button"
                className="text-sm text-primary hover:underline"
              >
                {t('forgotPassword')}
              </button>
            </div>
          )}

          <Button type="submit" className="w-full bg-gradient-primary hover:shadow-elegant" disabled={isLoading}>
            {isLoading 
              ? (isSignupMode ? 'Creating Account...' : 'Logging in...') 
              : (isSignupMode ? 'Create Account' : t('login'))
            }
          </Button>
        </form>

        <Separator className="my-6" />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {isSignupMode ? 'Already have an account?' : t('noAccount')}{" "}
            <button 
              type="button"
              onClick={toggleMode}
              className="text-primary hover:underline"
            >
              {isSignupMode ? 'Sign In' : t('createAccount')}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;