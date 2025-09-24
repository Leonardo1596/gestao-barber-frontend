"use client";

import * as React from "react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type MonthSelectorProps = {
  onRangeChange: (start: Date, end: Date) => void;
};

export function MonthSelector({ onRangeChange }: MonthSelectorProps) {
  const [selectedRange, setSelectedRange] = React.useState<DateRange>(() => {
    const today = new Date();
    return {
      from: startOfMonth(today),
      to: endOfMonth(today),
    };
  });

  const [popoverOpen, setPopoverOpen] = React.useState(false);

  React.useEffect(() => {
    if (selectedRange?.from && selectedRange?.to) {
      onRangeChange(selectedRange.from, selectedRange.to);
    }
  }, [selectedRange, onRangeChange]);

  // usuário clicou num dia → atualiza intervalo
  const handleDateSelect = (range: DateRange | undefined) => {
    if (range) {
      setSelectedRange(range);
    }
    if (range?.from && range?.to) {
      setPopoverOpen(false);
    }
  };

  // botões de navegação entre meses
  const changeMonth = (direction: "prev" | "next") => {
    if (!selectedRange?.from) return;
    const baseDate = selectedRange.from;
    const newDate =
      direction === "prev" ? subMonths(baseDate, 1) : addMonths(baseDate, 1);

    setSelectedRange({
      from: startOfMonth(newDate),
      to: endOfMonth(newDate),
    });
  };

  const start = selectedRange?.from;
  const end = selectedRange?.to;

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={() => changeMonth("prev")}>
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Mês anterior</span>
      </Button>

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full sm:w-[280px] justify-start text-left font-normal",
              !selectedRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {start && end ? (
              <span>
                {format(start, "d MMM", { locale: ptBR })} -{" "}
                {format(end, "d MMM yyyy", { locale: ptBR })}
              </span>
            ) : (
              <span>Selecione um intervalo</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full max-w-xs p-0 overflow-auto"
          style={{ maxHeight: "350px" }}
        >
          <div className="min-w-0">
            <Calendar
              mode="range"
              selected={selectedRange}
              onSelect={handleDateSelect}
              initialFocus
              locale={ptBR}
              className="min-w-0"
            />
          </div>
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="icon" onClick={() => changeMonth("next")}>
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Próximo mês</span>
      </Button>
    </div>
  );
}
