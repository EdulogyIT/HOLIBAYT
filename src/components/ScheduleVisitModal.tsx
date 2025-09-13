import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { CalendarIcon, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle: string;
}

const ScheduleVisitModal = ({ isOpen, onClose, propertyTitle }: ScheduleVisitModalProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [message, setMessage] = useState("");

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00",
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime || !visitorName || !visitorPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Visit Scheduled",
      description: `Your visit has been scheduled for ${selectedDate.toLocaleDateString()} at ${selectedTime}`,
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-playfair">
            <CalendarIcon className="w-5 h-5" />
            {t('scheduleVisit') || 'Schedule Property Visit'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-inter">{propertyTitle}</p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar Section */}
          <div className="space-y-4">
            <Label className="text-base font-medium font-inter">Select Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border p-3 pointer-events-auto"
            />
          </div>

          {/* Time Slots & Details */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium font-inter">Available Time Slots</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                    className="font-inter"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {time}
                  </Button>
                ))}
              </div>
            </div>

            {/* Visitor Details */}
            <div className="space-y-3">
              <Label className="text-base font-medium font-inter">Your Details</Label>
              
              <div>
                <Label htmlFor="name" className="text-sm font-inter">Full Name *</Label>
                <Input
                  id="name"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Enter your full name"
                  className="font-inter"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-inter">Phone Number *</Label>
                <Input
                  id="phone"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="font-inter"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-inter">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="font-inter"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-sm font-inter">Additional Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Any specific requirements or questions..."
                  className="font-inter"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Selected Summary */}
        {selectedDate && selectedTime && (
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium font-inter">Visit Summary</h4>
                  <p className="text-sm text-muted-foreground font-inter">
                    {selectedDate.toLocaleDateString()} at {selectedTime}
                  </p>
                </div>
                <Badge variant="secondary" className="font-inter">Confirmed</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1 font-inter">
            Cancel
          </Button>
          <Button 
            onClick={handleSchedule} 
            className="flex-1 bg-gradient-primary hover:shadow-elegant font-inter"
          >
            Schedule Visit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleVisitModal;