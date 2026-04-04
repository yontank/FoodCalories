import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  FoodDetail,
  MealEntryResponse,
  MealTime,
  mealTimeToString,
  PortionSize,
} from "@/type";
import { Button } from "./ui/button";
import { FoodSearch } from "./FoodSearch";
import { Edit2 } from "lucide-react";
import { AmountPicker } from "./AmountPicker";
import { client, reactClient } from "@/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface Props {
  mealTime: MealTime;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingEntry?: MealEntryResponse;
}

export function MealEntryDialog({
  mealTime,
  setOpen,
  open,
  editingEntry,
}: Props) {
  const { t } = useTranslation();
  const [selectedFood, setSelectedFood] = useState<FoodDetail | undefined>();
  const [searchingFood, setSearchingFood] = useState(editingEntry == undefined);
  const [selectedSize, setSelectedSize] = useState<PortionSize | undefined>();
  const [amount, setAmount] = useState(editingEntry?.amount ?? 1);
  const queryClient = useQueryClient();

  const { data } = reactClient.useQuery(
    "get",
    "/api/v1/food",
    { params: { query: { food_id: editingEntry?.food_id ?? 0 } } },
    { enabled: !!editingEntry },
  );

  const handleSubmit = async () => {
    if (!selectedFood || !selectedSize || amount <= 0) {
      return;
    }

    let request;

    const body = {
      food_id: selectedFood.food_id,
      meal_type: mealTime,
      amount,
      mida_id: selectedSize.id,
    };

    if (editingEntry) {
      request = client.PATCH("/api/v1/meal", {
        params: {
          query: {
            meal_id: editingEntry.meal_id,
          },
        },
        body,
      });
    } else {
      request = client.PUT("/api/v1/meal", { body });
    }

    const { error } = await request;

    if (error) {
      // TODO handle error
    } else {
      setOpen(false);
      // Invalidate the meals query so that the new meal will appear.
      queryClient.invalidateQueries({ queryKey: ["get", "/api/v1/meals"] });
    }
  };

  useEffect(() => {
    if (editingEntry && data) {
      // If we're editing an existing meal entry, we wait for the food info about it to load.
      // Once it loads, we select the correct food and portion size.
      setSelectedFood(data);
      setSelectedSize({ ...editingEntry.mida, mishkal: editingEntry.mishkal });
    }
  }, [data, editingEntry]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("key10", "מה אכלת לארוחת")} {mealTimeToString(mealTime)}?
          </DialogTitle>
        </DialogHeader>

        <FoodSearch
          show={searchingFood}
          selectedFood={selectedFood}
          setSelectedFood={(f) => {
            setSelectedFood(f);
            setSearchingFood(false);
            setSelectedSize(undefined);
          }}
        />

        {!searchingFood && (
          <Button
            variant="outline"
            className="font-bold"
            onClick={() => setSearchingFood(true)}
          >
            <Edit2 />
            {selectedFood?.food_name}
          </Button>
        )}

        {selectedFood && (
          <div className={searchingFood ? "hidden" : ""}>
            <div className="min-h-[6rem]">
              <AmountPicker
                food={selectedFood}
                amount={amount}
                setAmount={setAmount}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={!selectedSize || amount <= 0}
                onClick={handleSubmit}
              >
                {editingEntry ? t("update", "עדכון") : t("key11", "הוספה")}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
