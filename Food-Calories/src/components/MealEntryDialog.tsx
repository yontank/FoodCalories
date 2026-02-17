import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ListFoodBase, MealTime, mealTimeToString, Mida } from "@/type";
import { Button } from "./ui/button";
import { FoodSearch } from "./FoodSearch";
import { Edit2 } from "lucide-react";
import { AmountPicker } from "./AmountPicker";

interface Props {
  mealTime: MealTime;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MealEntryDialog({ mealTime, setOpen, open }: Props) {
  const [selectedFood, setSelectedFood] = useState<ListFoodBase | undefined>();
  const [searchingFood, setSearchingFood] = useState(selectedFood == undefined);
  const [selectedUnit, setSelectedUnit] = useState<Mida | undefined>();
  const [amount, setAmount] = useState(1);

  const handleSubmit = async () => {
    if (!selectedFood || !selectedUnit || amount <= 0) {
      return;
    }

    const res = await fetch("/v1/foodEaten", {
      method: "POST",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        amount,
        codeId: selectedFood.code,
        unitType: selectedUnit.name.smlmida,
        mealType: mealTime,
      }),
    });

    if (res.ok) {
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
            {selectedFood?.shmmitzrach}
          </Button>
        )}

        {selectedFood && (
          <div className={searchingFood ? "hidden" : ""}>
            <div className="min-h-[6rem]">
              <AmountPicker
                foodCode={selectedFood.code}
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
