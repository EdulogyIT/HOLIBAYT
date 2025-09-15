import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export default function UnifiedAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    name: '',
    email: '', 
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(loginData.email, loginData.password);

    if (success) {
      toast({
        title: t('loginSuccess'),
        description: t('loginSuccessDesc'),
      });
      navigate(from, { replace: true });
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password. Try: admin@holibayt.com / password',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: 'Registration Failed',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const result = await register(registerData.name, registerData.email, registerData.password);

    if (result.success) {
      if (result.needsConfirmation) {
        toast({
          title: 'Check Your Email',
          description: 'Please check your email and click the confirmation link to complete registration.',
          duration: 6000,
        });
      } else {
        toast({
          title: 'Registration Successful',
          description: 'Welcome to Holibayt! You are now logged in.',
        });
        navigate('/');
      }
    } else {
      toast({
        title: 'Registration Failed',
        description: 'Email already exists or invalid data',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  const handleLoginInputChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegisterInputChange = (field: string, value: string) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img 
              src="/lovable-uploads/bd206675-bfd0-4aee-936b-479f6c1240ca.png" 
              alt="Holibayt" 
              className="h-16 w-auto mx-auto mb-4"
            />
          </Link>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex bg-muted rounded-lg p-1 mb-4">
              <Button
                variant={isLogin ? "default" : "ghost"}
                className="flex-1 transition-all duration-300"
                onClick={() => setIsLogin(true)}
                type="button"
              >
                {t('login')}
              </Button>
              <Button
                variant={!isLogin ? "default" : "ghost"}
                className="flex-1 transition-all duration-300"
                onClick={() => setIsLogin(false)}
                type="button"
              >
                {t('createAccount')}
              </Button>
            </div>
            <CardTitle className="transition-all duration-300">
              {isLogin ? t('login') : t('createAccount')}
            </CardTitle>
            <CardDescription className="transition-all duration-300">
              {isLogin ? t('loginDescription') : 'Create your Holibayt account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-hidden">
              <div 
                className={`transition-transform duration-500 ease-in-out ${
                  isLogin ? 'translate-x-0' : '-translate-x-full'
                }`}
              >
                {/* Login Form */}
                <div className={`${isLogin ? 'block' : 'hidden'}`}>
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t('email')}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        value={loginData.email}
                        onChange={(e) => handleLoginInputChange('email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t('password')}</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => handleLoginInputChange('password', e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Logging in...' : t('login')}
                    </Button>

                    <div className="text-center">
                      <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                        {t('forgotPassword')}
                      </Link>
                    </div>
                  </form>
                </div>

                {/* Register Form */}
                <div className={`${!isLogin ? 'block' : 'hidden'}`}>
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={registerData.name}
                        onChange={(e) => handleRegisterInputChange('name', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">{t('email')}</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        value={registerData.email}
                        onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">{t('password')}</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a password"
                        value={registerData.password}
                        onChange={(e) => handleRegisterInputChange('password', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirmPassword">Confirm Password</Label>
                      <Input
                        id="register-confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={registerData.confirmPassword}
                        onChange={(e) => handleRegisterInputChange('confirmPassword', e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}