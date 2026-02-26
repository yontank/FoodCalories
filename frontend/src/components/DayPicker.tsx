import { Button } from "./ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { addDays, format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ButtonGroup } from "./ui/button-group";

type Props = {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
};

export function DayPicker({ date, setDate }: Props) {
  // TODO the chevron icons here are hardcoded for RTL - they will be incorrect in LTR
  return (
    <Popover>
      <ButtonGroup>
        <Button
          variant={"outline"}
          size={"icon"}
          onClick={() => setDate(addDays(date, -1))}
        >
          <ChevronRight />
        </Button>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker-simple"
            className="font-normal w-[13em]"
          >
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <Button
          variant={"outline"}
          size={"icon"}
          onClick={() => setDate(addDays(date, 1))}
        >
          <ChevronLeft />
        </Button>
      </ButtonGroup>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          defaultMonth={date}
          required={true}
          dir={"ltr"}
        />
      </PopoverContent>
    </Popover>
  );
}
