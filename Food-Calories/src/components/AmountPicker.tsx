import { ListFoodFull, Mida } from "@/type";
import { useQuery } from "@tanstack/react-query";
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

const getFoodInfo = async (
  foodQuery: number,
): Promise<ListFoodFull | undefined> => {
  const food = await fetch("/v1/foodInfo/" + foodQuery);

  if (food.ok) return ((await food.json()) as { data: ListFoodFull }).data;

  return undefined;
};

interface Props {
  foodCode: number;
  amount: number;
  setAmount: React.Dispatch<React.SetStateAction<number>>;
  selectedUnit: Mida | undefined;
  setSelectedUnit: React.Dispatch<React.SetStateAction<Mida | undefined>>;
}

/**
 * Based on a food that the user selected prior, fetches the available units for that food and lets
 * the user input how much they ate, and shows the calculated calorie amount based on that.
 */
export function AmountPicker({
  foodCode,
  amount,
  setAmount,
  selectedUnit,
  setSelectedUnit,
}: Props) {
  const [amountInput, setAmountInput] = useState<string>(amount.toString());

  const { data, status } = useQuery({
    queryKey: ["getFood", foodCode],
    queryFn: () => getFoodInfo(foodCode),
  });

  if (status == "pending") return <>Loading</>;
  if (status == "error" || data === undefined) return <>Error</>;

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
          value={selectedUnit?.name.shmmida}
          onValueChange={(v) =>
            setSelectedUnit(data.midot.find((u) => u.name.shmmida == v))
          }
        >
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="בחר מידה" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>מידות</SelectLabel>
              {data.midot.map((item) => (
                <SelectItem key={item.mida} value={item.name.shmmida}>
                  {item.name.shmmida}{" "}
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
            קלוריות: {(data.food_energy * calculatedAmount).toFixed(2)}{" "}
          </div>

          <div className="flex flex-col">
            <div>
              פחמימה: {(data.carbohydrates * calculatedAmount).toFixed(2)}
            </div>

            <div>חלבון: {(data.protein * calculatedAmount).toFixed(2)} </div>

            <div>שומן: {(data.total_fat * calculatedAmount).toFixed(2)}</div>
          </div>
        </div>
      )}
    </>
  );
}
