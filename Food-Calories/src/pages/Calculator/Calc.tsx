import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListFoodFull, Mida } from "@/type";
import { useNavigate, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Calcualte Calories of a speicifc food
 */
const getFoodInfo = async (
  foodQuery: string,
): Promise<ListFoodFull | undefined> => {
  const food = await fetch("/v1/foodInfo/" + foodQuery);

  if (food.ok) return ((await food.json()) as { data: ListFoodFull }).data;

  return undefined;
};

function Calc() {
  const [selectedUnit, setSelectedUnit] = useState<Mida | undefined>();
  const [amountInput, setAmountInput] = useState<string>("1");
  const [searchParams] = useSearchParams();
  const mealType = searchParams.get("meal");
  const mealName = searchParams.get("shm");

  const navigate = useNavigate();

  const { data, status } = useQuery({
    queryKey: ["getFood", mealName],
    queryFn: () => getFoodInfo(mealName ?? ""),
  });

  if (mealType == null || mealName === "") return <>Error</>;
  if (status == "pending") return <>Loading</>;
  if (status == "error" || data === undefined) return <>Error</>;

  const handleSubmit = async () => {
    if (!selectedUnit) {
      return;
    }

    const amount = parseFloat(amountInput);

    const res = await fetch("/v1/foodEaten", {
      method: "POST",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        amount,
        codeId: data.code,
        unitType: selectedUnit.name.smlmida,
        mealType: parseInt(mealType),
      }),
    });

    if (res.ok) {
      navigate("/");
    }
  };

  const amount =
    selectedUnit &&
    ((selectedUnit.mishkal ?? 1) / 100) * parseFloat(amountInput);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.shmmitzrach}</CardTitle>
      </CardHeader>
      <CardContent>
        כמה אכלת?
        <div className="flex mb-8">
          <div className="flex items-center gap-x-2">
            <Input
              type="number"
              min={0}
              step={1}
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
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
                      ({item.mishkal}) גרם
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {amount && (
          <div className="flex justify-between flex-row-reverse">
            <div>קלוריות: {(data.food_energy * amount).toFixed(2)} </div>

            <div className="flex flex-col">
              <div>פחמימה: {(data.carbohydrates * amount).toFixed(2)}</div>

              <div>חלבון: {(data.protein * amount).toFixed(2)} </div>

              <div>שומן: {(data.total_fat * amount).toFixed(2)}</div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button disabled={!selectedUnit} onClick={handleSubmit}>
          נראה טוב!
        </Button>
      </CardFooter>
    </Card>
  );
}

export default Calc;
