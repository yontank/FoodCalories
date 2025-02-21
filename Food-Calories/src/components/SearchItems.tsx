import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TotalCalorieProgress } from "./TotalCalorieProgress";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { useState } from "react";

import { Button } from "./ui/button";
import SearchBar from "./SearchBar";
import { TIME } from "@/type";

import { createSearchParams, useNavigate } from "react-router";
import { useDebounce } from "use-debounce";

function SearchItems() {
  const navigate = useNavigate();

  const [mealType, setMealType] = useState<TIME | undefined>(undefined);
  const [value, setValue] = useState<string>("");
  const [debounceValue] = useDebounce(value, 1000);

  return (
    <>
      <Dialog>
        <Card>
          <CardHeader>
            <CardTitle>Count calories</CardTitle>
            <CardDescription>Counts Calories Of A Given Day</CardDescription>
          </CardHeader>

          <CardContent>
            <TotalCalorieProgress
              segments={[{ value: 10 }, { value: 50, color: "bg-red-500" }]}
            />
            <div className="flex w-full justify-around mt-3">
              <Progress label="חלבון" />
              <Progress label="שומן" />
              <Progress label="פחמימה" />
            </div>
            <Separator className="mt-3" />

            <div id="food-container">
              <div>
                <DialogTrigger asChild>
                  <Button
                    className="rounded-full w-14 h-14"
                    onClick={() => {
                      setMealType(TIME.BREAKFAST);
                    }}
                  >
                    ADD
                    {/* <FaPlus /> */}
                  </Button>
                </DialogTrigger>
                <h2 className="inline">ארוחת בוקר</h2>
              </div>

              <div>
                <DialogTrigger asChild>
                  <Button
                    className="rounded-full w-14 h-14"
                    onClick={() => {
                      setMealType(TIME.AFTERNOON);
                    }}
                  >
                    ADD
                    {/* <FaPlus /> */}
                  </Button>
                </DialogTrigger>
                <h2 className="inline">ארוחת צהריים</h2>
              </div>

              <div>
                <DialogTrigger asChild>
                  <Button
                    className="rounded-full w-14 h-14"
                    onClick={() => {
                      setMealType(TIME.EVENING);
                    }}
                  >
                    ADD
                    {/* <FaPlus /> */}
                  </Button>
                </DialogTrigger>
                <h2 className="inline">ארוחת ערב</h2>
              </div>
            </div>
          </CardContent>
        </Card>
        <DialogContent className="sm:max-w-[950px]">
          <DialogHeader>
            <DialogTitle>מה אכלת היום?</DialogTitle>
          </DialogHeader>
          <SearchBar
            mealTime={mealType}
            value={value}
            setValue={setValue}
            debounceValue={debounceValue}
          />

          <DialogFooter>
            <Button
              type="submit"
              onClick={() => {
                navigate({
                  pathname: "calc",
                  search: createSearchParams({
                    shm: value,
                    meal: mealType?.toString() ?? "",
                  }).toString(),
                });
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SearchItems;
