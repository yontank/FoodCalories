import { useState } from "react";
import { HelpCircle, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { getDailyCaloriesDeficit, KCAL_PER_GRAM } from "@/lib/fitness-calc";
import { useSetAtom } from "jotai";
import { nutritionAtom } from "@/atoms/nutrition";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next'

type Step = 1 | 2;

export function CalorieDeficitDialog() {
  const { t } = useTranslation()
  const setNutrition = useSetAtom(nutritionAtom);

  const ACTIVITY_LEVELS = [
    { label: t('key17', 'Sedentary (no exercise)'), value: "1.2" },
    { label: t('13', 'Light (1-3 days/week)'), value: "1.375" },
    { label: t('35', 'Moderate (3-5 days/week)'), value: "1.55" },
    { label: t('67', 'Active (6-7 days/week)'), value: "1.725" },
    { label: t('key18', 'Very active (athlete)'), value: "1.9" },
  ];

  const LOSS_TARGETS = [
    { kg: 0.3, label: t('03', '0.3 kg / week') },
    { kg: 0.5, label: t('05', '0.5 kg / week') },
    { kg: 0.7, label: t('07', '0.7 kg / week') },
    { kg: 1.0, label: t('1', '1 kg / week') },
  ];

  const DIET_PRESETS = [
    { label: t('key19', 'Lean'), protein: 40, carbs: 35, fat: 25 },
    { label: t('key20', 'Balanced'), protein: 30, carbs: 40, fat: 30 },
    { label: t('key21', 'Keto'), protein: 25, carbs: 10, fat: 65 },
  ];
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);

  // Step 1 state
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activity, setActivity] = useState("");
  const [calculatedOptions, setCalculatedOptions] = useState<number[] | null>(null);
  const [selectedCalories, setSelectedCalories] = useState<number | null>(null);

  // Step 2 state
  const [proteinPct, setProteinPct] = useState(30);
  const [carbsPct, setCarbsPct] = useState(40);
  const [fatPct, setFatPct] = useState(30);

  const step1Valid =
    weight !== "" &&
    height !== "" &&
    age !== "" &&
    activity !== "" &&
    parseFloat(weight) > 0 &&
    parseFloat(height) > 0 &&
    parseFloat(age) > 0;

  const macroSum = proteinPct + carbsPct + fatPct;
  const macroValid = macroSum === 100;

  const canProceedStep1 = selectedCalories !== null;

  const handleCalculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    const act = parseFloat(activity);

    const calcs = LOSS_TARGETS.map(({ kg }) =>
      Math.round(getDailyCaloriesDeficit(kg / 7, w, h, a, gender, act)),
    );
    setCalculatedOptions(calcs);
    setSelectedCalories(null);
  };

  const handleConfirm = () => {
    if (!selectedCalories || !macroValid) return;

    setNutrition({
      calories: selectedCalories,
      protein: Math.round((selectedCalories * proteinPct) / 100 / KCAL_PER_GRAM.protein),
      carbs: Math.round((selectedCalories * carbsPct) / 100 / KCAL_PER_GRAM.carbohydrates),
      fat: Math.round((selectedCalories * fatPct) / 100 / KCAL_PER_GRAM.fat),
    });

    setOpen(false);
    resetState();
  };

  const resetState = () => {
    setStep(1);
    setWeight("");
    setHeight("");
    setAge("");
    setGender("male");
    setActivity("");
    setCalculatedOptions(null);
    setSelectedCalories(null);
    setProteinPct(30);
    setCarbsPct(40);
    setFatPct(30);
  };

  const proteinGrams = selectedCalories
    ? Math.round((selectedCalories * proteinPct) / 100 / KCAL_PER_GRAM.protein)
    : null;
  const carbsGrams = selectedCalories
    ? Math.round((selectedCalories * carbsPct) / 100 / KCAL_PER_GRAM.carbohydrates)
    : null;
  const fatGrams = selectedCalories
    ? Math.round((selectedCalories * fatPct) / 100 / KCAL_PER_GRAM.fat)
    : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <HelpCircle className="!size-6" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{t('key22', 'הגדר יעדי תזונה')}</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 py-1">
          {[1, 2].map((s) => (
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
                {t('key38', { defaultValue_one: 'פרטים אישיים', defaultValue_other: 'הרכב תזונה', count: s })}
              </span>
              {s < 2 && (
                <div className="h-px w-6 bg-muted-foreground/30 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1 ─────────────────────────────────────── */}
        {step === 1 && (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="weight">{t('key23', 'משקל (ק"ג)')}</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => {
                    setWeight(e.target.value);
                    setCalculatedOptions(null);
                    setSelectedCalories(null);
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="height">{t('key24', 'גובה (ס"מ)')}</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value);
                    setCalculatedOptions(null);
                    setSelectedCalories(null);
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="age">{t('key25', 'גיל')}</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    setCalculatedOptions(null);
                    setSelectedCalories(null);
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label>{t('key26', 'מגדר')}</Label>
                <div className="flex gap-2">
                  <Button
                    variant={gender === "male" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => {
                      setGender("male");
                      setCalculatedOptions(null);
                      setSelectedCalories(null);
                    }}
                    type="button"
                  >
                    {t('key27', 'זכר')}
                  </Button>
                  <Button
                    variant={gender === "female" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => {
                      setGender("female");
                      setCalculatedOptions(null);
                      setSelectedCalories(null);
                    }}
                    type="button"
                  >
                    {t('key28', 'נקבה')}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label>{t('key29', 'רמת פעילות')}</Label>
              <Select
                value={activity}
                onValueChange={(v) => {
                  setActivity(v);
                  setCalculatedOptions(null);
                  setSelectedCalories(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('key30', 'בחר רמת פעילות')} />
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

            <Button
              onClick={handleCalculate}
              disabled={!step1Valid}
              variant="outline"
            >
              {t('key31', 'חשב')}
            </Button>

            {calculatedOptions && (
              <div className="grid grid-cols-2 gap-2">
                {LOSS_TARGETS.map(({ label }, i) => {
                  const kcal = calculatedOptions[i];
                  const isSelected = selectedCalories === kcal;
                  const isTooLow = kcal < 1200;
                  return (
                    <button
                      key={label}
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
                        {label}
                      </div>
                      <div className="text-xl font-bold">
                        {isTooLow ? t('notSafe', 'Not safe') : kcal}
                      </div>
                      {!isTooLow && (
                        <div className="text-xs text-muted-foreground">
                          {t('key32', 'קל׳ / יום')}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2 ─────────────────────────────────────── */}
        {step === 2 && (
          <div className="grid gap-4">
            {/* Presets */}
            <div className="space-y-1">
              <Label>{t('key33', 'בחר תוכנית מהירה')}</Label>
              <div className="flex gap-2">
                {DIET_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    className="flex-1 text-sm"
                    type="button"
                    onClick={() => {
                      setProteinPct(preset.protein);
                      setCarbsPct(preset.carbs);
                      setFatPct(preset.fat);
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Macro inputs */}
            <div className="grid gap-3">
              {(
                [
                  {
                    label: t('key8', 'חלבון'),
                    value: proteinPct,
                    set: setProteinPct,
                    grams: proteinGrams,
                    color: "text-blue-500",
                  },
                  {
                    label: t('key7', 'פחמימות'),
                    value: carbsPct,
                    set: setCarbsPct,
                    grams: carbsGrams,
                    color: "text-yellow-500",
                  },
                  {
                    label: t('key9', 'שומן'),
                    value: fatPct,
                    set: setFatPct,
                    grams: fatGrams,
                    color: "text-orange-500",
                  },
                ] as const
              ).map(({ label, value, set, grams, color }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 w-24">
                    <span className={cn("text-sm font-medium", color)}>
                      {label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={value}
                      onChange={(e) => set(Number(e.target.value))}
                      className="w-20 text-center"
                    />
                    <span className="text-sm text-muted-foreground w-4">%</span>
                  </div>
                  <div className="text-sm text-muted-foreground text-left w-20">
                    {grams !== null ? t('grams', '{{grams}} גרם', { grams }) : "—"}
                  </div>
                </div>
              ))}
            </div>

            {/* Sum feedback */}
            <div
              className={cn(
                "text-sm text-center py-1 rounded",
                macroValid
                  ? "text-green-600 bg-green-50"
                  : "text-destructive bg-destructive/5",
              )}
            >
              {macroValid
                ? t('100', 'סה״כ: 100% ✓')
                : t('macrosum100', 'סה״כ: {{macroSum}}% — חייב להיות 100%', { macroSum })}
            </div>

            {/* Summary */}
            {selectedCalories && macroValid && (
              <div className="rounded-lg border p-3 space-y-1 text-sm">
                <div className="font-medium text-center mb-2">{t('key34', 'סיכום יעדים')}</div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('key6', 'קלוריות')}</span>
                  <span className="font-semibold">{selectedCalories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-500">{t('key8', 'חלבון')}</span>
                  <span>{t('proteingrams', '{{proteinGrams}} גרם', { proteinGrams })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-500">{t('key7', 'פחמימות')}</span>
                  <span>{t('carbsgrams', '{{carbsGrams}} גרם', { carbsGrams })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-500">{t('key9', 'שומן')}</span>
                  <span>{t('fatgrams', '{{fatGrams}} גרם', { fatGrams })}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer navigation */}
        <DialogFooter className="flex-row gap-2 sm:justify-between">
          {step === 2 ? (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                {t('key35', 'אחורה')}
              </Button>
              <Button onClick={handleConfirm} disabled={!macroValid}>
                {t('key36', 'אישור ושמירה')}
              </Button>
            </>
          ) : (
            <Button
              className="w-full"
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
            >
              {t('key37', 'הבא')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
