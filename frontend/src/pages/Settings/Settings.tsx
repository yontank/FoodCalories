import { Button } from "@/components/ui/button";
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
import { useTranslation } from "react-i18next";
import { ControlledField } from "@/components/ControlledField";
import * as z from "zod";
import { changePasswordSchema } from "@/schemas/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { client } from "@/api/client";
import { useState } from "react";
import { ErrorBox } from "@/components/ErrorBox";
import { useNavigate } from "react-router";
import { accessTokenAtom } from "@/atoms/user";

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
  const [, setAccessToken] = useAtom(accessTokenAtom);
  const [logDeletionSuccessfulDialog, setLogDeletionSuccessfulDialog] =
    useState(false);
  const [userDeletionSuccessfulDialog, setUserDeletionSuccessfulDialog] =
    useState(false);

  const navigate = useNavigate();

  const onExportData = async () => {
    const { data, error } = await client.GET("/api/v1/meals/export", {
      parseAs: "blob",
    });

    if (error) {
      return;
    }

    const file = window.URL.createObjectURL(data);
    window.location.assign(file);
  };

  const onClearLogs = async () => {
    const { error } = await client.DELETE("/api/v1/meals");
    if (error) {
      return;
    }
    setLogDeletionSuccessfulDialog(true);
  };

  const onDeleteAccount = async () => {
    const { error } = await client.DELETE("/api/v1/user");
    if (error) {
      return;
    }
    setUserDeletionSuccessfulDialog(true);
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("key46", "Settings")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("key47", "Manage your account and app preferences")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Account Settings */}
        <ChangePasswordForm />

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle>{t("language", "שפה")}</CardTitle>
            <CardDescription>
              {t("languageDesc", "שנה את שפת הממשק")}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="flex gap-2">
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
        <Card>
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
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("key64", "נקה יומני אוכל")}</DialogTitle>
                    <DialogDescription>
                      {t(
                        "key65",
                        "האם אתה בטוח? פעולה זו תמחק את כל רשומות האוכל שלך ולא\nניתן יהיה לשחזרן.",
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
          <Dialog
            open={logDeletionSuccessfulDialog}
            onOpenChange={setLogDeletionSuccessfulDialog}
          >
            <DialogContent>
              {t("logsDeleted", "רשומות האוכל שלך נמחקו.")}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">OK</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive/50 mt-6">
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
            <Dialog
              open={userDeletionSuccessfulDialog}
              onOpenChange={(open) => {
                if (!open) {
                  setAccessToken(undefined);
                  navigate("/login");
                }
              }}
            >
              <DialogContent>
                {t(
                  "userDeleted",
                  "חשבונך וכל הנתונים המשויכים אליו נמחקו בהצלחה.",
                )}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">OK</Button>
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
