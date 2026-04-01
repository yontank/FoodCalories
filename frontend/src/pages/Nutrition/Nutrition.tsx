import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  subMonths,
  subDays,
  startOfDay,
  format,
  differenceInDays,
} from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";

import { client, reactClient } from "@/api/client";
import { getActivityLevels } from "@/lib/fitness-calc";
import { nutritionAtom } from "@/atoms/nutrition";
import { CalorieDeficitDialog } from "@/components/CalorieDeficitDialog";
import { WeightReminderDialog } from "@/components/WeightReminderDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// --- Date constants ---

const now = new Date();
const weightStart = subMonths(now, 3);
const caloriesStart = startOfDay(subDays(now, 14));
const caloriesEnd = startOfDay(now);

const WEIGHT_REMINDER_DAYS = 14;

// --- Form types ---

type NutritionInputs = {
  calories: number;
  maxGramsCarbs: number;
  maxGramsFat: number;
  maxGramsProtein: number;
};

export function Nutrition() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [nutrition, setNutrition] = useAtom(nutritionAtom);

  // ── Nutrition Goals ──

  const nutritionForm = useForm<NutritionInputs>({
    values: {
      calories: nutrition.calories,
      maxGramsCarbs: nutrition.carbs,
      maxGramsFat: nutrition.fat,
      maxGramsProtein: nutrition.protein,
    },
  });

  const onSaveNutrition = (values: NutritionInputs) =>
    setNutrition({
      calories: values.calories,
      carbs: values.maxGramsCarbs,
      fat: values.maxGramsFat,
      protein: values.maxGramsProtein,
    });

  // ── Personal Profile ──

  const [profileHeight, setProfileHeight] = useState("");
  const [profileAge, setProfileAge] = useState("");
  const [profileGender, setProfileGender] = useState<"male" | "female">("male");
  const [profileActivity, setProfileActivity] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const ACTIVITY_LEVELS = getActivityLevels(t);

  const { data: profileData } = reactClient.useQuery("get", "/api/v1/profile");

  useEffect(() => {
    if (profileData) {
      setProfileHeight(String(profileData.height));
      setProfileAge(String(profileData.age));
      setProfileGender(profileData.gender);
      setProfileActivity(String(profileData.activity_factor));
    }
  }, [profileData]);

  const onSaveProfile = async () => {
    setProfileSaving(true);
    try {
      await client.PATCH("/api/v1/profile", {
        body: {
          height: Number(profileHeight),
          age: Number(profileAge),
          gender: profileGender,
          activity_factor: Number(profileActivity),
        },
      });
      queryClient.invalidateQueries({ queryKey: ["get", "/api/v1/profile"] });
    } finally {
      setProfileSaving(false);
    }
  };

  const profileValid =
    profileHeight !== "" &&
    profileAge !== "" &&
    profileActivity !== "" &&
    Number(profileHeight) > 0 &&
    Number(profileAge) > 0;

  // ── Weight entry + chart ──

  const [newWeight, setNewWeight] = useState("");
  const [weightSaving, setWeightSaving] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderChecked, setReminderChecked] = useState(false);

  const { data: weightData, isLoading: weightLoading } = reactClient.useQuery(
    "get",
    "/api/v1/weight",
    {
      params: {
        query: {
          start_date: weightStart.toISOString(),
          end_date: now.toISOString(),
        },
      },
    },
  );

  const latestWeight = weightData?.length
    ? weightData[weightData.length - 1]
    : null;

  // 14-day weight reminder
  useEffect(() => {
    if (reminderChecked || weightLoading) return;
    setReminderChecked(true);

    if (!latestWeight) {
      setReminderOpen(true);
      return;
    }
    const daysSince = differenceInDays(now, new Date(latestWeight.created_at));
    if (daysSince >= WEIGHT_REMINDER_DAYS) {
      setReminderOpen(true);
    }
  }, [weightLoading, latestWeight, reminderChecked]);

  const onSaveWeight = async (value?: string) => {
    const weight = Number(value ?? newWeight);
    if (!weight || weight <= 0) return;
    setWeightSaving(true);
    try {
      await client.PUT("/api/v1/weight", { params: { query: { weight } } });
      setNewWeight("");
      queryClient.invalidateQueries({ queryKey: ["get", "/api/v1/weight"] });
    } finally {
      setWeightSaving(false);
    }
  };

  const weightChartData = useMemo(
    () =>
      (weightData ?? []).map((entry) => ({
        date: format(new Date(entry.created_at), "MMM d"),
        weight: entry.weight,
      })),
    [weightData],
  );

  const weightChartConfig = {
    weight: {
      label: t("weight", "Weight"),
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  // ── Meals / Calories / Macros ──

  const { data: mealsData, isLoading: mealsLoading } = reactClient.useQuery(
    "get",
    "/api/v1/meals",
    {
      params: {
        query: {
          date: caloriesStart.toISOString(),
          end_date: caloriesEnd.toISOString(),
        },
      },
    },
  );

  const dailyData = useMemo(() => {
    if (!mealsData) return [];

    const byDay: Record<
      string,
      { calories: number; protein: number; carbs: number; fat: number }
    > = {};
    for (const meal of mealsData) {
      const day = format(new Date(meal.date), "MMM d");
      const factor = (meal.mishkal * meal.amount) / 100;
      if (!byDay[day])
        byDay[day] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      byDay[day].calories += meal.food_energy * factor;
      byDay[day].protein += meal.protein * factor;
      byDay[day].carbs += (meal.carbohydrates ?? 0) * factor;
      byDay[day].fat += meal.total_fat * factor;
    }

    return Object.entries(byDay).map(([date, totals]) => ({
      date,
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat),
    }));
  }, [mealsData]);

  const caloriesChartConfig = {
    calories: {
      label: t("calories", "Calories"),
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const macrosChartConfig = {
    protein: {
      label: t("protein", "Protein"),
      color: "hsl(217 91% 60%)",
    },
    carbs: {
      label: t("carbs", "Carbohydrates"),
      color: "hsl(24 95% 53%)",
    },
    fat: {
      label: t("fats", "Fats"),
      color: "hsl(84 81% 44%)",
    },
  } satisfies ChartConfig;

  // ── Render ──

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("nutrition", "Nutrition")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t(
            "nutritionDesc",
            "Manage your goals, profile, and track your progress",
          )}
        </p>
      </div>

      {/* Weight reminder dialog */}
      <WeightReminderDialog
        open={reminderOpen}
        onOpenChange={setReminderOpen}
        saving={weightSaving}
        onSave={onSaveWeight}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nutrition Goals */}
        <form onSubmit={nutritionForm.handleSubmit(onSaveNutrition)}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("key48", "Daily Goals")}</CardTitle>
                <CalorieDeficitDialog />
              </div>
              <CardDescription>
                {t("key49", "Set your daily maximum values")}
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="max-calories">{t("key6", "Calories")}</Label>
                  <Input
                    id="max-calories"
                    type="number"
                    {...nutritionForm.register("calories", {
                      required: t("requiredField", "Required field"),
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carb">
                    {t("key50", "Carbohydrates (g)")}
                  </Label>
                  <Input
                    id="carb"
                    type="number"
                    {...nutritionForm.register("maxGramsCarbs", {
                      required: t("requiredField", "Required field"),
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat">{t("key51", "Fat (g)")}</Label>
                  <Input
                    id="fat"
                    type="number"
                    {...nutritionForm.register("maxGramsFat", {
                      required: t("requiredField", "Required field"),
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein-input">
                    {t("key52", "Protein (g)")}
                  </Label>
                  <Input
                    id="protein-input"
                    type="number"
                    {...nutritionForm.register("maxGramsProtein", {
                      required: t("requiredField", "Required field"),
                    })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t pt-4">
              <Button type="submit">{t("key53", "Save Changes")}</Button>
            </CardFooter>
          </Card>
        </form>

        {/* Personal Profile */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>{t("personalProfile", "Personal Profile")}</CardTitle>
            <CardDescription>
              {t("personalProfileDesc", "Your body measurements and activity")}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{t("key24", "Height (cm)")}</Label>
                <Input
                  type="number"
                  value={profileHeight}
                  onChange={(e) => setProfileHeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("key25", "Age")}</Label>
                <Input
                  type="number"
                  value={profileAge}
                  onChange={(e) => setProfileAge(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("key26", "Gender")}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={profileGender === "male" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setProfileGender("male")}
                  >
                    {t("key27", "Male")}
                  </Button>
                  <Button
                    type="button"
                    variant={profileGender === "female" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setProfileGender("female")}
                  >
                    {t("key28", "Female")}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("key29", "Activity Level")}</Label>
                <Select
                  value={profileActivity}
                  onValueChange={setProfileActivity}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("key30", "Select activity level")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t pt-4">
            <Button
              onClick={onSaveProfile}
              disabled={!profileValid || profileSaving}
            >
              {t("key53", "Save Changes")}
            </Button>
          </CardFooter>
        </Card>

        {/* Log Weight */}
        <Card>
          <CardHeader>
            <CardTitle>{t("logWeight", "Log Weight")}</CardTitle>
            <CardDescription>
              {t("logWeightDesc", "Track your weight over time")}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-4">
            {latestWeight && (
              <div className="text-sm text-muted-foreground">
                {t("lastRecorded", "Last recorded")}:{" "}
                <span className="font-medium text-foreground">
                  {latestWeight.weight} {t("weightUnit", "kg")}
                </span>{" "}
                ({format(new Date(latestWeight.created_at), "MMM d, yyyy")})
              </div>
            )}
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={t("key23", "Weight (kg)")}
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
              />
              <Button
                onClick={() => onSaveWeight()}
                disabled={!newWeight || Number(newWeight) <= 0 || weightSaving}
              >
                {t("save", "Save")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts ── */}

      {/* Weight over time */}
      <Card>
        <CardHeader>
          <CardTitle>{t("weightOverTime", "Weight Over Time")}</CardTitle>
          <CardDescription>
            {t("weightLast3Months", "Your weight over the last 3 months")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weightLoading ? (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              {t("loading", "Loading...")}
            </div>
          ) : weightChartData.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              {t("noWeightData", "No weight data recorded yet")}
            </div>
          ) : (
            <ChartContainer config={weightChartConfig}>
              <LineChart data={weightChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={["dataMin - 2", "dataMax + 2"]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--color-weight)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Calories per day */}
      <Card>
        <CardHeader>
          <CardTitle>{t("caloriesPerDay", "Calories Per Day")}</CardTitle>
          <CardDescription>
            {t(
              "caloriesLast2Weeks",
              "Your daily calories over the last 2 weeks",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mealsLoading ? (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              {t("loading", "Loading...")}
            </div>
          ) : dailyData.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              {t("noCaloriesData", "No calorie data recorded yet")}
            </div>
          ) : (
            <ChartContainer config={caloriesChartConfig}>
              <BarChart data={dailyData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine
                  y={nutrition.calories}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="4 4"
                  label={{
                    value: `${t("goal", "Goal")}: ${nutrition.calories}`,
                    position: "insideTopRight",
                    fill: "hsl(var(--destructive))",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="calories"
                  fill="var(--color-calories)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Macros per day */}
      <Card>
        <CardHeader>
          <CardTitle>{t("macrosPerDay", "Macros Per Day")}</CardTitle>
          <CardDescription>
            {t(
              "macrosLast2Weeks",
              "Daily protein, carbs, and fat over the last 2 weeks (g)",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mealsLoading ? (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              {t("loading", "Loading...")}
            </div>
          ) : dailyData.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              {t("noCaloriesData", "No calorie data recorded yet")}
            </div>
          ) : (
            <ChartContainer config={macrosChartConfig}>
              <BarChart data={dailyData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="protein"
                  fill="var(--color-protein)"
                  stackId="macros"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="carbs"
                  fill="var(--color-carbs)"
                  stackId="macros"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="fat"
                  fill="var(--color-fat)"
                  stackId="macros"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
