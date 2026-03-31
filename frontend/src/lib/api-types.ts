/**
 * Types for backend endpoints that are not yet in the generated OpenAPI types (v1.d.ts).
 */

export type WeightEntry = {
  weight: number;
  created_at: string;
};

export type ProfileData = {
  height: number;
  age: number;
  activity_factor: number;
  gender: "male" | "female";
};
