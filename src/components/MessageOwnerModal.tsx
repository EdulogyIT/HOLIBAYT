import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Send, User, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MessageOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerName: string;
  ownerEmail: string;
  propertyTitle: string;
  propertyId: string;
  isSecureMode?: boolean;
}

const MessageOwnerModal = ({ isOpen, onClose, ownerName, ownerEmail, propertyTitle, propertyId, isSecureMode = false }: MessageOwnerModalProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState(`Inquiry about: ${propertyTitle}`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendMessage = async () => {
    if (!senderName || !senderEmail || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_requests')
        .insert({
          property_id: propertyId,
          requester_name: senderName,
          requester_email: senderEmail,
          requester_phone: senderPhone || null,
          subject,
          message,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Message Sent Successfully",
        description: isSecureMode 
          ? "Your secure contact request has been sent to the property owner. They will contact you if interested."
          : `Your message has been sent to ${ownerName}`,
      });
      
      // Reset form
      setSenderName("");
      setSenderEmail("");
      setSenderPhone("");
      setMessage("");
      setSubject(`Inquiry about: ${propertyTitle}`);
      
      onClose();
    } catch (error) {
      console.error('Error sending contact request:', error);
      toast({
        title: "Failed to Send Message",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-playfair">
            {isSecureMode ? <Shield className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
            {isSecureMode 
              ? (t('secureContactRequest') || 'Secure Contact Request')
              : (t('sendMessageBtn') || 'Send Message')
            }
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Owner Info / Security Notice */}
          {isSecureMode ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium font-inter text-green-800">Privacy Protected</h4>
                <p className="text-sm text-green-600 font-inter">Your contact details will only be shared if the owner responds</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Avatar>
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium font-inter">{ownerName}</h4>
                <p className="text-sm text-muted-foreground font-inter">{ownerEmail}</p>
              </div>
            </div>
          )}

          {/* Property Reference */}
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm font-medium font-inter">Property Inquiry</p>
            <p className="text-sm text-muted-foreground font-inter">{propertyTitle}</p>
          </div>

          {/* Message Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject" className="text-sm font-inter">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="font-inter"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="senderName" className="text-sm font-inter">Your Name *</Label>
                <Input
                  id="senderName"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Enter your full name"
                  className="font-inter"
                />
              </div>

              <div>
                <Label htmlFor="senderEmail" className="text-sm font-inter">Your Email *</Label>
                <Input
                  id="senderEmail"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="font-inter"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="senderPhone" className="text-sm font-inter">Your Phone Number</Label>
              <Input
                id="senderPhone"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="font-inter"
              />
            </div>

            <div>
              <Label htmlFor="messageText" className="text-sm font-inter">Message *</Label>
              <Textarea
                id="messageText"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                className="font-inter min-h-[120px]"
                rows={5}
              />
            </div>

            <div className="text-xs text-muted-foreground font-inter">
              * Required fields
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 font-inter">
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={isSubmitting}
              className="flex-1 bg-gradient-primary hover:shadow-elegant font-inter"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Sending..." : (isSecureMode ? "Send Secure Request" : "Send Message")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageOwnerModal;