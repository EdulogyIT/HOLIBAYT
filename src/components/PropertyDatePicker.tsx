import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface PropertyDatePickerProps {
  onDateChange: (dates: { checkIn: Date | undefined; checkOut: Date | undefined }) => void;
}

const PropertyDatePicker = ({ onDateChange }: PropertyDatePickerProps) => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();

  const handleCheckInChange = (date: Date | undefined) => {
    setCheckIn(date);
    // Reset checkout if it's before the new checkin date
    if (date && checkOut && checkOut <= date) {
      setCheckOut(undefined);
      onDateChange({ checkIn: date, checkOut: undefined });
    } else {
      onDateChange({ checkIn: date, checkOut });
    }
  };

  const handleCheckOutChange = (date: Date | undefined) => {
    setCheckOut(date);
    onDateChange({ checkIn, checkOut: date });
  };

  const calculateNights = () => {
    if (checkIn && checkOut) {
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff;
    }
    return 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-playfair">Dates de séjour</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Check-in Date */}
          <div className="space-y-2">
            <label className="text-sm font-inter font-medium text-foreground">Date d'arrivée</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-inter",
                    !checkIn && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkIn ? format(checkIn, "PPP", { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={handleCheckInChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-out Date */}
          <div className="space-y-2">
            <label className="text-sm font-inter font-medium text-foreground">Date de départ</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-inter",
                    !checkOut && "text-muted-foreground"
                  )}
                  disabled={!checkIn}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkOut ? format(checkOut, "PPP", { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkOut}
                  onSelect={handleCheckOutChange}
                  disabled={(date) => !checkIn || date <= checkIn}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Duration Summary */}
        {checkIn && checkOut && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-center space-y-2">
              <div className="text-sm font-inter text-muted-foreground">Durée du séjour</div>
              <div className="text-2xl font-playfair font-bold text-primary">
                {calculateNights()} {calculateNights() === 1 ? 'nuit' : 'nuits'}
              </div>
              <div className="text-xs font-inter text-muted-foreground">
                Du {format(checkIn, "dd MMM", { locale: fr })} au {format(checkOut, "dd MMM yyyy", { locale: fr })}
              </div>
            </div>
          </div>
        )}

        {/* Quick Selection */}
        <div className="space-y-2">
          <label className="text-sm font-inter font-medium text-foreground">Sélection rapide</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="font-inter text-xs"
              onClick={() => {
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                handleCheckInChange(today);
                handleCheckOutChange(tomorrow);
              }}
            >
              1 nuit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="font-inter text-xs"
              onClick={() => {
                const today = new Date();
                const weekLater = new Date(today);
                weekLater.setDate(today.getDate() + 7);
                handleCheckInChange(today);
                handleCheckOutChange(weekLater);
              }}
            >
              1 semaine
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="font-inter text-xs"
              onClick={() => {
                const friday = new Date();
                const dayOfWeek = friday.getDay();
                const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
                if (daysUntilFriday === 0 && friday.getDay() === 5) {
                  // It's already Friday
                } else {
                  friday.setDate(friday.getDate() + daysUntilFriday);
                }
                const sunday = new Date(friday);
                sunday.setDate(friday.getDate() + 2);
                handleCheckInChange(friday);
                handleCheckOutChange(sunday);
              }}
            >
              Week-end
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="font-inter text-xs"
              onClick={() => {
                const today = new Date();
                const monthLater = new Date(today);
                monthLater.setMonth(today.getMonth() + 1);
                handleCheckInChange(today);
                handleCheckOutChange(monthLater);
              }}
            >
              1 mois
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyDatePicker;