export type Gender = "male" | "female";

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

export function getActivityLevels(
  t: (key: string, defaultValue: string) => string,
) {
  return [
    { label: t("key17", "Sedentary (no exercise)"), value: "1.2" },
    { label: t("13", "Light (1-3 days/week)"), value: "1.375" },
    { label: t("35", "Moderate (3-5 days/week)"), value: "1.55" },
    { label: t("67", "Active (6-7 days/week)"), value: "1.725" },
    { label: t("key18", "Very active (athlete)"), value: "1.9" },
  ];
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

export type DietPreset = {
  key: string;
  default: string;
  protein: number;
  carbs: number;
  fat: number;
};

export const DIET_PRESETS: DietPreset[] = [
  { key: "key19", default: "Lean", protein: 40, carbs: 35, fat: 25 },
  { key: "key20", default: "Balanced", protein: 30, carbs: 40, fat: 30 },
  { key: "key21", default: "Keto", protein: 25, carbs: 10, fat: 65 },
];

export const LOSS_TARGETS = [
  { kg: 0.3, key: "03", default: "0.3 kg / week" },
  { kg: 0.5, key: "05", default: "0.5 kg / week" },
  { kg: 0.7, key: "07", default: "0.7 kg / week" },
  { kg: 1.0, key: "1", default: "1 kg / week" },
];

export function calculateMacroGrams(
  totalCalories: number,
  proteinPct: number,
  carbsPct: number,
  fatPct: number,
): { protein: number; carbohydrates: number; fat: number } {
  return {
    protein: Math.round(((totalCalories * proteinPct) / 100) / KCAL_PER_GRAM.protein),
    carbohydrates: Math.round(((totalCalories * carbsPct) / 100) / KCAL_PER_GRAM.carbohydrates),
    fat: Math.round(((totalCalories * fatPct) / 100) / KCAL_PER_GRAM.fat),
  };
}

export function getCaloriesFromNutrients(
  carbohydrates: number,
  fat: number,
  protein: number,
  alcohol: number,
) {
  return (
    carbohydrates * KCAL_PER_GRAM.carbohydrates +
    fat * KCAL_PER_GRAM.fat +
    protein * KCAL_PER_GRAM.protein +
    alcohol * KCAL_PER_GRAM.alcohol
  );
}
