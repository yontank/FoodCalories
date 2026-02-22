import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { MealEntryResponse, MealTime } from "../type";

interface MealsEatenContainerProps {
  openMealEntry: (mealTime: MealTime) => void;
  mealTime: MealTime;
  title: string;
  eatenFood?: MealEntryResponse[];
}

export function MealsEatenContainer({
  title,
  eatenFood,
  mealTime,
  openMealEntry,
}: MealsEatenContainerProps) {
  const eatenToday = eatenFood?.map((e) => (
    <div className="border-solid border-2 border-red-50 h-auto w-fit text-center">
      <h1>{e.food_name}</h1>
      <p>
        {e.amount} {e.mida.name}
      </p>

      <p>
        קלוריות {((e.mishkal / 100) * e.amount * e.food_energy).toFixed(2)}{" "}
      </p>

      <p>
        פחמימות{" "}
        {((e.mishkal / 100) * e.amount * (e.carbohydrates ?? 0)).toFixed(
          2,
        )}{" "}
      </p>

      <p>חלבון {((e.mishkal / 100) * e.amount * e.protein).toFixed(2)} </p>

      <p>
        שומן
        {((e.mishkal / 100) * e.amount * e.total_fat).toFixed(2)}{" "}
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
