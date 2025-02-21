import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
}

const listFoods = async (foodQuery: string): Promise<ListFoodAPI> => {
  const isFoodQuery = foodQuery?.length == 0;
  const foods = await fetch("/v1/foods" + (isFoodQuery ? "" : "/" + foodQuery));

  if (foods.ok) return await foods.json();

  return { data: [] };
};

function SearchBar({ value, setValue, debounceValue }: SearchBarProps) {
  const [open, setOpen] = useState<boolean>(false);

  const { data, status } = useQuery({
    staleTime: 1000,
    queryKey: ["listFoods", debounceValue],
    queryFn: () => listFoods(debounceValue),
  });

  if (status === "error") return <h3>Error</h3>;
  else if (status === "pending") return <h3>Loading...</h3>;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[800px] justify-between"
        >
          {value
            ? data?.data.find((food) => food.shmmitzrach === value)?.shmmitzrach
            : "Select food..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[800px] p-0">
        <Command>
          <CommandInput
            placeholder="Search food..."
            className="h-9"
            value={value}
            onValueChange={setValue}
          />
          <CommandList>
            <CommandEmpty>No food found.</CommandEmpty>
            <CommandGroup>
              {data?.data.map((food) => (
                <CommandItem
                  key={food.code}
                  value={food.shmmitzrach}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {food.shmmitzrach}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === food.shmmitzrach ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default SearchBar;
