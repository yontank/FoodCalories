import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "./ui/progress";

import { useEffect, useState } from "react";

import { MealEntryResponse, MealTime } from "@/type";

import { MealsEatenContainer } from "./MealsEatenContainer";
import { useAtomValue } from "jotai";
import { nutritionAtom } from "@/atoms/nutrition";
import { MealEntryDialog } from "./MealEntryDialog";
import { NotLoggedInError, reactClient } from "@/api/client";
import { useNavigate } from "react-router";
import { DayPicker } from "./DayPicker";
import { startOfDay } from "date-fns";
import { components } from "@/api/v1";
import { useTranslation } from "react-i18next";

function DataContent({
  data,
  openMealEntry,
}: {
  data: components["schemas"]["MealEntryResponse"][];
  openMealEntry: (time: MealTime) => void;
}) {
  const { t } = useTranslation();
  const CALORIES = useAtomValue(nutritionAtom);
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

  const macroLabel = (consumed: number, goal: number) =>
    t("macrosProgressLabel", {
      consumed: Math.round(consumed),
      goal: Math.round(goal),
    });

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-medium">
              {t("todaysCalories")}
            </CardTitle>
            <span className="text-sm text-muted-foreground tabular-nums">
              {t("caloriesProgress", {
                consumed: Math.round(calorieSum),
                goal: Math.round(CALORIES.calories),
              })}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress
            value={(calorieSum / CALORIES.calories) * 100}
            wrapperClassName="w-full"
            barHeight="h-3"
            goalAt={70}
            goalLabel={t("overeatingHint")}
            indicatorClassName="bg-[hsl(var(--chart-2))]"
            destructiveOnOverflow
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex w-full justify-around gap-4 pt-6">
          <Progress
            label={t("protein")}
            sublabel={macroLabel(proteinSum, CALORIES.protein)}
            value={(proteinSum / CALORIES.protein) * 100}
            indicatorClassName="bg-[hsl(var(--chart-1))]"
          />
          <Progress
            label={t("fats")}
            sublabel={macroLabel(fatSum, CALORIES.fat)}
            value={(fatSum / CALORIES.fat) * 100}
            indicatorClassName="bg-[hsl(var(--chart-4))]"
          />
          <Progress
            label={t("carbs")}
            sublabel={macroLabel(carbSum, CALORIES.carbs)}
            value={(carbSum / CALORIES.carbs) * 100}
            indicatorClassName="bg-[hsl(var(--chart-3))]"
          />
        </CardContent>
      </Card>

      <div id="food-container" className="flex flex-col gap-3">
        <MealsEatenContainer
          eatenFood={data.filter((e) => e.meal_type == "breakfast")}
          mealTime={"breakfast"}
          openMealEntry={openMealEntry}
          title={t("key13", "ארוחת בוקר")}
        />

        <MealsEatenContainer
          eatenFood={data.filter((e) => e.meal_type == "lunch")}
          mealTime={"lunch"}
          openMealEntry={openMealEntry}
          title={t("key14", "ארוחת צהריים")}
        />

        <MealsEatenContainer
          eatenFood={data.filter((e) => e.meal_type == "dinner")}
          mealTime={"dinner"}
          openMealEntry={openMealEntry}
          title={t("key15", "ארוחת ערב")}
        />
      </div>
    </div>
  );
}

export function FoodDayViewer() {
  const { t } = useTranslation();
  const [date, setDate] = useState<Date>(new Date());
  const [mealEntryTime, setMealEntryTime] = useState<MealTime>("breakfast");
  const [mealEntryOpen, setMealEntryOpen] = useState(false);
  const [mealEntryKey, setMealEntryKey] = useState(0);
  const [editingEntry, setEditingEntry] = useState<
    MealEntryResponse | undefined
  >();
  const navigate = useNavigate();

  const openMealEntry = (
    mealTime: MealTime,
    editingEntry?: MealEntryResponse,
  ) => {
    setMealEntryKey(Math.random()); // Reset the dialog's contents when adding a new meal entry.
    setMealEntryOpen(true);
    setMealEntryTime(mealTime);
    setEditingEntry(editingEntry);
  };

  const { data, error } = reactClient.useQuery(
    "get",
    "/api/v1/meals",
    {
      params: {
        query: {
          date: startOfDay(date).toISOString(),
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
    <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t("key16", "יומן אוכל")}</h1>
        <DayPicker date={date} setDate={setDate} />
      </div>

      {data ? (
        <DataContent data={data} openMealEntry={openMealEntry} />
      ) : (
        <div className="text-sm text-muted-foreground">
          {t("loading", "Loading...")}
        </div>
      )}

      <MealEntryDialog
        key={mealEntryKey}
        open={mealEntryOpen}
        setOpen={setMealEntryOpen}
        mealTime={mealEntryTime}
        editingEntry={editingEntry}
      />
    </div>
  );
}
