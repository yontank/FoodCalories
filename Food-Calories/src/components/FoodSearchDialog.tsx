import { useQuery } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { ListFoodAPI, ListFoodBase, MealTime, mealTimeToString } from "@/type";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useDebounce } from "use-debounce";
import { createSearchParams, useNavigate } from "react-router";
import { useState } from "react";

interface SearchBarProps {
  dialogMealTime: MealTime;
  setDialogMealTime: React.Dispatch<React.SetStateAction<MealTime | undefined>>;
}

const listFoods = async (foodQuery: string): Promise<ListFoodAPI> => {
  const isFoodQuery = foodQuery?.length == 0;

  const foods = await fetch(
    "/v1/foods" + (isFoodQuery ? "" : "/" + encodeURI(foodQuery)),
  );

  if (foods.ok) return await foods.json();

  return { data: [] };
};

export function FoodSearchDialog({ dialogMealTime }: SearchBarProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  const [selectedFood, setSelectedFood] = useState<ListFoodBase | undefined>();

  const { status, data } = useQuery({
    queryKey: ["listFoods", debouncedSearch],
    queryFn: ({ queryKey }) => listFoods(queryKey[1]),
  });

  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate({
      pathname: "calc",
      search: createSearchParams({
        shm: selectedFood!.code.toString() ?? "",
        meal: dialogMealTime.toString(),
      }).toString(),
    });
  };

  const item = data?.data.map((food) => (
    <CommandItem
      key={food.code}
      value={food.shmmitzrach}
      onSelect={() => {
        setSelectedFood(food);
      }}
    >
      {food.shmmitzrach}
      <Check
        className={cn(
          "ml-auto",
          selectedFood?.code == food.code ? "opacity-100" : "opacity-0",
        )}
      />
    </CommandItem>
  ));

  if (status === "error") return <h3>Error</h3>;

  return (
    <DialogContent className="z-50">
      <DialogHeader>
        <DialogTitle>
          מה אכלת היום בארוחת {mealTimeToString(dialogMealTime)}?
        </DialogTitle>
      </DialogHeader>

      <Popover defaultOpen={false}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="justify-between">
            {selectedFood ? selectedFood.shmmitzrach : "Select food..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 z-50">
          <Command>
            <CommandInput
              placeholder="Search food..."
              className="h-9"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList className="">
              <CommandEmpty>בחר מוצר</CommandEmpty>
              <CommandGroup className="">{item}</CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <DialogFooter>
        <Button
          type="submit"
          disabled={selectedFood == undefined}
          onClick={() => {
            handleSubmit();
          }}
        >
          הוספה
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
