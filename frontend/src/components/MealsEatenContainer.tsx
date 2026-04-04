import { Button } from "./ui/button";
import { EllipsisVertical, Pencil, Plus, Trash } from "lucide-react";
import { MealEntryResponse, MealTime } from "../type";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useState } from "react";
import { client } from "@/api/client";
import { useQueryClient } from "@tanstack/react-query";

interface MealsEatenContainerProps {
  openMealEntry: (mealTime: MealTime, editingEntry?: MealEntryResponse) => void;
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
  const { t, i18n } = useTranslation();
  const dir = i18n.language === "he" ? "rtl" : "ltr";
  const [deletingMealID, setDeletingMealID] = useState<number | undefined>();
  const queryClient = useQueryClient();

  const deleteMeal = async () => {
    if (deletingMealID === undefined) {
      return;
    }

    const { error } = await client.DELETE("/api/v1/meal", {
      params: { query: { meal_id: deletingMealID } },
    });

    if (!error) {
      setDeletingMealID(undefined);
      queryClient.invalidateQueries({ queryKey: ["get", "/api/v1/meals"] });
    }
  };

  const eatenToday = eatenFood?.map((e) => (
    <div
      key={e.meal_id}
      className="rounded-lg border border-border bg-card text-card-foreground shadow-sm h-auto w-full text-center flex items-center p-2 gap-2"
    >
      <DropdownMenu dir={dir}>
        <DropdownMenuTrigger asChild>
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent data-lang="he">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => openMealEntry(e.meal_type, e)}>
              <Pencil />
              {t("edit", "edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeletingMealID(e.meal_id)}>
              <Trash />
              {t("delete", "delete")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex flex-col w-1/3 max-w-3xl text-right">
        <b>{e.food_name}</b>
        <b>
          {e.amount} {e.mida.name}
        </b>
      </div>
      <div className="flex justify-around flex-1">
        <div>
          {t("key6", "קלוריות")}
          <p>{((e.mishkal / 100) * e.amount * e.food_energy).toFixed(2)} </p>
        </div>
        <div>
          {t("key7", "פחמימות")}{" "}
          <p>
            {((e.mishkal / 100) * e.amount * (e.carbohydrates ?? 0)).toFixed(
              2,
            )}{" "}
          </p>
        </div>
        <div>
          {t("key8", "חלבון")}
          <p> {((e.mishkal / 100) * e.amount * e.protein).toFixed(2)} </p>
        </div>
        <div>
          {t("key9", "שומן")}
          <p>{((e.mishkal / 100) * e.amount * e.total_fat).toFixed(2)} </p>
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
      <Dialog
        open={!!deletingMealID}
        onOpenChange={(o) => setDeletingMealID(o ? deletingMealID : undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteMeal", "deleteMeal")}</DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="destructive" onClick={deleteMeal}>
              {t("delete", "delete")}
            </Button>
            <DialogClose asChild>
              <Button variant="ghost">{t("cancel", "cancel")}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
