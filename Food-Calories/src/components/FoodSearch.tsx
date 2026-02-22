import { Button } from "@/components/ui/button";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "use-debounce";
import { Fragment, useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Separator } from "./ui/separator";
import { reactClient } from "@/api/client";
import { FoodDetail } from "@/type";

interface Props {
  selectedFood?: FoodDetail;
  setSelectedFood: React.Dispatch<React.SetStateAction<FoodDetail | undefined>>;
  show: boolean;
}

/**
 * Lets the user search for a specific food item by its name and select it.
 */
export function FoodSearch({ show, selectedFood, setSelectedFood }: Props) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  const [selectedFoodPre, setSelectedFoodPre] = useState<
    FoodDetail | undefined
  >(selectedFood);

  const { status, data } = reactClient.useQuery("get", "/v1/foods", {
    params: { query: { food_query: debouncedSearch } },
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
      <div className="h-[12em] overflow-scroll">
        {data &&
          data.map((food) => {
            const selected = selectedFoodPre?.food_id == food.food_id;
            return (
              <Fragment key={food.food_id}>
                <div
                  key={food.food_id}
                  onClick={() => {
                    setSelectedFoodPre(food);
                  }}
                  className={cn(
                    "flex gap-2 py-2 hover:bg-muted",
                    selected ? "font-bold" : "",
                  )}
                >
                  <Check className={cn(selected ? "visible" : "invisible")} />
                  {food.food_name}
                </div>
                <Separator />
              </Fragment>
            );
          })}
      </div>

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
