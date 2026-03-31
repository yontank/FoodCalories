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
import { useTranslation } from 'react-i18next'

type AccountInputs = {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function Settings() {
  const { t, i18n } = useTranslation();

  const accountForm = useForm<AccountInputs>();

  const onSaveAccount = (values: AccountInputs) => console.log(values);
  const onExportData = () => console.log("export data");
  const onClearLogs = () => console.log("clear logs");
  const onDeleteAccount = () => console.log("delete account");

  const dir = i18n.language === 'he' ? 'rtl' : 'ltr';

  return (
    <div className="p-6 max-w-4xl" dir={dir}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('key46', 'Settings')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('key47', 'Manage your account and app preferences')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6" dir="ltr">
        {/* Account Settings */}
        <form onSubmit={accountForm.handleSubmit(onSaveAccount)} dir={dir}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{t('key54', 'חשבון')}</CardTitle>
              <CardDescription>{t('key55', 'עדכן את פרטי הכניסה שלך')}</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">{t('key56', 'סיסמה נוכחית')}</Label>
                <Input
                  id="current-password"
                  type="password"
                  {...accountForm.register("currentPassword")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t('key57', 'סיסמה חדשה')}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    {...accountForm.register("newPassword")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t('key58', 'אימות סיסמה')}</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    {...accountForm.register("confirmPassword")}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t pt-4">
              <Button type="submit">{t('key53', 'שמור שינויים')}</Button>
            </CardFooter>
          </Card>
        </form>

        {/* Language */}
        <Card dir={dir}>
          <CardHeader>
            <CardTitle>{t('language', 'שפה')}</CardTitle>
            <CardDescription>{t('languageDesc', 'שנה את שפת הממשק')}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="flex gap-2" dir="ltr">
              <Button
                variant={i18n.language === 'he' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => i18n.changeLanguage('he')}
              >
                עברית
              </Button>
              <Button
                variant={i18n.language === 'en' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => i18n.changeLanguage('en')}
              >
                English
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data */}
        <Card dir={dir}>
          <CardHeader>
            <CardTitle>{t('key59', 'נתונים')}</CardTitle>
            <CardDescription>{t('key60', 'ייצא או נקה את הנתונים שלך')}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t('key61', 'ייצא נתונים')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('csv', 'הורד את כל יומני האוכל שלך כקובץ CSV')}
                </p>
              </div>
              <Button variant="outline" onClick={onExportData}>
                {t('csv2', 'ייצא CSV')}
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t('key62', 'נקה יומנים')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('key63', 'מחק את כל רשומות האוכל — הגדרות היעדים יישמרו')}
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">{t('key62', 'נקה יומנים')}</Button>
                </DialogTrigger>
                <DialogContent dir={dir}>
                  <DialogHeader>
                    <DialogTitle>{t('key64', 'נקה יומני אוכל')}</DialogTitle>
                    <DialogDescription>
                      {t('key65', 'האם אתה בטוח? פעולה זו תמחק את כל רשומות האוכל שלך ולא\n                      ניתן יהיה לשחזרן.')}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">{t('key66', 'ביטול')}</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="destructive" onClick={onClearLogs}>
                        {t('key62', 'נקה יומנים')}
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
          <CardTitle className="text-destructive">{t('key67', 'אזור מסוכן')}</CardTitle>
          <CardDescription>{t('key68', 'פעולות בלתי הפיכות')}</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('key69', 'מחק חשבון')}</p>
              <p className="text-xs text-muted-foreground">
                {t('key70', 'מחק לצמיתות את חשבונך וכל הנתונים המשויכים אליו')}
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">{t('key69', 'מחק חשבון')}</Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader>
                  <DialogTitle>{t('key71', 'מחיקת חשבון')}</DialogTitle>
                  <DialogDescription>
                    {t('key72', 'האם אתה בטוח? פעולה זו תמחק לצמיתות את חשבונך וכל הנתונים\n                    המשויכים אליו. לא ניתן יהיה לשחזר את החשבון.')}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button variant="outline">{t('key66', 'ביטול')}</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" onClick={onDeleteAccount}>
                      {t('key69', 'מחק חשבון')}
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
