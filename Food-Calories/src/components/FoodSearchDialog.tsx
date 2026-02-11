import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Check, Search } from "lucide-react";
import { ListFoodAPI, ListFoodBase, MealTime, mealTimeToString } from "@/type";
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
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Separator } from "./ui/separator";

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

  const searchItems = data?.data.map((food) => {
    const selected = selectedFood?.code == food.code;
    return (
      <>
        <div
          key={food.code}
          onClick={() => {
            setSelectedFood(food);
          }}
          className={cn(
            "flex gap-2 py-2 hover:bg-muted",
            selected ? "font-bold" : "",
          )}
        >
          <Check className={cn(selected ? "visible" : "invisible")} />
          {food.shmmitzrach}
        </div>
        <Separator />
      </>
    );
  });

  if (status === "error") return <h3>Error</h3>;

  return (
    <DialogContent className="z-50">
      <DialogHeader>
        <DialogTitle>
          מה אכלת היום בארוחת {mealTimeToString(dialogMealTime)}?
        </DialogTitle>
      </DialogHeader>

      <InputGroup>
        <InputGroupInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <InputGroupAddon>
          <Search className="ms-3" />
        </InputGroupAddon>
      </InputGroup>
      <div className="h-[12em] overflow-scroll">{searchItems}</div>

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
