import { FoodDetail, PortionSize } from "@/type";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  food: FoodDetail;
  amount: number;
  setAmount: React.Dispatch<React.SetStateAction<number>>;
  selectedSize: PortionSize | undefined;
  setSelectedSize: React.Dispatch<
    React.SetStateAction<PortionSize | undefined>
  >;
}

/**
 * Lets the user input how much they ate, and shows the calculated calorie amount based on that.
 */
export function AmountPicker({
  food,
  amount,
  setAmount,
  selectedSize,
  setSelectedSize,
}: Props) {
  const { t } = useTranslation();
  const [amountInput, setAmountInput] = useState<string>(amount.toString());

  const calculatedAmount =
    selectedSize &&
    ((selectedSize.mishkal ?? 1) / 100) * parseFloat(amountInput);

  return (
    <>
      {t("key39", "כמה אכלת?")}
      <div className="flex mb-8">
        <div className="flex items-center gap-x-2">
          <Input
            type="number"
            min={0}
            step={1}
            value={amountInput}
            onChange={(e) => {
              setAmountInput(e.target.value);
              setAmount(Number(e.target.value));
            }}
            className="w-[6em]"
          />
        </div>
        <Select
          value={selectedSize?.name ?? ""}
          onValueChange={(v) =>
            setSelectedSize(food.midot.find((u) => u.name == v))
          }
          dir={"rtl"}
        >
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder={t("key40", "בחר מידה")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{t("key41", "מידות")}</SelectLabel>
              {food.midot.map((item) => (
                <SelectItem key={item.id} value={item.name ?? ""}>
                  {item.name}{" "}
                  <span className="text-neutral-500 text-xs">
                    {t("mishkal", "({{mishkal}} גרם)", {
                      mishkal: item.mishkal,
                    })}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {calculatedAmount && (
        <div className="flex justify-between flex-row-reverse">
          <div>
            {t("key42", "קלוריות:")}{" "}
            {(food.food_energy * calculatedAmount).toFixed(2)}{" "}
          </div>

          <div className="flex flex-col">
            <div>
              {t("key43", "פחמימה:")}{" "}
              {((food.carbohydrates ?? 0) * calculatedAmount).toFixed(2)}
            </div>

            <div>
              {t("key44", "חלבון:")}{" "}
              {(food.protein * calculatedAmount).toFixed(2)}{" "}
            </div>

            <div>
              {t("key45", "שומן:")}{" "}
              {(food.total_fat * calculatedAmount).toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
