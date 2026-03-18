import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import CALORIES from "@/data/settings.json";

type NutritionInputs = {
  calories: number;
  maxGramsCarbs: number;
  maxGramsFat: number;
  maxGramsProtein: number;
};

type AccountInputs = {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function Settings() {
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("he");

  const nutritionForm = useForm<NutritionInputs>();
  const accountForm = useForm<AccountInputs>();

  const onSaveNutrition = (values: NutritionInputs) => console.log(values);
  const onSaveAccount = (values: AccountInputs) => console.log(values);
  const onExportData = () => console.log("export data");
  const onClearLogs = () => console.log("clear logs");
  const onDeleteAccount = () => console.log("delete account");

  return (
    <div className="p-6 max-w-4xl" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">הגדרות</h1>
        <p className="text-sm text-muted-foreground mt-1">
          נהל את חשבונך ואת העדפות האפליקציה
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">

      {/* Daily Nutrition Targets */}
      <form onSubmit={nutritionForm.handleSubmit(onSaveNutrition)}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>יעדים יומיים</CardTitle>
            <CardDescription>
              הגדר את הערכים המקסימליים היומיים שלך
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="max-calories">קלוריות</Label>
                <Input
                  id="max-calories"
                  type="number"
                  defaultValue={CALORIES.total_calories}
                  {...nutritionForm.register("calories", {
                    required: "שדה חובה",
                  })}
                />
                {nutritionForm.formState.errors.calories && (
                  <p className="text-xs text-destructive">
                    {nutritionForm.formState.errors.calories.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="carb">פחמימות (גרם)</Label>
                <Input
                  id="carb"
                  type="number"
                  defaultValue={CALORIES.total_grams_carbs}
                  {...nutritionForm.register("maxGramsCarbs", {
                    required: "שדה חובה",
                  })}
                />
                {nutritionForm.formState.errors.maxGramsCarbs && (
                  <p className="text-xs text-destructive">
                    {nutritionForm.formState.errors.maxGramsCarbs.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fat">שומן (גרם)</Label>
                <Input
                  id="fat"
                  type="number"
                  defaultValue={CALORIES.total_grams_fat}
                  {...nutritionForm.register("maxGramsFat", {
                    required: "שדה חובה",
                  })}
                />
                {nutritionForm.formState.errors.maxGramsFat && (
                  <p className="text-xs text-destructive">
                    {nutritionForm.formState.errors.maxGramsFat.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="protein">חלבון (גרם)</Label>
                <Input
                  id="protein"
                  type="number"
                  defaultValue={CALORIES.total_grams_protein}
                  {...nutritionForm.register("maxGramsProtein", {
                    required: "שדה חובה",
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
            <Button type="submit">שמור שינויים</Button>
          </CardFooter>
        </Card>
      </form>

      {/* Account Settings */}
      <form onSubmit={accountForm.handleSubmit(onSaveAccount)}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>חשבון</CardTitle>
            <CardDescription>עדכן את פרטי הכניסה שלך</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">כתובת אימייל</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...accountForm.register("email", { required: "שדה חובה" })}
              />
            </div>
            <Separator />
            <p className="text-sm font-medium">שינוי סיסמה</p>
            <div className="space-y-2">
              <Label htmlFor="current-password">סיסמה נוכחית</Label>
              <Input
                id="current-password"
                type="password"
                {...accountForm.register("currentPassword")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">סיסמה חדשה</Label>
                <Input
                  id="new-password"
                  type="password"
                  {...accountForm.register("newPassword")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">אימות סיסמה</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  {...accountForm.register("confirmPassword")}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t pt-4">
            <Button type="submit">שמור שינויים</Button>
          </CardFooter>
        </Card>
      </form>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>מראה</CardTitle>
          <CardDescription>התאם את עיצוב האפליקציה</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-3">
            <Label>ערכת נושא</Label>
            <RadioGroup
              value={theme}
              onValueChange={setTheme}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="light" id="theme-light" />
                <Label htmlFor="theme-light">בהיר</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark">כהה</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="system" id="theme-system" />
                <Label htmlFor="theme-system">לפי המערכת</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">שפה</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="he">עברית</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t pt-4">
          <Button onClick={() => console.log({ theme, language })}>
            שמור שינויים
          </Button>
        </CardFooter>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle>נתונים</CardTitle>
          <CardDescription>ייצא או נקה את הנתונים שלך</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">ייצא נתונים</p>
              <p className="text-xs text-muted-foreground">
                הורד את כל יומני האוכל שלך כקובץ CSV
              </p>
            </div>
            <Button variant="outline" onClick={onExportData}>
              ייצא CSV
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">נקה יומנים</p>
              <p className="text-xs text-muted-foreground">
                מחק את כל רשומות האוכל — הגדרות היעדים יישמרו
              </p>
            </div>
            <Button variant="outline" onClick={onClearLogs}>
              נקה יומנים
            </Button>
          </div>
        </CardContent>
      </Card>

      </div>

      {/* Danger Zone */}
      <Card className="border-destructive/50 mt-6">
        <CardHeader>
          <CardTitle className="text-destructive">אזור מסוכן</CardTitle>
          <CardDescription>פעולות בלתי הפיכות</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">מחק חשבון</p>
              <p className="text-xs text-muted-foreground">
                מחק לצמיתות את חשבונך וכל הנתונים המשויכים אליו
              </p>
            </div>
            <Button variant="destructive" onClick={onDeleteAccount}>
              מחק חשבון
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
