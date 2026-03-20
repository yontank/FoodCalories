import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { MealEntryResponse, MealTime } from "../type";
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const eatenToday = eatenFood?.map((e) => (
    <div
      key={e.meal_id}
      className="rounded-lg border border-border bg-card text-card-foreground shadow-sm h-auto w-full text-center flex p-3 "
    >
      <div className="flex flex-col w-1/3 max-w-3xl text-right">
        <b>{e.food_name}</b>
        <b>
          {e.amount} {e.mida.name}
        </b>
      </div>
      <div className="flex justify-around flex-1">
        <div>
          {t('key6', 'קלוריות')}
          <p>{((e.mishkal / 100) * e.amount * e.food_energy).toFixed(2)} </p>
        </div>
        <div>
          {t('key7', 'פחמימות')}{" "}
          <p>
            {((e.mishkal / 100) * e.amount * (e.carbohydrates ?? 0)).toFixed(
              2,
            )}{" "}
          </p>
        </div>
        <div>
          {t('key8', 'חלבון')}
          <p> {((e.mishkal / 100) * e.amount * e.protein).toFixed(2)} </p>
        </div>
        <div>
          {t('key9', 'שומן')}<p>{((e.mishkal / 100) * e.amount * e.total_fat).toFixed(2)} </p>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="rounded-xl border-4 p-2 min-h-48">
      <div className="flex items-center gap-3 mb-2">
        <Button
          className="rounded-full w-12 h-12"
          onClick={() => {
            openMealEntry(mealTime);
          }}
        >
          <Plus />
        </Button>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="flex gap-2 flex-col">{eatenToday}</div>
    </div>
  );
}
