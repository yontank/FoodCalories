import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import CALORIES from "@/data/settings.json";

export function Settings() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  //TODO: Work on OnSubmit to Change Values in JSON File.
  const onSubmit = (values) => console.log(values);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className=" w-1/4 max-w-80">
        <div>
          <Label htmlFor="max-calories"> מספר קלוריות</Label>
          <Input
            id="max-calories"
            defaultValue={CALORIES.total_calories}
            type="number"
            {...register("calories", { required: true })}
          />
          {errors.calories && errors.calories.message}
        </div>

        <div>
          <Label htmlFor="grams-carb"> גרם פחמימה</Label>
          <Input
            id="carb"
            defaultValue={CALORIES.total_grams_carbs}
            {...(register("maxGramsCarbs"), { type: "number", required: true })}
          />
          {errors.maxGramsCarbs && errors.maxGramsCarbs.message}
        </div>

        <div>
          <Label htmlFor="grams-fat"> גרם שומן</Label>
          <Input
            id="fat"
            defaultValue={CALORIES.total_grams_fat}
            {...(register("maxGramsFat"), { type: "number", required: true })}
          />
          {errors.maxGramsFat && errors.maxGramsFat.message}
        </div>

        <div>
          <Label htmlFor="grams-protein"> גרם חלבון</Label>
          <Input
            id="protein"
            type="number"
            defaultValue={CALORIES.total_grams_protein}
            {...register("maxGramsProtein", { required: true })}
          />
          {errors.maxGramsProtein && errors.maxGramsProtein.message}
        </div>
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}
