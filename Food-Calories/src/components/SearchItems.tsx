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
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";

import { useState } from "react";

import { Button } from "./ui/button";
import SearchBar from "./SearchBar";
import { EatenTodayQuery, ListFoodAPI, TIME } from "@/type";

import { useDebounce } from "use-debounce";
import { useQueries } from "@tanstack/react-query";
import { createSearchParams, useNavigate } from "react-router";
import MealsEatenContainer from "./MealsEatenContainer";
import CALORIES from "../data/settings.json";

const eatenToday = async (): Promise<{ data: EatenTodayQuery[] }> => {
  const todayMeals = await fetch("/v1/todayMeals");
  return (await todayMeals.json()) ?? { data: [] };
};

const listFoods = async (foodQuery: string): Promise<ListFoodAPI> => {
  const isFoodQuery = foodQuery?.length == 0;

  const foods = await fetch(
    "/v1/foods" + (isFoodQuery ? "" : "/" + encodeURI(foodQuery)),
  );

  if (foods.ok) return await foods.json();

  return { data: [] };
};

function SearchItems() {
  const [mealType, setMealType] = useState<TIME | undefined>(undefined);
  const [value, setValue] = useState<string>("");
  const [debounceValue] = useDebounce(value, 500);
  const [open, setOpen] = useState<boolean>(false);

  const query = useQueries({
    queries: [
      {
        enabled: open,
        queryKey: ["listFoods", debounceValue],
        queryFn: () => listFoods(debounceValue),
      },
      {
        queryKey: ["getEatenToday"],
        queryFn: () => eatenToday(),
      },
    ],
  });
  const navigate = useNavigate();

  const handleSubmit = (shm: string, mealType: string) => {
    const foodInfo = query[0].data?.data.find((e) => e.shmmitzrach === shm);
    navigate({
      pathname: "calc",
      search: createSearchParams({
        shm: foodInfo?.code.toString() ?? "",
        meal: mealType,
      }).toString(),
    });
  };

  if (query[1].isLoading) return "Loading...";

  const proteinSum = query[1].data?.data
    .map((e) => (e.code.protein * e.amount * e.mishkal.mishkal) / 100)
    .reduce((p, a) => p + a, 0);
  const fatSum = query[1].data?.data
    .map((e) => (e.code.total_fat * e.amount * e.mishkal.mishkal) / 100)
    .reduce((p, a) => p + a, 0);
  const carbSum = query[1].data?.data
    .map((e) => (e.code.carbohydrates * e.amount * e.mishkal.mishkal) / 100)
    .reduce((p, a) => p + a, 0);
  const totalSum = (fatSum ?? 0) + (proteinSum ?? 0) + (carbSum ?? 0);

  return (
    <>
      <Dialog>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>קלוריות מהיום</CardTitle>
          </CardHeader>

          <CardContent className="h-full">
            <TotalCalorieProgress
              segments={[
                { value: (carbSum! / totalSum) * 100 },
                { value: (fatSum! / totalSum) * 100, color: "bg-green-300" },
                { value: (proteinSum! / totalSum) * 100, color: "bg-red-500" },
              ]}
            />
            <div className="flex w-full justify-around mt-3">
              <Progress
                label={"חלבון"}
                value={(proteinSum! / CALORIES.total_grams_protein) * 100}
                indicatorClassName="bg-red-500"
              />
              <Progress
                label="שומן"
                value={(fatSum! / CALORIES.total_grams_fat) * 100}
                indicatorClassName="bg-green-300"
              />
              <Progress
                label="פחמימה"
                value={(carbSum! / CALORIES.total_grams_carbs) * 100}
              />
            </div>
            <div id="food-container" className="gap-6 mt-3">
              <MealsEatenContainer
                eatenFood={query[1].data?.data.filter(
                  (e) => e.meal_type === TIME.BREAKFAST,
                )}
                time={TIME.BREAKFAST}
                setMealType={setMealType}
                title="ארוחת בוקר"
              />
              <MealsEatenContainer
                eatenFood={query[1].data?.data.filter(
                  (e) => e.meal_type === TIME.LUNCH,
                )}
                time={TIME.LUNCH}
                setMealType={setMealType}
                title="ארוחת צהריים"
              />

              <MealsEatenContainer
                eatenFood={query[1].data?.data.filter(
                  (e) => e.meal_type === TIME.DINNER,
                )}
                time={TIME.DINNER}
                setMealType={setMealType}
                title="ארוחת ערב"
              />
            </div>
          </CardContent>
        </Card>

        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle>מה אכלת היום?</DialogTitle>
          </DialogHeader>

          <SearchBar
            open={open}
            setOpen={setOpen}
            mealTime={mealType}
            value={value}
            setValue={setValue}
            debounceValue={debounceValue}
            query={query[0]}
          />

          <DialogFooter>
            <Button
              type="submit"
              onClick={() => {
                handleSubmit(value, mealType?.toString() ?? "");
              }}
            >
              הוספה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SearchItems;
