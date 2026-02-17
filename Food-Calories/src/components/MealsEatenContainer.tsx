import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { EatenTodayQuery, MealTime } from "../type";

interface MealsEatenContainerProps {
  openMealEntry: (mealTime: MealTime) => void;
  mealTime: MealTime;
  title: string;
  eatenFood?: EatenTodayQuery[];
}

export function MealsEatenContainer({
  title,
  eatenFood,
  mealTime,
  openMealEntry,
}: MealsEatenContainerProps) {
  const eatenToday = eatenFood?.map((e) => (
    <div className="border-solid border-2 border-red-50 h-auto w-fit text-center">
      <h1>{e.code.shmmitzrach}</h1>
      <p>
        {e.amount} {e.mida.shmmida}
      </p>

      <p>
        קלוריות{" "}
        {((e.mishkal.mishkal / 100) * e.amount * e.code.food_energy).toFixed(
          2,
        )}{" "}
      </p>

      <p>
        פחמימות{" "}
        {((e.mishkal.mishkal / 100) * e.amount * e.code.carbohydrates).toFixed(
          2,
        )}{" "}
      </p>

      <p>
        חלבון{" "}
        {((e.mishkal.mishkal / 100) * e.amount * e.code.protein).toFixed(
          2,
        )}{" "}
      </p>

      <p>
        שומן
        {((e.mishkal.mishkal / 100) * e.amount * e.code.total_fat).toFixed(
          2,
        )}{" "}
      </p>
    </div>
  ));

  return (
    <div className="rounded-xl border-4 p-2">
      <Button
        className="rounded-full w-14 h-14 me-3"
        onClick={() => {
          openMealEntry(mealTime);
        }}
      >
        <Plus />
      </Button>
      <h2 className="inline">{title}</h2>
      <div className="flex gap-2">{eatenToday}</div>
    </div>
  );
}
