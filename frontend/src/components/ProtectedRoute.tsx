import { useState } from "react";
import { accessTokenAtom } from "@/atoms/user";
import { nutritionAtom } from "@/atoms/nutrition";
import { useAtom } from "jotai";
import { Navigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { client, reactClient } from "@/api/client";
import { OnboardingDialog, type OnboardingData } from "./OnboardingDialog";
import { useTranslation } from "react-i18next";

type ProtectedRouteProps = {
  user?: string;
  children: React.ReactNode;
};

/**
 * A route that redirects the user back to the home page if they're not logged in.
 * Also checks if the user has completed onboarding (profile + nutrition data).
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { t } = useTranslation();
  const [user] = useAtom(accessTokenAtom);
  const [, setNutrition] = useAtom(nutritionAtom);
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const profileQuery = reactClient.useQuery("get", "/api/v1/profile", {}, {
    retry: false,
    enabled: !!user,
  });

  const nutritionQuery = reactClient.useQuery("get", "/api/v1/profile/nutrition", {}, {
    retry: false,
    enabled: !!user,
  });

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isLoading = profileQuery.isLoading || nutritionQuery.isLoading;
  const needsOnboarding = profileQuery.isError || nutritionQuery.isError;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        {t("loading", "Loading...")}
      </div>
    );
  }

  const handleOnboardingComplete = async (data: OnboardingData) => {
    setSaving(true);
    try {
      await client.PUT("/api/v1/weight", {
        params: { query: { weight: data.weight } },
      });
      await client.PATCH("/api/v1/profile", { body: data.profile });
      await client.PATCH("/api/v1/profile/nutrition", { body: data.nutrition });

      setNutrition({
        calories: data.calories,
        protein: data.nutrition.protein,
        carbs: data.nutrition.carbohydrates,
        fat: data.nutrition.fat,
      });

      await queryClient.invalidateQueries({ queryKey: ["get", "/api/v1/profile"] });
      await queryClient.invalidateQueries({ queryKey: ["get", "/api/v1/profile/nutrition"] });
      await queryClient.invalidateQueries({ queryKey: ["get", "/api/v1/weight"] });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {children}
      {needsOnboarding && (
        <OnboardingDialog
          open
          saving={saving}
          onComplete={handleOnboardingComplete}
        />
      )}
    </>
  );
}
