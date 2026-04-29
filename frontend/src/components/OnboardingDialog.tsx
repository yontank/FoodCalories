import { useState } from "react";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "@/lib/utils";
import {
  getActivityLevels,
  getDailyCaloriesDeficit,
  calculateBMR,
  DIET_PRESETS,
  LOSS_TARGETS,
  calculateMacroGrams,
} from "@/lib/fitness-calc";
import { useTranslation } from "react-i18next";

type Step = 1 | 2 | 3;

export type OnboardingData = {
  weight: number;
  profile: {
    height: number;
    age: number;
    gender: "male" | "female";
    activity_factor: number;
  };
  nutrition: {
    protein: number;
    carbohydrates: number;
    fat: number;
  };
  calories: number;
};

type OnboardingDialogProps = {
  open: boolean;
  saving: boolean;
  onComplete: (data: OnboardingData) => void;
};

export function OnboardingDialog({
  open,
  saving,
  onComplete,
}: OnboardingDialogProps) {
  const { t } = useTranslation();
  const ACTIVITY_LEVELS = getActivityLevels(t);

  const [step, setStep] = useState<Step>(1);

  // Step 1 state
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activity, setActivity] = useState("");

  // Step 2 state
  const [calculatedOptions, setCalculatedOptions] = useState<number[]>([]);
  const [maintenanceCalories, setMaintenanceCalories] = useState(0);
  const [selectedCalories, setSelectedCalories] = useState<number | null>(null);

  // Step 3 state
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(1);

  const step1Valid =
    weight !== "" &&
    height !== "" &&
    age !== "" &&
    activity !== "" &&
    Number(weight) > 0 &&
    Number(height) > 0 &&
    Number(age) > 0;

  const step2Valid = selectedCalories !== null;

  const selectedPreset = DIET_PRESETS[selectedPresetIndex];
  const finalMacros =
    selectedCalories
      ? calculateMacroGrams(
          selectedCalories,
          selectedPreset.protein,
          selectedPreset.carbs,
          selectedPreset.fat,
        )
      : null;

  const handleGoToStep2 = () => {
    const w = Number(weight);
    const h = Number(height);
    const a = Number(age);
    const act = Number(activity);

    const maintenance = Math.round(calculateBMR(w, h, a, gender) * act);
    setMaintenanceCalories(maintenance);

    const calcs = LOSS_TARGETS.map(({ kg }) =>
      Math.round(getDailyCaloriesDeficit(kg / 7, w, h, a, gender, act)),
    );
    setCalculatedOptions(calcs);
    setSelectedCalories(null);
    setStep(2);
  };

  const handleConfirm = () => {
    if (!selectedCalories || !finalMacros) return;

    onComplete({
      weight: Number(weight),
      profile: {
        height: Number(height),
        age: Number(age),
        gender,
        activity_factor: Number(activity),
      },
      nutrition: {
        protein: finalMacros.protein,
        carbohydrates: finalMacros.carbohydrates,
        fat: finalMacros.fat,
      },
      calories: selectedCalories,
    });
  };

  const STEP_LABELS = [
    t("onboardingStep1", "Personal Details"),
    t("onboardingStep2", "Calorie Target"),
    t("onboardingStep3", "Diet Type"),
  ];

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto"
        dir="rtl"
        hideCloseButton
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {t("onboardingTitle", "Complete Your Profile")}
          </DialogTitle>
          <DialogDescription>
            {t("onboardingDesc", "Fill in your details to get started")}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 py-1">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "size-7 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors",
                  step === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : s < step
                      ? "bg-primary/20 text-primary border-primary/40"
                      : "bg-muted text-muted-foreground border-muted-foreground/30",
                )}
              >
                {s < step ? <Check className="size-3.5" /> : s}
              </div>
              <span
                className={cn(
                  "text-sm",
                  step === s ? "font-medium" : "text-muted-foreground",
                )}
              >
                {STEP_LABELS[s - 1]}
              </span>
              {s < 3 && (
                <div className="h-px w-6 bg-muted-foreground/30 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 - Profile + Weight */}
        {step === 1 && (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="onboard-weight">
                  {t("key23", "Weight (kg)")}
                </Label>
                <Input
                  id="onboard-weight"
                  type="number"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="onboard-height">
                  {t("key24", "Height (cm)")}
                </Label>
                <Input
                  id="onboard-height"
                  type="number"
                  placeholder="175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="onboard-age">{t("key25", "Age")}</Label>
                <Input
                  id="onboard-age"
                  type="number"
                  placeholder="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>{t("key26", "Gender")}</Label>
                <div className="flex gap-2">
                  <Button
                    variant={gender === "male" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setGender("male")}
                    type="button"
                  >
                    {t("key27", "Male")}
                  </Button>
                  <Button
                    variant={gender === "female" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setGender("female")}
                    type="button"
                  >
                    {t("key28", "Female")}
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <Label>{t("key29", "Activity Level")}</Label>
              <Select value={activity} onValueChange={setActivity}>
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
        )}

        {/* Step 2 - Calorie Target */}
        {step === 2 && (
          <div className="grid gap-4">
            <div className="text-center text-sm text-muted-foreground">
              {t("maintenanceCalories", "Your maintenance calories: {{calories}} kcal/day", {
                calories: maintenanceCalories,
              })}
            </div>
            <div className="text-center text-sm font-medium">
              {t("chooseLossRate", "How fast do you want to lose weight?")}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {LOSS_TARGETS.map((lt, i) => {
                const kcal = calculatedOptions[i];
                const isSelected = selectedCalories === kcal;
                const isTooLow = kcal < 1200;
                return (
                  <button
                    key={lt.kg}
                    type="button"
                    onClick={() => !isTooLow && setSelectedCalories(kcal)}
                    disabled={isTooLow}
                    className={cn(
                      "rounded-lg border p-3 text-center space-y-0.5 transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50",
                      isTooLow && "opacity-40 cursor-not-allowed",
                    )}
                  >
                    <div className="text-xs text-muted-foreground">
                      {t(lt.key, lt.default)}
                    </div>
                    <div className="text-xl font-bold">
                      {isTooLow ? t("notSafe", "Not safe") : kcal}
                    </div>
                    {!isTooLow && (
                      <div className="text-xs text-muted-foreground">
                        {t("key32", "kcal / day")}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3 - Diet Type */}
        {step === 3 && (
          <div className="grid gap-4">
            <div className="text-center text-sm font-medium">
              {t("chooseDietType", "Choose a diet type to set your macros")}
            </div>
            <div className="grid gap-2">
              {DIET_PRESETS.map((preset, i) => {
                const macros = calculateMacroGrams(
                  selectedCalories!,
                  preset.protein,
                  preset.carbs,
                  preset.fat,
                );
                const isSelected = selectedPresetIndex === i;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => setSelectedPresetIndex(i)}
                    className={cn(
                      "rounded-lg border p-4 text-start transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50",
                    )}
                  >
                    <div className="font-medium">
                      {t(preset.key, preset.default)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {t("key8", "Protein")}: {macros.protein}g ({preset.protein}%)
                      {" · "}
                      {t("key7", "Carbohydrates")}: {macros.carbohydrates}g ({preset.carbs}%)
                      {" · "}
                      {t("key9", "Fat")}: {macros.fat}g ({preset.fat}%)
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Summary */}
            {finalMacros && (
              <div className="rounded-lg border p-3 space-y-1 text-sm">
                <div className="font-medium text-center mb-2">
                  {t("key34", "Goals Summary")}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("key6", "Calories")}
                  </span>
                  <span className="font-semibold">{selectedCalories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--chart-1))]">
                    {t("key8", "Protein")}
                  </span>
                  <span>
                    {t("proteingrams", "{{proteinGrams}} g", {
                      proteinGrams: finalMacros.protein,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--chart-3))]">
                    {t("key7", "Carbohydrates")}
                  </span>
                  <span>
                    {t("carbsgrams", "{{carbsGrams}} g", {
                      carbsGrams: finalMacros.carbohydrates,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--chart-4))]">
                    {t("key9", "Fat")}
                  </span>
                  <span>
                    {t("fatgrams", "{{fatGrams}} g", {
                      fatGrams: finalMacros.fat,
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer navigation */}
        <DialogFooter className="flex-row gap-2 sm:justify-between">
          {step === 1 && (
            <Button
              className="w-full"
              onClick={handleGoToStep2}
              disabled={!step1Valid}
            >
              {t("key37", "Next")}
            </Button>
          )}
          {step === 2 && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={saving}
              >
                {t("key35", "Back")}
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!step2Valid}
              >
                {t("key37", "Next")}
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                disabled={saving}
              >
                {t("key35", "Back")}
              </Button>
              <Button onClick={handleConfirm} disabled={saving}>
                {t("onboardingConfirm", "Confirm")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
