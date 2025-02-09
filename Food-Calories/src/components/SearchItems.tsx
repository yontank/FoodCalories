import React from "react";
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
  DialogDescription,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { FaPlus } from "react-icons/fa";
function SearchItems() {
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
                  <Button className="rounded-full w-14 h-14" onClick={() => {}}>
                    <FaPlus />
                  </Button>
                </DialogTrigger>
                <h2 className="inline">ארוחת בוקר</h2>
              </div>

              <div>
                <DialogTrigger asChild>
                  <Button className="rounded-full w-14 h-14">
                    <FaPlus />
                  </Button>
                </DialogTrigger>
                <h2 className="inline">ארוחת צהריים</h2>
              </div>

              <div>
                <DialogTrigger asChild>
                  <Button className="rounded-full w-14 h-14">
                    <FaPlus />
                  </Button>
                </DialogTrigger>
                <h2 className="inline">ארוחת ערב</h2>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dialog FOR Food Pickup WHENEVER you've already eaten.  */}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>מה אכלת היום?</DialogTitle>
            {/* <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription> */}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              {" "}
              {/*className="grid grid-cols-4 items-center gap-4"*/}
              <Label htmlFor="food" className="text-right">
                בחר מוצר
              </Label>
              <Input id="food" className="" />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SearchItems;
