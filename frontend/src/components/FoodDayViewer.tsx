import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TotalCalorieProgress } from "./TotalCalorieProgress";
import { Progress } from "./ui/progress";

import { useEffect, useState } from "react";

import { MealTime } from "@/type";

import { MealsEatenContainer } from "./MealsEatenContainer";
import CALORIES from "../data/settings.json";
import { MealEntryDialog } from "./MealEntryDialog";
import { NotLoggedInError, reactClient } from "@/api/client";
import { useNavigate } from "react-router";
import { DayPicker } from "./DayPicker";
import { formatISO } from "date-fns";
import { components } from "@/api/v1";

function DataContent({
  data,
  openMealEntry,
}: {
  data: components["schemas"]["MealEntryResponse"][];
  openMealEntry: (time: MealTime) => void;
}) {
  const proteinSum = data
    .map((e) => (e.protein * e.amount * e.mishkal) / 100)
    .reduce((p, a) => p + a, 0);
  const fatSum = data
    .map((e) => (e.total_fat * e.amount * e.mishkal) / 100)
    .reduce((p, a) => p + a, 0);
  const carbSum = data
    .map((e) => ((e.carbohydrates ?? 0) * e.amount * e.mishkal) / 100)
    .reduce((p, a) => p + a, 0);

  const calorieSum = data
    .map((e) => (e.food_energy * e.mishkal * e.amount) / 100)
    .reduce((p, a) => p + a, 0);
  return (
    <>
      {/* <TotalCalorieProgress
        segments={[
          { value: (carbSum / totalSum) * 100 },
          { value: (fatSum / totalSum) * 100, color: "bg-green-300" },
          { value: (proteinSum / totalSum) * 100, color: "bg-red-500" },
        ]}
      /> */}
      <div className="w-full pb-4 flex justify-center items-center">
        <Progress
          label="קלוריות"
          value={(calorieSum / CALORIES.total_calories) * 100}
          wrapperClassName="w-3/4"
          barHeight="h-4"
        />
      </div>
      <div className="flex w-full justify-around mt-3">
        <Progress
          label="חלבון"
          value={(proteinSum / CALORIES.total_grams_protein) * 100}
          indicatorClassName="bg-blue-500"
        />
        <Progress
          label="שומן"
          value={(fatSum / CALORIES.total_grams_fat) * 100}
          indicatorClassName="bg-green-300"
        />
        <Progress
          label="פחמימה"
          value={(carbSum / CALORIES.total_grams_carbs) * 100}
          indicatorClassName="bg-red-500"
        />
      </div>
      <div id="food-container" className="flex flex-col gap-3 mt-3 ">
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
    </>
  );
}

export function FoodDayViewer() {
  const [date, setDate] = useState<Date>(new Date());
  const [mealEntryTime, setMealEntryTime] = useState<MealTime>("breakfast");
  const [mealEntryOpen, setMealEntryOpen] = useState(false);
  const [mealEntryKey, setMealEntryKey] = useState(0);
  const navigate = useNavigate();

  const openMealEntry = (mealTime: MealTime) => {
    setMealEntryKey(Math.random()); // Reset the dialog's contents when adding a new meal entry.
    setMealEntryOpen(true);
    setMealEntryTime(mealTime);
  };

  const { data, error } = reactClient.useQuery(
    "get",
    "/api/v1/meals",
    {
      params: {
        query: {
          date: formatISO(date, { representation: "date" }).substring(0, 10),
        },
      },
    },
    { retry: 0 },
  );

  useEffect(() => {
    if (error instanceof NotLoggedInError) {
      navigate("/login");
    }
  }, [error, navigate]);

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <CardTitle>יומן אוכל</CardTitle>
          <DayPicker date={date} setDate={setDate} />
        </CardHeader>

        <CardContent className="h-full">
          {data ? (
            <DataContent data={data} openMealEntry={openMealEntry} />
          ) : (
            "Loading..."
          )}
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
