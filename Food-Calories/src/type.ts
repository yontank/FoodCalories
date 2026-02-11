export interface ListFoodBase {
  code: number;
  shmmitzrach: string;
  smlmitzrach: number;
  english_name: string;
}

export interface ListFoodFull extends ListFoodBase {
  // makor: number;
  // edible: number;
  // psolet: number;
  // ahuz_ibud_nozlim: number;

  protein: number;
  total_fat: number;
  carbohydrates: number;
  food_energy: number;

  midot: {
    mishkal: number;
    mida: number;
    name: { smlmida: number; shmmida: string };
  }[];

  // alcohol: number;
  // moisture: number;
  // total_dietary_fiber: number;
  // calcium: number;
  // iron: number;
  // magnesium: number;
  // sodium: number;
  // vitamin_a_iu: number;
}
export interface EatenTodayQuery {
  date: Date;
  meal_type: MealTime;
  mida: { smlmida: number; shmmida: string };
  amount: number;
  code: ListFoodFull;
  mishkal: mishkal;
}

export interface ListFoodAPI {
  data: ListFoodBase[];
}

export enum MealTime {
  BREAKFAST,
  LUNCH,
  DINNER,
}

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
    case MealTime.BREAKFAST:
      return "בוקר";
    case MealTime.LUNCH:
      return "צהריים";
    case MealTime.DINNER:
      return "ערב";
  }
}
