import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TotalCalorieProgress } from "./TotalCalorieProgress";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { useState } from "react";

import { Button } from "./ui/button";
import SearchBar from "./SearchBar";
import { ListFoodAPI, TIME } from "@/type";

import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import { createSearchParams, useNavigate } from "react-router";
import { Plus } from "lucide-react";

const eatenToday = async (): Promise<any> => {
  const todayMeals = await fetch("/v1/todayMeals");
  console.log("MEALS ", await todayMeals.json());
};

const listFoods = async (foodQuery: string): Promise<ListFoodAPI> => {
  const isFoodQuery = foodQuery?.length == 0;

  const foods = await fetch(
    "/v1/foods" + (isFoodQuery ? "" : "/" + encodeURI(foodQuery))
  );

  if (foods.ok) return await foods.json();

  return { data: [] };
};

function SearchItems() {
  const [mealType, setMealType] = useState<TIME | undefined>(undefined);
  const [value, setValue] = useState<string>("");
  const [debounceValue] = useDebounce(value, 1000);

  const query = useQuery({
    queryKey: ["listFoods", debounceValue],
    queryFn: () => listFoods(debounceValue),
  });
  const navigate = useNavigate();

  const handleSubmit = (shm: string, mealType: string) => {
    const foodInfo = query.data?.data.find((e) => e.shmmitzrach === shm);
    navigate({
      pathname: "calc",
      search: createSearchParams({
        shm: foodInfo?.code.toString() ?? "",
        meal: mealType,
      }).toString(),
    });
  };

  eatenToday();

  return (
    <>
      <Dialog>
        <Card>
          <CardHeader>
            <CardTitle>Count calories</CardTitle>
            <CardDescription>Counts Calories Of A Given Day</CardDescription>
          </CardHeader>

          <CardContent className="h-full">
            <TotalCalorieProgress
              segments={[{ value: 10 }, { value: 50, color: "bg-red-500" }]}
            />
            <div className="flex w-full justify-around mt-3">
              <Progress label="חלבון" />
              <Progress label="שומן" />
              <Progress label="פחמימה" />
            </div>
            <Separator className="mt-3" />
  
            <div id="food-container" className="gap-6 h-screen ">
              <div className="-full h-1/5 border-dotted border-4 border-b-gray-600 mb-3">
                <DialogTrigger asChild>
                  <Button
                    className="rounded-full w-14 h-14"
                    onClick={() => {
                      setMealType(TIME.BREAKFAST);
                    }}
                  >
                    <Plus />
                  </Button>
                </DialogTrigger>
                <h2 className="inline">ארוחת בוקר</h2>
              </div>

              <div className="w-full h-1/5 border-dotted border-4 border-b-gray-600 mb-3">
                <DialogTrigger asChild>
                  <Button
                    className="rounded-full w-14 h-14"
                    onClick={() => {
                      setMealType(TIME.LUNCH);
                    }}
                  >
                    <Plus />
                  </Button>
                </DialogTrigger>
                <h2 className="inline">ארוחת צהריים</h2>
              </div>

              <div className="w-full h-1/5 border-dotted border-4 border-b-gray-600 mb-3">
                <DialogTrigger asChild>
                  <Button
                    className="rounded-full w-14 h-14"
                    onClick={() => {
                      setMealType(TIME.DINNER);
                    }}
                  >
                    <Plus />
                  </Button>
                </DialogTrigger>
                <h2 className="inline">ארוחת ערב</h2>
              </div>
            </div>
          </CardContent>
        </Card>
        <DialogContent className="sm:max-w-[950px]">
          <DialogHeader>
            <DialogTitle>מה אכלת היום?</DialogTitle>
          </DialogHeader>
          <SearchBar
            mealTime={mealType}
            value={value}
            setValue={setValue}
            debounceValue={debounceValue}
            query={query}
          />

          <DialogFooter>
            <Button
              type="submit"
              onClick={() => {
                handleSubmit(value, mealType?.toString() ?? "");
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SearchItems;
