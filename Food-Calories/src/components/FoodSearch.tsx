import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Check, Search } from "lucide-react";
import { ListFoodAPI, ListFoodBase } from "@/type";
import { cn } from "@/lib/utils";
import { useDebounce } from "use-debounce";
import { useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Separator } from "./ui/separator";

interface Props {
  selectedFood?: ListFoodBase;
  setSelectedFood: React.Dispatch<
    React.SetStateAction<ListFoodBase | undefined>
  >;
  show: boolean;
}

const listFoods = async (foodQuery: string): Promise<ListFoodAPI> => {
  const isFoodQuery = foodQuery?.length == 0;

  const foods = await fetch(
    "/v1/foods" + (isFoodQuery ? "" : "/" + encodeURI(foodQuery)),
  );

  if (foods.ok) return await foods.json();

  return { data: [] };
};

/**
 * Lets the user search for a specific food item by its name and select it.
 */
export function FoodSearch({ show, selectedFood, setSelectedFood }: Props) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  const [selectedFoodPre, setSelectedFoodPre] = useState<
    ListFoodBase | undefined
  >(selectedFood);

  const { status, data } = useQuery({
    queryKey: ["listFoods", debouncedSearch],
    queryFn: ({ queryKey }) => listFoods(queryKey[1]),
  });

  const searchItems = data?.data.map((food) => {
    const selected = selectedFoodPre?.code == food.code;
    return (
      <>
        <div
          key={food.code}
          onClick={() => {
            setSelectedFoodPre(food);
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
    <div className={show ? "" : "hidden"}>
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

      <Button
        type="submit"
        disabled={selectedFoodPre == undefined}
        className="mt-4 w-full"
        onClick={() => {
          setSelectedFood(selectedFoodPre);
        }}
      >
        בחירה
      </Button>
    </div>
  );
}
