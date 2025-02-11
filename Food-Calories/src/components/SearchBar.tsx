import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { ListFood } from "@/type";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const listFoods = async (): Promise<ListFood> => {
  const foods = await fetch("/v1/foods");
  return await foods.json();
};

function SearchBar() {
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");

  const { data, status } = useQuery({
    queryKey: ["listFoods"],
    queryFn: listFoods,
  });

  if (status === "error") return <h3>Error</h3>;
  else if (status === "pending") return <h3>Loading...</h3>;

  console.log(data);

  return (
    <Popover open={open} onOpenChange={setOpen} >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[800px] justify-between"
        >
          {value
            ? data?.data.find((food) => food.shmmitzrach === value)
                ?.shmmitzrach
            : "Select food..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[800px] p-0">
        <Command>
          <CommandInput placeholder="Search food..." className="h-9" />
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
                  {food.shmmitzrach
                    .split("\\")
                    .filter((_, i) => i !== 3)
                    .join(" ")}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === food.shmmitzrach
                        ? "opacity-100"
                        : "opacity-0"
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
