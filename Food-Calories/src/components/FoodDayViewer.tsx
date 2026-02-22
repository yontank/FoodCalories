import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TotalCalorieProgress } from "./TotalCalorieProgress";
import { Progress } from "./ui/progress";

import { useState } from "react";

import { MealTime } from "@/type";

import { MealsEatenContainer } from "./MealsEatenContainer";
import CALORIES from "../data/settings.json";
import { MealEntryDialog } from "./MealEntryDialog";
import { NotLoggedInError, reactClient } from "@/api/client";
import { useNavigate } from "react-router";

export function FoodDayViewer() {
  const [mealEntryTime, setMealEntryTime] = useState<MealTime>("breakfast");
  const [mealEntryOpen, setMealEntryOpen] = useState(false);
  const [mealEntryKey, setMealEntryKey] = useState(0);
  const navigate = useNavigate();

  const openMealEntry = (mealTime: MealTime) => {
    setMealEntryKey(Math.random()); // Reset the dialog's contents when adding a new meal entry.
    setMealEntryOpen(true);
    setMealEntryTime(mealTime);
  };

  const { data, isLoading, error } = reactClient.useQuery(
    "get",
    "/v1/meals",
    {
      params: { query: { date: new Date().toISOString().substring(0, 10) } },
    },
    { retry: 0 },
  );

  if (error instanceof NotLoggedInError) {
    navigate("/login");
    return <></>;
  }
  if (isLoading || !data) return "Loading...";

  const proteinSum = data
    .map((e) => (e.protein * e.amount * e.mishkal) / 100)
    .reduce((p, a) => p + a, 0);
  const fatSum = data
    .map((e) => (e.total_fat * e.amount * e.mishkal) / 100)
    .reduce((p, a) => p + a, 0);
  const carbSum = data
    .map((e) => ((e.carbohydrates ?? 0) * e.amount * e.mishkal) / 100)
    .reduce((p, a) => p + a, 0);
  const totalSum = fatSum + proteinSum + carbSum;

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>קלוריות מהיום</CardTitle>
        </CardHeader>

        <CardContent className="h-full">
          <TotalCalorieProgress
            segments={[
              { value: (carbSum / totalSum) * 100 },
              { value: (fatSum / totalSum) * 100, color: "bg-green-300" },
              { value: (proteinSum / totalSum) * 100, color: "bg-red-500" },
            ]}
          />
          <div className="flex w-full justify-around mt-3">
            <Progress
              label="חלבון"
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
              eatenFood={data.filter((e) => e.meal_type == "breakfast")}
              mealTime={"breakfast"}
              openMealEntry={openMealEntry}
              title="ארוחת בוקר"
            />

            <MealsEatenContainer
              eatenFood={data.filter((e) => e.meal_type == "lunch")}
              mealTime={"lunch"}
              openMealEntry={openMealEntry}
              title="ארוחת צהריים"
            />

            <MealsEatenContainer
              eatenFood={data.filter((e) => e.meal_type == "dinner")}
              mealTime={"dinner"}
              openMealEntry={openMealEntry}
              title="ארוחת ערב"
            />
          </div>
        </CardContent>
      </Card>

      <MealEntryDialog
        key={mealEntryKey}
        open={mealEntryOpen}
        setOpen={setMealEntryOpen}
        mealTime={mealEntryTime}
      />
    </>
  );
}
