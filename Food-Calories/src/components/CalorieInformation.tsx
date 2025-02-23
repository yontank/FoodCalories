import { Label } from "./ui/label";
import { CalInfoProps } from "@/type";

function CalorieInformation({
  carbohydrates,
  food_energy,
  protein,
  total_fat,
  size,
}: CalInfoProps) {

    

  return (
    <div className="flex justify-around flex-row-reverse">
      <div>קלוריות: {(food_energy * size).toFixed(2)} </div>

      <div className="flex flex-col align-evenly">
        <Label>פחמימה: {(carbohydrates * size).toFixed(2)}</Label>

        <Label>חלבון: {(protein * size).toFixed(2)} </Label>

        <Label>שומן: {(total_fat * size).toFixed(2)}</Label>
      </div>
    </div>
  );
}

export default CalorieInformation;
