import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TotalCalorieProgress } from "./TotalCalorieProgress";
import { Progress } from "./ui/progress";
import { Dialog } from "./ui/dialog";

import { useState } from "react";

import { FoodSearchDialog } from "./FoodSearchDialog";
import { EatenTodayQuery, MealTime } from "@/type";

import { useQuery } from "@tanstack/react-query";
import { MealsEatenContainer } from "./MealsEatenContainer";
import CALORIES from "../data/settings.json";

const eatenToday = async (): Promise<{ data: EatenTodayQuery[] }> => {
  const todayMeals = await fetch("/v1/todayMeals");
  return (await todayMeals.json()) ?? { data: [] };
};

export function FoodDayViewer() {
  const [dialogMealTime, setDialogMealTime] = useState<MealTime | undefined>(
    undefined,
  );

  const query = useQuery({
    queryKey: ["getEatenToday"],
    queryFn: () => eatenToday(),
  });

  if (query.isLoading) return "Loading...";

  const proteinSum = query.data?.data
    .map((e) => (e.code.protein * e.amount * e.mishkal.mishkal) / 100)
    .reduce((p, a) => p + a, 0);
  const fatSum = query.data?.data
    .map((e) => (e.code.total_fat * e.amount * e.mishkal.mishkal) / 100)
    .reduce((p, a) => p + a, 0);
  const carbSum = query.data?.data
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
            <div id="food-container" className="flex flex-col gap-3 mt-3">
              <MealsEatenContainer
                eatenFood={query.data?.data.filter(
                  (e) => e.meal_type === MealTime.BREAKFAST,
                )}
                mealTime={MealTime.BREAKFAST}
                setDialogMealTime={setDialogMealTime}
                title="ארוחת בוקר"
              />

              <MealsEatenContainer
                eatenFood={query.data?.data.filter(
                  (e) => e.meal_type === MealTime.LUNCH,
                )}
                mealTime={MealTime.LUNCH}
                setDialogMealTime={setDialogMealTime}
                title="ארוחת צהריים"
              />

              <MealsEatenContainer
                eatenFood={query.data?.data.filter(
                  (e) => e.meal_type === MealTime.DINNER,
                )}
                mealTime={MealTime.DINNER}
                setDialogMealTime={setDialogMealTime}
                title="ארוחת ערב"
              />
            </div>
          </CardContent>
        </Card>

        {dialogMealTime !== undefined && (
          <FoodSearchDialog
            dialogMealTime={dialogMealTime}
            setDialogMealTime={setDialogMealTime}
          />
        )}
      </Dialog>
    </>
  );
}
