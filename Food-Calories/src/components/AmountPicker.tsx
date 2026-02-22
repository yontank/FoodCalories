import { FoodDetail, PortionSize } from "@/type";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface Props {
  food: FoodDetail;
  amount: number;
  setAmount: React.Dispatch<React.SetStateAction<number>>;
  selectedUnit: PortionSize | undefined;
  setSelectedUnit: React.Dispatch<
    React.SetStateAction<PortionSize | undefined>
  >;
}

/**
 * Based on a food that the user selected prior, fetches the available units for that food and lets
 * the user input how much they ate, and shows the calculated calorie amount based on that.
 */
export function AmountPicker({
  food,
  amount,
  setAmount,
  selectedUnit,
  setSelectedUnit,
}: Props) {
  const [amountInput, setAmountInput] = useState<string>(amount.toString());

  const calculatedAmount =
    selectedUnit &&
    ((selectedUnit.mishkal ?? 1) / 100) * parseFloat(amountInput);

  return (
    <>
      כמה אכלת?
      <div className="flex mb-8">
        <div className="flex items-center gap-x-2">
          <Input
            type="number"
            min={0}
            step={1}
            value={amountInput}
            onChange={(e) => {
              setAmountInput(e.target.value);
              setAmount(Number(e.target.value));
            }}
            className="w-[6em]"
          />
        </div>
        <Select
          value={selectedUnit?.name}
          onValueChange={(v) =>
            setSelectedUnit(food.midot.find((u) => u.name == v))
          }
        >
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="בחר מידה" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>מידות</SelectLabel>
              {food.midot.map((item) => (
                <SelectItem key={item.id} value={item.name}>
                  {item.name}{" "}
                  <span className="text-neutral-500 text-xs">
                    ({item.mishkal} גרם)
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {calculatedAmount && (
        <div className="flex justify-between flex-row-reverse">
          <div>
            קלוריות: {(food.food_energy * calculatedAmount).toFixed(2)}{" "}
          </div>

          <div className="flex flex-col">
            <div>
              פחמימה:{" "}
              {((food.carbohydrates ?? 0) * calculatedAmount).toFixed(2)}
            </div>

            <div>חלבון: {(food.protein * calculatedAmount).toFixed(2)} </div>

            <div>שומן: {(food.total_fat * calculatedAmount).toFixed(2)}</div>
          </div>
        </div>
      )}
    </>
  );
}
