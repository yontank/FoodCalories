import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListFoodFull } from "@/type";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import CalorieInformation from "@/components/CalorieInformation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
/**
 * Calcualte Calories of a speicifc food
 *
 * @var food the type of food in question, containing all its nutritions.
 * @var units The type of units times 1 gram.
 * @returns
 */
const findFoodNutritions = async (
  foodQuery: string
): Promise<{ data: ListFoodFull } | undefined> => {
  const food = await fetch("/v1/foodInfo/" + foodQuery);

  if (food.ok) return food.json();

  return undefined;
};

function Calc() {
  const [units, setUnits] = useState<string>("");
  const [size, setSize] = useState<string>("1");
  const [searchParams] = useSearchParams();
  const mealType = searchParams.get("meal");
  const mealName = searchParams.get("shm");

  const { data, status } = useQuery({
    queryKey: ["getFood"],
    queryFn: () => findFoodNutritions(mealName ?? ""),
  });

  if (mealType == null || mealName === "") return <>Error</>;
  if (status == "pending") return <>Loading</>;
  if (status == "error") return <>Error</>;
  console.log(data?.data);

  const midot = data?.data.midot.map((mida) => (
    <div className="flex item-center space-x-2">
      <RadioGroupItem
        key={mida.name.smlmida}
        value={mida.name.shmmida}
        id={mida.name.smlmida.toString()}
        onClick={() => setUnits(mida.name.shmmida)}
      />
      <Label htmlFor={mida.name.smlmida.toString()}>
        {mida.name.shmmida + " (" + mida.mishkal + "גרם" + ") "}
      </Label>
    </div>
  ));
  const setSizeChange = (value: string) => {
    if (value.length === 0) setSize("1");
    else setSize(value);
  };
  const mida = data?.data.midot.find(
    (currUnit) => currUnit.name.shmmida === units
  );

  const handleSubmit = async () => {
    const amount = parseFloat(size);
    const midaType = data?.data.midot.find((e) => e.name.shmmida == units);
    console.log("MIDA_TYPE : ", midaType);

    const response = await fetch("/v1/foodEaten", {
      method: "POST",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        amount,
        codeId: data?.data.code,
        unitType: midaType?.name.smlmida,
        mealType: parseInt(mealType),
      }),
    });

    if (response.ok) {
      console.log("SUCCESSESESESA");
    }
  };

  const calc = ((mida?.mishkal ?? 1) / 100) * parseFloat(size);
  console.log("CALC", calc);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{data?.data.shmmitzrach}</CardTitle>
      </CardHeader>
      <CardContent>
        <CalorieInformation
          carbohydrates={data?.data.carbohydrates ?? 0}
          total_fat={data?.data.total_fat ?? 0}
          food_energy={data?.data.food_energy ?? 0}
          protein={data?.data.protein ?? 0}
          size={calc}
        />

        <div className="flex  pt-8 justify-around">
          <RadioGroup value={units}>{midot}</RadioGroup>

          <div className="flex items-center gap-x-2 ">
            <Input
              placeholder="Units"
              type="number"
              min={0}
              step={0.1}
              defaultValue={1}
              value={size}
              onChange={(e) => setSizeChange(e.target.value)}
            />
            <Label>{units}</Label>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit}>נראה טוב!</Button>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  );
}

export default Calc;
