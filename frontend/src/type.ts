import { components } from "./api/v1";

export type MealTime = "breakfast" | "lunch" | "dinner";

export interface CalInfoProps {
  protein: number;
  total_fat: number;
  carbohydrates: number;
  food_energy: number;
  size: number;
}

export interface mishkal {
  mida: number;
  mishkal: number;

  name: { smlmida: string; shmmida: string };
}

export function mealTimeToString(mealTime: MealTime) {
  switch (mealTime) {
    case "breakfast":
      return "בוקר";
    case "lunch":
      return "צהריים";
    case "dinner":
      return "ערב";
  }
}

export type FoodDetail = components["schemas"]["FoodDetail"];
export type MealEntryResponse = components["schemas"]["MealEntryResponse"];
export type PortionSize = components["schemas"]["PortionSize"];
