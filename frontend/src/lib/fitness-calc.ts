import { Activity } from "lucide-react";
import i18next from "i18next";

type Gender = "male" | "female";

type BMITypes =
  | "Underweight"
  | "Normal Weight"
  | "Overweight"
  | "Obesity I"
  | "Obesity II"
  | "Obesity III";

export const KCAL_PER_GRAM = {
  fat: 9,
  carbohydrates: 4,
  protein: 4,
  alcohol: 7,
};
//   Note: This function takes Imperial values
export function calculateBMI(weight: number, height: number) {
  if (weight <= 0 || height <= 0)
    throw new RangeError("Width or Height cannot be non-positive");

  const BMIScore = weight / (height * height);
  let BMIClass: BMITypes;

  if (BMIScore < 18.5) BMIClass = "Underweight";
  else if (18.5 <= BMIScore && BMIScore < 25) BMIClass = "Normal Weight";
  else if (25 <= BMIScore && BMIScore < 30) BMIClass = "Overweight";
  else if (30 <= BMIScore && BMIScore < 35) BMIClass = "Obesity I";
  else if (35 <= BMIScore && BMIScore < 40) BMIClass = "Obesity II";
  else if (BMIScore >= 40) BMIClass = "Obesity III";
  else throw RangeError("BMIValue doesn't get correct BMIClass value");

  return { name: BMIClass, value: BMIScore };
}
// Note: This function takes imperial values.
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: Gender,
) {
  const WEIGHT_MULTIPLIER = 10;
  const HEIGHT_MULTIPLIER = 6.25;
  const AGE_MULTIPLIER = 5;
  const MALE_OFFSET = 5,
    FEMALE_OFFSET = -161;

  if (height <= 0) throw new RangeError("Height cannot be non-positive");
  if (weight <= 0) throw new RangeError("Width cannot be non-positive");
  if (age <= 0) throw new RangeError("Age cannot be non-positive");

  return (
    WEIGHT_MULTIPLIER * weight +
    HEIGHT_MULTIPLIER * height -
    AGE_MULTIPLIER * age +
    (gender == "male" ? MALE_OFFSET : FEMALE_OFFSET)
  );
}

export function getDailyCaloriesDeficit(
  KgAmount: number,
  weight: number,
  height: number,
  age: number,
  gender: Gender,
  activity: number,
) {
  // A KG of fat is 7700 kcal.
  const FAT_KG = 7700;

  // Should return the amount of calories to lose KgAmount per week.
  const BMR = calculateBMR(weight, height, age, gender);

  // Calculate Calorie Amount for Deficit
  return BMR * activity - FAT_KG * KgAmount;
}
