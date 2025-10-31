import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AuthenticationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthenticationModal = ({ isOpen, onClose }: AuthenticationModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+213");
  const navigate = useNavigate();

  const handleContinue = () => {
    // For now, redirect to login page for full authentication flow
    onClose();
    navigate("/auth/login");
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as 'google' | 'apple' | 'facebook',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        console.error(`${provider} login error:`, error);
        toast.error(`Failed to sign in with ${provider}`);
      }
    } catch (err) {
      console.error(`${provider} login exception:`, err);
      toast.error(`An error occurred during ${provider} login`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 rounded-full h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-semibold">
              Connexion ou inscription
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country">Pays/région</Label>
              <select
                id="country"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="+213">Algérie (+213)</option>
                <option value="+33">France (+33)</option>
                <option value="+1">États-Unis (+1)</option>
                <option value="+44">Royaume-Uni (+44)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={countryCode}
                  disabled
                  className="w-24 rounded-xl"
                />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Numéro de téléphone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 rounded-xl"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Nous vous appellerons ou vous enverrons un SMS pour confirmer votre numéro. 
              Les frais standards de message et de transfert de données s'appliquent.
            </p>

            <Button 
              onClick={handleContinue}
              className="w-full h-12 rounded-xl font-semibold"
            >
              Continuer
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">ou</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                className="w-full h-12 rounded-xl font-semibold justify-start gap-3"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuer avec Google
              </Button>

              <Button
                variant="outline"
                onClick={() => handleSocialLogin('apple')}
                className="w-full h-12 rounded-xl font-semibold justify-start gap-3"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continuer avec Apple
              </Button>

              <Button
                variant="outline"
                onClick={() => handleSocialLogin('facebook')}
                className="w-full h-12 rounded-xl font-semibold justify-start gap-3"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continuer avec Facebook
              </Button>

              <Button
                variant="outline"
                onClick={handleContinue}
                className="w-full h-12 rounded-xl font-semibold justify-start gap-3"
              >
                <Mail className="h-5 w-5" />
                Continuer avec l'e-mail
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
