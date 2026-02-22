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

interface Props {
  mealTime: MealTime;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MealEntryDialog({ mealTime, setOpen, open }: Props) {
  const [selectedFood, setSelectedFood] = useState<FoodDetail | undefined>();
  const [searchingFood, setSearchingFood] = useState(selectedFood == undefined);
  const [selectedUnit, setSelectedUnit] = useState<PortionSize | undefined>();
  const [amount, setAmount] = useState(1);

  const handleSubmit = async () => {
    if (!selectedFood || !selectedUnit || amount <= 0) {
      return;
    }

    const { error } = await client.PUT("/v1/meal", {
      body: {
        food_id: selectedFood.food_id,
        meal_type: mealTime,
        amount,
        mida_id: selectedUnit.id,
      },
    });

    if (error) {
      // TODO handle error
    } else {
      setOpen(false);
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
                selectedUnit={selectedUnit}
                setSelectedUnit={setSelectedUnit}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={!selectedUnit || amount <= 0}
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
