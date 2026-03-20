import { CalorieDeficitDialog } from "@/components/CalorieDeficitDialog";
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
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { useAtom } from "jotai";
import { nutritionAtom } from "@/atoms/nutrition";
import { useTranslation } from "react-i18next";
import { ControlledField } from "@/components/ControlledField";
import * as z from "zod";
import { changePasswordSchema } from "@/schemas/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { client } from "@/api/client";
import { useState } from "react";
import { ErrorBox } from "@/components/ErrorBox";

type NutritionInputs = {
  calories: number;
  maxGramsCarbs: number;
  maxGramsFat: number;
  maxGramsProtein: number;
};

function ChangePasswordForm() {
  const { t } = useTranslation();

  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const accountForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onChangePassword = async (
    values: z.infer<typeof changePasswordSchema>,
  ) => {
    setErrorMessage(undefined);

    const { error } = await client.PUT("/api/v1/user/password", {
      body: {
        current_password: values.currentPassword,
        new_password: values.newPassword,
      },
    });

    if (error) {
      setErrorMessage(JSON.stringify(error));
    } else {
      setConfirmationOpen(true);
    }
  };

  return (
    <form
      id="form-change-password"
      onSubmit={accountForm.handleSubmit(onChangePassword)}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{t("key54", "חשבון")}</CardTitle>
          <CardDescription>
            {t("key55", "עדכן את פרטי הכניסה שלך")}
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <ControlledField
              form={accountForm}
              formName="form-change-password"
              name="currentPassword"
              type="password"
              label={t("key56", "סיסמה נוכחית")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <ControlledField
                form={accountForm}
                formName="form-change-password"
                name="newPassword"
                type="password"
                label={t("key57", "סיסמה חדשה")}
              />
            </div>
            <div className="space-y-2">
              <ControlledField
                form={accountForm}
                formName="form-change-password"
                name="confirmPassword"
                type="password"
                label={t("key58", "אימות סיסמה")}
              />
            </div>
          </div>
          {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
        </CardContent>
        <CardFooter className="justify-end border-t pt-4">
          <Button type="submit">{t("key53", "שמור שינויים")}</Button>
        </CardFooter>
      </Card>
      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <DialogContent>
          {t("passwordChanged", "סיסמתך שונתה בהצלחה.")}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">OK</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}

export function Settings() {
  const { t, i18n } = useTranslation();
  const [nutrition, setNutrition] = useAtom(nutritionAtom);

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

  const onExportData = () => console.log("export data");
  const onClearLogs = () => console.log("clear logs");
  const onDeleteAccount = () => console.log("delete account");

  const dir = i18n.language === "he" ? "rtl" : "ltr";

  return (
    <div className="p-6 max-w-4xl" dir={dir}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("key46", "Settings")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("key47", "Manage your account and app preferences")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Daily Nutrition Targets */}
        <form onSubmit={nutritionForm.handleSubmit(onSaveNutrition)} dir={dir}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("key48", "יעדים יומיים")}</CardTitle>
                <CalorieDeficitDialog />
              </div>
              <CardDescription>
                {t("key49", "הגדר את הערכים המקסימליים היומיים שלך")}
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="max-calories">{t("key6", "קלוריות")}</Label>
                  <Input
                    id="max-calories"
                    type="number"
                    {...nutritionForm.register("calories", {
                      required: t("requiredField", "Required field"),
                    })}
                  />
                  {nutritionForm.formState.errors.calories && (
                    <p className="text-xs text-destructive">
                      {nutritionForm.formState.errors.calories.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carb">{t("key50", "פחמימות (גרם)")}</Label>
                  <Input
                    id="carb"
                    type="number"
                    {...nutritionForm.register("maxGramsCarbs", {
                      required: t("requiredField", "Required field"),
                    })}
                  />
                  {nutritionForm.formState.errors.maxGramsCarbs && (
                    <p className="text-xs text-destructive">
                      {nutritionForm.formState.errors.maxGramsCarbs.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fat">{t("key51", "שומן (גרם)")}</Label>
                  <Input
                    id="fat"
                    type="number"
                    {...nutritionForm.register("maxGramsFat", {
                      required: t("requiredField", "Required field"),
                    })}
                  />
                  {nutritionForm.formState.errors.maxGramsFat && (
                    <p className="text-xs text-destructive">
                      {nutritionForm.formState.errors.maxGramsFat.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="protein">{t("key52", "חלבון (גרם)")}</Label>
                  <Input
                    id="protein"
                    type="number"
                    {...nutritionForm.register("maxGramsProtein", {
                      required: t("requiredField", "Required field"),
                    })}
                  />
                  {nutritionForm.formState.errors.maxGramsProtein && (
                    <p className="text-xs text-destructive">
                      {nutritionForm.formState.errors.maxGramsProtein.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t pt-4">
              <Button type="submit">{t("key53", "שמור שינויים")}</Button>
            </CardFooter>
          </Card>
        </form>

        {/* Account Settings */}
        <ChangePasswordForm />

        {/* Language */}
        <Card dir={dir}>
          <CardHeader>
            <CardTitle>{t("language", "שפה")}</CardTitle>
            <CardDescription>
              {t("languageDesc", "שנה את שפת הממשק")}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="flex gap-2" dir="ltr">
              <Button
                variant={i18n.language === "he" ? "default" : "outline"}
                className="flex-1"
                onClick={() => i18n.changeLanguage("he")}
              >
                עברית
              </Button>
              <Button
                variant={i18n.language === "en" ? "default" : "outline"}
                className="flex-1"
                onClick={() => i18n.changeLanguage("en")}
              >
                English
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data */}
        <Card dir={dir}>
          <CardHeader>
            <CardTitle>{t("key59", "נתונים")}</CardTitle>
            <CardDescription>
              {t("key60", "ייצא או נקה את הנתונים שלך")}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {t("key61", "ייצא נתונים")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("csv", "הורד את כל יומני האוכל שלך כקובץ CSV")}
                </p>
              </div>
              <Button variant="outline" onClick={onExportData}>
                {t("csv2", "ייצא CSV")}
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {t("key62", "נקה יומנים")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("key63", "מחק את כל רשומות האוכל — הגדרות היעדים יישמרו")}
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">{t("key62", "נקה יומנים")}</Button>
                </DialogTrigger>
                <DialogContent dir={dir}>
                  <DialogHeader>
                    <DialogTitle>{t("key64", "נקה יומני אוכל")}</DialogTitle>
                    <DialogDescription>
                      {t(
                        "key65",
                        "האם אתה בטוח? פעולה זו תמחק את כל רשומות האוכל שלך ולא\n                      ניתן יהיה לשחזרן.",
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">{t("key66", "ביטול")}</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="destructive" onClick={onClearLogs}>
                        {t("key62", "נקה יומנים")}
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive/50 mt-6" dir={dir}>
        <CardHeader>
          <CardTitle className="text-destructive">
            {t("key67", "אזור מסוכן")}
          </CardTitle>
          <CardDescription>{t("key68", "פעולות בלתי הפיכות")}</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t("key69", "מחק חשבון")}</p>
              <p className="text-xs text-muted-foreground">
                {t("key70", "מחק לצמיתות את חשבונך וכל הנתונים המשויכים אליו")}
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">{t("key69", "מחק חשבון")}</Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader>
                  <DialogTitle>{t("key71", "מחיקת חשבון")}</DialogTitle>
                  <DialogDescription>
                    {t(
                      "key72",
                      "האם אתה בטוח? פעולה זו תמחק לצמיתות את חשבונך וכל הנתונים\n                    המשויכים אליו. לא ניתן יהיה לשחזר את החשבון.",
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button variant="outline">{t("key66", "ביטול")}</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" onClick={onDeleteAccount}>
                      {t("key69", "מחק חשבון")}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
