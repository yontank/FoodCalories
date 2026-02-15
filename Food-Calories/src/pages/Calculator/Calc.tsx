import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListFoodFull, Mida } from "@/type";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  const { data, status } = useQuery({
    queryKey: ["getFood"],
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

    await fetch("/v1/foodEaten", {
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
  };

  const amount = ((selectedUnit?.mishkal ?? 1) / 100) * parseFloat(amountInput);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.shmmitzrach}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around flex-row-reverse">
          <div>קלוריות: {(data.food_energy * amount).toFixed(2)} </div>

          <div className="flex flex-col align-evenly">
            <Label>פחמימה: {(data.carbohydrates * amount).toFixed(2)}</Label>

            <Label>חלבון: {(data.protein * amount).toFixed(2)} </Label>

            <Label>שומן: {(data.total_fat * amount).toFixed(2)}</Label>
          </div>
        </div>

        <div className="flex pt-8 justify-around">
          <RadioGroup value={selectedUnit?.name.shmmida}>
            {data.midot.map((mida) => (
              <div key={mida.mida} className="flex item-center space-x-2">
                <RadioGroupItem
                  key={mida.name.smlmida}
                  value={mida.name.shmmida}
                  id={mida.name.smlmida.toString()}
                  onClick={() => setSelectedUnit(mida)}
                />
                <Label htmlFor={mida.name.smlmida.toString()}>
                  {mida.name.shmmida + " (" + mida.mishkal + "גרם" + ") "}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex items-center gap-x-2">
            <Input
              placeholder="Units"
              type="number"
              min={0}
              step={0.1}
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
            />
            <Label>{selectedUnit?.name.shmmida}</Label>
          </div>
        </div>
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
