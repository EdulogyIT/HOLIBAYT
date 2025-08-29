import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRangePicker } from "./DateRangePicker";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface DateRangeInputsProps {
  value?: { from?: Date; to?: Date };
  onChange: (range?: { from?: Date; to?: Date }) => void;
  allowPast?: boolean;
  className?: string;
}

export function DateRangeInputs({ 
  value, 
  onChange, 
  allowPast = true, 
  className 
}: DateRangeInputsProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("flex gap-2", className)}>
      {/* From Date Input */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex-1 justify-start text-left font-inter text-sm h-12",
              !value?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? format(value.from, "dd/MM/yyyy") : t('from')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DateRangePicker
            value={value}
            onChange={(range) => {
              onChange(range);
              if (range?.from && range?.to) {
                setIsOpen(false);
              }
            }}
            allowPast={allowPast}
          />
        </PopoverContent>
      </Popover>

      {/* To Date Input */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex-1 justify-start text-left font-inter text-sm h-12",
              !value?.to && "text-muted-foreground"
            )}
            disabled={!value?.from}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.to ? format(value.to, "dd/MM/yyyy") : t('to')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DateRangePicker
            value={value}
            onChange={(range) => {
              onChange(range);
              if (range?.from && range?.to) {
                setIsOpen(false);
              }
            }}
            allowPast={allowPast}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}