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

export interface ListFoodAPI {
  data: ListFoodBase[];
}

export enum TIME {
  BREAKFAST,
  AFTERNOON,
  EVENING,
}

export interface CalInfoProps {
  protein: number;
  total_fat: number;
  carbohydrates: number;
  food_energy: number;
  size: number;
}
