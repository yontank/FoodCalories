import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function WeightReminderDialog({
  open,
  onOpenChange,
  saving,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving: boolean;
  onSave: (value: string) => Promise<void>;
}) {
  const { t, i18n } = useTranslation();
  const dir = i18n.language === "he" ? "rtl" : "ltr";
  const [value, setValue] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={dir}>
        <DialogHeader>
          <DialogTitle>{t("logWeight", "Log Weight")}</DialogTitle>
          <DialogDescription>
            {t(
              "weightReminder",
              "It's been over 2 weeks since your last weigh-in",
            )}
          </DialogDescription>
        </DialogHeader>
        <Input
          type="number"
          placeholder={t("key23", "Weight (kg)")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline">{t("key66", "Cancel")}</Button>
          </DialogClose>
          <Button
            disabled={!value || Number(value) <= 0 || saving}
            onClick={async () => {
              await onSave(value);
              onOpenChange(false);
            }}
          >
            {t("save", "Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
