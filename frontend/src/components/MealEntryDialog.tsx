import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { FoodDetail, MealTime, mealTimeToString, PortionSize } from "@/type";
import { Button } from "./ui/button";
import { FoodSearch } from "./FoodSearch";
import { Edit2 } from "lucide-react";
import { AmountPicker } from "./AmountPicker";
import { client } from "@/api/client";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  mealTime: MealTime;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MealEntryDialog({ mealTime, setOpen, open }: Props) {
  const [selectedFood, setSelectedFood] = useState<FoodDetail | undefined>();
  const [searchingFood, setSearchingFood] = useState(selectedFood == undefined);
  const [selectedSize, setSelectedSize] = useState<PortionSize | undefined>();
  const [amount, setAmount] = useState(1);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!selectedFood || !selectedSize || amount <= 0) {
      return;
    }

    const { error } = await client.PUT("/api/v1/meal", {
      body: {
        food_id: selectedFood.food_id,
        meal_type: mealTime,
        amount,
        mida_id: selectedSize.id,
      },
    });

    if (error) {
      // TODO handle error
    } else {
      setOpen(false);
      // Invalidate the meals query so that the new meal will appear.
      // (This might be a bit overkill, `/meals` could simply return the ID of the newly added meal and this could be avoided.)
      queryClient.invalidateQueries({ queryKey: ["get", "/api/v1/meals"] });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            מה אכלת לארוחת {mealTimeToString(mealTime)}?
          </DialogTitle>
        </DialogHeader>

        <FoodSearch
          show={searchingFood}
          selectedFood={selectedFood}
          setSelectedFood={(f) => {
            setSelectedFood(f);
            setSearchingFood(false);
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
                הוספה
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
