import { atomWithStorage } from "jotai/utils";

export const nutritionAtom = atomWithStorage("nutrition", {
  calories: 2500,
  protein: 250,
  fat: 70,
  carbs: 225,
});
