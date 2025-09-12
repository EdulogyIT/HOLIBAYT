import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(formData.email, formData.password);

    if (success) {
      toast({
        title: t('loginSuccess'),
        description: t('loginSuccessDesc'),
      });
      onOpenChange(false);
      setFormData({ email: "", password: "" }); // Reset form
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Try: admin@holibayt.com / password',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">{t('login')}</DialogTitle>
          <DialogDescription className="text-muted-foreground text-center">
            {t('loginDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            />
          </div>

          <div className="flex items-center justify-between">
            <button 
              type="button"
              className="text-sm text-primary hover:underline"
            >
              {t('forgotPassword')}
            </button>
          </div>

          <Button type="submit" className="w-full bg-gradient-primary hover:shadow-elegant" disabled={isLoading}>
            {isLoading ? 'Logging in...' : t('login')}
          </Button>
        </form>

        <Separator className="my-6" />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t('noAccount')}{" "}
            <button 
              className="text-primary hover:underline"
              onClick={() => {
                onOpenChange(false);
                navigate('/register');
              }}
            >
              {t('createAccount')}
            </button>
          </p>
          
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;