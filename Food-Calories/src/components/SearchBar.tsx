import { UseQueryResult } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { ListFoodAPI, TIME } from "@/type";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  mealTime?: TIME;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  debounceValue: string;
  query: UseQueryResult<ListFoodAPI, Error>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function SearchBar({ value, setValue, query, open, setOpen }: SearchBarProps) {
  const { data, status } = query;

  if (status === "error") return <h3>Error</h3>;

  const item = data?.data.map((food) => (
    <CommandItem
      key={food.code}
      value={food.shmmitzrach}
      onSelect={(currentValue) => {
        setValue(currentValue === value ? "" : currentValue);
        // setOpen(false);
      }}
    >
      {food.shmmitzrach}
      <Check
        className={cn(
          "ml-auto",
          value === food.shmmitzrach ? "opacity-100" : "opacity-0",
        )}
      />
    </CommandItem>
  ));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {value
            ? data?.data.find((food) => food.shmmitzrach === value)?.shmmitzrach
            : "Select food..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 z-50">
        <Command>
          <CommandInput
            placeholder="Search food..."
            className="h-9"
            value={value}
            onValueChange={setValue}
          />
          <CommandList className="">
            <CommandEmpty>בחר מוצר</CommandEmpty>
            <CommandGroup className="">{item}</CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default SearchBar;
